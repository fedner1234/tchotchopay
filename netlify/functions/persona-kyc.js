// netlify/functions/persona-kyc.js
// Persona Identity Verification for TchotchoPay
// Handles: create inquiry, check status, webhook verification
//
// Required Netlify env vars:
//   PERSONA_API_KEY       — from app.withpersona.com → API Keys
//   PERSONA_TEMPLATE_ID   — from app.withpersona.com → Templates (e.g. tmpl_xxx)
//   PERSONA_WEBHOOK_SECRET — from app.withpersona.com → Webhooks (for signature verification)
//   SUPABASE_URL          — already set
//   SUPABASE_SERVICE_KEY  — already set

const PERSONA_API_KEY       = process.env.PERSONA_API_KEY;
const PERSONA_TEMPLATE_ID   = process.env.PERSONA_TEMPLATE_ID;
const PERSONA_WEBHOOK_SECRET = process.env.PERSONA_WEBHOOK_SECRET;
const SUPABASE_URL          = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;

const PERSONA_BASE = 'https://withpersona.com/api/v1';

// ── Allowed origins ──────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://tchotchopay.com',
  'https://www.tchotchopay.com',
  /^https:\/\/[a-z0-9-]+--tchotchopay\.netlify\.app$/,
];

function getCORSHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some(o =>
    typeof o === 'string' ? o === origin : o.test(origin)
  );
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://tchotchopay.com',
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
  const key = `persona:${ip}`;
  const now = Date.now();
  if (!rateLimitStore[key]) rateLimitStore[key] = [];
  rateLimitStore[key] = rateLimitStore[key].filter(t => now - t < 60000);
  if (rateLimitStore[key].length >= 10) return true;
  rateLimitStore[key].push(now);
  return false;
}

// ── Persona API helper ───────────────────────────────────────────
async function personaRequest(method, path, body) {
  const res = await fetch(`${PERSONA_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${PERSONA_API_KEY}`,
      'Persona-Version': '2023-01-05',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = {}; }
  if (!res.ok) {
    const detail = data?.errors?.[0]?.details
      || data?.errors?.[0]?.detail
      || data?.errors?.[0]?.title
      || text.slice(0, 200);
    throw new Error(`Persona ${res.status}: ${detail}`);
  }
  return data;
}

// ── Supabase helper ──────────────────────────────────────────────
async function supabaseUpdate(userId, fields) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase update failed: ${err}`);
  }
}

// ── Webhook signature verification ──────────────────────────────
async function verifyPersonaWebhook(body, signature) {
  if (!PERSONA_WEBHOOK_SECRET || !signature) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(PERSONA_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const computed = 'sha256=' + Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return computed === signature;
}

// ── Handler ──────────────────────────────────────────────────────
exports.handler = async (event) => {
  const origin = event.headers['origin'] || event.headers['Origin'] || '';
  const headers = getCORSHeaders(origin);

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  // ── Webhook from Persona — detect by signature header, not path ──
  if (event.httpMethod === 'POST' && (event.headers['persona-signature'] || event.headers['Persona-Signature'])) {
    const signature = event.headers['persona-signature'];
    const valid = await verifyPersonaWebhook(event.body || '', signature);
    if (!valid) return { statusCode: 401, body: 'Invalid signature' };

    const payload = JSON.parse(event.body || '{}');
    const eventName = payload?.data?.attributes?.name;
    const inquiry = payload?.data?.attributes?.payload?.data;

    if (eventName === 'inquiry.completed' && inquiry) {
      const inquiryId = inquiry.id;
      const userId = inquiry.attributes?.['reference-id'];
      const status = inquiry.attributes?.status;

      if (userId && (status === 'completed' || status === 'approved')) {
        try {
          await supabaseUpdate(userId, {
            kyc_status: 'verified',
            kyc_inquiry_id: inquiryId,
            kyc_completed_at: new Date().toISOString(),
          });
        } catch (e) {
          console.error('Supabase KYC update failed:', e.message);
        }
      }
    }

    if (eventName === 'inquiry.failed' && inquiry) {
      const userId = inquiry.attributes?.['reference-id'];
      if (userId) {
        try {
          await supabaseUpdate(userId, { kyc_status: 'failed' });
        } catch (e) {
          console.error('Supabase KYC failed update error:', e.message);
        }
      }
    }

    return { statusCode: 200, body: 'ok' };
  }

  // ── Regular API calls ─────────────────────────────────────────
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!PERSONA_API_KEY || !PERSONA_TEMPLATE_ID) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Persona not configured. Add PERSONA_API_KEY and PERSONA_TEMPLATE_ID to Netlify env vars.' }) };
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
    // ── CREATE INQUIRY ────────────────────────────────────────────
    // Returns an inquiry ID + session token for the embedded flow
    // If the user already has a non-expired inquiry, resumes it.
    // If expired/failed/declined, creates a fresh one.
    if (action === 'createInquiry') {
      const { userId, email, firstName, lastName, existingInquiryId } = payload;
      if (!userId || userId === 'demo-user') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please complete account registration before starting ID verification.' }) };
      }

      // If a previous inquiry ID is passed, check if it can be resumed
      if (existingInquiryId) {
        try {
          const existing = await personaRequest('GET', `/inquiries/${existingInquiryId}`);
          const status = existing?.data?.attributes?.status;
          // Resume only if still active
          if (status && !['expired', 'failed', 'declined', 'completed', 'approved'].includes(status)) {
            // Generate a new session token for the existing inquiry
            const resumed = await personaRequest('POST', `/inquiries/${existingInquiryId}/generate-one-time-link`);
            const sessionToken = resumed?.data?.attributes?.['session-token'] || null;
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ inquiryId: existingInquiryId, sessionToken, templateId: PERSONA_TEMPLATE_ID, resumed: true }),
            };
          }
          // Otherwise fall through and create a fresh inquiry
        } catch (e) {
          // Existing inquiry lookup failed — create fresh
          console.log('Could not resume inquiry, creating fresh:', e.message);
        }
      }

      // Create a brand new inquiry
      const data = await personaRequest('POST', '/inquiries', {
        data: {
          attributes: {
            'inquiry-template-id': PERSONA_TEMPLATE_ID,
            'reference-id': userId,
            fields: {
              ...(email      ? { 'email-address': email } : {}),
              ...(firstName  ? { 'name-first':    firstName } : {}),
              ...(lastName   ? { 'name-last':     lastName } : {}),
            },
          },
        },
      });

      const inquiryId    = data?.data?.id;
      const sessionToken = data?.data?.attributes?.['session-token'] || null;

      // Save inquiry ID to Supabase immediately so we can track it
      if (inquiryId && userId) {
        try { await supabaseUpdate(userId, { kyc_inquiry_id: inquiryId, kyc_status: 'pending' }); } catch(e) {}
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ inquiryId, sessionToken, templateId: PERSONA_TEMPLATE_ID }),
      };
    }

    // ── CHECK INQUIRY STATUS ──────────────────────────────────────
    if (action === 'checkInquiry') {
      const { inquiryId } = payload;
      if (!inquiryId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'inquiryId required' }) };

      const data = await personaRequest('GET', `/inquiries/${inquiryId}`);
      const status    = data?.data?.attributes?.status;
      const userId    = data?.data?.attributes?.['reference-id'];
      const createdAt = data?.data?.attributes?.['created-at'];

      // Auto-update Supabase based on status
      if (userId) {
        try {
          if (status === 'completed' || status === 'approved') {
            await supabaseUpdate(userId, {
              kyc_status: 'verified',
              kyc_inquiry_id: inquiryId,
              kyc_completed_at: new Date().toISOString(),
            });
          } else if (status === 'needs_review') {
            // Under review — save inquiry ID so we can poll later
            await supabaseUpdate(userId, { kyc_inquiry_id: inquiryId });
          } else if (status === 'declined' || status === 'failed') {
            await supabaseUpdate(userId, { kyc_status: 'failed', kyc_inquiry_id: inquiryId });
          } else {
            // pending / created — at least save the inquiry ID
            await supabaseUpdate(userId, { kyc_inquiry_id: inquiryId });
          }
        } catch (e) {
          console.error('Supabase sync error:', e.message);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ inquiryId, status, userId, createdAt }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Unknown action. Valid: createInquiry, checkInquiry' }),
    };

  } catch (err) {
    console.error('Persona function error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
