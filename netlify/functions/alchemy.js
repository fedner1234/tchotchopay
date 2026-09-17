// netlify/functions/alchemy.js
// Alchemy API proxy for TchotchoPay — Base blockchain data
// Provides: USDC balance, transaction history, token transfers
// Complements Circle API with direct on-chain reads
//
// Required env var: ALCHEMY_API_KEY (set in Netlify dashboard)
// Base Sepolia RPC: https://base-sepolia.g.alchemy.com/v2/{key}
// Base Mainnet RPC: https://base-mainnet.g.alchemy.com/v2/{key}

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const NETWORK = process.env.ALCHEMY_NETWORK || 'base-sepolia'; // 'base-mainnet' for prod

// USDC contract addresses
const USDC_CONTRACTS = {
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  'base-mainnet': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};

const ALCHEMY_BASE = `https://${NETWORK}.g.alchemy.com/v2`;

// ── Allowed origins ─────────────────────────────────────────────
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
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  };
}

// ── Rate limiter ─────────────────────────────────────────────────
const rateLimitStore = {};
function isRateLimited(ip) {
  const key = `alchemy:${ip}`;
  const now = Date.now();
  if (!rateLimitStore[key]) rateLimitStore[key] = [];
  rateLimitStore[key] = rateLimitStore[key].filter(t => now - t < 60000);
  if (rateLimitStore[key].length >= 30) return true;
  rateLimitStore[key].push(now);
  return false;
}

// ── Alchemy JSON-RPC helper ──────────────────────────────────────
async function alchemyRPC(method, params) {
  const res = await fetch(`${ALCHEMY_BASE}/${ALCHEMY_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Alchemy RPC error');
  return data.result;
}

// ── Alchemy Enhanced API helper ──────────────────────────────────
async function alchemyAPI(endpoint, params) {
  const url = new URL(`https://${NETWORK}.g.alchemy.com/v2/${ALCHEMY_API_KEY}/${endpoint}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Alchemy API error');
  return data;
}

// ── Handler ──────────────────────────────────────────────────────
exports.handler = async (event) => {
  const origin = event.headers['origin'] || event.headers['Origin'] || '';
  const headers = getCORSHeaders(origin);

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (event.body && event.body.length > 4096) return { statusCode: 413, headers, body: JSON.stringify({ error: 'Request too large' }) };

  if (!ALCHEMY_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Alchemy API key not configured' }) };
  }

  const clientIP = event.headers['x-nf-client-connection-ip']
    || (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(clientIP)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests' }) };
  }

  let action, payload;
  try {
    const parsed = JSON.parse(event.body || '{}');
    action = parsed.action;
    payload = parsed;
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  try {
    // ── GET USDC BALANCE (on-chain) ───────────────────────────────
    if (action === 'getUsdcBalance') {
      const { address } = payload;
      if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid address' }) };
      }
      const usdcAddress = USDC_CONTRACTS[NETWORK];
      // ERC-20 balanceOf call: keccak256("balanceOf(address)") = 0x70a08231
      const data = '0x70a08231' + address.slice(2).padStart(64, '0');
      const result = await alchemyRPC('eth_call', [{ to: usdcAddress, data }, 'latest']);
      const rawBalance = BigInt(result || '0x0');
      const usdc = Number(rawBalance) / 1e6; // USDC has 6 decimals
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          address,
          usdcBalance: usdc.toFixed(6),
          usdcFormatted: usdc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          network: NETWORK,
          contract: usdcAddress,
        }),
      };
    }

    // ── GET ETH BALANCE ───────────────────────────────────────────
    if (action === 'getEthBalance') {
      const { address } = payload;
      if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid address' }) };
      }
      const result = await alchemyRPC('eth_getBalance', [address, 'latest']);
      const wei = BigInt(result || '0x0');
      const eth = Number(wei) / 1e18;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ address, ethBalance: eth.toFixed(6), network: NETWORK }),
      };
    }

    // ── GET TOKEN TRANSFERS (USDC in/out) ─────────────────────────
    if (action === 'getTransfers') {
      const { address, pageKey } = payload;
      if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid address' }) };
      }
      const usdcAddress = USDC_CONTRACTS[NETWORK];

      // Fetch transfers TO and FROM this address
      const [inRes, outRes] = await Promise.all([
        alchemyRPC('alchemy_getAssetTransfers', [{
          fromBlock: '0x0',
          toBlock: 'latest',
          toAddress: address,
          contractAddresses: [usdcAddress],
          category: ['erc20'],
          withMetadata: true,
          maxCount: '0x14', // 20 results
          order: 'desc',
          ...(pageKey ? { pageKey } : {}),
        }]),
        alchemyRPC('alchemy_getAssetTransfers', [{
          fromBlock: '0x0',
          toBlock: 'latest',
          fromAddress: address,
          contractAddresses: [usdcAddress],
          category: ['erc20'],
          withMetadata: true,
          maxCount: '0x14',
          order: 'desc',
          ...(pageKey ? { pageKey } : {}),
        }]),
      ]);

      const inTransfers = (inRes?.transfers || []).map(t => ({
        type: 'received',
        hash: t.hash,
        from: t.from,
        amount: parseFloat(t.value || 0).toFixed(2),
        asset: t.asset,
        timestamp: t.metadata?.blockTimestamp,
        blockNum: t.blockNum,
      }));

      const outTransfers = (outRes?.transfers || []).map(t => ({
        type: 'sent',
        hash: t.hash,
        to: t.to,
        amount: parseFloat(t.value || 0).toFixed(2),
        asset: t.asset,
        timestamp: t.metadata?.blockTimestamp,
        blockNum: t.blockNum,
      }));

      // Merge and sort by block number descending
      const all = [...inTransfers, ...outTransfers]
        .sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16))
        .slice(0, 20);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ transfers: all, network: NETWORK, address }),
      };
    }

    // ── GET LATEST BLOCK ──────────────────────────────────────────
    if (action === 'getBlockNumber') {
      const result = await alchemyRPC('eth_blockNumber', []);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ blockNumber: parseInt(result, 16), network: NETWORK }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Unknown action. Valid: getUsdcBalance, getEthBalance, getTransfers, getBlockNumber` }),
    };

  } catch (err) {
    console.error('Alchemy function error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
