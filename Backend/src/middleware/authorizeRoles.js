import httpError from "../utils/httpError.js";

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(httpError(403, "FORBIDDEN", "You do not have permission to perform this action"));
  }
  return next();
};

export default authorizeRoles;
