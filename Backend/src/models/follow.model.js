import { pool } from "../config/database.js";

const addUserFollow = async (followerId, followedId) => {
  const [result] = await pool.execute(
    "INSERT IGNORE INTO user_follows (follower_user_id, followed_user_id) VALUES (?, ?)",
    [followerId, followedId]
  );
  return result.affectedRows > 0;
};

const removeUserFollow = async (followerId, followedId) => {
  await pool.execute(
    "DELETE FROM user_follows WHERE follower_user_id = ? AND followed_user_id = ?",
    [followerId, followedId]
  );
};

const addArtistFollow = async (userId, artistId) => {
  const [result] = await pool.execute(
    "INSERT IGNORE INTO artist_follows (user_id, artist_id) VALUES (?, ?)",
    [userId, artistId]
  );
  return result.affectedRows > 0;
};

const removeArtistFollow = async (userId, artistId) => {
  await pool.execute("DELETE FROM artist_follows WHERE user_id = ? AND artist_id = ?", [userId, artistId]);
};

const listUserFollowers = async ({ userId, limit, offset }) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.display_name AS displayName, u.avatar_url AS avatarUrl,
            uf.created_at AS followedAt
     FROM user_follows uf JOIN users u ON u.id = uf.follower_user_id
     WHERE uf.followed_user_id = ? AND u.is_active = TRUE
     ORDER BY uf.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );
  return rows;
};

const listUserFollowing = async ({ userId, limit, offset }) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.display_name AS displayName, u.avatar_url AS avatarUrl,
            uf.created_at AS followedAt
     FROM user_follows uf JOIN users u ON u.id = uf.followed_user_id
     WHERE uf.follower_user_id = ? AND u.is_active = TRUE
     ORDER BY uf.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );
  return rows;
};

const listArtistFollowers = async ({ artistId, limit, offset }) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.display_name AS displayName, u.avatar_url AS avatarUrl,
            af.created_at AS followedAt
     FROM artist_follows af JOIN users u ON u.id = af.user_id
     WHERE af.artist_id = ? AND u.is_active = TRUE
     ORDER BY af.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    [artistId]
  );
  return rows;
};

const getUserStats = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT
       (SELECT COUNT(*) FROM user_follows WHERE followed_user_id = ?) AS followerCount,
       (SELECT COUNT(*) FROM user_follows WHERE follower_user_id = ?) AS followingCount`,
    [userId, userId]
  );
  return { followerCount: Number(rows[0].followerCount), followingCount: Number(rows[0].followingCount) };
};

const getArtistStats = async (artistId) => {
  const [rows] = await pool.execute("SELECT COUNT(*) AS followerCount FROM artist_follows WHERE artist_id = ?", [artistId]);
  return { followerCount: Number(rows[0].followerCount) };
};

const listMine = async (userId) => {
  const [users] = await pool.execute(
    `SELECT u.id, u.username, u.display_name AS displayName, u.avatar_url AS avatarUrl,
            uf.created_at AS followedAt
     FROM user_follows uf JOIN users u ON u.id = uf.followed_user_id
     WHERE uf.follower_user_id = ? ORDER BY uf.created_at DESC`,
    [userId]
  );
  const [artists] = await pool.execute(
    `SELECT ap.id, ap.stage_name AS stageName, ap.location, ap.is_verified AS isVerified,
            af.created_at AS followedAt
     FROM artist_follows af JOIN artist_profiles ap ON ap.id = af.artist_id
     WHERE af.user_id = ? ORDER BY af.created_at DESC`,
    [userId]
  );
  return { users, artists: artists.map((artist) => ({ ...artist, isVerified: Boolean(artist.isVerified) })) };
};

const findArtistOwner = async (artistId) => {
  const [rows] = await pool.execute("SELECT user_id AS userId FROM artist_profiles WHERE id = ? LIMIT 1", [artistId]);
  return rows[0] || null;
};

export {
  addArtistFollow, addUserFollow, findArtistOwner, getArtistStats, getUserStats,
  listArtistFollowers, listMine, listUserFollowers, listUserFollowing,
  removeArtistFollow, removeUserFollow
};
