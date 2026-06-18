// server/routes/webhook.js
const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const { handleIncoming } = require("../services/bot");

// GET /webhook -- Meta's verification handshake.
// Meta hits this once when you first register the webhook URL.
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  console.warn("Webhook verification failed", { mode, token });
  return res.sendStatus(403);
});
function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature || !req.rawBody) return false;

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.META_APP_SECRET)
      .update(req.rawBody)
      .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}
// POST /webhook -- real incoming messages.
// Verifies Meta's signature, acknowledges immediately, then runs the bot.
router.post("/", async (req, res) => {
  if (!verifySignature(req)) {
    console.warn("Invalid webhook signature -- rejecting");
    return res.sendStatus(401);
  }

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
});
module.exports = router;
