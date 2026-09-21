import { pool } from "../config/database.js";

const targetTables = { post: "posts", comment: "comments", user: "users", artist: "artist_profiles" };
const targetExists = async (type, id) => {
  const table = targetTables[type];
  if (!table) return false;
  const [rows] = await pool.execute(`SELECT 1 FROM ${table} WHERE id = ? LIMIT 1`, [id]);
  return rows.length > 0;
};
const createReport = async ({ reporterId, targetType, targetId, reason }) => {
  const [result] = await pool.execute(
    "INSERT INTO content_reports (reporter_user_id, target_type, target_id, reason) VALUES (?, ?, ?, ?)",
    [reporterId, targetType, targetId, reason]
  );
  return result.insertId;
};
const listReports = async ({ status, limit, offset }) => {
  const where = status ? "WHERE r.status = ?" : "";
  const [rows] = await pool.execute(
    `SELECT r.id, r.target_type AS targetType, r.target_id AS targetId, r.reason, r.status,
      r.created_at AS createdAt, reporter.username AS reporterUsername, reviewer.username AS reviewerUsername
     FROM content_reports r JOIN users reporter ON reporter.id = r.reporter_user_id
     LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by ${where}
     ORDER BY r.created_at ASC LIMIT ${limit} OFFSET ${offset}`, status ? [status] : []
  );
  return rows;
};
const withAudit = async (actorId, action, targetType, targetId, details, mutate) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const affected = await mutate(connection);
    if (!affected) { await connection.rollback(); return false; }
    await connection.execute(
      "INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [actorId, action, targetType, targetId, JSON.stringify(details ?? {})]
    );
    await connection.commit();
    return true;
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
};
const setArtistVerification = (actorId, id, verified) => withAudit(actorId, "artist.verification_changed", "artist", id, { verified }, async (connection) => {
  const [result] = await connection.execute("UPDATE artist_profiles SET is_verified = ? WHERE id = ?", [verified, id]); return result.affectedRows;
});
const setUserActive = (actorId, id, active) => withAudit(actorId, "user.status_changed", "user", id, { active }, async (connection) => {
  const [result] = await connection.execute("UPDATE users SET is_active = ? WHERE id = ?", [active, id]);
  if (result.affectedRows && !active) await connection.execute("UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL", [id]);
  return result.affectedRows;
});
const reviewReport = (actorId, id, status) => withAudit(actorId, "report.reviewed", "report", id, { status }, async (connection) => {
  const [result] = await connection.execute("UPDATE content_reports SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?", [status, actorId, id]); return result.affectedRows;
});
const deleteContent = (actorId, type, id) => withAudit(actorId, `${type}.removed`, type, id, {}, async (connection) => {
  const table = { post: "posts", comment: "comments" }[type];
  const [result] = await connection.execute(`DELETE FROM ${table} WHERE id = ?`, [id]); return result.affectedRows;
});
const listAuditLogs = async ({ limit, offset }) => {
  const [rows] = await pool.execute(
    `SELECT al.id, al.action, al.target_type AS targetType, al.target_id AS targetId,
      al.details, al.created_at AS createdAt, u.username AS actorUsername
     FROM audit_logs al LEFT JOIN users u ON u.id = al.actor_user_id
     ORDER BY al.created_at DESC, al.id DESC LIMIT ${limit} OFFSET ${offset}`
  ); return rows;
};

export { createReport, deleteContent, listAuditLogs, listReports, reviewReport, setArtistVerification, setUserActive, targetExists };
