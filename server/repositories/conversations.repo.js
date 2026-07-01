// server/repositories/conversations.repo.js
const { query } = require("../config/db");

async function findByLeadId(leadId) {
  const { rows } = await query(
    "SELECT * FROM conversations WHERE lead_id = $1",
    [leadId],
  );
  return rows[0] || null;
}

async function create(leadId, state = "awaiting_name") {
  const { rows } = await query(
    `INSERT INTO conversations (lead_id, state)
     VALUES ($1, $2)
     RETURNING *`,
    [leadId, state],
  );
  return rows[0];
}

async function setState(leadId, state) {
  const { rows } = await query(
    `UPDATE conversations
     SET state = $1, last_message_at = NOW()
     WHERE lead_id = $2
     RETURNING *`,
    [state, leadId],
  );
  return rows[0] || null;
}

module.exports = { findByLeadId, create, setState };
