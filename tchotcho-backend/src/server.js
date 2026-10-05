// TchotchoPay — Mobile App API Server
// Zero dependencies — uses only Node.js built-ins
// Run: node src/server.js
// API base: http://localhost:4000/api/v1

const http  = require('http');
const https = require('https');
const url   = require('url');
const fs    = require('fs');
const path  = require('path');

// ── Load .env if present ───────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#') && v.length) {
      process.env[k.trim()] = v.join('=').trim();
    }
  });
}

const PORT = process.env.PORT || 4000;

// ── CORS headers ───────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { ...CORS, 'Content-Length': Buffer.byteLength(json) });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch(e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function fetchJSON(apiUrl) {
  return new Promise((resolve, reject) => {
    https.get(apiUrl, { headers: { 'User-Agent': 'TchotchoPay-Mobile/1.0' } }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ── Mock users (used when Supabase is not configured) ─────────────────────
const MOCK_USERS = {
  '+50937123456': {
    id: 'usr_001', full_name: 'Jean Baptiste',
    phone: '+50937123456', email: 'jean@example.com',
    usdc_balance: 1240.50,
    wallet_address: '0x2953399124F0cBB46d2CbACD8A89cF0599974963',
  },
  '+50948217890': {
    id: 'usr_002', full_name: 'Marie Pierre',
    phone: '+50948217890', email: 'marie@example.com',
    usdc_balance: 320.00,
    wallet_address: '0xABCD1234EFGH5678IJKL9012MNOP3456QRST7890',
  },
};

const TRANSACTIONS = [];
const HTG_RATE = 132.50;

// ── Route handlers ─────────────────────────────────────────────────────────

async function handleRates(req, res) {
  let usdcUsd = 1.00, source = 'static';
  try {
    const data = await fetchJSON(
      'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd'
    );
    if (data?.['usd-coin']?.usd) { usdcUsd = data['usd-coin'].usd; source = 'coingecko'; }
  } catch { /* fallback */ }
  send(res, 200, {
    success: true,
    data: {
      baseCurrency: 'USDC',
      rates: { USD: +usdcUsd.toFixed(4), HTG: +(usdcUsd * HTG_RATE).toFixed(2) },
      source,
      updatedAt: new Date().toISOString(),
    },
  });
}

function handleUser(req, res, phone) {
  const user = MOCK_USERS[decodeURIComponent(phone)];
  if (!user) return send(res, 404, { success: false, message: 'User not found.' });
  send(res, 200, { success: true, data: user });
}

async function handleRemit(req, res) {
  let body;
  try { body = await readBody(req); } catch { return send(res, 400, { success: false, message: 'Invalid JSON.' }); }

  const { senderPhone, recipientIdentifier, amountUsdc, method } = body;
  if (!senderPhone || !recipientIdentifier || !amountUsdc || !method) {
    return send(res, 400, { success: false, message: 'Missing required fields.' });
  }

  const amount = parseFloat(amountUsdc);
  if (isNaN(amount) || amount <= 0) return send(res, 400, { success: false, message: 'Invalid amount.' });

  const sender = MOCK_USERS[senderPhone];
  if (!sender) return send(res, 404, { success: false, message: 'Sender not found.' });

  const fee = 0.50;
  if (sender.usdc_balance < amount + fee) {
    return send(res, 400, { success: false, message: `Insufficient balance. Need $${(amount + fee).toFixed(2)} USDC.` });
  }

  sender.usdc_balance = +(sender.usdc_balance - amount - fee).toFixed(2);

  const tx = {
    id: 'tx_' + Date.now(),
    method: method.toUpperCase(),
    senderPhone,
    recipient: recipientIdentifier,
    amountSentUsdc: amount,
    amountReceivedHtg: +(amount * HTG_RATE).toFixed(2),
    feeUsdc: fee,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
  };
  TRANSACTIONS.push(tx);

  console.log(`[TRANSFER] ${sender.full_name} → ${recipientIdentifier} | $${amount} USDC via ${tx.method}`);
  send(res, 200, { success: true, message: 'Transfer successful.', data: tx });
}

function handleTransactions(req, res, phone) {
  const userTx = TRANSACTIONS.filter(t => t.senderPhone === decodeURIComponent(phone)).reverse();
  send(res, 200, { success: true, data: userTx });
}

// ── Router ─────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url);
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') return send(res, 204, {});

  // GET /health
  if (method === 'GET' && pathname === '/health') {
    return send(res, 200, { status: 'ok', service: 'TchotchoPay Mobile API' });
  }

  // GET /api/v1/rates
  if (method === 'GET' && pathname === '/api/v1/rates') {
    return handleRates(req, res);
  }

  // GET /api/v1/user/:phone
  const userMatch = pathname.match(/^\/api\/v1\/user\/(.+)$/);
  if (method === 'GET' && userMatch) {
    return handleUser(req, res, userMatch[1]);
  }

  // POST /api/v1/remit
  if (method === 'POST' && pathname === '/api/v1/remit') {
    return handleRemit(req, res);
  }

  // GET /api/v1/transactions/:phone
  const txMatch = pathname.match(/^\/api\/v1\/transactions\/(.+)$/);
  if (method === 'GET' && txMatch) {
    return handleTransactions(req, res, txMatch[1]);
  }

  send(res, 404, { success: false, message: 'Route not found.' });
});

server.listen(PORT, () => {
  console.log(`\n🚀 TchotchoPay Mobile API  →  http://localhost:${PORT}`);
  console.log(`   GET  /api/v1/rates`);
  console.log(`   GET  /api/v1/user/:phone`);
  console.log(`   POST /api/v1/remit`);
  console.log(`   GET  /api/v1/transactions/:phone\n`);
});
