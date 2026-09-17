// Tchotcho Pay — Reloadly API Proxy
// Keeps client_secret server-side; called from topup.html
// Sandbox mode: set RELOADLY_SANDBOX=true in Netlify env to enable sandbox (default: PRODUCTION)

const CLIENT_ID     = process.env.RELOADLY_CLIENT_ID;
const CLIENT_SECRET = process.env.RELOADLY_CLIENT_SECRET;
const SANDBOX       = process.env.RELOADLY_SANDBOX === 'true'; // default: PRODUCTION

// Auth URL is always auth.reloadly.com — sandbox vs production is determined by the audience
const AUTH_URL  = 'https://auth.reloadly.com/oauth/token';
const API_BASE  = SANDBOX
  ? 'https://topups-sandbox.reloadly.com'
  : 'https://topups.reloadly.com';
const AUDIENCE  = SANDBOX
  ? 'https://topups-sandbox.reloadly.com'
  : 'https://topups.reloadly.com';

// ── Allowed origins ───────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://tchotchopay.com',
  'https://www.tchotchopay.com',
  // Allow Netlify preview deploys during development
  /^https:\/\/[a-z0-9-]+--tchotchopay\.netlify\.app$/,
];

// ── Simple in-memory rate limiter ─────────────────────────────────
// Limits each IP to 10 requests per minute per action
const rateLimitStore = {};
function isRateLimited(ip, action) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const window = 60 * 1000; // 1 minute
  const maxRequests = action === 'topup' ? 5 : 20; // stricter for actual top-ups

  if (!rateLimitStore[key]) rateLimitStore[key] = [];
  // Remove entries older than the window
  rateLimitStore[key] = rateLimitStore[key].filter(t => now - t < window);

  if (rateLimitStore[key].length >= maxRequests) return true;
  rateLimitStore[key].push(now);
  return false;
}

// ── Input validation ──────────────────────────────────────────────
function validateTopupInputs(operatorId, amount, phoneNumber) {
  const errors = [];

  // operatorId must be a positive integer
  if (!Number.isInteger(Number(operatorId)) || Number(operatorId) <= 0) {
    errors.push('Invalid operatorId');
  }

  // amount must be a number between $1 and $100
  const amt = Number(amount);
  if (isNaN(amt) || amt < 1 || amt > 100) {
    errors.push('Amount must be between $1 and $100');
  }

  // Phone number: strip non-digits, must be 8 digits (Haiti local) or 11 digits with country code
  const cleanPhone = String(phoneNumber).replace(/\D/g, '');
  if (cleanPhone.length < 8 || cleanPhone.length > 15) {
    errors.push('Invalid phone number');
  }

  return errors;
}

// ── CORS headers builder ──────────────────────────────────────────
function getCORSHeaders(requestOrigin) {
  const allowed = ALLOWED_ORIGINS.some(o =>
    typeof o === 'string' ? o === requestOrigin : o.test(requestOrigin)
  );
  const origin = allowed ? requestOrigin : 'https://tchotchopay.com';
  return {
    'Access-Control-Allow-Origin':  origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  };
}

// ── Auth ─────────────────────────────────────────────────────────────────────
async function getToken() {
  const res = await fetch(AUTH_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type:    'client_credentials',
      audience:      AUDIENCE
    })
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(`Auth failed: ${res.status} — ${JSON.stringify(errBody)}`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error(`Auth OK but no token: ${JSON.stringify(data)}`);
  return data.access_token;
}

// ── Handler ──────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const origin = event.headers['origin'] || event.headers['Origin'] || '';
  const HEADERS = getCORSHeaders(origin);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Block oversized payloads (prevents payload attacks)
  if (event.body && event.body.length > 10240) {
    return { statusCode: 413, headers: HEADERS, body: JSON.stringify({ error: 'Request too large' }) };
  }

  // Get client IP for rate limiting
  const clientIP = event.headers['x-nf-client-connection-ip']
    || (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';

  try {
    const body   = JSON.parse(event.body || '{}');
    const action = body.action;

    if (!action) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing action' }) };
    }

    // Whitelist — reject any unknown action outright
    const ALLOWED_ACTIONS = ['operators', 'topup', 'denominations', 'balance'];
    if (!ALLOWED_ACTIONS.includes(action)) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Unknown action' }) };
    }

    // Rate limit: 5 top-up attempts per IP per minute, 20 for lookups
    if (isRateLimited(clientIP, action)) {
      return { statusCode: 429, headers: HEADERS, body: JSON.stringify({ error: 'Too many requests. Please wait a moment.' }) };
    }

    const token = await getToken();
    const apiHeaders = {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/com.reloadly.topups-v1+json',
      'Content-Type':  'application/json'
    };

    // ── BALANCE PRE-CHECK (called before Stripe to protect customer) ─────────
    if (action === 'balance') {
      const { amount } = body;
      const needed = parseFloat(amount || 0) + 1; // topup amount + $1 buffer
      const balRes  = await fetch(`${API_BASE}/accounts/balance`, { headers: apiHeaders });
      const balData = await balRes.json();
      const balance = parseFloat(balData.balance || 0);
      if (!balRes.ok || balance < needed) {
        console.error(`Low balance: $${balance} needed $${needed}`);
        return {
          statusCode: 503,
          headers: HEADERS,
          body: JSON.stringify({
            error: 'Top-up service is temporarily unavailable. Please try again in a few minutes or contact support@tchotchopay.com.',
            code: 'LOW_BALANCE'
          })
        };
      }
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, balance }) };
    }

    // ── GET OPERATORS BY COUNTRY ─────────────────────────────────────────────
    if (action === 'operators') {
      const { country } = body;
      // Whitelist supported countries
      const countryCode = ['HT', 'DO', 'CU', 'JM', 'TT', 'GY'].includes(country) ? country : 'HT';
      const res  = await fetch(`${API_BASE}/operators/countries/${countryCode}`, { headers: apiHeaders });
      const data = await res.json();

      const filtered = (Array.isArray(data) ? data : data.content || []).map(op => ({
        id:   op.id,
        name: op.name,
        logoUrls: op.logoUrls
      }));

      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(filtered) };
    }

    // ── SEND TOP-UP ──────────────────────────────────────────────────────────
    if (action === 'topup') {
      const { operatorId, amount, phoneNumber, recipientCountry } = body;

      if (!operatorId || !amount || !phoneNumber) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing operatorId, amount, or phoneNumber' }) };
      }

      // Whitelist recipient country
      const recipCountry = ['HT', 'DO', 'CU', 'JM', 'TT', 'GY'].includes(recipientCountry) ? recipientCountry : 'HT';

      // Validate inputs before hitting Reloadly
      const validationErrors = validateTopupInputs(operatorId, amount, phoneNumber);
      if (validationErrors.length > 0) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: validationErrors.join('; ') }) };
      }

      // Strip non-digits from phone number
      const cleanPhone = String(phoneNumber).replace(/\D/g, '');

      // ── Balance check before charging customer ────────────────────
      try {
        const balRes  = await fetch(`${API_BASE}/accounts/balance`, { headers: apiHeaders });
        const balData = await balRes.json();
        const balance = parseFloat(balData.balance || 0);
        const needed  = parseFloat(amount) + 1; // topup amount + $1 buffer
        if (balRes.ok && balance < needed) {
          console.error(`Reloadly low balance: $${balance} — needed $${needed}`);
          return {
            statusCode: 503,
            headers: HEADERS,
            body: JSON.stringify({
              error: 'Top-up service is temporarily unavailable. Your card has NOT been charged. Please try again in a few minutes or contact support@tchotchopay.com.',
              code:  'LOW_BALANCE'
            })
          };
        }
      } catch (balErr) {
        // Balance check failed — log and continue (don't block the topup)
        console.warn('Balance check failed:', balErr.message);
      }

      const res = await fetch(`${API_BASE}/topups`, {
        method:  'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          operatorId,
          amount,
          useLocalAmount:   false,
          customIdentifier: `tchotchopay-${Date.now()}`,
          recipientPhone: {
            countryCode: recipCountry,
            number:      cleanPhone
          },
          senderPhone: {
            countryCode: 'US',
            number:      '3058888888'
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return { statusCode: res.status, headers: HEADERS, body: JSON.stringify({ error: data.message || 'Top-up failed', details: data }) };
      }

      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    // ── GET FIXED DENOMINATIONS FOR AN OPERATOR ──────────────────────────────
    if (action === 'denominations') {
      const { operatorId } = body;
      if (!operatorId) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing operatorId' }) };
      }
      const res  = await fetch(`${API_BASE}/operators/${operatorId}/fixed-denominations`, { headers: apiHeaders });
      const data = await res.json();
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) };

  } catch (err) {
    console.error('Reloadly function error:', err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
