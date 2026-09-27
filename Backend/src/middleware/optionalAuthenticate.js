import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Public resources may use identity for additional access without forcing a
// login. Invalid or expired credentials remain anonymous instead of producing
// an authentication error on an otherwise public endpoint.
const optionalAuthenticate = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme === "Bearer" && token && env.jwtSecret) {
    try {
      const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
      req.user = { id: payload.sub, role: payload.role };
    } catch { /* Anonymous access is still permitted. */ }
  }
  next();
};
export default optionalAuthenticate;
