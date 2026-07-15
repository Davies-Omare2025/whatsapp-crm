const { query } = require("../config/db");

exports.create = async ({ fullName, idNumber }) => {
  const sql = `
          INSERT INTO users (
              full_name,
              id_number
          )
          VALUES ($1, $2)
          RETURNING *;
      `;

  const result = await query(sql, [fullName, idNumber]);

  return result.rows[0];
};
