// treasury-admin.js
// Protected treasury management: view balance, withdraw USDC, view recent transfers
//
// POST /.netlify/functions/treasury-admin
// Body: { "adminSecret": "<ADMIN_SECRET>", "action": "getBalance" | "withdraw", ... }
//
// withdraw: { adminSecret, action: "withdraw", toAddress, amount }

const { webcrypto } = require('node:crypto');
const subtle = webcrypto.subtle;

const CIRCLE_API_BASE    = 'https://api.circle.com/v1/w3s';
const BLOCKCHAIN         = 'ARC';

// ── Circle helpers ────────────────────────────────────────────────────────────
async function getEntitySecretCiphertext() {
  const res = await fetch(`${CIRCLE_API_BASE}/config/entity/publicKey`, {
    headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}` },
  });
  const data = await res.json();
  const pem  = data.data.publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\n/g, '').trim();
  const der  = Buffer.from(pem, 'base64');
  const key  = await subtle.importKey('spki', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  const enc  = await subtle.encrypt({ name: 'RSA-OAEP' }, key, Buffer.from(process.env.CIRCLE_ENTITY_SECRET, 'hex'));
  return Buffer.from(enc).toString('base64');
}

let cachedUsdcTokenId = null;
async function getUsdcTokenId() {
  if (cachedUsdcTokenId) return cachedUsdcTokenId;
  const res  = await fetch(`${CIRCLE_API_BASE}/tokens?blockchain=${BLOCKCHAIN}`, {
    headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`, Accept: 'application/json' },
  });
  const data = await res.json();
  const usdc = (data.data?.tokens || []).find(t => t.symbol?.toUpperCase() === 'USDC' || t.name?.toUpperCase().includes('USD COIN'));
  if (!usdc) throw new Error('USDC token not found on ARC');
  cachedUsdcTokenId = usdc.id;
  return cachedUsdcTokenId;
}

async function getTreasuryBalance(walletId) {
  const res  = await fetch(`${CIRCLE_API_BASE}/wallets/${walletId}/balances`, {
    headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`, Accept: 'application/json' },
  });
  const data = await res.json();
  const balances = data.data?.tokenBalances || [];
  const usdc = balances.find(b => b.token?.symbol?.toUpperCase().includes('USDC'));
  return {
    usdc:     parseFloat(usdc?.amount || '0'),
    raw:      balances,
    walletId,
    address:  '0xaaacb6cda737addcedea7dc9df7493950b023439',
  };
}

async function withdrawUsdc(fromWalletId, toAddress, amount) {
  const [ciphertext, tokenId] = await Promise.all([getEntitySecretCiphertext(), getUsdcTokenId()]);
  const res = await fetch(`${CIRCLE_API_BASE}/developer/transactions/transfer`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${process.env.CIRCLE_API_KEY}`,
      'Content-Type': 'application/json',
      Accept:         'application/json',
    },
    body: JSON.stringify({
      idempotencyKey:         webcrypto.randomUUID(),
      entitySecretCiphertext: ciphertext,
      walletId:               fromWalletId,
      destinationAddress:     toAddress,
      blockchain:             BLOCKCHAIN,
      tokenId,
      amounts:                [String(amount)],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Circle transfer error: ${res.status}`);
  return data;
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  // Admin auth
  if (!process.env.ADMIN_SECRET || body.adminSecret !== process.env.ADMIN_SECRET) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const treasuryWalletId = process.env.CIRCLE_TREASURY_WALLET_ID;
  if (!treasuryWalletId) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'CIRCLE_TREASURY_WALLET_ID not configured' }) };
  }

  try {
    // ── getBalance ──────────────────────────────────────────────────────────
    if (body.action === 'getBalance') {
      const balance = await getTreasuryBalance(treasuryWalletId);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, balance }) };
    }

    // ── withdraw ────────────────────────────────────────────────────────────
    if (body.action === 'withdraw') {
      const { toAddress, amount } = body;
      if (!toAddress || !amount) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'toAddress and amount required' }) };
      }
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid amount' }) };
      }

      // Safety: check balance before withdrawing
      const balance = await getTreasuryBalance(treasuryWalletId);
      if (amt > balance.usdc) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Insufficient balance. Treasury has ${balance.usdc} USDC, requested ${amt}` }),
        };
      }

      const result = await withdrawUsdc(treasuryWalletId, toAddress, amt);
      console.log(`💸 Treasury withdrawal: ${amt} USDC → ${toAddress}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success:       true,
          amount:        amt,
          toAddress,
          transactionId: result.data?.id || result.data?.transaction?.id,
          status:        result.data?.state || result.data?.transaction?.state || 'SUBMITTED',
        }),
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${body.action}` }) };

  } catch (err) {
    console.error('Treasury admin error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
