import { createHash, randomBytes } from "node:crypto";
import { pool } from "../config/database.js";
import env from "../config/env.js";

const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const generateToken = () => randomBytes(48).toString("base64url");
const expiresAt = () => new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000);

const insertToken = async (connection, userId) => {
  const token = generateToken();
  await connection.execute(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, hashToken(token), expiresAt()]
  );
  return token;
};

const create = async (userId) => {
  // Opportunistic cleanup keeps the table bounded without requiring a cron job.
  await pool.execute("DELETE FROM refresh_tokens WHERE expires_at <= NOW()");
  return insertToken(pool, userId);
};

const rotate = async (token) => {
  const connection = await pool.getConnection();
  let committed = false;
  try {
    await connection.beginTransaction();
    const tokenHash = hashToken(token);
    const [rows] = await connection.execute(
      `SELECT rt.id AS tokenId, rt.user_id AS userId, rt.expires_at AS expiresAt,
              rt.revoked_at AS revokedAt, u.username, u.email,
              u.display_name, u.bio, u.avatar_url, u.role, u.is_active,
              u.created_at, u.updated_at
       FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = ? FOR UPDATE`,
      [tokenHash]
    );
    const record = rows[0];
    if (!record) {
      const error = new Error("Refresh token is invalid");
      error.code = "INVALID_REFRESH_TOKEN";
      throw error;
    }

    if (record.revokedAt) {
      // A rotated token being presented again suggests theft. Revoke every
      // session for the account before reporting the reuse attempt.
      await connection.execute(
        "UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, NOW()) WHERE user_id = ?",
        [record.userId]
      );
      await connection.commit();
      committed = true;
      const error = new Error("Refresh token reuse detected");
      error.code = "REFRESH_TOKEN_REUSED";
      throw error;
    }

    if (!record.is_active || new Date(record.expiresAt) <= new Date()) {
      await connection.execute("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?", [record.tokenId]);
      await connection.commit();
      committed = true;
      const error = new Error("Refresh token is expired or inactive");
      error.code = "INVALID_REFRESH_TOKEN";
      throw error;
    }

    const replacement = await insertToken(connection, record.userId);
    await connection.execute(
      "UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_token_hash = ? WHERE id = ?",
      [hashToken(replacement), record.tokenId]
    );
    await connection.commit();
    committed = true;

    const user = {
      id: record.userId,
      username: record.username,
      email: record.email,
      display_name: record.display_name,
      bio: record.bio,
      avatar_url: record.avatar_url,
      role: record.role,
      created_at: record.created_at,
      updated_at: record.updated_at
    };
    return { user, token: replacement };
  } catch (error) {
    if (!committed) await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const revoke = async (token) => {
  await pool.execute(
    "UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, NOW()) WHERE token_hash = ?",
    [hashToken(token)]
  );
};

const revokeAll = async (userId) => {
  await pool.execute(
    "UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, NOW()) WHERE user_id = ?",
    [userId]
  );
};

export { create, revoke, revokeAll, rotate };
