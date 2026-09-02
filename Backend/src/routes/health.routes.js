import express from "express";
import { checkDatabaseConnection } from "../config/database.js";

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

export default router;
