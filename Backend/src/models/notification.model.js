import { pool } from "../config/database.js";

const supportedTypes = ["post_like", "post_comment", "artist_release", "event_reminder", "system"];

const create = async ({ userId, actorUserId, type, title, message, targetType, targetId, actionUrl, dedupeKey }) => {
  // Missing preference rows mean enabled. INSERT ... SELECT lets MySQL apply the
  // preference and self-alert rules atomically with the notification insert.
  const [result] = await pool.execute(
    `INSERT INTO notifications
       (user_id, actor_user_id, notification_type, title, message,
        target_type, target_id, action_url, dedupe_key)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
     WHERE (? IS NULL OR ? <> ?) AND COALESCE((
       SELECT in_app_enabled FROM notification_preferences
       WHERE user_id = ? AND notification_type = ?
     ), TRUE) = TRUE
     ON DUPLICATE KEY UPDATE id = id`,
    [userId, actorUserId, type, title, message, targetType, targetId, actionUrl,
      dedupeKey, actorUserId, userId, actorUserId, userId, type]
  );
  return result.affectedRows > 0;
};

const list = async ({ userId, unreadOnly, type, limit, offset }) => {
  const filters = ["n.user_id = ?"];
  const values = [userId];
  if (unreadOnly) filters.push("n.read_at IS NULL");
  if (type) {
    filters.push("n.notification_type = ?");
    values.push(type);
  }
  const [rows] = await pool.execute(
    `SELECT n.id, n.notification_type AS type, n.title, n.message,
            n.target_type AS targetType, n.target_id AS targetId,
            n.action_url AS actionUrl, n.read_at AS readAt, n.created_at AS createdAt,
            actor.id AS actorId, actor.username AS actorUsername,
            actor.display_name AS actorDisplayName, actor.avatar_url AS actorAvatarUrl
     FROM notifications n LEFT JOIN users actor ON actor.id = n.actor_user_id
     WHERE ${filters.join(" AND ")}
     ORDER BY n.created_at DESC, n.id DESC LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return rows;
};

const unreadCount = async (userId) => {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL",
    [userId]
  );
  return Number(rows[0].count);
};

const markRead = async (id, userId) => {
  const [result] = await pool.execute(
    "UPDATE notifications SET read_at = COALESCE(read_at, NOW()) WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
};

const markAllRead = async (userId) => {
  const [result] = await pool.execute(
    "UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL",
    [userId]
  );
  return result.affectedRows;
};

const remove = async (id, userId) => {
  const [result] = await pool.execute("DELETE FROM notifications WHERE id = ? AND user_id = ?", [id, userId]);
  return result.affectedRows > 0;
};

const getPreferences = async (userId) => {
  const placeholders = supportedTypes.map(() => "SELECT ? AS notification_type").join(" UNION ALL ");
  const [rows] = await pool.execute(
    `SELECT types.notification_type AS type,
            COALESCE(preference.in_app_enabled, TRUE) AS inAppEnabled
     FROM (${placeholders}) types
     LEFT JOIN notification_preferences preference
       ON preference.user_id = ? AND preference.notification_type = types.notification_type
     ORDER BY types.notification_type`,
    [...supportedTypes, userId]
  );
  return rows.map((row) => ({ ...row, inAppEnabled: Boolean(row.inAppEnabled) }));
};

const setPreference = async (userId, type, inAppEnabled) => {
  await pool.execute(
    `INSERT INTO notification_preferences (user_id, notification_type, in_app_enabled)
     VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE in_app_enabled = VALUES(in_app_enabled)`,
    [userId, type, inAppEnabled]
  );
};

export { create, getPreferences, list, markAllRead, markRead, remove, setPreference, supportedTypes, unreadCount };
