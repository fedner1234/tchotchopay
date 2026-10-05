// netlify/functions/alchemy-webhook.js
// Receives Alchemy Notify webhooks when USDC moves on Base
// Set this as your webhook URL in Alchemy dashboard:
//   https://tchotchopay.com/.netlify/functions/alchemy-webhook
//
// Required env var: ALCHEMY_WEBHOOK_SECRET (from Alchemy dashboard)
// This function validates the signature so only real Alchemy events pass.

const crypto = require('crypto');

// ── Signature verification ───────────────────────────────────────
// Alchemy signs every webhook with HMAC-SHA256 using your signing key.
// Never skip this — without it anyone can fake USDC arrival events.
function verifyAlchemySignature(rawBody, signatureHeader, signingKey) {
  if (!signatureHeader || !signingKey) return false;
  const expected = crypto
    .createHmac('sha256', signingKey)
    .update(rawBody, 'utf8')
    .digest('hex');
  // Constant-time compare to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

// ── Format USDC amount (6 decimals) ─────────────────────────────
function formatUsdc(hexValue) {
  try {
    const raw = BigInt(hexValue || '0x0');
    return (Number(raw) / 1e6).toFixed(2);
  } catch {
    return '0.00';
  }
}

// ── Handler ──────────────────────────────────────────────────────
exports.handler = async (event) => {
  // Alchemy sends POST only
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const rawBody = event.body || '';
  const signature = event.headers['x-alchemy-signature'] || '';
  const signingKey = process.env.ALCHEMY_WEBHOOK_SECRET;

  // ── Verify signature ─────────────────────────────────────────
  if (!verifyAlchemySignature(rawBody, signature, signingKey)) {
    console.warn('Alchemy webhook: invalid signature — rejected');
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // ── Process webhook event ────────────────────────────────────
  const webhookType = payload.type || payload.webhookType;
  const event_data = payload.event || {};

  console.log(`Alchemy webhook received: type=${webhookType}`);

  // ADDRESS_ACTIVITY webhook — fires on any USDC transfer
  if (webhookType === 'ADDRESS_ACTIVITY' || webhookType === 'GRAPHQL') {
    const activities = event_data.activity || [];

    for (const activity of activities) {
      const { asset, category, value, toAddress, fromAddress, hash, log } = activity;

      // Filter for USDC ERC-20 transfers only
      if (category !== 'token' && category !== 'erc20') continue;
      if (!asset || !asset.toUpperCase().includes('USDC')) continue;

      const amountUsdc = value
        ? parseFloat(value).toFixed(2)
        : log?.data ? formatUsdc(log.data) : '0.00';

      console.log(`USDC Transfer detected:
        From: ${fromAddress}
        To:   ${toAddress}
        Amount: ${amountUsdc} USDC
        Tx: ${hash}
      `);

      // ── Here you would:
      // 1. Look up which TchotchoPay user owns `toAddress`
      // 2. Update their balance in your database
      // 3. Send a push notification / email / SMS
      // For now, we log and acknowledge — extend this as auth/DB is added
    }
  }

  // TOKEN_TRANSFER webhook (alternative type from Alchemy)
  if (webhookType === 'TOKEN_TRANSFER') {
    const transfers = event_data.transfers || [];
    for (const t of transfers) {
      if (!t.asset?.symbol?.toUpperCase().includes('USDC')) continue;
      console.log(`USDC token transfer: ${t.value} USDC | ${t.from} → ${t.to} | ${t.transactionHash}`);
    }
  }

  // Always return 200 immediately — Alchemy retries on non-2xx
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  };
};
