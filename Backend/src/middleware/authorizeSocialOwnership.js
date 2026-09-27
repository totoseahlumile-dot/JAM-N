import * as social from "../models/social.model.js";
import httpError from "../utils/httpError.js";

const authorizeSocialOwnership = (resource) => async (req, res, next) => {
  if (req.user.role === "admin") return next();

  if (!await social.belongsToUser(resource, req.params.id, req.user.id)) {
    return next(httpError(
      403,
      "RESOURCE_OWNERSHIP_REQUIRED",
      `You can only modify your own ${resource}s`
    ));
  }
  return next();
};

export default authorizeSocialOwnership;
