import * as notifications from "../models/notification.model.js";
import httpError from "../utils/httpError.js";

const positiveInteger = (value, name) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw httpError(400, "INVALID_QUERY", `${name} must be a positive integer`);
  return parsed;
};

const pagination = (query) => ({
  limit: query.limit === undefined ? 25 : Math.min(100, positiveInteger(query.limit, "limit")),
  offset: query.offset === undefined ? 0 : Math.max(0, Number.parseInt(query.offset, 10) || 0)
});

const listAlerts = async (req, res, next) => {
  try {
    const options = {
      ...pagination(req.query),
      userId: req.user.id,
      unreadOnly: req.query.unread === "true",
      type: typeof req.query.type === "string" ? req.query.type : null
    };
    if (options.type && !notifications.supportedTypes.includes(options.type)) {
      throw httpError(400, "INVALID_QUERY", "Unsupported alert type");
    }
    res.json({
      alerts: await notifications.list(options),
      pagination: { limit: options.limit, offset: options.offset }
    });
  } catch (error) { next(error); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    res.json({ unreadCount: await notifications.unreadCount(req.user.id) });
  } catch (error) { next(error); }
};

const markRead = async (req, res, next) => {
  try {
    const id = positiveInteger(req.params.id, "alert id");
    if (!await notifications.markRead(id, req.user.id)) {
      throw httpError(404, "ALERT_NOT_FOUND", "Alert not found");
    }
    res.json({ id, read: true });
  } catch (error) { next(error); }
};

const markAllRead = async (req, res, next) => {
  try {
    res.json({ updated: await notifications.markAllRead(req.user.id) });
  } catch (error) { next(error); }
};

const deleteAlert = async (req, res, next) => {
  try {
    const id = positiveInteger(req.params.id, "alert id");
    if (!await notifications.remove(id, req.user.id)) {
      throw httpError(404, "ALERT_NOT_FOUND", "Alert not found");
    }
    res.status(204).end();
  } catch (error) { next(error); }
};

const getPreferences = async (req, res, next) => {
  try {
    res.json({ preferences: await notifications.getPreferences(req.user.id) });
  } catch (error) { next(error); }
};

const setPreference = async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!notifications.supportedTypes.includes(type)) {
      throw httpError(400, "VALIDATION_ERROR", "Unsupported alert type");
    }
    if (typeof req.body?.inAppEnabled !== "boolean") {
      throw httpError(400, "VALIDATION_ERROR", "inAppEnabled must be a boolean");
    }
    await notifications.setPreference(req.user.id, type, req.body.inAppEnabled);
    res.json({ type, inAppEnabled: req.body.inAppEnabled });
  } catch (error) { next(error); }
};

export { deleteAlert, getPreferences, getUnreadCount, listAlerts, markAllRead, markRead, setPreference };
