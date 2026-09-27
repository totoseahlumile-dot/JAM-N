import { pool } from "../config/database.js";

const publicColumns = `
  id, username, email, display_name, bio, avatar_url, role, created_at, updated_at
`;

const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT ${publicColumns}, password_hash, is_active FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT ${publicColumns} FROM users WHERE id = ? AND is_active = TRUE LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ username, email, passwordHash, displayName, role }) => {
  const [result] = await pool.execute(
    `INSERT INTO users (username, email, password_hash, display_name, role)
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, passwordHash, displayName, role]
  );
  return findById(result.insertId);
};

export { findByEmail, findById, create };
