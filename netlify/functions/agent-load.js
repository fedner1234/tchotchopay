// netlify/functions/agent-load.js
// TchotchoPay — Agent Cash Load
// Lets an approved agent credit a customer's USDC wallet balance from their float.
//
// POST /.netlify/functions/agent-load
// Body: { agentToken, customerPhone, amountUSD }
//
// Flow:
//   1. Verify agent session token
//   2. Check agent float balance is sufficient
//   3. Look up customer by phone number
//   4. Debit agent float, credit customer usdc_balance (1:1 USD→USDC)
//   5. Record load in agent_loads table
//   6. Return success with new balances
//
// Required Netlify env vars (already set):
//   SUPABASE_URL, SUPABASE_SERVICE_KEY

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

// ── Verify HMAC session token ───────────────────────────────────────────────
function verifyToken(token) {
  try {
    if (!token) return null;
    const dot     = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payload = token.slice(0, dot);
    const sig     = token.slice(dot + 1);
    const expected = crypto
      .createHmac('sha256', SUPABASE_KEY)
      .update(payload)
      .digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data;
  } catch { return null; }
}

// ── Supabase helpers ────────────────────────────────────────────────────────
function sbFetch(method, path, body) {
  return new Promise((resolve, reject) => {
    const url  = new URL(SUPABASE_URL);
    const raw  = body ? JSON.stringify(body) : null;
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    };
    if (method === 'PATCH' || method === 'POST') {
      headers.Prefer = 'return=representation';
    }
    if (raw) headers['Content-Length'] = Buffer.byteLength(raw);

    const req = https.request(
      { hostname: url.hostname, path: `/rest/v1/${path}`, method, headers },
      res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
      }
    );
    req.on('error', reject);
    if (raw) req.write(raw);
    req.end();
  });
}

// ── Handler ─────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});
  if (event.httpMethod !== 'POST')    return respond(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { error: 'Invalid JSON' }); }

  const { agentToken, customerPhone, amountUSD } = body;

  // ── 1. Validate inputs ───────────────────────────────────────────────────
  if (!agentToken)     return respond(401, { error: 'Agent authentication required.' });
  if (!customerPhone)  return respond(400, { error: 'Customer phone number required.' });
  if (!amountUSD)      return respond(400, { error: 'Load amount required.' });

  const amount = parseFloat(amountUSD);
  if (isNaN(amount) || amount < 5)   return respond(400, { error: 'Minimum load is $5.00.' });
  if (amount > 500)                   return respond(400, { error: 'Maximum single load is $500.00.' });

  // ── 2. Verify agent token ────────────────────────────────────────────────
  const tokenData = verifyToken(agentToken);
  if (!tokenData) return respond(401, { error: 'Session expired — please sign in again.' });
  const agentUserId = tokenData.userId;

  // ── 3. Fetch agent record ────────────────────────────────────────────────
  const { status: aStatus, body: agentRows } = await sbFetch(
    'GET', `agent_floats?agent_id=eq.${agentUserId}&select=*&limit=1`
  );

  if (aStatus !== 200 || !agentRows || agentRows.length === 0) {
    return respond(403, { error: 'Agent account not found or not approved. Contact support.' });
  }

  const agent = agentRows[0];

  if (agent.status !== 'active') {
    return respond(403, { error: 'Agent account is pending approval.' });
  }

  const agentFloat = parseFloat(agent.float_balance) || 0;
  if (agentFloat < amount) {
    return respond(400, {
      error: `Insufficient float. Your float balance is $${agentFloat.toFixed(2)}. Top it up to continue.`,
      floatBalance: agentFloat,
    });
  }

  // ── 4. Look up customer by phone ─────────────────────────────────────────
  // Normalize phone: strip non-digits, accept 10 or 11 digits
  const phone = customerPhone.replace(/\D/g, '');
  if (phone.length < 10 || phone.length > 11) {
    return respond(400, { error: 'Invalid phone number format.' });
  }

  const { status: cStatus, body: customerRows } = await sbFetch(
    'GET', `users?phone=eq.${encodeURIComponent(phone)}&select=id,full_name,usdc_balance,phone&limit=1`
  );

  if (cStatus !== 200 || !customerRows || customerRows.length === 0) {
    return respond(404, { error: 'No TchotchoPay account found for that phone number. Ask the customer to sign up first.' });
  }

  const customer = customerRows[0];
  const customerId = customer.id;

  // ── 5. Debit agent float ─────────────────────────────────────────────────
  const newFloat = parseFloat((agentFloat - amount).toFixed(2));

  const { status: debitStatus } = await sbFetch(
    'PATCH',
    `agent_floats?agent_id=eq.${agentUserId}`,
    { float_balance: newFloat, updated_at: new Date().toISOString() }
  );

  if (debitStatus < 200 || debitStatus > 299) {
    return respond(500, { error: 'Failed to debit float. Please try again.' });
  }

  // ── 6. Credit customer wallet (1:1 USD → USDC) ──────────────────────────
  const currentBalance = parseFloat(customer.usdc_balance) || 0;
  const newBalance     = parseFloat((currentBalance + amount).toFixed(2));

  const { status: creditStatus } = await sbFetch(
    'PATCH',
    `users?id=eq.${customerId}`,
    { usdc_balance: newBalance }
  );

  if (creditStatus < 200 || creditStatus > 299) {
    // Rollback agent float
    await sbFetch('PATCH', `agent_floats?agent_id=eq.${agentUserId}`, {
      float_balance: agentFloat,
      updated_at: new Date().toISOString(),
    });
    return respond(500, { error: 'Failed to credit customer wallet. Float has been restored.' });
  }

  // ── 7. Record load in agent_loads table ──────────────────────────────────
  const loadRecord = {
    agent_id:        agentUserId,
    customer_id:     customerId,
    customer_phone:  phone,
    amount_usd:      amount,
    amount_usdc:     amount,
    agent_float_before: agentFloat,
    agent_float_after:  newFloat,
    customer_balance_before: currentBalance,
    customer_balance_after:  newBalance,
    status:          'completed',
    created_at:      new Date().toISOString(),
  };

  await sbFetch('POST', 'agent_loads', loadRecord).catch(() => {
    // Don't fail the transaction if logging fails — money already moved
    console.error('Failed to record load in agent_loads table');
  });

  // ── 8. Respond ───────────────────────────────────────────────────────────
  return respond(200, {
    success:          true,
    customerName:     customer.full_name || 'Customer',
    customerPhone:    phone,
    amountLoaded:     amount,
    customerNewBalance: newBalance,
    agentFloatRemaining: newFloat,
    message: `✅ $${amount.toFixed(2)} loaded to ${customer.full_name || phone}'s wallet.`,
  });
};
