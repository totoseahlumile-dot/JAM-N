import { Router } from 'express';
import { pool } from '../config/database.js';
import rateLimit from '../middleware/rateLimit.js';
import httpError from '../utils/httpError.js';

const router = Router();
const playLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 120 });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.post('/tracks/:id/plays', playLimit, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return next(httpError(400, 'VALIDATION_ERROR', 'Invalid track ID'));
  const playbackId = req.body?.playbackId;
  if (typeof playbackId !== 'string' || !uuid.test(playbackId)) {
    return next(httpError(400, 'VALIDATION_ERROR', 'A valid playbackId is required'));
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [tracks] = await connection.execute('SELECT stream_count AS streamCount FROM tracks WHERE id = ? FOR UPDATE', [id]);
    if (!tracks.length) throw httpError(404, 'TRACK_NOT_FOUND', 'Track not found');
    // Each player session supplies one UUID. INSERT IGNORE makes retries
    // idempotent, so a network retry cannot increment the public count twice.
    const [insert] = await connection.execute('INSERT IGNORE INTO track_plays (playback_id, track_id) VALUES (?, ?)', [playbackId, id]);
    if (insert.affectedRows) await connection.execute('UPDATE tracks SET stream_count = stream_count + 1 WHERE id = ?', [id]);
    await connection.commit();
    res.json({ streamCount: Number(tracks[0].streamCount) + Number(Boolean(insert.affectedRows)), counted: Boolean(insert.affectedRows) });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    next(error);
  } finally { connection?.release(); }
});

export default router;
