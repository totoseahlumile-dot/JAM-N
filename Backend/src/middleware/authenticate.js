import jwt from "jsonwebtoken";
import env from "../config/env.js";
import httpError from "../utils/httpError.js";

const authenticate = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(httpError(401, "AUTHENTICATION_REQUIRED", "A Bearer token is required"));
  }
  if (!env.jwtSecret) {
    return next(httpError(500, "AUTH_CONFIGURATION_ERROR", "Authentication is not configured"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next(httpError(401, "INVALID_TOKEN", "The access token is invalid or expired"));
  }
};

export default authenticate;
