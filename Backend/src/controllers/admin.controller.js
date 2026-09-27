import * as admin from "../models/admin.model.js";
import httpError from "../utils/httpError.js";
const integer = (value, name) => { const parsed = Number(value); if (!Number.isInteger(parsed) || parsed < 1) throw httpError(400, "VALIDATION_ERROR", `${name} must be a positive integer`); return parsed; };
const paging = (query) => ({ limit: Math.min(100, integer(query.limit || 25, "limit")), offset: Math.max(0, Number.parseInt(query.offset, 10) || 0) });
const requiredBoolean = (value, name) => { if (typeof value !== "boolean") throw httpError(400, "VALIDATION_ERROR", `${name} must be boolean`); return value; };
const report = async (req, res, next) => { try {
  const targetType = req.body?.targetType; const targetId = integer(req.body?.targetId, "targetId");
  if (!['post', 'comment', 'user', 'artist'].includes(targetType)) throw httpError(400, "VALIDATION_ERROR", "Unsupported targetType");
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  if (!reason || reason.length > 500) throw httpError(400, "VALIDATION_ERROR", "reason is required and must not exceed 500 characters");
  if (!await admin.targetExists(targetType, targetId)) throw httpError(404, "TARGET_NOT_FOUND", "Reported target not found");
  res.status(201).json({ id: await admin.createReport({ reporterId: req.user.id, targetType, targetId, reason }) });
} catch (error) { next(error); } };
const listReports = async (req, res, next) => { try {
  const status = req.query.status; if (status && !['pending', 'reviewing', 'dismissed', 'actioned'].includes(status)) throw httpError(400, "VALIDATION_ERROR", "Invalid report status");
  const options = paging(req.query); res.json({ reports: await admin.listReports({ ...options, status }), pagination: options });
} catch (error) { next(error); } };
const verifyArtist = async (req, res, next) => { try { const id = integer(req.params.id, "artist id"); if (!await admin.setArtistVerification(req.user.id, id, requiredBoolean(req.body?.verified, "verified"))) throw httpError(404, "ARTIST_NOT_FOUND", "Artist not found"); res.json({ id, updated: true }); } catch (error) { next(error); } };
const setUserStatus = async (req, res, next) => { try { const id = integer(req.params.id, "user id"); const active = requiredBoolean(req.body?.active, "active"); if (id === Number(req.user.id) && !active) throw httpError(400, "SELF_SUSPENSION", "Admins cannot suspend themselves"); if (!await admin.setUserActive(req.user.id, id, active)) throw httpError(404, "USER_NOT_FOUND", "User not found"); res.json({ id, updated: true }); } catch (error) { next(error); } };
const reviewReport = async (req, res, next) => { try { const id = integer(req.params.id, "report id"); const status = req.body?.status; if (!['reviewing', 'dismissed', 'actioned'].includes(status)) throw httpError(400, "VALIDATION_ERROR", "status must be reviewing, dismissed, or actioned"); if (!await admin.reviewReport(req.user.id, id, status)) throw httpError(404, "REPORT_NOT_FOUND", "Report not found"); res.json({ id, updated: true }); } catch (error) { next(error); } };
const deleteContent = async (req, res, next) => { try { const type = req.params.type; if (!['post', 'comment'].includes(type)) throw httpError(400, "VALIDATION_ERROR", "type must be post or comment"); const id = integer(req.params.id, `${type} id`); if (!await admin.deleteContent(req.user.id, type, id)) throw httpError(404, "CONTENT_NOT_FOUND", "Content not found"); res.status(204).end(); } catch (error) { next(error); } };
const auditLogs = async (req, res, next) => { try { const options = paging(req.query); res.json({ auditLogs: await admin.listAuditLogs(options), pagination: options }); } catch (error) { next(error); } };
export { auditLogs, deleteContent, listReports, report, reviewReport, setUserStatus, verifyArtist };
