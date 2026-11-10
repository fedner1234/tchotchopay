// netlify/functions/agent-register.js
// TchotchoPay — Agent signup → creates Supabase user + agent_floats record (status: pending)
//
// POST /.netlify/functions/agent-register
// Body: { firstName, lastName, email, password, phone, city, zone, businessName,
//         businessType, address, state, zip, floatSize }
// Returns: { success, agentId, message }

const crypto = require('crypto');
const https  = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL || 'hello@tchotchopay.com';

const CORS = {
  'Access-Control-Allow-Origin':  'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function respond(code, body) {
  return { statusCode: code, headers: CORS, body: JSON.stringify(body) };
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SUPABASE_KEY).digest('hex');
}

function sbRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url   = new URL(SUPABASE_URL);
    const body  = data ? JSON.stringify(data) : null;
    const req   = https.request(
      {
        hostname: url.hostname,
        path:     `/rest/v1/${path}`,
        method,
        headers: {
          apikey:         SUPABASE_KEY,
          Authorization:  `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer:         'return=representation',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        },
      },
      res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }));
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});
  if (event.httpMethod !== 'POST')    return respond(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { error: 'Invalid JSON' }); }

  const {
    firstName, lastName, email, password, phone,
    city, zone, businessName, businessType,
    address, state, zip, floatSize, country,
  } = body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !phone || !city) {
    return respond(400, { error: 'Missing required fields.' });
  }
  if (password.length < 8) {
    return respond(400, { error: 'Password must be at least 8 characters.' });
  }

  // Check if email already exists
  const { body: existing } = await sbRequest('GET', `users?email=eq.${encodeURIComponent(email)}&select=id&limit=1`);
  if (existing && existing.length > 0) {
    return respond(409, { error: 'An account with this email already exists. Please sign in.' });
  }

  // Resolve agent fields before any DB call
  const agentCity        = city.trim();
  const agentCountry     = (country || 'HT').trim().toUpperCase();
  const agentState       = (state || '').trim() || agentCountry;

  // Create user account
  const userId       = crypto.randomUUID();
  const passwordHash = hashPassword(password);
  const fullName     = `${firstName.trim()} ${lastName.trim()}`;

  const { status: userStatus, body: userRows } = await sbRequest('POST', 'users', {
    id:            userId,
    full_name:     fullName,
    email:         email.toLowerCase().trim(),
    password_hash: passwordHash,
    phone:         phone.trim(),
    is_agent:      true,
    agent_status:  'pending',
    agent_country: agentCountry,
    agent_type:    agentCountry === 'HT' ? 'cash-out' : 'cash-in',
    created_at:    new Date().toISOString(),
  });

  if (userStatus !== 201) {
    console.error('User creation failed:', userRows);
    return respond(500, { error: 'Failed to create account. Please try again.' });
  }

  // Create agent_floats record (status: pending, float starts at 0)
  const agentZip         = (zip || '').trim() || '00000';
  const agentAddress     = (address || '').trim() || agentCity;
  const agentBizName     = (businessName || fullName).trim();
  const agentBizType     = (businessType || 'other').trim();
  const initialFloat     = parseFloat(floatSize) || 0;

  const { status: floatStatus, body: floatRows } = await sbRequest('POST', 'agent_floats', {
    agent_id:       userId,
    business_name:  agentBizName,
    business_type:  agentBizType,
    address:        agentAddress,
    city:           agentCity,
    state:          agentState,
    zip:            agentZip,
    float_balance:  0,            // always starts at 0 — admin funds after approval
    status:         'pending',
    created_at:     new Date().toISOString(),
    updated_at:     new Date().toISOString(),
  });

  if (floatStatus !== 201) {
    console.error('agent_floats creation failed:', floatRows);
    // Don't fail the whole registration — user was created, just log the float issue
  }

  // Notify admin (fire-and-forget — don't block response)
  try {
    await sbRequest('POST', 'admin_notifications', {
      type:       'new_agent_application',
      message:    `New agent application from ${fullName} (${email}) in ${agentCity}. Float requested: $${initialFloat}`,
      data:       JSON.stringify({ userId, fullName, email, phone, agentCity, zone, agentBizName, agentBizType, initialFloat }),
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    // Notification table may not exist yet — silently ignore
  }

  return respond(201, {
    success:  true,
    agentId:  userId,
    message:  `Application received! We'll review your application and contact you at ${email} within 24–48 hours.`,
  });
};
