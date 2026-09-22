import app from "./app.js";
import env from "./config/env.js";
import { pool } from "./config/database.js";
import { closeRedis } from "./config/redis.js";

const server = app.listen(env.port, () => {
  console.log(`JAM'N API listening on http://localhost:${env.port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received; shutting down`);
  server.close(async () => {
    await pool.end();
    await closeRedis();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
