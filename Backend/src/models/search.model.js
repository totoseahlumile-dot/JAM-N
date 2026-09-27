import { pool } from "../config/database.js";

const queries = {
  artists: `SELECT ap.id, ap.stage_name AS stageName, ap.location, ap.is_verified AS isVerified,
    u.avatar_url AS avatarUrl FROM artist_profiles ap LEFT JOIN users u ON u.id = ap.user_id
    WHERE ap.stage_name LIKE ? ORDER BY ap.is_verified DESC, ap.stage_name LIMIT ?`,
  albums: `SELECT a.id, a.title, a.release_date AS releaseDate, a.cover_url AS coverUrl,
    ap.id AS artistId, ap.stage_name AS artistName FROM albums a JOIN artist_profiles ap ON ap.id = a.artist_id
    WHERE a.title LIKE ? OR ap.stage_name LIKE ? ORDER BY a.release_date DESC LIMIT ?`,
  tracks: `SELECT t.id, t.title, t.audio_url AS audioUrl, t.release_date AS releaseDate,
    ap.id AS artistId, ap.stage_name AS artistName, a.id AS albumId, a.title AS albumTitle
    FROM tracks t JOIN artist_profiles ap ON ap.id = t.artist_id LEFT JOIN albums a ON a.id = t.album_id
    WHERE t.title LIKE ? OR ap.stage_name LIKE ? OR a.title LIKE ? ORDER BY t.stream_count DESC, t.title LIMIT ?`,
  events: `SELECT id, name, location, starts_at AS startsAt, ticket_url AS ticketUrl FROM events
    WHERE name LIKE ? OR location LIKE ? ORDER BY starts_at DESC LIMIT ?`,
  users: `SELECT id, username, display_name AS displayName, avatar_url AS avatarUrl, role FROM users
    WHERE is_active = TRUE AND (username LIKE ? OR display_name LIKE ?) ORDER BY username LIMIT ?`
};

const search = async ({ term, types, limit }) => {
  const pattern = `%${term}%`;
  const parameters = {
    artists: [pattern, limit], albums: [pattern, pattern, limit],
    tracks: [pattern, pattern, pattern, limit], events: [pattern, pattern, limit],
    users: [pattern, pattern, limit]
  };
  // Independent queries run concurrently so adding a result category does not
  // make endpoint latency grow linearly with the number of selected types.
  const entries = await Promise.all(types.map(async (type) => {
    const [rows] = await pool.execute(queries[type], parameters[type]);
    return [type, rows];
  }));
  return Object.fromEntries(entries);
};

export { search };
