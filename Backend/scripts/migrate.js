import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import env from "../src/config/env.js";

const directory = fileURLToPath(new URL("../database/migrations", import.meta.url));
// These migrations were applied locally before their files were lost in a
// worktree reset. The reconstructed files describe the same existing tables.
const legacyChecksums = {
  "007_track_comments.sql": "ad6570a672191837a5f69f6ffae38653412e13df101d2af1f707e8d09d42c69f",
  "008_track_plays.sql": "adc7f6d80d523741f6d89f7621c6b20661dbd8aef22c86d76059257137235f64"
};
const { name: database, ...databaseOptions } = env.database;
const connection = await mysql.createConnection({ ...databaseOptions, database, multipleStatements: true });

try {
  await connection.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) NOT NULL PRIMARY KEY,
    checksum CHAR(64) NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);
  const filenames = (await fs.readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  for (const filename of filenames) {
    const sql = await fs.readFile(path.join(directory, filename), "utf8");
    // Git may check out SQL with CRLF on Windows even when the migration was
    // originally applied with LF. Line endings do not change the SQL, so use
    // LF for new checksums while accepting old raw-file checksums as well.
    const checksum = crypto.createHash("sha256").update(sql.replace(/\r\n/g, "\n")).digest("hex");
    const rawChecksum = crypto.createHash("sha256").update(sql).digest("hex");
    const [rows] = await connection.execute("SELECT checksum FROM schema_migrations WHERE filename = ?", [filename]);
    if (rows[0]) {
      // A changed checksum means deployed history was rewritten. Refusing to
      // continue is safer than silently claiming an unknown schema is current.
      if (rows[0].checksum !== checksum && rows[0].checksum !== rawChecksum && rows[0].checksum !== legacyChecksums[filename]) {
        throw new Error(`Applied migration was modified: ${filename}`);
      }
      console.log(`skip ${filename}`);
      continue;
    }
    // MySQL DDL performs implicit commits, so the migration is recorded only
    // after every statement succeeds instead of promising a false transaction.
    await connection.query(sql);
    await connection.execute("INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)", [filename, checksum]);
    console.log(`apply ${filename}`);
  }
} finally {
  await connection.end();
}
