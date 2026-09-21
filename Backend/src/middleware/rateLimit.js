import httpError from "../utils/httpError.js";
import { getRedis } from "../config/redis.js";

const rateLimit = ({ windowMs, max }) => {
  const clients = new Map();

  return async (req, res, next) => {
    if (process.env.NODE_ENV === "test") return next();
    const now = Date.now();
    const key = req.ip;
    const redis = await getRedis();
    if (redis) {
      // This script atomically increments and sets expiry. Atomicity prevents
      // concurrent first requests from creating a counter with no TTL.
      const redisKey = `jamn:rate:${windowMs}:${max}:${key}`;
      const count = Number(await redis.eval(
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return n",
        { keys: [redisKey], arguments: [String(windowMs)] }
      ));
      const ttl = Math.max(0, await redis.pTTL(redisKey));
      res.set("RateLimit-Limit", String(max)); res.set("RateLimit-Remaining", String(Math.max(0, max - count)));
      res.set("RateLimit-Reset", String(Math.ceil((now + ttl) / 1000)));
      if (count > max) { res.set("Retry-After", String(Math.ceil(ttl / 1000))); return next(httpError(429, "RATE_LIMIT_EXCEEDED", "Too many authentication attempts; try again later")); }
      return next();
    }
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
