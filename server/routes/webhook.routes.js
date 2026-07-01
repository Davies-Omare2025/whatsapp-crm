// server/routes/webhook.routes.js
const express = require("express");
const controller = require("../controllers/webhook.controller");
const verifyWebhookSignature = require("../middleware/verifyWebhookSignature");

const router = express.Router();

router.get("/", controller.verify);
router.post("/", verifyWebhookSignature, controller.receive);

module.exports = router;
