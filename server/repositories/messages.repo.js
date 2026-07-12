// server/repositories/messages.repo.js

const { query } = require("../config/db");
const { incrementUnreadCount } = require("./leads.repo");

/**
 * Save any WhatsApp message.
 * Used by the bot for both incoming and outgoing messages.
 */
async function append(leadId, direction, body, rawPayload = null) {
  const { rows } = await query(
    `
    INSERT INTO messages
    (
        lead_id,
        direction,
        body,
        raw_payload
    )
    VALUES ($1,$2,$3,$4)
    RETURNING *
    `,
    [leadId, direction, body, rawPayload ? JSON.stringify(rawPayload) : null],
  );

  if (direction === "in") {
    console.log("Incoming message detected");
    console.log("Lead ID:", leadId);

    await incrementUnreadCount(leadId);

    console.log("Unread count increased");
  }

  return rows[0];
}

/**
 * Return the complete conversation.
 */
async function listForLead(leadId) {
  const { rows } = await query(
    `
    SELECT *
    FROM messages
    WHERE lead_id=$1
    ORDER BY created_at ASC
    `,
    [leadId],
  );

  return rows;
}

/**
 * Save an outgoing HUMAN AGENT message.
 */
async function insertOutgoing(leadId, body) {
  return append(leadId, "out", body, null);
}

module.exports = {
  append,
  listForLead,
  insertOutgoing,
};
