// send-otp.js — Twilio Verify API (no phone number purchase needed)
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

  let phone;
  try {
    ({ phone } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }
  if (!phone) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Phone number required' }) };

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const verifySid  = process.env.TWILIO_VERIFY_SID;

  if (!accountSid || !authToken || !verifySid) {
    console.error('Missing Twilio env vars');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'SMS service not configured' }) };
  }

  const params = new URLSearchParams({ To: phone, Channel: 'sms' });
  const auth   = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const result = await new Promise((resolve) => {
    const req = https.request({
      hostname: 'verify.twilio.com',
      path:     `/v2/Services/${verifySid}/Verifications`,
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

  if (result.status === 201) {
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Verification code sent' }) };
  }

  console.error('Twilio Verify error:', result.status, result.body);
  const errData = JSON.parse(result.body || '{}');
  return { statusCode: 500, headers, body: JSON.stringify({ error: errData.message || 'Failed to send verification code' }) };
};
