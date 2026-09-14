import httpError from "../utils/httpError.js";

const rateLimit = ({ windowMs, max }) => {
  const clients = new Map();

  return (req, res, next) => {
    if (process.env.NODE_ENV === "test") return next();
    const now = Date.now();
    const key = req.ip;
    const current = clients.get(key);
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    entry.count += 1;
    clients.set(key, entry);
    res.set("RateLimit-Limit", String(max));
    res.set("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    res.set("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return next(httpError(429, "RATE_LIMIT_EXCEEDED", "Too many authentication attempts; try again later"));
    }

    // Remove expired entries occasionally without running a permanent timer.
    if (clients.size > 1000) {
      for (const [clientKey, value] of clients) {
        if (value.resetAt <= now) clients.delete(clientKey);
      }
    }
    return next();
  };
};

export default rateLimit;
