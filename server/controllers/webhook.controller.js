// server/controllers/webhook.controller.js
const env = require("../config/env");
const { handleIncoming } = require("../services/bot");

// GET /webhook -- Meta's verification handshake.
// Meta hits this once when you first register the webhook URL.
function verify(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.META_VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  console.warn("Webhook verification failed", { mode, token });
  return res.sendStatus(403);
}

// POST /webhook -- real incoming messages.
// Signature already verified by middleware before this runs.
// Acknowledges immediately, then runs the bot.
async function receive(req, res) {
  // Acknowledge IMMEDIATELY. Meta retries if we take too long.
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;
    const contacts = value?.contacts;

    // Status updates (delivered/read) arrive without `messages`. Ignore.
    if (!messages || messages.length === 0) return;

    for (const message of messages) {
      const contact = contacts?.[0];
      await handleIncoming(message, contact);
    }
  } catch (err) {
    // We've already sent 200 -- log and move on.
    console.error("Error handling webhook:", err);
  }
}

module.exports = { verify, receive };
