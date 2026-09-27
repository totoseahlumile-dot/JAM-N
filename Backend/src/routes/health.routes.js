import express from "express";
import { checkDatabaseConnection } from "../config/database.js";
import { getRedis } from "../config/redis.js";
import { metrics } from "../middleware/observability.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ status: "ok", service: "jam-n-api" });
});

router.get("/database", async (req, res, next) => {
  try {
    await checkDatabaseConnection();
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    error.status = 503;
    error.code = "DATABASE_UNAVAILABLE";
    error.message = "The database is unavailable";
    next(error);
  }
});

router.get("/ready", async (req, res, next) => {
  try {
    await checkDatabaseConnection();
    const redis = await getRedis();
    if (redis) await redis.ping();
    res.json({ status: "ready", database: "connected", redis: redis ? "connected" : "not-configured" });
  } catch (error) { error.status = 503; error.code = "DEPENDENCY_UNAVAILABLE"; error.message = "A required dependency is unavailable"; next(error); }
});
router.get("/metrics", (req, res) => res.type("text/plain; version=0.0.4").send(metrics()));

export default router;
