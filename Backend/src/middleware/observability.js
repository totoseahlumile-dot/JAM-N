import crypto from "node:crypto";

const startedAt = Date.now();
const counters = new Map();
const observeRequests = (req, res, next) => {
  const start = process.hrtime.bigint();
  req.id = req.get("x-request-id")?.slice(0, 100) || crypto.randomUUID();
  res.set("X-Request-Id", req.id);
  res.on("finish", () => {
    const route = req.route?.path || req.path;
    const key = `${req.method}|${route}|${res.statusCode}`;
    counters.set(key, (counters.get(key) || 0) + 1);
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    if (process.env.NODE_ENV !== "test") console.log(JSON.stringify({
      level: "info", event: "http.request", requestId: req.id, method: req.method,
      path: req.originalUrl, status: res.statusCode, durationMs: Number(durationMs.toFixed(2))
    }));
  });
  next();
};
const metrics = () => {
  const lines = [`jamn_process_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}`];
  for (const [key, value] of counters) {
    const [method, route, status] = key.split("|");
    const safeRoute = route.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
    lines.push(`jamn_http_requests_total{method="${method}",route="${safeRoute}",status="${status}"} ${value}`);
  }
  return `${lines.join("\n")}\n`;
};
export { metrics, observeRequests };
