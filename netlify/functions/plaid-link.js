// netlify/functions/plaid-link.js
// Plaid bank-linking integration for TchotchoPay
// Handles: createLinkToken, exchangeToken, getAccounts, initiateTransfer

const https  = require('https');
const crypto = require('crypto');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET    = process.env.PLAID_SECRET;
const PLAID_ENV       = process.env.PLAID_ENV || 'sandbox'; // sandbox | production
const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const PLAID_HOST = PLAID_ENV === 'production'
  ? 'production.plaid.com'
  : 'sandbox.plaid.com';

// ── Rate limiting ──────────────────────────────────────────────────────────
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const window = 60_000;
  const max = 10;
  const hits = (rateLimitMap.get(ip) || []).filter(t => now - t < window);
  hits.push(now);
  rateLimitMap.set(ip, hits);
  return hits.length > max;
}

// ── CORS helper ────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function respond(statusCode, body, extra = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extra },
    body: JSON.stringify(body),
  };
}

// ── Plaid API helper ───────────────────────────────────────────────────────
function plaidPost(path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      client_id: PLAID_CLIENT_ID,
      secret:    PLAID_SECRET,
      ...payload,
    });
    const req = https.request(
      { hostname: PLAID_HOST, path, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      res => {
        let data = '';
        res.on('data', c => { data += c; });
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Supabase helper ────────────────────────────────────────────────────────
async function supabaseFetch(path, method = 'GET', body = null) {
  const options = {
    hostname: new URL(SUPABASE_URL).hostname,
    path: `/rest/v1/${path}`,
    method,
    headers: {
      'apikey':        SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation',
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── Verify HMAC session token (issued by register.js / login.js) ──────────
function verifySessionToken(token) {
  try {
    if (!token) return null;
    const dot = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payload = token.slice(0, dot);
    const sig     = token.slice(dot + 1);
    const secret  = SUPABASE_SERVICE_KEY;
    if (!secret) return null;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    // Constant-time compare (both must be 64-char hex)
    if (sig.length !== 64 || expected.length !== 64) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data.userId;
  } catch {
    return null;
  }
}

// ── Verify Plaid webhook JWT (ES256, signed by Plaid) ─────────────────────
async function verifyPlaidWebhookJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const kid = header.kid;
    if (!kid) return false;
    // Fetch Plaid's public key for this key ID
    const { status, body: keyResp } = await plaidPost('/webhook/verification_key/get', { key_id: kid });
    if (status !== 200 || !keyResp.key) return false;
    const jwk = keyResp.key;
    if (jwk.expired_at) return false; // key has been rotated out
    // Import EC public key from JWK
    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    // Verify ES256 signature
    const signedPart = `${parts[0]}.${parts[1]}`;
    const signature  = Buffer.from(parts[2], 'base64url');
    const verify = crypto.createVerify('SHA256');
    verify.update(signedPart);
    if (!verify.verify(publicKey, signature)) return false;
    // Ensure JWT is fresh (< 5 minutes old)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return (Date.now() / 1000 - payload.iat) < 300;
  } catch {
    return false;
  }
}

// ── Main handler ───────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' });

  const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) return respond(429, { error: 'Too many requests' });

  // ── Plaid Webhook — verified via Plaid JWT, no user session needed ────────
  const plaidVerificationToken = event.headers['plaid-verification'];
  if (plaidVerificationToken) {
    const valid = await verifyPlaidWebhookJWT(plaidVerificationToken);
    if (!valid) return respond(401, { error: 'Invalid webhook signature' });
    let wb;
    try { wb = JSON.parse(event.body || '{}'); } catch { return respond(400, { error: 'Invalid JSON' }); }
    console.log('Plaid webhook received:', wb);
    return respond(200, { received: true });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { error: 'Invalid JSON' }); }

  const { action, publicToken } = body;

  // ── All user actions require a valid session token ────────────────────────
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const rawToken   = authHeader.replace(/^Bearer\s+/i, '').trim();
  const userId     = verifySessionToken(rawToken);
  if (!userId) return respond(401, { error: 'Authentication required' });

  // ── 1. Create Link Token ─────────────────────────────────────────────────
  if (action === 'createLinkToken') {
    const { status, body: plaidBody } = await plaidPost('/link/token/create', {
      user:          { client_user_id: userId },
      client_name:   'TchotchoPay',
      products:      ['auth', 'transactions'],
      country_codes: ['US'],
      language:      'en',
      webhook:       'https://tchotchopay.com/.netlify/functions/plaid-link',
    });
    if (status !== 200) return respond(502, { error: plaidBody.error_message || 'Plaid error' });
    return respond(200, { linkToken: plaidBody.link_token });
  }

  // ── 2. Exchange Public Token ─────────────────────────────────────────────
  if (action === 'exchangeToken') {
    if (!publicToken) return respond(400, { error: 'publicToken required' });
    const { status, body: plaidBody } = await plaidPost('/item/public_token/exchange', {
      public_token: publicToken,
    });
    if (status !== 200) return respond(502, { error: plaidBody.error_message || 'Exchange failed' });
    const { access_token, item_id } = plaidBody;
    const { body: authBody } = await plaidPost('/auth/get', { access_token });
    const accounts = authBody.accounts || [];
    const primaryAccount = accounts.find(a => a.type === 'depository') || accounts[0];
    await supabaseFetch('plaid_items', 'POST', {
      user_id:      userId,
      access_token,
      item_id,
      account_id:   primaryAccount?.account_id,
      account_name: primaryAccount?.name,
      mask:         primaryAccount?.mask,
      created_at:   new Date().toISOString(),
    });
    return respond(200, {
      success: true,
      accountName: primaryAccount?.name,
      mask:        primaryAccount?.mask,
      accountId:   primaryAccount?.account_id,
    });
  }

  // ── 3. Get Linked Accounts ───────────────────────────────────────────────
  if (action === 'getAccounts') {
    const { body: items } = await supabaseFetch(
      `plaid_items?user_id=eq.${userId}&select=account_name,mask,account_id,created_at`
    );
    return respond(200, { accounts: items || [] });
  }

  // ── 4. Get Balance ───────────────────────────────────────────────────────
  if (action === 'getBalance') {
    const { body: items } = await supabaseFetch(
      `plaid_items?user_id=eq.${userId}&select=access_token,account_id&limit=1`
    );
    if (!items || items.length === 0) return respond(404, { error: 'No linked bank found' });
    const { access_token, account_id } = items[0];
    const { status, body: balBody } = await plaidPost('/accounts/balance/get', {
      access_token,
      options: { account_ids: [account_id] },
    });
    if (status !== 200) return respond(502, { error: 'Could not fetch balance' });
    const account = balBody.accounts?.find(a => a.account_id === account_id);
    return respond(200, {
      available: account?.balances?.available,
      current:   account?.balances?.current,
      currency:  account?.balances?.iso_currency_code,
    });
  }

  return respond(400, { error: `Unknown action: ${action}` });
};
