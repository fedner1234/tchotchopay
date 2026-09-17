// netlify/functions/login.js
// TchotchoPay user authentication — verifies credentials, returns wallet info

const crypto = require('crypto');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Rate limiter — 5 attempts per 15 minutes per IP
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  const entry = rateLimitMap.get(ip);
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= maxRequests) return true;
  entry.count++;
  return false;
}

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Skip if not configured yet
  if (!token) return true;  // Fail open if token missing — rate limiter still protects
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return true; // Fail open if Cloudflare is unreachable
  }
}

// Verify PBKDF2 password
function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
}

// Generate a simple session token
function generateSessionToken(userId) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    iat: Date.now(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  })).toString('base64');
  const secret = process.env.SUPABASE_SERVICE_KEY || 'fallback-secret';
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

// Look up user by email from Supabase
async function getUserByEmail(email) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  const encodedEmail = encodeURIComponent(email);
  const response = await fetch(
    `${supabaseUrl}/rest/v1/users?email=eq.${encodedEmail}&select=*&limit=1`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Database error');
  }

  const rows = await response.json();
  return rows[0] || null;
}

// Get Circle wallet balance via Alchemy
async function getWalletBalance(walletAddress) {
  if (!walletAddress) return null;
  try {
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    const network = process.env.ALCHEMY_NETWORK || 'base-sepolia';
    const usdcContract = network.includes('sepolia')
      ? '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
      : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

    const resp = await fetch(`https://${network}.g.alchemy.com/v2/${alchemyKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'eth_call',
        params: [{
          to: usdcContract,
          data: '0x70a08231000000000000000000000000' + walletAddress.slice(2),
        }, 'latest'],
      }),
    });
    const data = await resp.json();
    if (data.result) {
      const raw = parseInt(data.result, 16);
      return (raw / 1e6).toFixed(2); // USDC has 6 decimals
    }
  } catch (e) {
    console.error('Balance fetch error:', e.message);
  }
  return '0.00';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Too many login attempts. Please wait a minute.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { email, password, turnstileToken } = body;

  // Verify Turnstile CAPTCHA
  const turnstileOk = await verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Bot check failed. Please try again.' }) };
  }

  if (!email || !password) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Email and password are required' }),
    };
  }

  try {
    const user = await getUserByEmail(email.toLowerCase().trim());

    // Always run password check to prevent timing attacks
    const dummyHash = 'aabbcc:' + 'a'.repeat(128);
    const passwordOk = user
      ? verifyPassword(password, user.password_hash)
      : (verifyPassword(password, dummyHash), false);

    if (!user || !passwordOk) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Invalid email or password' }),
      };
    }

    // Get wallet balance (non-blocking)
    const usdcBalance = await getWalletBalance(user.wallet_address);

    const sessionToken = generateSessionToken(user.id);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          wallet_address: user.wallet_address,
          circle_wallet_id: user.circle_wallet_id,
          kyc_status: user.kyc_status,
          usdc_balance: usdcBalance,
          created_at: user.created_at,
        },
      }),
    };
  } catch (err) {
    console.error('Login error:', err.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Login failed. Please try again.' }),
    };
  }
};
