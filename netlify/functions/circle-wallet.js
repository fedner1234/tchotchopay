// netlify/functions/circle-wallet.js
// Circle Programmable Wallets (Developer-Controlled) — TchotchoPay backend
// API: https://api.circle.com/v1/w3s/
// Auth: Bearer API_KEY + entitySecretCiphertext in request body

const { webcrypto } = require("node:crypto");
const subtle = webcrypto.subtle;
const crypto  = require("node:crypto");

const CIRCLE_API_BASE = "https://api.circle.com/v1/w3s";
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;
const CIRCLE_ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET; // 32-byte hex

// ── Auth: verify session token (same logic as update-profile.js) ──────────────
// Actions that require a valid user session
const AUTH_REQUIRED_ACTIONS = new Set(["sendUsdc", "getBalance", "getWallet", "listWallets", "getTransaction"]);

function verifySessionToken(token) {
  try {
    if (!token) return null;
    const dot = token.lastIndexOf(".");
    if (dot < 0) return null;
    const payload  = token.slice(0, dot);
    const sig      = token.slice(dot + 1);
    const secret   = process.env.SUPABASE_SERVICE_KEY;
    if (!secret) return null;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (sig.length !== 64 || expected.length !== 64) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
    const data = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    if (!data.userId || !data.exp || Date.now() > data.exp) return null;
    return data.userId;
  } catch { return null; }
}

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

// ── Rate limiter (5 calls/min per IP for mutating ops, 20 for reads) ──
const rateLimitStore = {};
function isRateLimited(ip, action) {
  const mutating = ["createWalletSet", "createWallet", "sendUsdc"];
  const max = mutating.includes(action) ? 5 : 20;
  const key = `circle:${ip}:${action}`;
  const now = Date.now();
  if (!rateLimitStore[key]) rateLimitStore[key] = [];
  rateLimitStore[key] = rateLimitStore[key].filter((t) => now - t < 60000);
  if (rateLimitStore[key].length >= max) return true;
  rateLimitStore[key].push(now);
  return false;
}

// ── Encrypt entity secret with Circle's RSA public key ──────────────────────
async function getEntitySecretCiphertext() {
  // 1. Fetch Circle's current public key
  const res = await fetch(`${CIRCLE_API_BASE}/config/entity/publicKey`, {
    headers: { Authorization: `Bearer ${CIRCLE_API_KEY}` },
  });
  const data = await res.json();
  const publicKeyPem = data.data.publicKey;

  // 2. Parse PEM → DER buffer
  const pemBody = publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\n/g, "")
    .trim();
  const der = Buffer.from(pemBody, "base64");

  // 3. Import as RSA-OAEP key
  const cryptoKey = await subtle.importKey(
    "spki",
    der,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  // 4. Encrypt the entity secret bytes
  const secretBytes = Buffer.from(CIRCLE_ENTITY_SECRET, "hex");
  const encrypted = await subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
    secretBytes
  );

  return Buffer.from(encrypted).toString("base64");
}

// ── Blockchain config ─────────────────────────────────────────────────────────
// Supported blockchains: "ARC" (Arc mainnet), "BASE" (Base mainnet),
// "ARC-TESTNET", "BASE-SEPOLIA" (testnets)
const DEFAULT_BLOCKCHAIN = "ARC"; // Arc mainnet — Circle's own L1

// ── Resolve USDC token ID for a given blockchain ────────────────────────────
// Calls Circle's /tokens endpoint to find USDC on any supported chain.
// Caches per process instance (cold-start cache).
const tokenIdCache = {};
async function getUsdcTokenId(blockchain) {
  if (tokenIdCache[blockchain]) return tokenIdCache[blockchain];
  const data = await circleRequest(
    "GET",
    `/tokens?blockchain=${encodeURIComponent(blockchain)}&includeAll=false`
  );
  const tokens = data.data?.tokens || [];
  const usdc = tokens.find(
    (t) =>
      t.symbol?.toUpperCase() === "USDC" ||
      t.name?.toUpperCase().includes("USD COIN")
  );
  if (!usdc) throw new Error(`USDC token not found for blockchain: ${blockchain}`);
  tokenIdCache[blockchain] = usdc.id;
  return usdc.id;
}

// ── Helper: call Circle API ──────────────────────────────────────────────────
async function circleRequest(method, path, body = null) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${CIRCLE_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${CIRCLE_API_BASE}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Circle API error: ${res.status}`);
  }
  return data;
}

// ── Idempotency key (proper UUID v4) ─────────────────────────────────────────
function idempotencyKey() {
  return webcrypto.randomUUID();
}

// ── Lambda handler ────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const origin = event.headers["origin"] || event.headers["Origin"] || "";
  const headers = getCORSHeaders(origin);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (event.body && event.body.length > 4096) {
    return { statusCode: 413, headers, body: JSON.stringify({ error: "Request too large" }) };
  }

  if (!CIRCLE_API_KEY || !CIRCLE_ENTITY_SECRET) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Circle credentials not configured" }),
    };
  }

  let action, payload;
  try {
    const parsed = JSON.parse(event.body || "{}");
    action = parsed.action;
    payload = parsed;
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Rate limiting
  const clientIP =
    event.headers["x-nf-client-connection-ip"] ||
    (event.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    "unknown";
  if (isRateLimited(clientIP, action)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: "Too many requests. Please wait." }) };
  }

  // Auth check — user-facing actions require a valid session token
  if (AUTH_REQUIRED_ACTIONS.has(action)) {
    const authHeader = event.headers["authorization"] || event.headers["Authorization"] || "";
    const rawToken   = authHeader.replace(/^Bearer\s+/i, "").trim();
    const userId     = verifySessionToken(rawToken);
    if (!userId) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Authentication required" }) };
    }
  }

  try {
    // Pre-encrypt entity secret for calls that need it
    const needsSecret = ["createWalletSet", "createWallet", "sendUsdc"];
    let entitySecretCiphertext = null;
    if (needsSecret.includes(action)) {
      entitySecretCiphertext = await getEntitySecretCiphertext();
    }

    // ── INIT ENTITY SECRET (one-time setup) ───────────────────────────────
    if (action === "initEntitySecret") {
      // Registers the entity secret ciphertext with Circle (one-time setup required
      // before developer-controlled wallets can be used on this API key)
      const ciphertext = await getEntitySecretCiphertext();
      const res = await fetch(`${CIRCLE_API_BASE}/config/entity/secretCiphertext`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CIRCLE_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ entitySecretCiphertext: ciphertext }),
      });
      const result = await res.json();
      return {
        statusCode: res.ok ? 200 : 500,
        headers,
        body: JSON.stringify({ ok: res.ok, status: res.status, result }),
      };
    }

    // ── CREATE WALLET SET ──────────────────────────────────────────────────
    if (action === "createWalletSet") {
      const { name } = payload;
      const data = await circleRequest("POST", "/developer/walletSets", {
        idempotencyKey: idempotencyKey(),
        entitySecretCiphertext,
        name: name || "TchotchoPay Users",
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ walletSet: data.data }),
      };
    }

    // ── CREATE WALLET ──────────────────────────────────────────────────────
    if (action === "createWallet") {
      const { walletSetId, userId, blockchain } = payload;
      if (!walletSetId) throw new Error("walletSetId is required");
      // Default to Arc mainnet. Callers can pass blockchain: "BASE" etc.
      const chain = blockchain || DEFAULT_BLOCKCHAIN;
      const data = await circleRequest("POST", "/developer/wallets", {
        idempotencyKey: idempotencyKey(),
        entitySecretCiphertext,
        walletSetId,
        blockchains: [chain],
        count: 1,
        metadata: [{ name: userId || "tchotchopay-user", refId: userId || "" }],
      });
      const wallet = data.data?.wallets?.[0];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ wallet }),
      };
    }

    // ── GET WALLET BALANCE ─────────────────────────────────────────────────
    if (action === "getBalance") {
      const { walletId } = payload;
      if (!walletId) throw new Error("walletId is required");
      const data = await circleRequest(
        "GET",
        `/wallets/${walletId}/balances`
      );
      const balances = data.data?.tokenBalances || [];
      const usdc = balances.find((b) =>
        b.token?.symbol?.toUpperCase().includes("USDC")
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          walletId,
          usdcBalance: usdc?.amount || "0",
          allBalances: balances,
        }),
      };
    }

    // ── SEND USDC ──────────────────────────────────────────────────────────
    if (action === "sendUsdc") {
      const { walletId, destinationAddress, amount, userId } = payload;
      if (!walletId || !destinationAddress || !amount) {
        throw new Error("walletId, destinationAddress, and amount are required");
      }
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Invalid amount");
      }
      // Determine the wallet's blockchain, then look up USDC token ID for it.
      // This works on Arc mainnet, Base, or any supported Circle chain.
      const walletInfo = await circleRequest("GET", `/wallets/${walletId}`);
      const walletBlockchain =
        walletInfo.data?.wallet?.blockchain || DEFAULT_BLOCKCHAIN;
      const usdcTokenId = await getUsdcTokenId(walletBlockchain);

      const data = await circleRequest(
        "POST",
        "/developer/transactions/transfer",
        {
          idempotencyKey: idempotencyKey(),
          entitySecretCiphertext,
          walletId,
          destinationAddress,
          amounts: [amount.toString()],
          tokenId: usdcTokenId,
          fee: { type: "level", config: { feeLevel: "MEDIUM" } },
          note: `TchotchoPay transfer by ${userId || "user"}`,
        }
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ transaction: data.data }),
      };
    }

    // ── LIST WALLETS ───────────────────────────────────────────────────────
    if (action === "listWallets") {
      const { walletSetId } = payload;
      const query = walletSetId ? `?walletSetId=${walletSetId}` : "";
      const data = await circleRequest("GET", `/wallets${query}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ wallets: data.data?.wallets || [] }),
      };
    }

    // ── GET TRANSACTION ────────────────────────────────────────────────────
    if (action === "getTransaction") {
      const { transactionId } = payload;
      if (!transactionId) throw new Error("transactionId is required");
      const data = await circleRequest(
        "GET",
        `/transactions/${transactionId}`
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ transaction: data.data }),
      };
    }

    // ── GET WALLET ─────────────────────────────────────────────────────────
    if (action === "getWallet") {
      const { walletId } = payload;
      if (!walletId) throw new Error("walletId is required");
      const data = await circleRequest("GET", `/wallets/${walletId}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ wallet: data.data }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: `Unknown action: ${action}. Valid: createWalletSet, createWallet, getBalance, sendUsdc, listWallets, getTransaction, getWallet`,
      }),
    };
  } catch (err) {
    console.error("circle-wallet error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
