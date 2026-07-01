// server/middleware/verifyWebhookSignature.js
const crypto = require("crypto");
const env = require("../config/env");

function verifyWebhookSignature(req, res, next) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature || !req.rawBody) {
    console.warn("Invalid webhook signature -- rejecting (missing)");
    return res.sendStatus(401);
  }

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", env.META_APP_SECRET)
      .update(req.rawBody)
      .digest("hex");

  let valid = false;
  try {
    valid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    valid = false;
  }

  if (!valid) {
    console.warn("Invalid webhook signature -- rejecting");
    return res.sendStatus(401);
  }

  next();
}

module.exports = verifyWebhookSignature;
