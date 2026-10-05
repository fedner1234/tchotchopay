const https = require("https");

// ── Allowed origins ────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://tchotchopay.com",
  "https://www.tchotchopay.com",
  /^https:\/\/[a-z0-9-]+--tchotchopay\.netlify\.app$/,
];

function getCORSHeaders(requestOrigin) {
  const allowed = ALLOWED_ORIGINS.some((o) =>
    typeof o === "string" ? o === requestOrigin : o.test(requestOrigin)
  );
  const origin = allowed ? requestOrigin : "https://tchotchopay.com";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };
}

// ── Rate limiter: 20 messages per minute per IP ────────────────
const rateLimitStore = {};
function isRateLimited(ip) {
  const key = `chat:${ip}`;
  const now = Date.now();
  if (!rateLimitStore[key]) rateLimitStore[key] = [];
  rateLimitStore[key] = rateLimitStore[key].filter((t) => now - t < 60000);
  if (rateLimitStore[key].length >= 20) return true;
  rateLimitStore[key].push(now);
  return false;
}

const SYSTEM_PROMPT = `You are TchotchoPay Assistant, a friendly multilingual support agent for TchotchoPay — a digital payment and remittance platform connecting the Haitian diaspora worldwide with their families in Haiti.

SERVICES:
- Send money to Haiti instantly using USDC on Base blockchain
- Load funds via ACH bank transfer, debit card, credit card, or wire transfer
- TchotchoPay Wallet: USDC balance, transaction history, QR code payments
- Haitian Marketplace: pay for food, electricity, phone top-ups, school fees, transportation, local merchants
- Send to friends & family by username, phone number, or QR code
- Cash out to local Haitian bank accounts, agents, or convert to HTG
- Keep USDC as digital dollar savings (no inflation risk)
- Peer-to-peer transfers inside TchotchoPay: FREE

FEES:
- Debit/credit card deposit: 2–3%
- Cash out: 1%
- Merchant fee: 1–2%
- Small FX spread when converting USD to HTG
- P2P transfers inside TchotchoPay: FREE

KEY INFO:
- Built on Base blockchain (Coinbase Layer 2)
- Regulated U.S. company (Delaware C-Corp)
- Registered in Haiti as TchotchoPay S.A.
- Email: contact@tchotchopay.com
- Website: tchotchopay.com

LANGUAGE RULES:
- Detect the user's language from their message
- Always respond in the same language as the user
- Supported: English, Haitian Creole (Kreyol Ayisyen), French, Spanish
- Default to English if unclear

TONE: Warm, concise, professional. 2-4 sentences max unless explaining a process. If unsure, direct to contact@tchotchopay.com.`;

function callOpenAI(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10),
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          // Attach HTTP status to the parsed result for error handling
          parsed._httpStatus = res.statusCode;
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse OpenAI response (HTTP ${res.statusCode}): ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const origin = event.headers["origin"] || event.headers["Origin"] || "";
  const corsHeaders = getCORSHeaders(origin);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (event.body && event.body.length > 16384) {
    return { statusCode: 413, headers: corsHeaders, body: JSON.stringify({ error: "Request too large" }) };
  }

  const clientIP =
    event.headers["x-nf-client-connection-ip"] ||
    (event.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    "unknown";
  if (isRateLimited(clientIP)) {
    return { statusCode: 429, headers: corsHeaders, body: JSON.stringify({ error: "Too many messages. Please wait a moment." }) };
  }

  // Explicit API key check
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set");
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Service configuration error. Please contact contact@tchotchopay.com" }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Invalid request" }) };
    }

    const result = await callOpenAI(messages);

    if (result.error) {
      console.error("OpenAI error:", result._httpStatus, result.error.code, result.error.message);
      throw new Error(`OpenAI ${result._httpStatus}: ${result.error.message}`);
    }

    const reply = result.choices[0].message.content;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Chat function error:", err.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Something went wrong. Please try again or email contact@tchotchopay.com" }),
    };
  }
};
