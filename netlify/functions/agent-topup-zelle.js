// netlify/functions/agent-topup-zelle.js
// TchotchoPay — Agent Float Top-up Request via Zelle (manual approval)
//
// POST /.netlify/functions/agent-topup-zelle
// Body: { agentToken, amountUSD, zelleConfirmation }
//   zelleConfirmation: optional reference code agent received from Zelle
//
// Creates a pending top-up request. Admin approves via agent-topup-approve.js.
//
// Required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const crypto = require('crypto');
const https  = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const CORS = {
  'Access-Control-Allow-Origin':  'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function respond(code, body) {
  return { statusCode: code, headers: CORS, body: JSON.stringify(body) };
}

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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});
  if (event.httpMethod !== 'POST')    return respond(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { error: 'Invalid JSON' }); }

  const { agentToken, amountUSD, zelleConfirmation } = body;

  if (!agentToken) return respond(401, { error: 'Agent authentication required.' });
  if (!amountUSD)  return respond(400, { error: 'Amount required.' });

  const amount = parseFloat(amountUSD);
  if (isNaN(amount) || amount < 50)   return respond(400, { error: 'Minimum top-up is $50.' });
  if (amount > 5000)                   return respond(400, { error: 'Maximum top-up is $5,000.' });

  // Verify agent
  const agentId = verifyToken(agentToken);
  if (!agentId) return respond(401, { error: 'Session expired — please sign in again.' });

  const { body: agentRows } = await sbFetch('GET', `agent_floats?agent_id=eq.${agentId}&select=*&limit=1`);
  if (!agentRows || agentRows.length === 0 || agentRows[0].status !== 'active') {
    return respond(403, { error: 'Agent account not found or not approved.' });
  }

  const agent   = agentRows[0];
  const curFloat = parseFloat(agent.float_balance) || 0;

  // Check for duplicate pending request (same amount within 1 hour)
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { body: existing } = await sbFetch(
    'GET',
    `agent_topups?agent_id=eq.${agentId}&method=eq.zelle&status=eq.pending&amount_usd=eq.${amount}&created_at=gte.${oneHourAgo}&limit=1`
  );
  if (existing && existing.length > 0) {
    return respond(400, { error: 'You already have a pending Zelle request for this amount. Please wait for admin approval.' });
  }

  // Create pending top-up request
  const { status, body: record } = await sbFetch('POST', 'agent_topups', {
    agent_id:           agentId,
    amount_usd:         amount,
    method:             'zelle',
    stripe_pi_id:       null,
    float_before:       curFloat,
    float_after:        curFloat + amount, // will be applied on approval
    status:             'pending',
    zelle_confirmation: zelleConfirmation || null,
    agent_name:         agent.business_name || 'Agent',
    created_at:         new Date().toISOString(),
    completed_at:       null,
  });

  if (status < 200 || status > 299) {
    return respond(500, { error: 'Failed to submit request. Please try again.' });
  }

  return respond(200, {
    success: true,
    requestId: record?.[0]?.id || null,
    message:   `✅ Zelle request submitted for $${amount.toFixed(2)}. Send the Zelle to: hello@tchotchopay.com or (239) 209-3021. Admin will approve within 30 minutes.`,
    zelleInfo: {
      email:  'hello@tchotchopay.com',
      phone:  '(239) 209-3021',
      memo:   `Float - ${agentId.slice(0,8).toUpperCase()}`,
      amount: amount,
    },
  });
};
