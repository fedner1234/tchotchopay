// netlify/functions/coinbase-webhook.js
// Receives real-time event notifications from Coinbase CDP
// Events: wallet.transaction.created, wallet.transaction.broadcast,
//         payments.transfers.processing, onramp.transaction.success,
//         onramp.transaction.failed

const crypto = require("crypto");

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = event.body;
    const signature = event.headers["x-webhook-signature"] || "";
    const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET || "";

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const hmac = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");
      if (hmac !== signature) {
        console.error("Invalid webhook signature");
        return { statusCode: 401, body: "Unauthorized" };
      }
    }

    const payload = JSON.parse(body);
    const { type, data } = payload;

    console.log(`[Coinbase Webhook] Event: ${type}`, JSON.stringify(data, null, 2));

    switch (type) {
      case "wallet.transaction.created":
        await handleTransactionCreated(data);
        break;

      case "wallet.transaction.broadcast":
        await handleTransactionBroadcast(data);
        break;

      case "payments.transfers.processing":
        await handleTransferProcessing(data);
        break;

      case "onramp.transaction.success":
        await handleOnrampSuccess(data);
        break;

      case "onramp.transaction.failed":
        await handleOnrampFailed(data);
        break;

      default:
        console.log(`[Coinbase Webhook] Unhandled event type: ${type}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error("[Coinbase Webhook] Error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

// ── Event Handlers ──────────────────────────────────────────────

async function handleTransactionCreated(data) {
  // A new USDC transaction has been initiated
  // data.transaction_id, data.wallet_id, data.amount, data.currency
  console.log("[TX Created] Wallet:", data.wallet_id, "Amount:", data.amount, data.currency);
  // TODO: Update transaction status in your database to 'pending'
  // TODO: Send push notification to sender: "Transaction initiated"
}

async function handleTransactionBroadcast(data) {
  // Transaction has been broadcast to Base blockchain
  // Typically takes 2 seconds to confirm
  console.log("[TX Broadcast] TX Hash:", data.transaction_hash);
  // TODO: Update transaction status to 'confirming'
  // TODO: Send notification: "Your transfer is on its way!"
}

async function handleTransferProcessing(data) {
  // A payment transfer is being processed
  console.log("[Transfer Processing] Transfer ID:", data.transfer_id);
  // TODO: Update transfer status to 'processing'
}

async function handleOnrampSuccess(data) {
  // User successfully loaded money (USD → USDC)
  // data.amount, data.currency, data.wallet_address, data.transaction_id
  console.log(
    "[Onramp Success] User loaded:",
    data.purchase_amount,
    "→",
    data.crypto_amount,
    data.crypto_currency
  );
  // TODO: Credit user's TchotchoPay wallet balance in your DB
  // TODO: Send notification: "Your wallet has been funded with X USDC"
}

async function handleOnrampFailed(data) {
  // User's money load attempt failed (card declined, etc.)
  console.log("[Onramp Failed] Reason:", data.failure_reason);
  // TODO: Update transaction status to 'failed'
  // TODO: Send notification: "Your funding attempt failed - please try again"
  // TODO: Email user with reason and support link
}
