import { pool } from "../config/database.js";

const listArtists = async ({ search, genre, limit, offset }) => {
  const filters = [];
  const values = [];

  if (search) {
    filters.push("ap.stage_name LIKE ?");
    values.push(`%${search}%`);
  }
  if (genre) {
    filters.push(`EXISTS (
      SELECT 1 FROM artist_genres filter_ag
      JOIN genres filter_g ON filter_g.id = filter_ag.genre_id
      WHERE filter_ag.artist_id = ap.id AND filter_g.name = ?
    )`);
    values.push(genre);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await pool.execute(
    `SELECT ap.id, ap.stage_name AS stageName, ap.member_count AS memberCount,
            ap.location, ap.booking_email AS bookingEmail,
            ap.spotify_url AS spotifyUrl, ap.youtube_url AS youtubeUrl,
            ap.apple_music_url AS appleMusicUrl, ap.is_verified AS isVerified,
            u.bio, u.avatar_url AS avatarUrl,
            GROUP_CONCAT(DISTINCT g.name ORDER BY ag.is_primary DESC, g.name SEPARATOR '|') AS genreNames
     FROM artist_profiles ap
     LEFT JOIN users u ON u.id = ap.user_id
     LEFT JOIN artist_genres ag ON ag.artist_id = ap.id
     LEFT JOIN genres g ON g.id = ag.genre_id
     ${where}
     GROUP BY ap.id
     ORDER BY ap.stage_name
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return rows;
};

const findArtistById = async (id) => {
  const [artists] = await pool.execute(
    `SELECT ap.id, ap.stage_name AS stageName, ap.member_count AS memberCount,
            ap.location, ap.booking_email AS bookingEmail,
            ap.spotify_url AS spotifyUrl, ap.youtube_url AS youtubeUrl,
            ap.apple_music_url AS appleMusicUrl, ap.is_verified AS isVerified,
            u.bio, u.avatar_url AS avatarUrl,
            GROUP_CONCAT(DISTINCT g.name ORDER BY ag.is_primary DESC, g.name SEPARATOR '|') AS genreNames
     FROM artist_profiles ap
     LEFT JOIN users u ON u.id = ap.user_id
     LEFT JOIN artist_genres ag ON ag.artist_id = ap.id
     LEFT JOIN genres g ON g.id = ag.genre_id
     WHERE ap.id = ?
     GROUP BY ap.id`,
    [id]
  );
  if (!artists[0]) return null;

  const [albums] = await pool.execute(
    `SELECT id, title, release_date AS releaseDate, cover_url AS coverUrl
     FROM albums WHERE artist_id = ? ORDER BY release_date DESC, title`,
    [id]
  );
  const [tracks] = await pool.execute(
    `SELECT t.id, t.title, t.audio_url AS audioUrl, t.release_date AS releaseDate,
            t.stream_count AS streamCount, t.album_id AS albumId, a.title AS albumTitle
     FROM tracks t LEFT JOIN albums a ON a.id = t.album_id
     WHERE t.artist_id = ? ORDER BY t.release_date DESC, t.title`,
    [id]
  );
  return { ...artists[0], albums, tracks };
};

const listGenres = async () => {
  const [rows] = await pool.execute("SELECT id, name FROM genres ORDER BY name");
  return rows;
};

const listEvents = async ({ upcoming, limit, offset }) => {
  const where = upcoming ? "WHERE starts_at >= CURRENT_DATE" : "";
  const [rows] = await pool.execute(
    `SELECT id, name, location, starts_at AS startsAt, ends_at AS endsAt,
            price_description AS priceDescription, ticket_url AS ticketUrl
     FROM events ${where} ORDER BY starts_at ASC LIMIT ${limit} OFFSET ${offset}`
  );
  return rows;
};

const listAlbums = async ({ artistId, limit, offset }) => {
  const where = artistId ? "WHERE a.artist_id = ?" : "";
  const values = artistId ? [artistId] : [];
  const [rows] = await pool.execute(
    `SELECT a.id, a.title, a.release_date AS releaseDate, a.cover_url AS coverUrl,
            a.artist_id AS artistId, ap.stage_name AS artistName
     FROM albums a JOIN artist_profiles ap ON ap.id = a.artist_id
     ${where} ORDER BY a.release_date DESC, a.title LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return rows;
};

const listTracks = async ({ artistId, albumId, limit, offset }) => {
  const filters = [];
  const values = [];
  if (artistId) {
    filters.push("t.artist_id = ?");
    values.push(artistId);
  }
  if (albumId) {
    filters.push("t.album_id = ?");
    values.push(albumId);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await pool.execute(
    `SELECT t.id, t.title, t.audio_url AS audioUrl, t.release_date AS releaseDate,
            t.stream_count AS streamCount, t.artist_id AS artistId,
            ap.stage_name AS artistName, t.album_id AS albumId, a.title AS albumTitle
     FROM tracks t
     JOIN artist_profiles ap ON ap.id = t.artist_id
     LEFT JOIN albums a ON a.id = t.album_id
     ${where} ORDER BY t.release_date DESC, t.title LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return rows;
};

export { findArtistById, listAlbums, listArtists, listEvents, listGenres, listTracks };
