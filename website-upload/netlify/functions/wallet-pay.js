// netlify/functions/wallet-pay.js
// Deduct USDC from a user's TchotchoPay wallet balance (for top-ups and transfers)
// Called from topup.html and send.html when the user pays with their wallet balance.
// IMPORTANT: This only updates the Supabase usdc_balance column — it does NOT move
// funds on-chain. Circle/on-chain movement happens via the deposit webhook.

const crypto = require('crypto');
const https  = require('https');

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const CORS = {
  'Access-Control-Allow-Origin':  'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function respond(code, body) {
  return { statusCode: code, headers: CORS, body: JSON.stringify(body) };
}

// ── Verify HMAC session token (same as user-profile.js) ────────────────────
function verifySessionToken(token) {
  try {
    if (!token) return null;
    const dot      = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payload  = token.slice(0, dot);
    const sig      = token.slice(dot + 1);
    const expected = crypto
      .createHmac('sha256', SUPABASE_SERVICE_KEY)
      .update(payload)
      .digest('hex');
    if (sig.length !== 64 || expected.length !== 64) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data.userId;
  } catch { return null; }
}

// ── Supabase GET ───────────────────────────────────────────────────────────
function supabaseGet(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    const req = https.request(
      { hostname: url.hostname, path: `/rest/v1/${path}`, method: 'GET',
        headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' } },
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

// ── Supabase PATCH ─────────────────────────────────────────────────────────
function supabasePatch(path, payload) {
  return new Promise((resolve, reject) => {
    const url  = new URL(SUPABASE_URL);
    const body = JSON.stringify(payload);
    const req  = https.request(
      { hostname: url.hostname, path: `/rest/v1/${path}`, method: 'PATCH',
        headers: {
          apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json', Prefer: 'return=minimal',
          'Content-Length': Buffer.byteLength(body),
        }
      },
      res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => resolve({ status: res.statusCode }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Handler ────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});
  if (event.httpMethod !== 'POST')    return respond(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { error: 'Invalid JSON' }); }

  const { sessionToken, amountUSDC } = body;

  if (!sessionToken) return respond(401, { error: 'Authentication required — please sign in.' });

  const userId = verifySessionToken(sessionToken);
  if (!userId)  return respond(401, { error: 'Session expired — please sign in again.' });

  const amount = parseFloat(amountUSDC);
  if (!amount || amount <= 0) return respond(400, { error: 'Invalid amount.' });

  // Fetch current balance from Supabase
  const { status, body: rows } = await supabaseGet(
    `users?id=eq.${userId}&select=id,usdc_balance&limit=1`
  );
  if (status !== 200 || !rows || rows.length === 0) {
    return respond(404, { error: 'User not found.' });
  }

  const currentBalance = parseFloat(rows[0].usdc_balance) || 0;

  if (currentBalance < amount) {
    return respond(400, {
      error: `Insufficient balance. You have ${currentBalance.toFixed(2)} USDC but need ${amount.toFixed(2)} USDC.`,
      currentBalance,
    });
  }

  const newBalance = parseFloat((currentBalance - amount).toFixed(6));

  const { status: patchStatus } = await supabasePatch(
    `users?id=eq.${userId}`,
    { usdc_balance: newBalance }
  );

  if (patchStatus < 200 || patchStatus > 299) {
    return respond(500, { error: 'Failed to update balance. Please try again.' });
  }

  return respond(200, {
    success:    true,
    deducted:   amount,
    newBalance,
  });
};
