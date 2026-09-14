import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import env from "../src/config/env.js";

const { name: database, ...databaseOptions } = env.database;
const connection = await mysql.createConnection({ ...databaseOptions, database, multipleStatements: true });
try {
  // The seed uses unique keys and INSERT ... ON DUPLICATE KEY UPDATE, so this
  // command is safe to repeat after catalog values change.
  const sql = (await fs.readFile(new URL("../database/seed.sql", import.meta.url), "utf8"))
    .replace(/^USE\s+[^;]+;/i, "");
  await connection.query(sql);
  const [[counts]] = await connection.query(`SELECT
    (SELECT COUNT(*) FROM artist_profiles) AS artists,
    (SELECT COUNT(*) FROM artist_genres) AS artistGenres,
    (SELECT COUNT(*) FROM albums) AS albums,
    (SELECT COUNT(*) FROM tracks) AS tracks`);
  console.log(JSON.stringify(counts));
} finally { await connection.end(); }
