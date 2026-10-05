// netlify/functions/user-profile.js
// Returns full user profile + USDC balance for the logged-in dashboard
// Requires: Authorization: Bearer <session_token>

const https  = require('https');
const crypto = require('crypto');

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const CIRCLE_API_KEY       = process.env.CIRCLE_API_KEY;
const CIRCLE_ENV           = process.env.CIRCLE_ENV || 'sandbox';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

// ── Verify HMAC session token ──────────────────────────────────────────────
function verifySessionToken(token) {
  try {
    if (!token) return null;
    const dot     = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payload  = token.slice(0, dot);
    const sig      = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', SUPABASE_SERVICE_KEY).update(payload).digest('hex');
    if (sig.length !== 64 || expected.length !== 64) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data.userId;
  } catch { return null; }
}

// ── Supabase fetch ─────────────────────────────────────────────────────────
async function supabaseFetch(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: `/rest/v1/${path}`,
      method: 'GET',
      headers: {
        'apikey':        SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type':  'application/json',
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    req.setTimeout(7000, () => { req.destroy(new Error('Supabase request timed out')); });
    req.end();
  });
}

// ── Circle balance fetch ───────────────────────────────────────────────────
async function getCircleBalance(walletId) {
  if (!walletId || !CIRCLE_API_KEY) return null;
  const base = CIRCLE_ENV === 'production'
    ? 'https://api.circle.com'
    : 'https://api-sandbox.circle.com';
  try {
    const res = await fetch(`${base}/v1/w3s/wallets/${walletId}/balances`, {
      headers: { 'Authorization': `Bearer ${CIRCLE_API_KEY}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const usdc = data.data?.tokenBalances?.find(t =>
      t.token?.symbol === 'USDC' || t.token?.name?.includes('USD Coin')
    );
    return usdc ? parseFloat(usdc.amount) : 0;
  } catch { return null; }
}

// ── Main handler ───────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});

  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const rawToken   = authHeader.replace(/^Bearer\s+/i, '').trim();
  const userId     = verifySessionToken(rawToken);
  if (!userId) return respond(401, { error: 'Authentication required' });

  // Fetch user — try with usdc_balance first, fall back without it if column missing
  let userRow = null;
  const { status, body } = await supabaseFetch(
    `users?id=eq.${userId}&select=id,email,full_name,phone,wallet_address,circle_wallet_id,kyc_status,kyc_inquiry_id,usdc_balance,created_at&limit=1`
  );
  if (status === 200 && body && body.length > 0) {
    userRow = body[0];
  } else {
    // Column may not exist yet — retry without usdc_balance
    const { status: s2, body: b2 } = await supabaseFetch(
      `users?id=eq.${userId}&select=id,email,full_name,phone,wallet_address,circle_wallet_id,kyc_status,kyc_inquiry_id,created_at&limit=1`
    );
    if (s2 !== 200 || !b2 || b2.length === 0) {
      return respond(404, { error: 'User not found' });
    }
    userRow = b2[0];
  }
  const user = userRow;

  return respond(200, {
    user: {
      id:               user.id,
      email:            user.email,
      full_name:        user.full_name,
      phone:            user.phone,
      wallet_address:   user.wallet_address,
      circle_wallet_id: user.circle_wallet_id,
      kyc_status:       user.kyc_status,
      kyc_inquiry_id:   user.kyc_inquiry_id,
      created_at:       user.created_at,
    },
    wallet: {
      usdc_balance: parseFloat(user.usdc_balance) || 0,
      currency:     'USDC',
      network:      'Base',
      address:      user.wallet_address,
    },
  });
};
