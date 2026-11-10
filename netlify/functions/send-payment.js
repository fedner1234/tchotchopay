// TchotchoPay — Stripe PaymentIntent for MonCash / NatCash Transfers
// Keeps STRIPE_SECRET_KEY server-side; frontend never sees it.
// POST body: { amount (USD), wallet ('moncash'|'natcash'), phoneNumber, sessionToken }
// Requires valid session token — unauthenticated requests are rejected.

const STRIPE_API = 'https://api.stripe.com/v1';
const crypto     = require('crypto');

// ── Session token verification ─────────────────────────────────
function verifySessionToken(token) {
  try {
    if (!token) return null;
    const dot      = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payload  = token.slice(0, dot);
    const sig      = token.slice(dot + 1);
    const secret   = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_KEY;
    if (!secret) return null;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (sig.length !== 64 || expected.length !== 64) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data.userId;
  } catch { return null; }
}

// ── Daily limit check via Supabase ─────────────────────────────
// Returns total USD sent by user today (resets at midnight UTC)
async function getDailyTotal(userId) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return 0;
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const res = await fetch(
      `${supabaseUrl}/rest/v1/transactions?user_id=eq.${userId}&created_at=gte.${today}T00:00:00Z&select=amount_usd`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    if (!res.ok) return 0;
    const rows = await res.json();
    return rows.reduce((sum, r) => sum + (parseFloat(r.amount_usd) || 0), 0);
  } catch { return 0; }
}

// ── Allowed origins ────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://tchotchopay.com',
  'https://www.tchotchopay.com',
  /^https:\/\/[a-z0-9-]+--tchotchopay\.netlify\.app$/,
];

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

// ── Stripe REST helper ─────────────────────────────────────────
async function stripePost(path, params) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('Stripe secret key not configured');

  const body = Object.entries(params)
    .flatMap(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        return Object.entries(v).map(([sk, sv]) =>
          `${encodeURIComponent(k + '[' + sk + ']')}=${encodeURIComponent(sv)}`
        );
      }
      return [`${encodeURIComponent(k)}=${encodeURIComponent(v)}`];
    })
    .join('&');

  const res = await fetch(`${STRIPE_API}${path}`, {
    method:  'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(secret + ':').toString('base64'),
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Stripe API error');
  return data;
}

// ── Handler ───────────────────────────────────────────────────
exports.handler = async (event) => {
  const origin  = event.headers['origin'] || event.headers['Origin'] || '';
  const HEADERS = getCORSHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (event.body && event.body.length > 4096) {
    return { statusCode: 413, headers: HEADERS, body: JSON.stringify({ error: 'Request too large' }) };
  }

  try {
    const { amount, wallet, phoneNumber, sessionToken } = JSON.parse(event.body || '{}');

    // ── Authentication required ──────────────────────────────────
    const userId = verifySessionToken(sessionToken);
    if (!userId) {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Authentication required. Please sign in to send money.' }),
      };
    }

    // ── Daily transaction limit: $2,000 per user ─────────────────
    const DAILY_LIMIT = 2000;
    const dailyTotal = await getDailyTotal(userId);
    if (dailyTotal + Number(amount) > DAILY_LIMIT) {
      return {
        statusCode: 429,
        headers: HEADERS,
        body: JSON.stringify({
          error: `Daily limit reached. You have sent $${dailyTotal.toFixed(2)} today. Maximum is $${DAILY_LIMIT}/day.`,
        }),
      };
    }

    // Validate amount: $10 – $1,000
    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum < 10 || amtNum > 1000) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Amount must be between $10 and $1,000' }),
      };
    }

    // Validate wallet
    if (!['moncash', 'natcash'].includes(String(wallet).toLowerCase())) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Wallet must be moncash or natcash' }),
      };
    }

    // Validate phone
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Invalid phone number' }),
      };
    }

    // Fee calculation: Stripe (2.9% + $0.30) + TchotchoPay (2%)
    const transferCents  = Math.round(amtNum * 100);
    const stripeCents    = Math.round(amtNum * 0.029 * 100) + 30;
    const platformCents  = Math.round(amtNum * 0.02 * 100);
    const feeCents       = stripeCents + platformCents;
    const totalCents     = transferCents + feeCents;

    // HTG amount (indicative; actual rate applied at disbursement time)
    const htgRate     = 130;
    const htgAmount   = Math.round(amtNum * htgRate);
    const walletLabel = wallet === 'moncash' ? 'MonCash (Digicel)' : 'NatCash (Natcom)';

    const paymentIntent = await stripePost('/payment_intents', {
      amount:      totalCents,
      currency:    'usd',
      description: `TchotchoPay — ${walletLabel} transfer to +509${cleanPhone}`,
      'metadata[wallet]':           walletLabel,
      'metadata[walletKey]':        wallet,
      'metadata[recipientPhone]':   '+509' + cleanPhone,
      'metadata[transferAmountUsd]':String(amtNum),
      'metadata[htgAmount]':        String(htgAmount),
      'metadata[feeCents]':         String(feeCents),
      'metadata[platform]':         'tchotchopay',
      'metadata[type]':             'wallet_transfer',
    });

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        clientSecret:   paymentIntent.client_secret,
        totalCents,
        feeCents,
        transferCents,
        htgAmount,
      }),
    };

  } catch (err) {
    console.error('send-payment error:', err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
