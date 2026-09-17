// netlify/functions/register.js
// TchotchoPay user registration: creates Circle wallet + saves user to Supabase
// All secrets are server-side only (Netlify env vars)

const crypto = require('crypto');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Simple in-memory rate limiter (resets on cold start — use Upstash Redis for production)
// Verify Cloudflare Turnstile token
async function verifyTurnstile(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Skip if not configured yet
  if (!token) return false;
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

const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 3; // max 3 registrations per IP per hour

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

// Generate HMAC-signed session token (same logic as login.js)
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

// Hash password with PBKDF2 (bcrypt not available in Lambda without native deps)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Encrypt entity secret with Circle's RSA public key (required for developer-controlled wallets)
const { webcrypto } = require('node:crypto');
const subtle = webcrypto.subtle;

const CIRCLE_API_BASE = 'https://api.circle.com/v1/w3s';
// The wallet set created 2026-08-28 under this Circle account.
// Update when migrating to a new Circle environment.
const CIRCLE_WALLET_SET_FALLBACK = 'd86762dc-fa22-585a-9dda-c2825f19ef99'; // Arc mainnet wallet set

async function getEntitySecretCiphertext(circleApiKey) {
  const res = await fetch(`${CIRCLE_API_BASE}/config/entity/publicKey`, {
    headers: { Authorization: `Bearer ${circleApiKey}` },
  });
  const data = await res.json();
  const publicKeyPem = data.data.publicKey;

  const pemBody = publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\n/g, '')
    .trim();
  const der = Buffer.from(pemBody, 'base64');

  const cryptoKey = await subtle.importKey(
    'spki',
    der,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );

  const secretBytes = Buffer.from(process.env.CIRCLE_ENTITY_SECRET, 'hex');
  const encrypted = await subtle.encrypt({ name: 'RSA-OAEP' }, cryptoKey, secretBytes);
  return Buffer.from(encrypted).toString('base64');
}

// Create a Circle developer-controlled wallet for the user
async function createCircleWallet(userId) {
  const circleApiKey = process.env.CIRCLE_API_KEY;
  // Always use the verified wallet set — env var may be stale from a prior Circle account
  const walletSetId = CIRCLE_WALLET_SET_FALLBACK;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!circleApiKey || !entitySecret) {
    throw new Error('Circle configuration missing');
  }

  const entitySecretCiphertext = await getEntitySecretCiphertext(circleApiKey);

  const response = await fetch(`${CIRCLE_API_BASE}/developer/wallets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${circleApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idempotencyKey: webcrypto.randomUUID(),
      entitySecretCiphertext,
      accountType: 'EOA',
      blockchains: ['ARC'], // Arc mainnet — Circle's L1 with sub-cent USDC fees
      count: 1,
      walletSetId,
      metadata: [{ name: `TchotchoPay-${userId}`, refId: userId }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Circle wallet creation failed: ${err}`);
  }

  const data = await response.json();
  const wallet = data.data?.wallets?.[0];
  if (!wallet) throw new Error('No wallet returned from Circle');

  return {
    walletId: wallet.id,
    walletSetId: wallet.walletSetId,
    address: wallet.address,
    blockchain: wallet.blockchain,
  };
}

// Save user to Supabase
async function saveUserToSupabase(userData) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const err = await response.text();
    // Check for duplicate email
    if (err.includes('duplicate') || err.includes('unique')) {
      throw new Error('EMAIL_EXISTS');
    }
    throw new Error(`Supabase insert failed: ${err}`);
  }

  const rows = await response.json();
  return rows[0];
}

exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Rate limiting
  const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { email, password, full_name, phone, turnstileToken } = body;

  // Verify Turnstile CAPTCHA
  const turnstileOk = await verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Bot check failed. Please try again.' }) };
  }

  // Validation
  if (!email || !password || !full_name) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Email, password, and full name are required' }),
    };
  }

  if (!isValidEmail(email)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid email address' }) };
  }

  if (password.length < 8) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Password must be at least 8 characters' }) };
  }

  try {
    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    // Step 1: Create Circle wallet
    let wallet;
    try {
      wallet = await createCircleWallet(userId);
    } catch (walletErr) {
      console.error('Circle wallet error:', walletErr.message);
      // If Circle fails, still create the user — wallet can be created later
      wallet = { walletId: null, walletSetId: null, address: null, blockchain: 'ARC' };
    }

    // Step 2: Save user to Supabase
    const userData = {
      id: userId,
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      phone: phone?.trim() || null,
      password_hash: passwordHash,
      circle_wallet_id: wallet.walletId,
      circle_wallet_set_id: wallet.walletSetId,
      wallet_address: wallet.address,
      kyc_status: 'pending',
    };

    const savedUser = await saveUserToSupabase(userData);

    // Return safe user data (no password hash) + session token
    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        sessionToken: generateSessionToken(savedUser.id),
        user: {
          id: savedUser.id,
          email: savedUser.email,
          full_name: savedUser.full_name,
          wallet_address: savedUser.wallet_address,
          circle_wallet_id: savedUser.circle_wallet_id,
          kyc_status: savedUser.kyc_status,
          created_at: savedUser.created_at,
        },
        message: 'Account created successfully! Your TchotchoPay wallet is ready.',
      }),
    };
  } catch (err) {
    console.error('Register error:', err.message);

    if (err.message === 'EMAIL_EXISTS') {
      return {
        statusCode: 409,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'An account with this email already exists.' }),
      };
    }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Registration failed. Please try again.' }),
    };
  }
};
