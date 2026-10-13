// netlify/functions/agent-lookup.js
// TchotchoPay — Look up a customer by phone number (agent use only)
// Returns customer name + current wallet balance for the load confirmation UI.
// Does NOT move any money.
//
// POST /.netlify/functions/agent-lookup
// Body: { agentToken, customerPhone }

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
    const expected = crypto
      .createHmac('sha256', SUPABASE_KEY)
      .update(payload)
      .digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data.userId;
  } catch { return null; }
}

function sbGet(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    const req = https.request(
      { hostname: url.hostname, path: `/rest/v1/${path}`, method: 'GET',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' } },
      res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});
  if (event.httpMethod !== 'POST')    return respond(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { error: 'Invalid JSON' }); }

  const { agentToken, customerPhone } = body;

  if (!agentToken)    return respond(401, { error: 'Agent authentication required.' });
  if (!customerPhone) return respond(400, { error: 'Phone number required.' });

  // Verify agent
  const agentId = verifyToken(agentToken);
  if (!agentId) return respond(401, { error: 'Session expired — please sign in again.' });

  // Verify agent is active
  const { body: agentRows } = await sbGet(`agent_floats?agent_id=eq.${agentId}&select=status,float_balance&limit=1`);
  if (!agentRows || agentRows.length === 0 || agentRows[0].status !== 'active') {
    return respond(403, { error: 'Agent account not found or not approved.' });
  }

  // Look up customer
  const phone = customerPhone.replace(/\D/g, '');
  if (phone.length < 10) return respond(400, { error: 'Invalid phone number.' });

  const { status, body: customers } = await sbGet(
    `users?phone=eq.${encodeURIComponent(phone)}&select=id,full_name,usdc_balance&limit=1`
  );

  if (status !== 200 || !customers || customers.length === 0) {
    return respond(404, { error: 'No TchotchoPay account found for that phone number. Ask the customer to sign up first at tchotchopay.com/signup' });
  }

  const c = customers[0];
  return respond(200, {
    found:          true,
    customerName:   c.full_name || 'TchotchoPay User',
    walletBalance:  parseFloat(c.usdc_balance) || 0,
    agentFloat:     parseFloat(agentRows[0].float_balance) || 0,
  });
};
