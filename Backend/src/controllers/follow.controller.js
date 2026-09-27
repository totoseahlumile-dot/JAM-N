import * as follows from "../models/follow.model.js";
import * as notifications from "../models/notification.model.js";
import httpError from "../utils/httpError.js";
import * as users from "../models/user.model.js";

const positiveInteger = (value, name) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw httpError(400, "INVALID_QUERY", `${name} must be a positive integer`);
  return parsed;
};

const pagination = (query) => ({
  limit: query.limit === undefined ? 25 : Math.min(100, positiveInteger(query.limit, "limit")),
  offset: query.offset === undefined ? 0 : Math.max(0, Number.parseInt(query.offset, 10) || 0)
});

const handleReferenceError = (next, error, label) => {
  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return next(httpError(404, `${label.toUpperCase()}_NOT_FOUND`, `${label} not found`));
  }
  return next(error);
};

const createFollowerAlert = async ({ recipientId, actorId, targetType, targetId, actionUrl, dedupeKey }) => {
  if (!recipientId) return;
  try {
    const actor = await users.findById(actorId);
    const username = actor?.username || "A user";
    await notifications.create({
      userId: recipientId,
      actorUserId: actorId,
      type: "new_follower",
      title: "New follower",
      message: targetType === "artist"
        ? `${username} followed your artist profile.`
        : `${username} followed you.`,
      targetType,
      targetId,
      actionUrl,
      dedupeKey
    });
  } catch (error) {
    // Following remains successful if the secondary inbox write is unavailable.
    if (process.env.NODE_ENV !== "test") console.error("Unable to create follower alert", error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const followedId = positiveInteger(req.params.userId, "user id");
    if (Number(req.user.id) === followedId) {
      throw httpError(400, "SELF_FOLLOW_NOT_ALLOWED", "You cannot follow yourself");
    }
    const added = await follows.addUserFollow(req.user.id, followedId);
    if (added) await createFollowerAlert({
      recipientId: followedId,
      actorId: req.user.id,
      targetType: "user",
      targetId: req.user.id,
      actionUrl: `/users/${req.user.id}`,
      dedupeKey: `user_follow:${followedId}:${req.user.id}`
    });
    res.status(204).end();
  } catch (error) { handleReferenceError(next, error, "user"); }
};

const unfollowUser = async (req, res, next) => {
  try {
    await follows.removeUserFollow(req.user.id, positiveInteger(req.params.userId, "user id"));
    res.status(204).end();
  } catch (error) { next(error); }
};

const followArtist = async (req, res, next) => {
  try {
    const artistId = positiveInteger(req.params.artistId, "artist id");
    const owner = await follows.findArtistOwner(artistId);
    if (Number(owner?.userId) === Number(req.user.id)) {
      throw httpError(400, "SELF_FOLLOW_NOT_ALLOWED", "You cannot follow your own artist profile");
    }
    const added = await follows.addArtistFollow(req.user.id, artistId);
    if (added) {
      await createFollowerAlert({
        recipientId: owner?.userId,
        actorId: req.user.id,
        targetType: "artist",
        targetId: artistId,
        actionUrl: `/artists/${artistId}`,
        dedupeKey: `artist_follow:${artistId}:${req.user.id}`
      });
    }
    res.status(204).end();
  } catch (error) { handleReferenceError(next, error, "artist"); }
};

const unfollowArtist = async (req, res, next) => {
  try {
    await follows.removeArtistFollow(req.user.id, positiveInteger(req.params.artistId, "artist id"));
    res.status(204).end();
  } catch (error) { next(error); }
};

const getUserFollowers = async (req, res, next) => {
  try {
    const options = { ...pagination(req.query), userId: positiveInteger(req.params.userId, "user id") };
    res.json({ followers: await follows.listUserFollowers(options), pagination: { limit: options.limit, offset: options.offset } });
  } catch (error) { next(error); }
};

const getUserFollowing = async (req, res, next) => {
  try {
    const options = { ...pagination(req.query), userId: positiveInteger(req.params.userId, "user id") };
    res.json({ following: await follows.listUserFollowing(options), pagination: { limit: options.limit, offset: options.offset } });
  } catch (error) { next(error); }
};

const getArtistFollowers = async (req, res, next) => {
  try {
    const options = { ...pagination(req.query), artistId: positiveInteger(req.params.artistId, "artist id") };
    res.json({ followers: await follows.listArtistFollowers(options), pagination: { limit: options.limit, offset: options.offset } });
  } catch (error) { next(error); }
};

const getUserStats = async (req, res, next) => {
  try { res.json(await follows.getUserStats(positiveInteger(req.params.userId, "user id"))); }
  catch (error) { next(error); }
};

const getArtistStats = async (req, res, next) => {
  try { res.json(await follows.getArtistStats(positiveInteger(req.params.artistId, "artist id"))); }
  catch (error) { next(error); }
};

const getMyFollows = async (req, res, next) => {
  try { res.json(await follows.listMine(req.user.id)); }
  catch (error) { next(error); }
};

export {
  followArtist, followUser, getArtistFollowers, getArtistStats, getMyFollows,
  getUserFollowers, getUserFollowing, getUserStats, unfollowArtist, unfollowUser
};
