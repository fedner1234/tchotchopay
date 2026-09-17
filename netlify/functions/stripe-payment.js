// TchotchoPay — Stripe Payment Intent Creator
// Uses Stripe REST API directly via fetch — no npm packages required.
// Keeps STRIPE_SECRET_KEY server-side; frontend never sees it.

const STRIPE_API = 'https://api.stripe.com/v1';

// ── Allowed origins ───────────────────────────────────────────────
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

// ── Stripe REST helper ────────────────────────────────────────────
async function stripePost(path, params) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('Stripe secret key not configured');

  // Encode params as application/x-www-form-urlencoded
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

// ── Handler ──────────────────────────────────────────────────────────────────
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
    const { amount, carrier, phoneNumber } = JSON.parse(event.body || '{}');

    // Validate amount: $1 – $100
    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum < 1 || amtNum > 100) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid amount' }) };
    }

    // Validate carrier
    if (!['digicel', 'natcom'].includes(String(carrier).toLowerCase())) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid carrier' }) };
    }

    // Validate phone
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid phone number' }) };
    }

    // Fees: Stripe cost (2.9% + $0.30) + TchotchoPay platform fee (2%)
    const topupCents    = Math.round(amtNum * 100);
    const stripeCents   = Math.round(amtNum * 0.029 * 100) + 30;
    const platformCents = Math.round(amtNum * 0.02 * 100);
    const feeCents      = stripeCents + platformCents;
    const totalCents    = topupCents + feeCents;
    const carrierLabel = carrier === 'digicel' ? 'Digicel Haiti' : 'Natcom Haiti';

    const paymentIntent = await stripePost('/payment_intents', {
      amount:      totalCents,
      currency:    'usd',
      description: `TchotchoPay — ${carrierLabel} top-up for +509${cleanPhone}`,
      'metadata[carrier]':     carrierLabel,
      'metadata[phoneNumber]': '+509' + cleanPhone,
      'metadata[topupAmount]':    String(amtNum),
      'metadata[platformFeeCents]': String(platformCents),
      'metadata[platform]':    'tchotchopay',
    });

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        clientSecret:   paymentIntent.client_secret,
        totalCents,
        feeCents,
        topupCents,
        stripeCents,
        platformCents,
      }),
    };

  } catch (err) {
    console.error('Stripe function error:', err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
