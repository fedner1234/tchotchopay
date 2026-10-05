// TchotchoPay — MonCash & NatCash Wallet Transfer
//
// Called AFTER Stripe payment is confirmed on the frontend.
// Verifies the PaymentIntent is actually paid via Stripe API,
// then disburses funds to the recipient's MonCash or NatCash wallet.
//
// Required env vars for each wallet:
//   MonCash:  MONCASH_CLIENT_ID, MONCASH_CLIENT_SECRET
//   NatCash:  NATCASH_CLIENT_ID, NATCASH_CLIENT_SECRET
//   Both:     MONCASH_SANDBOX=false (default: sandbox ON)
//
// If credentials are absent, the transfer is queued for manual
// processing — all details are stored in Stripe PaymentIntent
// metadata, visible in the Stripe Dashboard.

const STRIPE_API = 'https://api.stripe.com/v1';
const HTG_RATE   = 130; // 1 USD = 130 HTG (indicative)

// ── MonCash endpoints ──────────────────────────────────────────
const MONCASH_SANDBOX = process.env.MONCASH_SANDBOX !== 'false';
const MONCASH_BASE = MONCASH_SANDBOX
  ? 'https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware'
  : 'https://moncashbutton.digicelgroup.com/Moncash-middleware';

// ── NatCash endpoints ──────────────────────────────────────────
// NatCash API credentials and base URL — update when obtained
const NATCASH_SANDBOX = process.env.NATCASH_SANDBOX !== 'false';
const NATCASH_BASE = NATCASH_SANDBOX
  ? 'https://sandbox.natcash.ht/api'        // placeholder — confirm with Natcom
  : 'https://api.natcash.ht/api';            // placeholder — confirm with Natcom

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

// ── Stripe: verify payment intent ─────────────────────────────
async function verifyStripePayment(paymentIntentId) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('Stripe secret key not configured');

  const res = await fetch(`${STRIPE_API}/payment_intents/${paymentIntentId}`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(secret + ':').toString('base64'),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Stripe verification failed');
  return data;
}

// ── MonCash: get OAuth token ───────────────────────────────────
async function getMoncashToken() {
  const clientId = process.env.MONCASH_CLIENT_ID;
  const secret   = process.env.MONCASH_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error('MonCash credentials not configured');

  const res = await fetch(
    `${MONCASH_BASE}/oauth/token?scope=read,write&grant_type=client_credentials`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
        'Accept':        'application/json',
        'Content-Type':  'application/x-www-form-urlencoded',
      },
    }
  );
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`MonCash auth failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// ── MonCash: send transfer ─────────────────────────────────────
// Endpoint: POST {base}/v1/Business/transfert
// Body: { amount (HTG), receiver (phone with country code), desc }
async function moncashTransfer(token, phoneNumber, amountHTG, description) {
  const res = await fetch(`${MONCASH_BASE}/v1/Business/transfert`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/json',
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      amount:   amountHTG,
      receiver: phoneNumber,  // e.g. "50943280714" (country code + local number)
      desc:     description,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`MonCash transfer failed: ${JSON.stringify(data)}`);
  return data;
}

// ── NatCash: get OAuth token ───────────────────────────────────
// TODO: Replace with actual NatCash API auth when credentials obtained from Natcom
async function getNatcashToken() {
  const clientId = process.env.NATCASH_CLIENT_ID;
  const secret   = process.env.NATCASH_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error('NatCash credentials not configured');

  // NatCash OAuth — endpoint to be confirmed with Natcom business team
  const res = await fetch(`${NATCASH_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
      'Accept':        'application/json',
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`NatCash auth failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// ── NatCash: send transfer ─────────────────────────────────────
// TODO: Confirm exact endpoint and body schema with Natcom
async function natcashTransfer(token, phoneNumber, amountHTG, description) {
  const res = await fetch(`${NATCASH_BASE}/v1/transfer`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/json',
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      amount:      amountHTG,
      destination: phoneNumber,
      reference:   description,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`NatCash transfer failed: ${JSON.stringify(data)}`);
  return data;
}

// ── Rate limiter ───────────────────────────────────────────────
const rateLimitStore = {};
function isRateLimited(ip) {
  const key = `transfer:${ip}`;
  const now = Date.now();
  if (!rateLimitStore[key]) rateLimitStore[key] = [];
  rateLimitStore[key] = rateLimitStore[key].filter(t => now - t < 60000);
  if (rateLimitStore[key].length >= 3) return true;  // 3 transfers per minute per IP
  rateLimitStore[key].push(now);
  return false;
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

  const clientIP = event.headers['x-nf-client-connection-ip']
    || (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';

  if (isRateLimited(clientIP)) {
    return { statusCode: 429, headers: HEADERS, body: JSON.stringify({ error: 'Too many requests. Please wait.' }) };
  }

  try {
    const { wallet, phoneNumber, amountUsd, paymentIntentId } = JSON.parse(event.body || '{}');

    // ── Validate inputs ────────────────────────────────────────
    if (!wallet || !phoneNumber || !amountUsd || !paymentIntentId) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Missing required fields: wallet, phoneNumber, amountUsd, paymentIntentId' }),
      };
    }

    const walletKey = String(wallet).toLowerCase();
    if (!['moncash', 'natcash'].includes(walletKey)) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid wallet type' }) };
    }

    const amt = Number(amountUsd);
    if (isNaN(amt) || amt < 10 || amt > 1000) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid amount' }) };
    }

    const cleanPhone = String(phoneNumber).replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid phone number' }) };
    }

    // ── Verify Stripe payment is actually paid ─────────────────
    const pi = await verifyStripePayment(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return {
        statusCode: 402,
        headers: HEADERS,
        body: JSON.stringify({ error: `Payment not confirmed. Status: ${pi.status}` }),
      };
    }

    // ── Verify amount matches what was charged ─────────────────
    // Allow a small tolerance for rounding differences
    const expectedCents = Math.round(amt * 100);
    const stripeCents   = Math.round(amt * 0.029 * 100) + 30;
    const platformCents = Math.round(amt * 0.02 * 100);
    const totalExpected = expectedCents + stripeCents + platformCents;
    if (Math.abs(pi.amount - totalExpected) > 5) {
      console.error(`Amount mismatch: PI=${pi.amount} expected=${totalExpected}`);
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Amount mismatch. Please contact support.' }),
      };
    }

    const amountHTG   = Math.round(amt * HTG_RATE);
    const fullPhone   = '509' + cleanPhone;   // e.g. "50943280714"
    const description = `TchotchoPay transfer | ${pi.id} | ${new Date().toISOString()}`;
    const walletLabel = walletKey === 'moncash' ? 'MonCash' : 'NatCash';

    // ── Attempt wallet API transfer ────────────────────────────
    let transactionId = null;
    let apiUsed       = false;

    if (walletKey === 'moncash') {
      const hasCreds = process.env.MONCASH_CLIENT_ID && process.env.MONCASH_CLIENT_SECRET;
      if (hasCreds) {
        try {
          const token  = await getMoncashToken();
          const result = await moncashTransfer(token, fullPhone, amountHTG, description);
          transactionId = result.transactionId || result.transaction_id || result.orderId || null;
          apiUsed = true;
          console.log(`MonCash transfer success: ${JSON.stringify(result)}`);
        } catch (apiErr) {
          console.error('MonCash API error (falling back to manual):', apiErr.message);
          // Fall through to manual queue — payment is already captured
        }
      }
    }

    if (walletKey === 'natcash') {
      const hasCreds = process.env.NATCASH_CLIENT_ID && process.env.NATCASH_CLIENT_SECRET;
      if (hasCreds) {
        try {
          const token  = await getNatcashToken();
          const result = await natcashTransfer(token, fullPhone, amountHTG, description);
          transactionId = result.transactionId || result.transaction_id || result.reference || null;
          apiUsed = true;
          console.log(`NatCash transfer success: ${JSON.stringify(result)}`);
        } catch (apiErr) {
          console.error('NatCash API error (falling back to manual):', apiErr.message);
          // Fall through to manual queue
        }
      }
    }

    // ── Manual processing fallback ─────────────────────────────
    // If no API credentials or API failed, the transfer details are
    // stored in Stripe PaymentIntent metadata (set by send-payment.js).
    // Admin can view all pending transfers in the Stripe Dashboard at:
    // https://dashboard.stripe.com → Payments → filter by metadata.type=wallet_transfer
    if (!apiUsed) {
      console.log(`MANUAL QUEUE: ${walletLabel} transfer to +509${cleanPhone} for ${amt} USD (${amountHTG} HTG) | PI: ${pi.id}`);
    }

    // ── Success response ───────────────────────────────────────
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success:       true,
        wallet:        walletLabel,
        recipient:     '+509' + cleanPhone,
        amountUsd:     amt,
        amountHTG,
        transactionId: transactionId || pi.id,
        eta:           apiUsed ? 'Delivered instantly' : 'Within 30 minutes',
        method:        apiUsed ? 'api' : 'queued',
      }),
    };

  } catch (err) {
    console.error('moncash-transfer error:', err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
