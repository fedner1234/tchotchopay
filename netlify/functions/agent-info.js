// netlify/functions/agent-info.js
// TchotchoPay — Return the logged-in agent's profile + float balance.
// Called on page load by agent-dashboard.html to populate live data.
//
// POST /.netlify/functions/agent-info
// Body: { agentToken }
// Returns: { agentName, floatBalance, status, agentId }

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

  const { agentToken } = body;
  if (!agentToken) return respond(401, { error: 'Agent authentication required.' });

  const agentId = verifyToken(agentToken);
  if (!agentId) return respond(401, { error: 'Session expired — please sign in again.' });

  // Get agent float record
  const { body: floatRows } = await sbGet(
    `agent_floats?agent_id=eq.${agentId}&select=status,float_balance,agent_id&limit=1`
  );
  if (!floatRows || floatRows.length === 0) {
    return respond(403, { error: 'Agent account not found. Contact support.' });
  }

  const agent = floatRows[0];
  if (agent.status !== 'active') {
    return respond(403, { error: 'Agent account pending approval. Contact support.' });
  }

  // Get agent name from users table
  const { body: userRows } = await sbGet(
    `users?id=eq.${agentId}&select=full_name&limit=1`
  );
  const agentName = (userRows && userRows[0]?.full_name) || 'Agent';

  return respond(200, {
    agentId,
    agentName,
    floatBalance: parseFloat(agent.float_balance) || 0,
    status:       agent.status,
  });
};
