import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import env from "../src/config/env.js";

const directory = fileURLToPath(new URL("../backups", import.meta.url));
await fsPromises.mkdir(directory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const destination = path.join(directory, `${env.database.name}-${stamp}.sql`);
const output = fs.createWriteStream(destination, { flags: "wx" });
const windowsCandidates = [
  "C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe",
  "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe",
  "C:\\xampp\\mysql\\bin\\mysqldump.exe"
];
const executable = process.env.MYSQLDUMP_PATH
  || windowsCandidates.find((candidate) => fs.existsSync(candidate))
  || "mysqldump";
const child = spawn(executable, ["--single-transaction", "--routines", "--events", "--host", env.database.host,
  "--port", String(env.database.port), "--user", env.database.user, env.database.name],
{ env: { ...process.env, MYSQL_PWD: env.database.password }, stdio: ["ignore", "pipe", "inherit"] });
child.stdout.pipe(output);
let exitCode;
try {
  exitCode = await new Promise((resolve, reject) => { child.on("error", reject); child.on("close", resolve); });
} catch (error) {
  output.destroy(); await fsPromises.rm(destination, { force: true }); throw error;
}
if (exitCode !== 0) { await fsPromises.rm(destination, { force: true }); throw new Error(`mysqldump exited with code ${exitCode}`); }
console.log(destination);
