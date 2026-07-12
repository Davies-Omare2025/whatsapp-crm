// server/routes/messages.routes.js

const express = require("express");

const router = express.Router();

const controller = require("../controllers/messages.controller");
const requireAuth = require("../middleware/requireAuth");

/*
|--------------------------------------------------------------------------
| All message routes require authentication
|--------------------------------------------------------------------------
*/

router.use(requireAuth);

/*
|--------------------------------------------------------------------------
| GET /api/messages/:leadId
|--------------------------------------------------------------------------
| Return the full conversation for a lead.
*/

router.get("/:leadId", controller.getMessages);

/*
|--------------------------------------------------------------------------
| POST /api/messages/send
|--------------------------------------------------------------------------
| Send a WhatsApp message from an agent.
|
| Body:
| {
|   "leadId": "...",
|   "body": "Hello!"
| }
*/

router.post("/send", controller.sendMessage);

module.exports = router;
