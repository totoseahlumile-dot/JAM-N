import { Router } from 'express';
import { pool } from '../config/database.js';
import authenticate from '../middleware/authenticate.js';
import httpError from '../utils/httpError.js';

const router = Router();
const columns = `c.id, c.track_id AS trackId, c.user_id AS userId, c.body,
  c.position_seconds AS positionSeconds, c.created_at AS createdAt,
  c.updated_at AS updatedAt, u.username AS authorUsername,
  u.display_name AS authorDisplayName, u.avatar_url AS authorAvatarUrl`;
const trackId = (value) => {
  if (!/^[1-9]\d*$/.test(String(value))) throw httpError(400, 'VALIDATION_ERROR', 'Invalid track ID');
  return Number(value);
};
const commentId = (value) => {
  if (!/^[1-9]\d*$/.test(String(value))) throw httpError(400, 'VALIDATION_ERROR', 'Invalid comment ID');
  return Number(value);
};
const validateBody = (body) => {
  const text = body?.body?.trim();
  if (!text || text.length > 1000) throw httpError(400, 'VALIDATION_ERROR', 'Comment must contain 1–1000 characters');
  const position = body.positionSeconds == null ? null : Number(body.positionSeconds);
  if (position !== null && (!Number.isInteger(position) || position < 0 || position > 86400)) {
    throw httpError(400, 'VALIDATION_ERROR', 'Invalid comment timestamp');
  }
  return { text, position };
};
const findComment = async (id) => {
  const [rows] = await pool.execute(`SELECT ${columns} FROM track_comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?`, [id]);
  return rows[0];
};

router.get('/tracks/:trackId/comments', async (req, res, next) => {
  try {
    const id = trackId(req.params.trackId);
    const [tracks] = await pool.execute('SELECT id FROM tracks WHERE id = ?', [id]);
    if (!tracks.length) throw httpError(404, 'TRACK_NOT_FOUND', 'Track not found');
    const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
    const limit = 30;
    const [countRows] = await pool.execute('SELECT COUNT(*) AS total FROM track_comments WHERE track_id = ?', [id]);
    const [comments] = await pool.query(`SELECT ${columns} FROM track_comments c JOIN users u ON u.id = c.user_id WHERE c.track_id = ? ORDER BY c.created_at DESC, c.id DESC LIMIT ? OFFSET ?`, [id, limit, (page - 1) * limit]);
    res.json({ comments, total: countRows[0].total, page, limit });
  } catch (error) { next(error); }
});

router.post('/tracks/:trackId/comments', authenticate, async (req, res, next) => {
  try {
    const id = trackId(req.params.trackId);
    const { text, position } = validateBody(req.body);
    const [tracks] = await pool.execute('SELECT id FROM tracks WHERE id = ?', [id]);
    if (!tracks.length) throw httpError(404, 'TRACK_NOT_FOUND', 'Track not found');
    const [result] = await pool.execute('INSERT INTO track_comments (track_id, user_id, body, position_seconds) VALUES (?, ?, ?, ?)', [id, req.user.id, text, position]);
    res.status(201).json({ comment: await findComment(result.insertId) });
  } catch (error) { next(error); }
});

router.put('/tracks/:trackId/comments/:commentId', authenticate, async (req, res, next) => {
  try {
    const id = trackId(req.params.trackId);
    const comment = await findComment(commentId(req.params.commentId));
    if (!comment || Number(comment.trackId) !== id) throw httpError(404, 'COMMENT_NOT_FOUND', 'Comment not found');
    if (Number(comment.userId) !== Number(req.user.id) && req.user.role !== 'admin') throw httpError(403, 'FORBIDDEN', 'You cannot edit this comment');
    const { text, position } = validateBody(req.body);
    await pool.execute('UPDATE track_comments SET body = ?, position_seconds = ? WHERE id = ?', [text, position, comment.id]);
    res.json({ comment: await findComment(comment.id) });
  } catch (error) { next(error); }
});

router.delete('/tracks/:trackId/comments/:commentId', authenticate, async (req, res, next) => {
  try {
    const id = trackId(req.params.trackId);
    const comment = await findComment(commentId(req.params.commentId));
    if (!comment || Number(comment.trackId) !== id) throw httpError(404, 'COMMENT_NOT_FOUND', 'Comment not found');
    if (Number(comment.userId) !== Number(req.user.id) && req.user.role !== 'admin') throw httpError(403, 'FORBIDDEN', 'You cannot delete this comment');
    await pool.execute('DELETE FROM track_comments WHERE id = ?', [comment.id]);
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
