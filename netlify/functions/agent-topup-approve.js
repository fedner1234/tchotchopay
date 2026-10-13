// netlify/functions/agent-topup-approve.js
// TchotchoPay — Admin: Approve or Reject a pending Zelle float top-up
//
// POST /.netlify/functions/agent-topup-approve
// Body: { adminSecret, topupId, action }
//   action: 'approve' | 'reject'
//
// On approve: credits agent float_balance, marks topup as completed
// On reject: marks topup as rejected, no balance change
//
// Required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_SECRET

const https = require('https');

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET  = process.env.ADMIN_SECRET;

const CORS = {
  'Access-Control-Allow-Origin':  'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function respond(code, body) {
  return { statusCode: code, headers: CORS, body: JSON.stringify(body) };
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

  const { adminSecret, topupId, action } = body;

  // Verify admin
  if (!ADMIN_SECRET || adminSecret !== ADMIN_SECRET) {
    return respond(403, { error: 'Unauthorized' });
  }
  if (!topupId) return respond(400, { error: 'topupId required.' });
  if (!['approve','reject'].includes(action)) return respond(400, { error: "action must be 'approve' or 'reject'." });

  // Fetch the pending top-up
  const { body: topupRows } = await sbFetch('GET', `agent_topups?id=eq.${topupId}&limit=1`);
  if (!topupRows || topupRows.length === 0) {
    return respond(404, { error: 'Top-up request not found.' });
  }

  const topup = topupRows[0];
  if (topup.status !== 'pending') {
    return respond(400, { error: `This request is already ${topup.status}.` });
  }

  if (action === 'reject') {
    await sbFetch('PATCH', `agent_topups?id=eq.${topupId}`, {
      status: 'rejected',
      completed_at: new Date().toISOString(),
    });
    return respond(200, { success: true, action: 'rejected', topupId, agentId: topup.agent_id });
  }

  // Approve: fetch current float and credit
  const { body: agentRows } = await sbFetch('GET', `agent_floats?agent_id=eq.${topup.agent_id}&select=float_balance&limit=1`);
  if (!agentRows || agentRows.length === 0) {
    return respond(404, { error: 'Agent float account not found.' });
  }

  const currentFloat = parseFloat(agentRows[0].float_balance) || 0;
  const amount       = parseFloat(topup.amount_usd);
  const newFloat     = parseFloat((currentFloat + amount).toFixed(2));

  // Credit agent float
  await sbFetch('PATCH', `agent_floats?agent_id=eq.${topup.agent_id}`, {
    float_balance: newFloat,
    updated_at:    new Date().toISOString(),
  });

  // Mark top-up as completed
  await sbFetch('PATCH', `agent_topups?id=eq.${topupId}`, {
    status:        'completed',
    float_after:   newFloat,
    completed_at:  new Date().toISOString(),
  });

  return respond(200, {
    success:   true,
    action:    'approved',
    topupId,
    agentId:   topup.agent_id,
    amount,
    newFloat,
    message:   `✅ Approved $${amount.toFixed(2)} Zelle top-up. Agent float is now $${newFloat.toFixed(2)}.`,
  });
};
