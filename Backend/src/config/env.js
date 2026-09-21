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
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  redisUrl: process.env.REDIS_URL || "",
  payfast: {
    merchantId: process.env.PAYFAST_MERCHANT_ID || "",
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || "",
    passphrase: process.env.PAYFAST_PASSPHRASE || "",
    notifyUrl: process.env.PAYFAST_NOTIFY_URL || "",
    returnUrl: process.env.PAYFAST_RETURN_URL || "",
    cancelUrl: process.env.PAYFAST_CANCEL_URL || ""
  },
  refreshTokenDays: readNumber("REFRESH_TOKEN_DAYS", 30),
  database: {
    host: process.env.DB_HOST || "localhost",
    port: readNumber("DB_PORT", 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "jam_n",
    connectionLimit: readNumber("DB_CONNECTION_LIMIT", 10)
  }
});

if (env.nodeEnv === "production") {
  const problems = [];
  if (!env.jwtSecret || env.jwtSecret.length < 32 || env.jwtSecret.includes("replace-with")) problems.push("JWT_SECRET must be an unpredictable value of at least 32 characters");
  if (!env.redisUrl) problems.push("REDIS_URL is required for shared rate limiting");
  if (!env.database.password) problems.push("DB_PASSWORD is required");
  if (!env.frontendOrigin.startsWith("https://")) problems.push("FRONTEND_ORIGIN must use HTTPS");
  if (env.payfast.merchantId || env.payfast.merchantKey) problems.push("Live payments are disabled; remove PAYFAST credentials until production review");
  if (problems.length) throw new Error(`Invalid production configuration: ${problems.join("; ")}`);
}

export default env;
