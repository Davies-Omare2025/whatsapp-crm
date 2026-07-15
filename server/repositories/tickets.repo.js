// server/repositories/tickets.repo.js

const { query } = require("../config/db");

async function list({ status, channel, search, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`tickets.status = $${values.length}`);
  }

  if (channel) {
    values.push(channel);
    conditions.push(`tickets.channel = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);

    conditions.push(
      `(leads.name ILIKE $${values.length}
        OR leads.wa_phone ILIKE $${values.length}
        OR tickets.category ILIKE $${values.length}
        OR tickets.message ILIKE $${values.length})`,
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(limit);
  const limitPlaceholder = `$${values.length}`;

  values.push(offset);
  const offsetPlaceholder = `$${values.length}`;

  const { rows } = await query(
    `SELECT
       tickets.id,
       tickets.lead_id,
       tickets.category,
       tickets.message,
       tickets.status,
       tickets.channel,
       tickets.created_at,
       tickets.updated_at,
       leads.name AS lead_name,
       leads.wa_phone AS lead_phone
     FROM tickets
     INNER JOIN leads
       ON leads.id = tickets.lead_id
     ${whereClause}
     ORDER BY tickets.created_at DESC
     LIMIT ${limitPlaceholder}
     OFFSET ${offsetPlaceholder}`,
    values,
  );

  return rows;
}

async function findById(id) {
  const { rows } = await query(
    `SELECT
       tickets.id,
       tickets.lead_id,
       tickets.category,
       tickets.message,
       tickets.status,
       tickets.channel,
       tickets.created_at,
       tickets.updated_at,
       leads.name AS lead_name,
       leads.wa_phone AS lead_phone,
       leads.email AS lead_email,
       leads.assigned_to AS lead_assigned_to
     FROM tickets
     INNER JOIN leads
       ON leads.id = tickets.lead_id
     WHERE tickets.id = $1
     LIMIT 1`,
    [id],
  );

  return rows[0] || null;
}

async function updateStatus(id, status) {
  const { rows } = await query(
    `UPDATE tickets
     SET
       status = $2,
       updated_at = NOW()
     WHERE id = $1
     RETURNING
       id,
       lead_id,
       category,
       message,
       status,
       channel,
       created_at,
       updated_at`,
    [id, status],
  );

  return rows[0] || null;
}

async function findOpenByLeadId(leadId) {
  const { rows } = await query(
    `SELECT
       id,
       lead_id,
       category,
       message,
       status,
       channel,
       created_at,
       updated_at
     FROM tickets
     WHERE lead_id = $1
       AND status IN ('open', 'in_progress')
     ORDER BY created_at DESC
     LIMIT 5`,
    [leadId],
  );

  return rows;
}

async function create({ leadId, category, message, channel = "ussd" }) {
  const { rows } = await query(
    `INSERT INTO tickets
      (lead_id, category, message, channel)
     VALUES
      ($1, $2, $3, $4)
     RETURNING *`,
    [leadId, category, message, channel],
  );

  return rows[0];
}

module.exports = {
  list,
  findById,
  updateStatus,
  findOpenByLeadId,
  create,
};
