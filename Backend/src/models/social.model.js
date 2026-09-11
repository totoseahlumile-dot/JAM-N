import { pool } from "../config/database.js";

const postColumns = `
  p.id, p.caption, p.media_url AS mediaUrl, p.media_type_id AS mediaTypeId,
  mt.name AS mediaType, p.created_at AS createdAt, p.updated_at AS updatedAt,
  u.id AS authorId, u.username AS authorUsername, u.display_name AS authorDisplayName,
  u.avatar_url AS authorAvatarUrl,
  (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likeCount,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS commentCount
`;

const listPosts = async ({ userId, limit, offset }) => {
  const where = userId ? "WHERE p.user_id = ?" : "";
  const values = userId ? [userId] : [];
  const [rows] = await pool.execute(
    `SELECT ${postColumns}
     FROM posts p JOIN users u ON u.id = p.user_id
     LEFT JOIN media_types mt ON mt.id = p.media_type_id
     ${where} ORDER BY p.created_at DESC, p.id DESC LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return rows;
};

const findPostById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT ${postColumns}
     FROM posts p JOIN users u ON u.id = p.user_id
     LEFT JOIN media_types mt ON mt.id = p.media_type_id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const createPost = async ({ userId, caption, mediaUrl, mediaTypeId }) => {
  const [result] = await pool.execute(
    "INSERT INTO posts (user_id, caption, media_url, media_type_id) VALUES (?, ?, ?, ?)",
    [userId, caption, mediaUrl, mediaTypeId]
  );
  return result.insertId;
};

const updatePost = async (id, fields) => {
  const columns = Object.keys(fields);
  const [result] = await pool.execute(
    `UPDATE posts SET ${columns.map((column) => `${column} = ?`).join(", ")} WHERE id = ?`,
    [...Object.values(fields), id]
  );
  return result.affectedRows > 0;
};

const deletePost = async (id) => {
  const [result] = await pool.execute("DELETE FROM posts WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const addLike = async (postId, userId) => {
  await pool.execute("INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)", [postId, userId]);
};

const removeLike = async (postId, userId) => {
  await pool.execute("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?", [postId, userId]);
};

const listComments = async ({ postId, limit, offset }) => {
  const [rows] = await pool.execute(
    `SELECT c.id, c.post_id AS postId, c.body, c.created_at AS createdAt,
            c.updated_at AS updatedAt, u.id AS authorId,
            u.username AS authorUsername, u.display_name AS authorDisplayName,
            u.avatar_url AS authorAvatarUrl
     FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.post_id = ? ORDER BY c.created_at ASC, c.id ASC LIMIT ${limit} OFFSET ${offset}`,
    [postId]
  );
  return rows;
};

const createComment = async ({ postId, userId, body }) => {
  const [result] = await pool.execute(
    "INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, ?)",
    [postId, userId, body]
  );
  return result.insertId;
};

const updateComment = async (id, body) => {
  const [result] = await pool.execute("UPDATE comments SET body = ? WHERE id = ?", [body, id]);
  return result.affectedRows > 0;
};

const deleteComment = async (id) => {
  const [result] = await pool.execute("DELETE FROM comments WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const belongsToUser = async (resource, id, userId) => {
  const table = { post: "posts", comment: "comments" }[resource];
  if (!table) return false;
  const [rows] = await pool.execute(`SELECT 1 FROM ${table} WHERE id = ? AND user_id = ? LIMIT 1`, [id, userId]);
  return rows.length > 0;
};

export {
  addLike, belongsToUser, createComment, createPost, deleteComment, deletePost,
  findPostById, listComments, listPosts, removeLike, updateComment, updatePost
};
