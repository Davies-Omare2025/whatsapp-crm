// server/repositories/messages.repo.js
const { query } = require("../config/db");

async function append(leadId, direction, body, rawPayload) {
  const { rows } = await query(
    `INSERT INTO messages (lead_id, direction, body, raw_payload)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [leadId, direction, body, rawPayload ? JSON.stringify(rawPayload) : null],
  );
  return rows[0];
}

async function listForLead(leadId) {
  const { rows } = await query(
    `SELECT * FROM messages WHERE lead_id = $1 ORDER BY created_at ASC`,
    [leadId],
  );
  return rows;
}

module.exports = { append, listForLead };
