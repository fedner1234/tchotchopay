// TchotchoPay — Add Funds (Wallet Top-Up via Stripe)
// Creates a Stripe Payment Intent for loading the user's USDC wallet.
// No carrier or phone number required — amount only.
// STRIPE_SECRET_KEY must be set in Netlify environment variables.

const STRIPE_API = 'https://api.stripe.com/v1';
const crypto     = require('crypto');

function verifySessionToken(token) {
  try {
    if (!token) return null;
    const dot = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payload  = token.slice(0, dot);
    const sig      = token.slice(dot + 1);
    const secret   = process.env.SUPABASE_SERVICE_KEY;
    if (!secret) return null;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (sig.length !== 64 || expected.length !== 64) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data.userId;
  } catch { return null; }
}

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  };
}

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

exports.handler = async (event) => {
  const origin  = event.headers['origin'] || event.headers['Origin'] || '';
  const HEADERS = getCORSHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (event.body && event.body.length > 2048) {
    return { statusCode: 413, headers: HEADERS, body: JSON.stringify({ error: 'Request too large' }) };
  }

  // Require valid session
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const rawToken   = authHeader.replace(/^Bearer\s+/i, '').trim();
  const userId     = verifySessionToken(rawToken);
  if (!userId) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Authentication required' }) };
  }

  try {
    const { amount, currency = 'usd' } = JSON.parse(event.body || '{}');

    // Validate amount: $10 – $5,000
    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum < 10 || amtNum > 5000) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Amount must be between $10 and $5,000' }),
      };
    }

    // Fee calculation: Stripe (2.9% + $0.30) + TchotchoPay platform fee (1%)
    const depositCents   = Math.round(amtNum * 100);
    const stripeCents    = Math.round(amtNum * 0.029 * 100) + 30;
    const platformCents  = Math.round(amtNum * 0.01 * 100);
    const feeCents       = stripeCents + platformCents;
    const totalCents     = depositCents + feeCents;

    const paymentIntent = await stripePost('/payment_intents', {
      amount:               totalCents,
      currency:             currency.toLowerCase(),
      description:          `TchotchoPay — Wallet deposit $${amtNum.toFixed(2)}`,
      automatic_payment_methods: { enabled: 'true' },
      'metadata[type]':           'wallet_deposit',
      'metadata[depositAmountUsd]': String(amtNum),
      'metadata[feeCents]':         String(feeCents),
      'metadata[platform]':         'tchotchopay',
    });

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        clientSecret:  paymentIntent.client_secret,
        totalCents,
        feeCents,
        depositCents,
        stripeCents,
        platformCents,
        feeUsd:  (feeCents / 100).toFixed(2),
        totalUsd: (totalCents / 100).toFixed(2),
      }),
    };

  } catch (err) {
    console.error('add-funds error:', err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
