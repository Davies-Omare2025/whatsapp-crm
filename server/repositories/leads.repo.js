// server/repositories/leads.repo.js
const { query } = require("../config/db");

async function findById(id) {
  const { rows } = await query("SELECT * FROM leads WHERE id = $1", [id]);
  return rows[0] || null;
}

async function findByPhone(waPhone) {
  const { rows } = await query("SELECT * FROM leads WHERE wa_phone = $1", [
    waPhone,
  ]);
  return rows[0] || null;
}

// assignedTo can be: undefined (no filter), "unassigned" (IS NULL), or a real user UUID
async function list({ status, search, assignedTo, limit = 50, offset = 0 }) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`l.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(l.name ILIKE $${params.length} OR l.wa_phone ILIKE $${params.length})`,
    );
  }
  if (assignedTo === "unassigned") {
    conditions.push("l.assigned_to IS NULL");
  } else if (assignedTo) {
    params.push(assignedTo);
    conditions.push(`l.assigned_to = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  params.push(limit);
  params.push(offset);

  const { rows } = await query(
    `SELECT l.*, u.name AS assigned_to_name
     FROM leads l
     LEFT JOIN users u ON u.id = l.assigned_to
     ${where}
     ORDER BY l.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return rows;
}

async function insert({
  waPhone,
  name,
  email,
  inquiryType,
  channel = "whatsapp",
  category = null,
}) {
  const { rows } = await query(
    `INSERT INTO leads
      (wa_phone, name, email, inquiry_type, channel, category)
     VALUES
      ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [waPhone, name, email, inquiryType, channel, category],
  );

  return rows[0];
}

async function updateStatus(id, status) {
  const { rows } = await query(
    `UPDATE leads SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id],
  );
  return rows[0] || null;
}

// Generic field updater, used by the WhatsApp bot to update
// name/email/inquiry_type as the conversation progresses.
async function updateFields(id, patch) {
  const fields = Object.keys(patch);
  if (fields.length === 0) return findById(id);

  const sets = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = fields.map((f) => patch[f]);

  const { rows } = await query(
    `UPDATE leads SET ${sets}, updated_at = NOW()
     WHERE id = $${fields.length + 1}
     RETURNING *`,
    [...values, id],
  );
  return rows[0] || null;
}

async function assign(leadId, userId) {
  const { rows } = await query(
    `UPDATE leads SET assigned_to = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [userId, leadId],
  );
  return rows[0] || null;
}

async function statsByStatus() {
  const { rows } = await query(
    `SELECT status, COUNT(*)::int AS total
     FROM leads
     GROUP BY status`,
  );
  return rows;
}

async function setBotEnabled(id, enabled) {
  const { rows } = await query(
    `
    UPDATE leads
    SET bot_enabled = $2,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *;
    `,
    [id, enabled],
  );

  return rows[0] || null;
}

async function incrementUnreadCount(id) {
  console.log("incrementUnreadCount() called with:", id);

  const { rows } = await query(
    `
    UPDATE leads
    SET unread_count = unread_count + 1,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, unread_count;
    `,
    [id],
  );

  console.log("Updated lead:", rows[0]);

  return rows[0] || null;
}

async function resetUnreadCount(id) {
  const { rows } = await query(
    `
    UPDATE leads
    SET unread_count = 0,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *;
    `,
    [id],
  );

  return rows[0] || null;
}

module.exports = {
  findById,
  findByPhone,
  list,
  insert,
  updateStatus,
  updateFields,
  assign,
  statsByStatus,
  setBotEnabled,
  incrementUnreadCount,
  resetUnreadCount,
};
