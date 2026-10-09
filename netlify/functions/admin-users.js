// netlify/functions/admin-users.js
// Returns real user records from Supabase for the TchotchoPay admin dashboard.
// Protected by X-Admin-Secret header (must match ADMIN_SECRET env var).
// Never returns password_hash or any sensitive credential.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://tchotchopay.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // ── Admin authentication ──
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Admin secret not configured' }) };
  }

  const providedSecret = event.headers['x-admin-secret'];
  if (!providedSecret || providedSecret !== adminSecret) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // ── Query Supabase ──
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  try {
    // Select all safe fields — never password_hash
    const response = await fetch(
      `${supabaseUrl}/rest/v1/users?select=id,email,full_name,phone,wallet_address,circle_wallet_id,circle_wallet_set_id,kyc_status,created_at&order=created_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase query failed:', err);
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Database query failed' }) };
    }

    const users = await response.json();

    // ── Also fetch total count ──
    const countRes = await fetch(
      `${supabaseUrl}/rest/v1/users?select=count`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact',
          'Range-Unit': 'items',
          'Range': '0-0',
        },
      }
    );
    const totalCount = parseInt(countRes.headers.get('content-range')?.split('/')[1] || users.length, 10);

    // ── KYC breakdown ──
    const kycVerified = users.filter(u => u.kyc_status === 'verified').length;
    const kycPending  = users.filter(u => u.kyc_status === 'pending').length;
    const kycRejected = users.filter(u => u.kyc_status === 'rejected').length;

    // ── Wallet coverage (how many have a Circle wallet address) ──
    const withWallet  = users.filter(u => u.wallet_address).length;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        meta: {
          total: totalCount,
          kyc_verified: kycVerified,
          kyc_pending: kycPending,
          kyc_rejected: kycRejected,
          with_wallet: withWallet,
          generated_at: new Date().toISOString(),
        },
        users,
      }),
    };
  } catch (err) {
    console.error('admin-users error:', err.message);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
