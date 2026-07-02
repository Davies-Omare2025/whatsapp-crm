// server/repositories/users.repo.js
const { query } = require("../config/db");

async function findByEmail(email) {
  const { rows } = await query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query(
    "SELECT id, email, name, role, created_at FROM users WHERE id = $1",
    [id],
  );
  return rows[0] || null;
}

async function insert({ email, passwordHash, name, role = "agent" }) {
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role, created_at`,
    [email.toLowerCase(), passwordHash, name, role],
  );
  return rows[0];
}

async function findLeastBusyAgent() {
  const { rows } = await query(
    `SELECT u.id, u.name, COUNT(l.id)::int AS active_leads
     FROM users u
     LEFT JOIN leads l
       ON l.assigned_to = u.id
       AND l.status NOT IN ('converted', 'lost')
     WHERE u.role = 'agent'
     GROUP BY u.id, u.name
     ORDER BY active_leads ASC, u.created_at ASC
     LIMIT 1`,
  );
  return rows[0] || null;
}

module.exports = { findByEmail, findById, insert, findLeastBusyAgent };
