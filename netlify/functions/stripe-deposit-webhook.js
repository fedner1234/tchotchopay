// stripe-deposit-webhook.js
// Stripe webhook: payment_intent.succeeded → credit USDC to user's Circle wallet
//
// Required Netlify env vars (NEVER in code):
//   STRIPE_WEBHOOK_SECRET        — from Stripe Dashboard → Webhooks → signing secret
//   STRIPE_SECRET_KEY            — already set
//   CIRCLE_API_KEY               — already set
//   CIRCLE_ENTITY_SECRET         — already set (32-byte hex)
//   CIRCLE_TREASURY_WALLET_ID    — your platform treasury wallet ID on Circle (Arc mainnet)
//   SUPABASE_URL                 — already set
//   SUPABASE_SERVICE_KEY         — already set
//   TREASURY_ALERT_THRESHOLD     — optional, default 2000 (alert when treasury below this)
//   ALERT_EMAIL                  — optional, email to notify on low balance (default: fednerfrancois@yahoo.com)

const { webcrypto } = require('node:crypto');
const subtle = webcrypto.subtle;

const CIRCLE_API_BASE = 'https://api.circle.com/v1/w3s';
const BLOCKCHAIN     = 'ARC'; // Arc mainnet — Circle's own L1
const ALERT_THRESHOLD = parseFloat(process.env.TREASURY_ALERT_THRESHOLD || '2000');
const ALERT_EMAIL     = process.env.ALERT_EMAIL || 'fednerfrancois@yahoo.com';

// ── USDC token ID cache (fetched once per cold start) ────────────────────────
let cachedUsdcTokenId = null;

async function getUsdcTokenId() {
  if (cachedUsdcTokenId) return cachedUsdcTokenId;
  const res = await fetch(
    `${CIRCLE_API_BASE}/tokens?blockchain=${BLOCKCHAIN}&includeAll=false`,
    { headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`, Accept: 'application/json' } }
  );
  const data = await res.json();
  const tokens = data.data?.tokens || [];
  const usdc   = tokens.find(t => t.symbol?.toUpperCase() === 'USDC' || t.name?.toUpperCase().includes('USD COIN'));
  if (!usdc) throw new Error(`USDC token not found on ${BLOCKCHAIN}`);
  cachedUsdcTokenId = usdc.id;
  return cachedUsdcTokenId;
}

// ── Stripe webhook signature verification ────────────────────────────────────
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) return false;
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

// ── Supabase helpers ─────────────────────────────────────────────────────────
async function supabaseGet(userId) {
  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=id,circle_wallet_id,wallet_address,usdc_balance`,
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

// ── Circle: transfer USDC from treasury to user wallet ───────────────────────
async function transferUSDC(fromWalletId, toAddress, amountUsdc) {
  const [ciphertext, usdcTokenId] = await Promise.all([
    getEntitySecretCiphertext(),
    getUsdcTokenId(),
  ]);

  const res = await fetch(`${CIRCLE_API_BASE}/developer/transactions/transfer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      idempotencyKey:         webcrypto.randomUUID(),
      entitySecretCiphertext: ciphertext,
      walletId:               fromWalletId,       // source: treasury
      destinationAddress:     toAddress,           // destination: user's Arc wallet address
      blockchain:             BLOCKCHAIN,
      tokenId:                usdcTokenId,         // USDC token UUID on Arc
      amounts:                [String(amountUsdc)],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Circle transfer error: ${res.status}`);
  return data;
}

// ── Circle: get treasury USDC balance ────────────────────────────────────────
async function getTreasuryBalance(walletId) {
  try {
    const res = await fetch(`${CIRCLE_API_BASE}/wallets/${walletId}/balances`, {
      headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`, Accept: 'application/json' },
    });
    const data = await res.json();
    const balances = data.data?.tokenBalances || [];
    const usdc = balances.find(b => b.token?.symbol?.toUpperCase().includes('USDC'));
    return parseFloat(usdc?.amount || '0');
  } catch {
    return null; // non-critical — don't fail the deposit
  }
}

// ── Low-balance alert ─────────────────────────────────────────────────────────
async function sendLowBalanceAlert(balance, threshold) {
  // Log prominently for Netlify function logs
  console.warn(`⚠️  TREASURY LOW BALANCE ALERT: $${balance} USDC remaining (threshold: $${threshold}). Top up CIRCLE_TREASURY_WALLET_ID immediately.`);

  // If an alert webhook is configured (e.g. Slack, ntfy, etc.) fire it
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `⚠️ TchotchoPay treasury low: $${balance} USDC remaining. Top up now at console.circle.com`,
          balance,
          threshold,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error('Alert webhook failed:', e.message);
    }
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig     = event.headers['stripe-signature'];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = event.body || '';

  const valid = await verifyStripeSignature(rawBody, sig, secret);
  if (!valid) {
    console.error('Stripe webhook signature invalid');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  let payload;
  try { payload = JSON.parse(rawBody); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  // Only handle deposit payment intents
  if (payload.type !== 'payment_intent.succeeded') {
    return { statusCode: 200, body: 'Ignored' };
  }

  const pi = payload.data?.object;
  if (!pi) return { statusCode: 400, body: 'Missing payment intent' };

  // Only process deposits tagged for TchotchoPay
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
    // 1. Fetch user from Supabase (need wallet_address for Arc transfer)
    const user = await supabaseGet(userId);
    if (!user) throw new Error(`User ${userId} not found in Supabase`);

    const treasuryWalletId = process.env.CIRCLE_TREASURY_WALLET_ID;
    const userWalletAddress = user.wallet_address; // Arc blockchain address e.g. 0xabc...

    // 2. Transfer USDC from treasury → user's Arc wallet
    if (treasuryWalletId && userWalletAddress) {
      await transferUSDC(treasuryWalletId, userWalletAddress, depositAmt);
      console.log(`✅ Transferred ${depositAmt} USDC → ${userWalletAddress} (user: ${userId})`);

      // 3. Check treasury balance and alert if low
      const balance = await getTreasuryBalance(treasuryWalletId);
      if (balance !== null && balance < ALERT_THRESHOLD) {
        await sendLowBalanceAlert(balance, ALERT_THRESHOLD);
      }
    } else {
      // Treasury or user wallet not configured — log for manual processing
      console.warn(`Circle not fully configured — recording ${depositAmt} USDC deposit for user ${userId} (manual credit needed)`);
    }

    // 4. Update Supabase balance (optimistic — reflects what was sent)
    const currentBalance = parseFloat(user.usdc_balance) || 0;
    await supabaseUpdate(userId, {
      usdc_balance:    (currentBalance + depositAmt).toFixed(6),
      last_deposit_at: new Date().toISOString(),
      last_stripe_pi:  pi.id,
    });

    console.log(`Deposit complete: user=${userId} amount=${depositAmt} USDC pi=${pi.id}`);
    return { statusCode: 200, body: 'ok' };

  } catch (err) {
    console.error('Deposit webhook error:', err.message);
    // Return 200 so Stripe doesn't retry — error is logged for manual review
    return { statusCode: 200, body: `Error logged: ${err.message}` };
  }
};
