import { pool } from "../config/database.js";

const summaryColumns = `p.id, p.user_id AS ownerId, u.username AS ownerUsername,
  p.name, p.description, p.is_public AS isPublic, p.created_at AS createdAt,
  p.updated_at AS updatedAt, COUNT(pt.track_id) AS trackCount`;

const list = async ({ userId, limit, offset }) => {
  const where = userId ? "p.user_id = ?" : "p.is_public = TRUE";
  const values = userId ? [userId] : [];
  const [rows] = await pool.execute(
    `SELECT ${summaryColumns} FROM playlists p JOIN users u ON u.id = p.user_id
     LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id WHERE ${where}
     GROUP BY p.id ORDER BY p.updated_at DESC LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT ${summaryColumns} FROM playlists p JOIN users u ON u.id = p.user_id
     LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id WHERE p.id = ? GROUP BY p.id`, [id]
  );
  if (!rows[0]) return null;
  const [tracks] = await pool.execute(
    `SELECT t.id, t.title, t.audio_url AS audioUrl, a.cover_url AS coverUrl, pt.position,
            ap.id AS artistId, ap.stage_name AS artistName, a.id AS albumId, a.title AS albumTitle
     FROM playlist_tracks pt JOIN tracks t ON t.id = pt.track_id
     JOIN artist_profiles ap ON ap.id = t.artist_id LEFT JOIN albums a ON a.id = t.album_id
     WHERE pt.playlist_id = ? ORDER BY pt.position`, [id]
  );
  return { ...rows[0], tracks };
};

const create = async ({ userId, name, description, isPublic }) => {
  const [result] = await pool.execute(
    "INSERT INTO playlists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)",
    [userId, name, description, isPublic]
  );
  return result.insertId;
};

const update = async (id, fields) => {
  const columns = Object.keys(fields);
  const [result] = await pool.execute(
    `UPDATE playlists SET ${columns.map((column) => `${column} = ?`).join(", ")} WHERE id = ?`,
    [...Object.values(fields), id]
  );
  return result.affectedRows > 0;
};

const remove = async (id) => (await pool.execute("DELETE FROM playlists WHERE id = ?", [id]))[0].affectedRows > 0;

const addTrack = async (playlistId, trackId) => {
  const [result] = await pool.execute(
    `INSERT IGNORE INTO playlist_tracks (playlist_id, track_id, position)
     SELECT ?, ?, COALESCE(MAX(position), 0) + 1 FROM playlist_tracks WHERE playlist_id = ?`,
    [playlistId, trackId, playlistId]
  );
  return result.affectedRows > 0;
};

const removeTrack = async (playlistId, trackId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?", [playlistId, trackId]
    );
    // The temporary offset avoids collisions with the unique position index
    // while the remaining tracks are compacted into a gap-free sequence.
    await connection.execute("UPDATE playlist_tracks SET position = position + 1000000 WHERE playlist_id = ?", [playlistId]);
    await connection.query("SET @playlist_position := 0");
    await connection.execute(
      "UPDATE playlist_tracks SET position = (@playlist_position := @playlist_position + 1) WHERE playlist_id = ? ORDER BY position", [playlistId]
    );
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
};

const reorder = async (playlistId, trackIds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [current] = await connection.execute(
      "SELECT track_id AS trackId FROM playlist_tracks WHERE playlist_id = ? FOR UPDATE", [playlistId]
    );
    const existing = current.map((row) => Number(row.trackId)).sort((a, b) => a - b);
    const requested = [...trackIds].sort((a, b) => a - b);
    if (existing.length !== requested.length || existing.some((id, index) => id !== requested[index])) {
      await connection.rollback();
      return false;
    }
    // Move every row outside the live range first; otherwise swapping two
    // positions would briefly violate the unique (playlist, position) index.
    await connection.execute("UPDATE playlist_tracks SET position = position + 1000000 WHERE playlist_id = ?", [playlistId]);
    for (let index = 0; index < trackIds.length; index += 1) {
      await connection.execute(
        "UPDATE playlist_tracks SET position = ? WHERE playlist_id = ? AND track_id = ?",
        [index + 1, playlistId, trackIds[index]]
      );
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
};

export { addTrack, create, findById, list, remove, removeTrack, reorder, update };
