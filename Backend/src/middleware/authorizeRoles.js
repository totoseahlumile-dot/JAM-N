import httpError from "../utils/httpError.js";

const authorizeRoles = (...roles) => (req, res, next) => {
  // `authenticate` must run first; it verifies the JWT and adds `req.user`.
  // Keeping role checks in a separate factory lets each route declare its policy.
  if (!req.user || !roles.includes(req.user.role)) {
    return next(httpError(403, "FORBIDDEN", "You do not have permission to perform this action"));
  }
  return next();
};

export default authorizeRoles;
