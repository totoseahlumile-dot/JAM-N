import * as playlists from "../models/playlist.model.js";
import httpError from "../utils/httpError.js";

const positiveInteger = (value, name) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw httpError(400, "VALIDATION_ERROR", `${name} must be a positive integer`);
  return parsed;
};
const text = (value, name, max, required = false) => {
  if (value === undefined && !required) return undefined;
  if (value === null && !required) return null;
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw httpError(400, "VALIDATION_ERROR", `${name} must be ${required ? "a non-empty string" : "text"} no longer than ${max} characters`);
  }
  return value.trim();
};
const canManage = (playlist, user) => user && (Number(playlist.ownerId) === Number(user.id) || user.role === "admin");
const loadManaged = async (id, user) => {
  const playlist = await playlists.findById(id);
  if (!playlist) throw httpError(404, "PLAYLIST_NOT_FOUND", "Playlist not found");
  if (!canManage(playlist, user)) throw httpError(403, "FORBIDDEN", "You do not own this playlist");
  return playlist;
};
const fields = (body) => Object.fromEntries(Object.entries({
  name: text(body.name, "name", 120),
  description: text(body.description, "description", 500),
  is_public: body.isPublic === undefined ? undefined : Boolean(body.isPublic)
}).filter(([, value]) => value !== undefined));

const getPublic = async (req, res, next) => { try {
  const limit = Math.min(100, positiveInteger(req.query.limit || 25, "limit"));
  const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);
  res.json({ playlists: await playlists.list({ limit, offset }), pagination: { limit, offset } });
} catch (error) { next(error); } };
const getMine = async (req, res, next) => { try {
  const limit = Math.min(100, positiveInteger(req.query.limit || 25, "limit"));
  const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);
  res.json({ playlists: await playlists.list({ userId: req.user.id, limit, offset }), pagination: { limit, offset } });
} catch (error) { next(error); } };
const getOne = async (req, res, next) => { try {
  const playlist = await playlists.findById(positiveInteger(req.params.id, "playlist id"));
  if (!playlist) throw httpError(404, "PLAYLIST_NOT_FOUND", "Playlist not found");
  if (!playlist.isPublic && !canManage(playlist, req.user)) throw httpError(404, "PLAYLIST_NOT_FOUND", "Playlist not found");
  res.json({ playlist });
} catch (error) { next(error); } };
const create = async (req, res, next) => { try {
  const id = await playlists.create({ userId: req.user.id, name: text(req.body?.name, "name", 120, true),
    description: text(req.body?.description, "description", 500) ?? null, isPublic: req.body?.isPublic === undefined ? true : Boolean(req.body.isPublic) });
  res.status(201).json({ id });
} catch (error) { next(error); } };
const update = async (req, res, next) => { try {
  const id = positiveInteger(req.params.id, "playlist id"); await loadManaged(id, req.user);
  const updates = fields(req.body ?? {}); if (!Object.keys(updates).length) throw httpError(400, "VALIDATION_ERROR", "At least one field is required");
  await playlists.update(id, updates); res.json({ id, updated: true });
} catch (error) { next(error); } };
const remove = async (req, res, next) => { try {
  const id = positiveInteger(req.params.id, "playlist id"); await loadManaged(id, req.user); await playlists.remove(id); res.status(204).end();
} catch (error) { next(error); } };
const addTrack = async (req, res, next) => { try {
  const id = positiveInteger(req.params.id, "playlist id"); await loadManaged(id, req.user);
  const added = await playlists.addTrack(id, positiveInteger(req.body?.trackId, "trackId")); res.status(added ? 201 : 200).json({ added });
} catch (error) { if (error.code === "ER_NO_REFERENCED_ROW_2") next(httpError(404, "TRACK_NOT_FOUND", "Track not found")); else next(error); } };
const removeTrack = async (req, res, next) => { try {
  const id = positiveInteger(req.params.id, "playlist id"); await loadManaged(id, req.user);
  if (!await playlists.removeTrack(id, positiveInteger(req.params.trackId, "track id"))) throw httpError(404, "TRACK_NOT_IN_PLAYLIST", "Track is not in this playlist");
  res.status(204).end();
} catch (error) { next(error); } };
const reorder = async (req, res, next) => { try {
  const id = positiveInteger(req.params.id, "playlist id"); await loadManaged(id, req.user);
  if (!Array.isArray(req.body?.trackIds) || new Set(req.body.trackIds).size !== req.body.trackIds.length) throw httpError(400, "VALIDATION_ERROR", "trackIds must be a unique array");
  const trackIds = req.body.trackIds.map((trackId) => positiveInteger(trackId, "track id"));
  if (!await playlists.reorder(id, trackIds)) throw httpError(400, "INVALID_TRACK_ORDER", "trackIds must contain every playlist track exactly once");
  res.json({ id, reordered: true });
} catch (error) { next(error); } };

export { addTrack, create, getMine, getOne, getPublic, remove, removeTrack, reorder, update };
