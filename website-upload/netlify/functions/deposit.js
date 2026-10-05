// deposit.js — Stripe Payment Intent for USDC wallet deposits
// Env vars required: STRIPE_SECRET_KEY
// Amount range: $5 – $2000

const STRIPE_API = 'https://api.stripe.com/v1';

const ALLOWED_ORIGINS = [
  'https://tchotchopay.com',
  'https://www.tchotchopay.com',
  /^https:\/\/[a-z0-9-]+--tchotchopay\.netlify\.app$/,
];

function getCORSHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some(o =>
    typeof o === 'string' ? o === origin : o.test(origin)
  );
  return {
    'Access-Control-Allow-Origin':  allowed ? origin : 'https://tchotchopay.com',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  };
}

// Rate limiter — 10 requests/minute per IP
const rateStore = {};
function isRateLimited(ip) {
  const key = `dep:${ip}`;
  const now = Date.now();
  if (!rateStore[key]) rateStore[key] = [];
  rateStore[key] = rateStore[key].filter(t => now - t < 60000);
  if (rateStore[key].length >= 10) return true;
  rateStore[key].push(now);
  return false;
}

async function stripePost(path, params, secret) {
  const body = Object.entries(params)
    .flatMap(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        return Object.entries(v).map(([sk, sv]) =>
          `${encodeURIComponent(`${k}[${sk}]`)}=${encodeURIComponent(sv)}`
        );
      }
      return [`${encodeURIComponent(k)}=${encodeURIComponent(v)}`];
    })
    .join('&');

  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
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
  const headers = getCORSHeaders(origin);

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Payment not configured' }) };

  const ip = event.headers['x-nf-client-connection-ip']
    || (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests' }) };

  let amount, userId;
  try {
    ({ amount, userId } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const amtNum = Number(amount);
  if (isNaN(amtNum) || amtNum < 5 || amtNum > 2000) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Amount must be between $5 and $2,000' }) };
  }
  if (!userId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'userId required' }) };
  }

  try {
    // Fees: Stripe 2.9% + $0.30 + TchotchoPay 1%
    const depositCents  = Math.round(amtNum * 100);
    const stripeCents   = Math.round(amtNum * 0.029 * 100) + 30;
    const platformCents = Math.round(amtNum * 0.01 * 100);
    const feeCents      = stripeCents + platformCents;
    const totalCents    = depositCents + feeCents;

    const pi = await stripePost('/payment_intents', {
      amount:   totalCents,
      currency: 'usd',
      description: 'TchotchoPay — USDC wallet deposit',
      'automatic_payment_methods[enabled]': 'true',
      'metadata[userId]':       userId,
      'metadata[depositUSDC]':  String(amtNum),
      'metadata[feeCents]':     String(feeCents),
      'metadata[platform]':     'tchotchopay',
    }, secret);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret:  pi.client_secret,
        totalCents,
        depositCents,
        feeCents,
      }),
    };
  } catch (err) {
    console.error('Deposit error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
