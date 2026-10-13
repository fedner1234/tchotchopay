// netlify/functions/agent-topup.js
// TchotchoPay — Agent Float Top-up via Stripe (ACH or Card)
//
// POST /.netlify/functions/agent-topup
// Body: { agentToken, amountUSD, paymentMethodId, paymentType }
//   paymentType: 'card' | 'ach'
//
// For ACH: paymentMethodId is a Stripe PaymentMethod of type 'us_bank_account'
// For Card: paymentMethodId is a Stripe PaymentMethod of type 'card'
//
// Required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY

const crypto = require('crypto');
const https  = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STRIPE_KEY   = process.env.STRIPE_SECRET_KEY;

const CORS = {
  'Access-Control-Allow-Origin':  'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function respond(code, body) {
  return { statusCode: code, headers: CORS, body: JSON.stringify(body) };
}

// ── Verify agent session token ───────────────────────────────────────────
function verifyToken(token) {
  try {
    if (!token) return null;
    const dot      = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payload  = token.slice(0, dot);
    const sig      = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', SUPABASE_KEY).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data.userId;
  } catch { return null; }
}

// ── Supabase helpers ─────────────────────────────────────────────────────
function sbFetch(method, path, body) {
  return new Promise((resolve, reject) => {
    const url  = new URL(SUPABASE_URL);
    const raw  = body ? JSON.stringify(body) : null;
    const headers = {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json', Prefer: 'return=representation',
    };
    if (raw) headers['Content-Length'] = Buffer.byteLength(raw);
    const req = https.request(
      { hostname: url.hostname, path: `/rest/v1/${path}`, method, headers },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d ? JSON.parse(d) : null })); }
    );
    req.on('error', reject);
    if (raw) req.write(raw);
    req.end();
  });
}

// ── Stripe POST helper ────────────────────────────────────────────────────
function stripePost(path, params) {
  return new Promise((resolve, reject) => {
    const body = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    const req = https.request(
      {
        hostname: 'api.stripe.com', path, method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(STRIPE_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) })); }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Handler ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});
  if (event.httpMethod !== 'POST')    return respond(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { error: 'Invalid JSON' }); }

  const { agentToken, amountUSD, paymentMethodId, paymentType } = body;

  // Validate
  if (!agentToken)       return respond(401, { error: 'Agent authentication required.' });
  if (!amountUSD)        return respond(400, { error: 'Amount required.' });
  if (!paymentMethodId)  return respond(400, { error: 'Payment method required.' });
  if (!['card','ach'].includes(paymentType)) return respond(400, { error: 'Invalid payment type.' });

  const amount = parseFloat(amountUSD);
  if (isNaN(amount) || amount < 50)   return respond(400, { error: 'Minimum top-up is $50.' });
  if (amount > 5000)                   return respond(400, { error: 'Maximum single top-up is $5,000.' });

  // Verify agent
  const agentId = verifyToken(agentToken);
  if (!agentId) return respond(401, { error: 'Session expired — please sign in again.' });

  const { body: agentRows } = await sbFetch('GET', `agent_floats?agent_id=eq.${agentId}&select=*&limit=1`);
  if (!agentRows || agentRows.length === 0 || agentRows[0].status !== 'active') {
    return respond(403, { error: 'Agent account not found or not approved.' });
  }

  const agent = agentRows[0];

  // Calculate fees
  const amountCents = Math.round(amount * 100);
  let feeNote = '';
  let stripeFee = 0;
  if (paymentType === 'ach') {
    stripeFee = Math.min(Math.round(amountCents * 0.008), 500); // 0.8% capped at $5
    feeNote = `ACH fee: $${(stripeFee/100).toFixed(2)}`;
  } else {
    stripeFee = Math.round(amountCents * 0.029) + 30; // 2.9% + $0.30
    feeNote = `Card fee: $${(stripeFee/100).toFixed(2)}`;
  }

  // Create Stripe Payment Intent
  const piParams = {
    amount: amountCents,
    currency: 'usd',
    payment_method: paymentMethodId,
    payment_method_types: paymentType === 'ach' ? 'us_bank_account' : 'card',
    confirm: 'true',
    description: `TchotchoPay Agent Float Top-up — Agent ${agentId}`,
    metadata: JSON.stringify({ agentId, type: 'agent_float_topup', amountUSD: amount }),
    'return_url': 'https://tchotchopay.com/agent-dashboard',
  };

  const { status: piStatus, body: pi } = await stripePost('/v1/payment_intents', piParams);

  if (piStatus !== 200 || pi.error) {
    return respond(400, { error: pi.error?.message || 'Payment failed. Please try again.' });
  }

  // For ACH, Stripe returns requires_action or processing (async) — record as pending
  const isPending = pi.status === 'processing' || pi.status === 'requires_action';
  const isSuccess = pi.status === 'succeeded';

  // Record top-up in Supabase
  const currentFloat = parseFloat(agent.float_balance) || 0;
  await sbFetch('POST', 'agent_topups', {
    agent_id:     agentId,
    amount_usd:   amount,
    method:       paymentType,
    stripe_pi_id: pi.id,
    float_before: currentFloat,
    float_after:  isSuccess ? currentFloat + amount : currentFloat,
    status:       isSuccess ? 'completed' : 'pending',
    created_at:   new Date().toISOString(),
    completed_at: isSuccess ? new Date().toISOString() : null,
  });

  // If instant success (card), credit float immediately
  if (isSuccess) {
    await sbFetch('PATCH', `agent_floats?agent_id=eq.${agentId}`, {
      float_balance: currentFloat + amount,
      updated_at: new Date().toISOString(),
    });
    return respond(200, {
      success: true,
      status:  'completed',
      message: `✅ Float topped up by $${amount.toFixed(2)}! New balance: $${(currentFloat + amount).toFixed(2)}`,
      newFloat: currentFloat + amount,
      feeNote,
    });
  }

  // ACH is async — will be credited when Stripe webhook fires
  return respond(200, {
    success: true,
    status:  'pending',
    message: `⏳ ACH initiated for $${amount.toFixed(2)}. Float will be credited by next business day once payment clears.`,
    feeNote,
    stripeIntentId: pi.id,
  });
};
