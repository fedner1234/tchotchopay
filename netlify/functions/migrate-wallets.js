// migrate-wallets.js
// One-time admin function: creates Arc mainnet wallets for all existing Supabase users
// who have a null or testnet wallet_address.
//
// Call: POST /.netlify/functions/migrate-wallets
// Body: { "adminSecret": "<ADMIN_SECRET env var>" }
//
// This is protected by ADMIN_SECRET — never expose publicly.

const { webcrypto } = require('node:crypto');
const subtle = webcrypto.subtle;

const CIRCLE_API_BASE          = 'https://api.circle.com/v1/w3s';
const CIRCLE_WALLET_SET_ID     = 'd86762dc-fa22-585a-9dda-c2825f19ef99'; // Arc mainnet
const BLOCKCHAIN               = 'ARC';

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

async function createCircleWallet(userId) {
  const ciphertext = await getEntitySecretCiphertext();
  const res = await fetch(`${CIRCLE_API_BASE}/developer/wallets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      idempotencyKey:         webcrypto.randomUUID(),
      entitySecretCiphertext: ciphertext,
      accountType:            'EOA',
      blockchains:            [BLOCKCHAIN],
      count:                  1,
      walletSetId:            CIRCLE_WALLET_SET_ID,
      metadata:               [{ name: `TchotchoPay-${userId}`, refId: userId }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Circle error: ${res.status}`);
  const wallet = data.data?.wallets?.[0];
  if (!wallet) throw new Error('No wallet returned');
  return { walletId: wallet.id, address: wallet.address, blockchain: wallet.blockchain };
}

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function getAllUsers() {
  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/users?select=id,email,circle_wallet_id,wallet_address&order=created_at.asc`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  if (!res.ok) throw new Error(`Supabase fetch failed: ${await res.text()}`);
  return res.json();
}

async function updateUserWallet(userId, walletId, address) {
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
      body: JSON.stringify({
        circle_wallet_id:      walletId,
        circle_wallet_set_id:  CIRCLE_WALLET_SET_ID,
        wallet_address:        address,
      }),
    }
  );
  if (!res.ok) throw new Error(`Supabase update failed: ${await res.text()}`);
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };
  }

  // Admin auth check
  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  if (!process.env.ADMIN_SECRET || body.adminSecret !== process.env.ADMIN_SECRET) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (!process.env.CIRCLE_API_KEY || !process.env.CIRCLE_ENTITY_SECRET) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Circle credentials not configured' }) };
  }

  try {
    const users = await getAllUsers();
    const results = { migrated: [], skipped: [], failed: [] };

    for (const user of users) {
      // Skip users who already have a mainnet wallet address
      if (user.wallet_address && user.wallet_address.startsWith('0x')) {
        results.skipped.push({ id: user.id, email: user.email, reason: 'already has Arc wallet' });
        continue;
      }

      try {
        const wallet = await createCircleWallet(user.id);
        await updateUserWallet(user.id, wallet.walletId, wallet.address);
        results.migrated.push({
          id:      user.id,
          email:   user.email,
          walletId: wallet.walletId,
          address: wallet.address,
        });
        console.log(`✅ Migrated ${user.email} → ${wallet.address}`);

        // Small delay to avoid Circle rate limits
        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        console.error(`❌ Failed to migrate ${user.email}:`, err.message);
        results.failed.push({ id: user.id, email: user.email, error: err.message });
      }
    }

    console.log(`Migration complete: ${results.migrated.length} migrated, ${results.skipped.length} skipped, ${results.failed.length} failed`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        summary: {
          total:    users.length,
          migrated: results.migrated.length,
          skipped:  results.skipped.length,
          failed:   results.failed.length,
        },
        details: results,
      }),
    };
  } catch (err) {
    console.error('Migration error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
