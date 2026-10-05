// netlify/functions/update-profile.js
// Update a user's editable profile fields (full_name, phone) in Supabase.
// Requires: Authorization: Bearer <session_token>

const crypto = require('crypto');
const https  = require('https');

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const CORS = {
  'Access-Control-Allow-Origin':  'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function respond(code, body) {
  return { statusCode: code, headers: CORS, body: JSON.stringify(body) };
}

function verifySessionToken(token) {
  try {
    if (!token) return null;
    const dot      = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payload  = token.slice(0, dot);
    const sig      = token.slice(dot + 1);
    const expected = crypto
      .createHmac('sha256', SUPABASE_SERVICE_KEY)
      .update(payload)
      .digest('hex');
    if (sig.length !== 64 || expected.length !== 64) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data.userId;
  } catch { return null; }
}

function supabasePatch(userId, payload) {
  return new Promise((resolve, reject) => {
    const url  = new URL(SUPABASE_URL);
    const body = JSON.stringify(payload);
    const req  = https.request(
      {
        hostname: url.hostname,
        path: `/rest/v1/users?id=eq.${userId}`,
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => resolve({ status: res.statusCode }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});
  if (event.httpMethod !== 'POST')    return respond(405, { error: 'Method not allowed' });

  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const rawToken   = authHeader.replace(/^Bearer\s+/i, '').trim();
  const userId     = verifySessionToken(rawToken);
  if (!userId) return respond(401, { error: 'Authentication required' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return respond(400, { error: 'Invalid JSON' }); }

  // Only allow editing these fields
  const allowed  = ['full_name', 'phone'];
  const updates  = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates[key] = String(body[key]).trim();
    }
  }

  if (Object.keys(updates).length === 0) {
    return respond(400, { error: 'No valid fields to update' });
  }

  // Basic validation
  if (updates.full_name !== undefined && updates.full_name.length < 2) {
    return respond(400, { error: 'Name must be at least 2 characters' });
  }

  const { status } = await supabasePatch(userId, updates);
  if (status < 200 || status > 299) {
    return respond(500, { error: 'Failed to update profile. Please try again.' });
  }

  return respond(200, { success: true, updated: updates });
};
