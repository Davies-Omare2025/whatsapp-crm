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

async function list({ status, search, limit = 50, offset = 0 }) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(name ILIKE $${params.length} OR wa_phone ILIKE $${params.length})`,
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  params.push(limit);
  params.push(offset);

  const { rows } = await query(
    `SELECT * FROM leads ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return rows;
}

async function insert({ waPhone, name, email, inquiryType }) {
  const { rows } = await query(
    `INSERT INTO leads (wa_phone, name, email, inquiry_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [waPhone, name, email, inquiryType],
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

async function statsByStatus() {
  const { rows } = await query(
    `SELECT status, COUNT(*)::int AS total
     FROM leads
     GROUP BY status`,
  );
  return rows;
}

module.exports = {
  findById,
  findByPhone,
  list,
  insert,
  updateStatus,
  updateFields,
  statsByStatus,
};
