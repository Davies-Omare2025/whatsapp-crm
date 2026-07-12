// server/controllers/messages.controller.js

const leadsRepo = require("../repositories/leads.repo");
const messagesRepo = require("../repositories/messages.repo");
const { sendText } = require("../services/whatsapp");

/**
 * GET /api/messages/:leadId
 * Returns the complete conversation for a lead.
 */
async function getMessages(req, res, next) {
  try {
    const { leadId } = req.params;

    const lead = await leadsRepo.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        error: "Lead not found",
      });
    }

    const messages = await messagesRepo.listForLead(leadId);

    return res.json(messages);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/messages/send
 *
 * Body:
 * {
 *   "leadId": "...",
 *   "body": "Hello Davies!"
 * }
 */
async function sendMessage(req, res, next) {
  try {
    const { leadId, body } = req.body;

    if (!leadId) {
      return res.status(400).json({
        error: "leadId is required",
      });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({
        error: "Message body is required",
      });
    }

    const lead = await leadsRepo.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        error: "Lead not found",
      });
    }

    // Send the WhatsApp message
    await sendText(lead.wa_phone, body);

    console.log("WhatsApp sent successfully");

    const saved = await messagesRepo.insertOutgoing(lead.id, body);

    if (global.io) {
      global.io.emit("message:new", {
        leadId: lead.id,
        message: saved,
      });
    }

    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMessages,
  sendMessage,
};
