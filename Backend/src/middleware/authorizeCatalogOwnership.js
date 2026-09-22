import * as catalog from "../models/catalog.model.js";
import httpError from "../utils/httpError.js";

const forbidden = () => httpError(
  403,
  "RESOURCE_OWNERSHIP_REQUIRED",
  "You can only manage resources belonging to your artist profile"
);

const authorizeArtistOwnership = ({ source = "params", key = "id" } = {}) => async (req, res, next) => {
  if (req.user.role === "admin") return next();

  const artistId = req[source]?.[key];
  if (!artistId || !await catalog.artistBelongsToUser(artistId, req.user.id)) {
    return next(forbidden());
  }
  if (source === "params" && req.method === "PUT") {
    // An artist may edit profile data but cannot transfer that profile to a
    // different user account. Admins bypass this restriction above.
    req.body.userId = req.user.id;
  }
  return next();
};

const authorizeResourceOwnership = (resource) => async (req, res, next) => {
  if (req.user.role === "admin") return next();

  const ownsResource = await catalog.resourceBelongsToUser(resource, req.params.id, req.user.id);
  if (!ownsResource) return next(forbidden());

  // When an update moves a resource to another artist, that destination must
  // also belong to the caller; otherwise ownership could be bypassed via PUT.
  if (req.body?.artistId && !await catalog.artistBelongsToUser(req.body.artistId, req.user.id)) {
    return next(forbidden());
  }
  return next();
};

const bindNewArtistToUser = (req, res, next) => {
  if (req.user.role !== "admin") {
    // Never trust an artist-supplied userId. The verified JWT subject is the
    // only identity allowed to own a newly created artist profile.
    req.body.userId = req.user.id;
  }
  return next();
};

export { authorizeArtistOwnership, authorizeResourceOwnership, bindNewArtistToUser };
