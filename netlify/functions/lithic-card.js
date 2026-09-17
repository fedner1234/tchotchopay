// netlify/functions/lithic-card.js
// TchotchoPay — Lithic virtual card issuing
// Handles: create account holder, issue card, freeze/unfreeze, reveal PAN
// All secrets are server-side only (LITHIC_API_KEY in Netlify env vars — NEVER in code)

const crypto = require('crypto');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

function verifySession(token) {
  try {
    const [payload, sig] = token.split('.');
    const secret = process.env.SUPABASE_SERVICE_KEY || 'fallback-secret';
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Supabase ──────────────────────────────────────────────────────────────────

async function supabaseGet(table, match) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(match)) params.append(k, `eq.${v}`);
  params.append('limit', '1');
  const res = await fetch(`${url}/rest/v1/${table}?${params}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  });
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : null;
}

async function supabasePatch(table, match, data) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(match)) params.append(k, `eq.${v}`);
  await fetch(`${url}/rest/v1/${table}?${params}`, {
    method: 'PATCH',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  });
}

// ── Lithic API ────────────────────────────────────────────────────────────────

function lithicHeaders() {
  return {
    Authorization: `api-key ${process.env.LITHIC_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

// Sandbox vs production base URL
function lithicBase() {
  return process.env.LITHIC_ENV === 'production'
    ? 'https://api.lithic.com'
    : 'https://sandbox.lithic.com';
}

async function lithicRequest(method, path, body) {
  const res = await fetch(`${lithicBase()}${path}`, {
    method,
    headers: lithicHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || `Lithic ${res.status}`);
  return json;
}

// Normalize any phone format to E.164 (required by Lithic)
function toE164(phone) {
  if (!phone) return '+10000000000'; // fallback dummy for KYC_EXEMPT
  // Strip everything except digits and a leading +
  const digits = phone.replace(/[^\d]/g, '');
  if (phone.trim().startsWith('+')) {
    // Already has country code — just strip non-digits and re-add +
    return `+${digits}`;
  }
  // Haiti: 8-digit numbers → +509XXXXXXXX
  if (digits.length === 8) return `+509${digits}`;
  // Haiti with country code already in digits: 509 + 8 digits = 11 digits
  if (digits.length === 11 && digits.startsWith('509')) return `+${digits}`;
  // US/Canada: 10 digits → +1XXXXXXXXXX
  if (digits.length === 10) return `+1${digits}`;
  // US with country code: 11 digits starting with 1
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  // Unknown format — prepend + and hope for the best
  return `+${digits}`;
}

// Create a Lithic account holder (KYC_EXEMPT for now — upgrade to KYC_BASIC for full production)
async function createAccountHolder(user) {
  const nameParts = (user.full_name || 'User User').split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName  = nameParts.slice(1).join(' ') || 'User';

  // Build address — use stored fields or fall back to a valid US placeholder
  const address = {
    address1:    user.address_line1  || '1600 Amphitheatre Pkwy',
    city:        user.city           || 'Mountain View',
    state:       user.state          || 'CA',
    postal_code: user.postal_code    || '94043',
    country:     user.country        || 'USA',
  };

  return lithicRequest('POST', '/v1/account_holders', {
    workflow:          'KYC_EXEMPT',
    kyc_exemption_type: 'PREPAID_CARD_USER',
    first_name:        firstName,
    last_name:         lastName,
    email:             user.email,
    phone_number:      toE164(user.phone),
    address,
  });
}

// Create a virtual card for an account holder
async function createVirtualCard(accountToken) {
  return lithicRequest('POST', '/v1/cards', {
    type: 'VIRTUAL',
    account_token: accountToken,
    state: 'OPEN',
    memo: 'TchotchoPay Virtual Card',
    spend_limit: 50000,          // $500.00 daily limit (in cents)
    spend_limit_duration: 'DAILY',
  });
}

// Get card details
async function getCard(cardToken) {
  return lithicRequest('GET', `/v1/cards/${cardToken}`);
}

// Update card state (OPEN / PAUSED)
async function updateCardState(cardToken, state) {
  return lithicRequest('PATCH', `/v1/cards/${cardToken}`, { state });
}

// ── Handler ───────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});

  // Auth — require session token
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const session = verifySession(token);
  if (!session) return respond(401, { error: 'Unauthorized' });

  // Load user from Supabase
  const user = await supabaseGet('users', { id: session.userId });
  if (!user) return respond(404, { error: 'User not found' });

  const action = event.queryStringParameters?.action || 'status';

  try {
    // ── ACTION: status — return current card info ────────────────────────────
    if (action === 'status') {
      if (!user.lithic_card_token) {
        return respond(200, { hasCard: false });
      }
      const card = await getCard(user.lithic_card_token);
      return respond(200, {
        hasCard: true,
        card: {
          token: card.token,
          last_four: card.last_four,
          state: card.state,          // OPEN | PAUSED | CLOSED
          spend_limit: card.spend_limit,
          spend_limit_duration: card.spend_limit_duration,
          created: card.created,
          type: card.type,
          memo: card.memo,
          hostname: card.hostname,
        },
      });
    }

    // ── ACTION: create — issue a new virtual card ───────────────────────────
    if (action === 'create' && event.httpMethod === 'POST') {
      if (user.lithic_card_token) {
        return respond(400, { error: 'Card already issued for this account' });
      }

      // Create account holder if not exists
      let accountToken = user.lithic_account_token;
      if (!accountToken) {
        const ah = await createAccountHolder(user);
        accountToken = ah.token;
        await supabasePatch('users', { id: user.id }, { lithic_account_token: accountToken });
      }

      // Issue card
      const card = await createVirtualCard(accountToken);
      await supabasePatch('users', { id: user.id }, { lithic_card_token: card.token });

      return respond(200, {
        success: true,
        card: {
          token: card.token,
          last_four: card.last_four,
          state: card.state,
          type: card.type,
          memo: card.memo,
        },
      });
    }

    // ── ACTION: freeze — pause the card ─────────────────────────────────────
    if (action === 'freeze' && event.httpMethod === 'POST') {
      if (!user.lithic_card_token) return respond(404, { error: 'No card found' });
      await updateCardState(user.lithic_card_token, 'PAUSED');
      return respond(200, { success: true, state: 'PAUSED' });
    }

    // ── ACTION: unfreeze — reopen the card ──────────────────────────────────
    if (action === 'unfreeze' && event.httpMethod === 'POST') {
      if (!user.lithic_card_token) return respond(404, { error: 'No card found' });
      await updateCardState(user.lithic_card_token, 'OPEN');
      return respond(200, { success: true, state: 'OPEN' });
    }

    return respond(400, { error: 'Unknown action' });

  } catch (err) {
    console.error('Lithic error:', err.message);
    return respond(500, { error: err.message || 'Lithic API error' });
  }
};
