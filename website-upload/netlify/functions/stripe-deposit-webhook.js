// stripe-deposit-webhook.js
// Stripe webhook: payment_intent.succeeded → credit USDC to user's Circle wallet
//
// Required Netlify env vars (NEVER in code):
//   STRIPE_WEBHOOK_SECRET        — from Stripe Dashboard → Webhooks → signing secret
//   STRIPE_SECRET_KEY            — already set
//   CIRCLE_API_KEY               — already set
//   CIRCLE_ENTITY_SECRET         — already set (32-byte hex)
//   CIRCLE_TREASURY_WALLET_ID    — your platform's main USDC wallet ID on Circle
//   SUPABASE_URL                 — already set
//   SUPABASE_SERVICE_KEY         — already set

const { webcrypto } = require('node:crypto');
const subtle = webcrypto.subtle;

const CIRCLE_API_BASE = 'https://api.circle.com/v1/w3s';

// ── Stripe webhook signature verification ────────────────────────────────────
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) return false;

  // sigHeader format: "t=<timestamp>,v1=<sig>,v1=<sig2>..."
  const parts   = sigHeader.split(',');
  const tPart   = parts.find(p => p.startsWith('t='));
  const v1Parts = parts.filter(p => p.startsWith('v1='));
  if (!tPart || !v1Parts.length) return false;

  const timestamp = tPart.slice(2);
  const signed    = `${timestamp}.${rawBody}`;

  const keyBytes  = new TextEncoder().encode(secret);
  const msgBytes  = new TextEncoder().encode(signed);
  const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBytes  = await subtle.sign('HMAC', cryptoKey, msgBytes);
  const computed  = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, '0')).join('');

  // Replay protection: reject events older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (age > 300) return false;

  return v1Parts.some(p => p.slice(3) === computed);
}

// ── Supabase helper ──────────────────────────────────────────────────────────
async function supabaseGet(userId) {
  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=id,circle_wallet_id,usdc_balance`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const rows = await res.json();
  return rows?.[0] || null;
}

async function supabaseUpdate(userId, fields) {
  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(fields),
    }
  );
  if (!res.ok) throw new Error(`Supabase PATCH failed: ${await res.text()}`);
}

// ── Circle: encrypt entity secret ────────────────────────────────────────────
async function getEntitySecretCiphertext() {
  const res = await fetch(`${CIRCLE_API_BASE}/config/entity/publicKey`, {
    headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}` },
  });
  const data = await res.json();
  const pem  = data.data.publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\n/g, '')
    .trim();
  const der  = Buffer.from(pem, 'base64');
  const key  = await subtle.importKey('spki', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  const enc  = await subtle.encrypt({ name: 'RSA-OAEP' }, key, Buffer.from(process.env.CIRCLE_ENTITY_SECRET, 'hex'));
  return Buffer.from(enc).toString('base64');
}

// ── Circle: transfer USDC ────────────────────────────────────────────────────
async function transferUSDC(fromWalletId, toWalletId, amountUsdc) {
  const ciphertext = await getEntitySecretCiphertext();

  const res = await fetch(`${CIRCLE_API_BASE}/developer/transactions/transfer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idempotencyKey:      webcrypto.randomUUID(),
      entitySecretCiphertext: ciphertext,
      walletId:            fromWalletId,
      destinationAddress:  null,         // null when transferring to another Circle wallet
      destinationWalletId: toWalletId,
      blockchain:          'BASE',
      tokenId:             'USDC',
      amounts:             [String(amountUsdc)],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Circle transfer error: ${res.status}`);
  return data;
}

// ── Stripe: retrieve payment intent ──────────────────────────────────────────
async function getPaymentIntent(piId) {
  const res = await fetch(`https://api.stripe.com/v1/payment_intents/${piId}`, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(process.env.STRIPE_SECRET_KEY + ':').toString('base64'),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Stripe PI fetch failed');
  return data;
}

// ── Handler ──────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig    = event.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = event.body || '';

  const valid = await verifyStripeSignature(rawBody, sig, secret);
  if (!valid) {
    console.error('Stripe webhook signature invalid');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Only handle deposit payment intents
  if (payload.type !== 'payment_intent.succeeded') {
    return { statusCode: 200, body: 'Ignored' };
  }

  const pi = payload.data?.object;
  if (!pi) return { statusCode: 400, body: 'Missing payment intent' };

  // Only process deposits (not top-ups, etc.)
  if (pi.metadata?.platform !== 'tchotchopay' || !pi.metadata?.depositUSDC) {
    return { statusCode: 200, body: 'Not a deposit — skipped' };
  }

  const userId     = pi.metadata.userId;
  const depositAmt = parseFloat(pi.metadata.depositUSDC);

  if (!userId || isNaN(depositAmt) || depositAmt <= 0) {
    console.error('Invalid deposit metadata:', pi.metadata);
    return { statusCode: 400, body: 'Invalid metadata' };
  }

  try {
    // 1. Fetch user from Supabase
    const user = await supabaseGet(userId);
    if (!user) throw new Error(`User ${userId} not found in Supabase`);

    const treasuryWalletId = process.env.CIRCLE_TREASURY_WALLET_ID;
    const userWalletId     = user.circle_wallet_id;

    // 2. Transfer USDC if Circle wallets are configured
    if (treasuryWalletId && userWalletId) {
      await transferUSDC(treasuryWalletId, userWalletId, depositAmt);
      console.log(`Transferred ${depositAmt} USDC from treasury to ${userWalletId}`);
    } else {
      // Circle not live yet — just log, balance updated below
      console.log(`Circle not live — recording ${depositAmt} USDC deposit for user ${userId}`);
    }

    // 3. Update Supabase balance
    const currentBalance = parseFloat(user.usdc_balance) || 0;
    await supabaseUpdate(userId, {
      usdc_balance: (currentBalance + depositAmt).toFixed(6),
      last_deposit_at: new Date().toISOString(),
      last_stripe_pi: pi.id,
    });

    console.log(`Deposit complete: user=${userId} amount=${depositAmt} USDC pi=${pi.id}`);
    return { statusCode: 200, body: 'ok' };

  } catch (err) {
    console.error('Deposit webhook error:', err.message);
    // Return 200 so Stripe doesn't retry — log the error for manual review
    return { statusCode: 200, body: `Error logged: ${err.message}` };
  }
};
