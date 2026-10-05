// verify-otp.js — Twilio Verify API check (no phone number purchase needed)
// Env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID

const https = require('https');

const headers = {
  'Access-Control-Allow-Origin': 'https://tchotchopay.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let phone, code;
  try {
    ({ phone, code } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }
  if (!phone || !code) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Phone and code required' }) };

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const verifySid  = process.env.TWILIO_VERIFY_SID;

  if (!accountSid || !authToken || !verifySid) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'SMS service not configured', verified: false }) };
  }

  const params = new URLSearchParams({ To: phone, Code: String(code) });
  const auth   = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const result = await new Promise((resolve) => {
    const req = https.request({
      hostname: 'verify.twilio.com',
      path:     `/v2/Services/${verifySid}/VerificationChecks`,
      method:   'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type':  'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString()),
      }
    }, (r) => {
      let data = '';
      r.on('data', chunk => data += chunk);
      r.on('end', () => resolve({ status: r.statusCode, body: data }));
    });
    req.on('error', (e) => resolve({ status: 500, body: JSON.stringify({ message: e.message }) }));
    req.write(params.toString());
    req.end();
  });

  const data = JSON.parse(result.body || '{}');

  if (result.status === 200 && data.status === 'approved') {
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, verified: true }) };
  }

  // expired, wrong code, or already used
  const msg = data.status === 'canceled'  ? 'Code expired. Please request a new code.' :
              data.status === 'pending'    ? 'Incorrect code. Please try again.' :
              data.message                 || 'Verification failed.';

  return { statusCode: 400, headers, body: JSON.stringify({ error: msg, verified: false }) };
};
