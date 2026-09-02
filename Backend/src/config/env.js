import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)), quiet: true });

const readNumber = (name, fallback) => {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
};

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: readNumber("PORT", 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5500",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  database: {
    host: process.env.DB_HOST || "localhost",
    port: readNumber("DB_PORT", 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "jam_n",
    connectionLimit: readNumber("DB_CONNECTION_LIMIT", 10)
  }
});

export default env;
