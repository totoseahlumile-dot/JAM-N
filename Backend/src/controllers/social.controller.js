import * as social from "../models/social.model.js";
import httpError from "../utils/httpError.js";

const positiveInteger = (value, name, optional = false) => {
  if (optional && (value === undefined || value === "")) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw httpError(400, "INVALID_QUERY", `${name} must be a positive integer`);
  }
  return parsed;
};

const pagination = (query) => ({
  limit: query.limit === undefined ? 25 : Math.min(100, positiveInteger(query.limit, "limit")),
  offset: query.offset === undefined ? 0 : Math.max(0, Number.parseInt(query.offset, 10) || 0)
});

const nullableString = (value, name, max) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string" || value.trim().length > max) {
    throw httpError(400, "VALIDATION_ERROR", `${name} must be no longer than ${max} characters`);
  }
  return value.trim();
};

const requiredText = (value, name, max) => {
  const result = nullableString(value, name, max);
  if (!result) throw httpError(400, "VALIDATION_ERROR", `${name} is required`);
  return result;
};

const postFields = (body) => Object.fromEntries(Object.entries({
  caption: nullableString(body.caption, "caption", 1000),
  media_url: nullableString(body.mediaUrl, "mediaUrl", 2048),
  media_type_id: body.mediaTypeId === undefined
    ? undefined
    : body.mediaTypeId === null ? null : positiveInteger(body.mediaTypeId, "mediaTypeId")
}).filter(([, value]) => value !== undefined));

const handleDatabaseError = (next, error) => {
  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return next(httpError(404, "RELATED_RESOURCE_NOT_FOUND", "A related post, user, or media type does not exist"));
  }
  return next(error);
};

const getPosts = async (req, res, next) => {
  try {
    const options = { ...pagination(req.query), userId: positiveInteger(req.query.userId, "userId", true) };
    const posts = await social.listPosts(options);
    res.json({ posts, pagination: { limit: options.limit, offset: options.offset } });
  } catch (error) { next(error); }
};

const getPost = async (req, res, next) => {
  try {
    const post = await social.findPostById(positiveInteger(req.params.id, "post id"));
    if (!post) return next(httpError(404, "POST_NOT_FOUND", "Post not found"));
    return res.json({ post });
  } catch (error) { return next(error); }
};

const createPost = async (req, res, next) => {
  try {
    const fields = postFields(req.body ?? {});
    if (!fields.caption && !fields.media_url) {
      throw httpError(400, "VALIDATION_ERROR", "A post requires a caption or mediaUrl");
    }
    const id = await social.createPost({
      userId: req.user.id,
      caption: fields.caption ?? null,
      mediaUrl: fields.media_url ?? null,
      mediaTypeId: fields.media_type_id ?? null
    });
    res.status(201).json({ id });
  } catch (error) { handleDatabaseError(next, error); }
};

const updatePost = async (req, res, next) => {
  try {
    const id = positiveInteger(req.params.id, "post id");
    const fields = postFields(req.body ?? {});
    if (Object.keys(fields).length === 0) throw httpError(400, "VALIDATION_ERROR", "At least one field is required");
    const current = await social.findPostById(id);
    if (!current) throw httpError(404, "POST_NOT_FOUND", "Post not found");
    const nextCaption = Object.hasOwn(fields, "caption") ? fields.caption : current.caption;
    const nextMediaUrl = Object.hasOwn(fields, "media_url") ? fields.media_url : current.mediaUrl;
    if (!nextCaption && !nextMediaUrl) {
      throw httpError(400, "VALIDATION_ERROR", "A post requires a caption or mediaUrl");
    }
    if (!await social.updatePost(id, fields)) throw httpError(404, "POST_NOT_FOUND", "Post not found");
    res.json({ id, updated: true });
  } catch (error) { handleDatabaseError(next, error); }
};

const deletePost = async (req, res, next) => {
  try {
    const id = positiveInteger(req.params.id, "post id");
    if (!await social.deletePost(id)) throw httpError(404, "POST_NOT_FOUND", "Post not found");
    res.status(204).end();
  } catch (error) { next(error); }
};

const likePost = async (req, res, next) => {
  try {
    await social.addLike(positiveInteger(req.params.postId, "post id"), req.user.id);
    res.status(204).end();
  } catch (error) { handleDatabaseError(next, error); }
};

const unlikePost = async (req, res, next) => {
  try {
    await social.removeLike(positiveInteger(req.params.postId, "post id"), req.user.id);
    res.status(204).end();
  } catch (error) { next(error); }
};

const getComments = async (req, res, next) => {
  try {
    const options = { ...pagination(req.query), postId: positiveInteger(req.params.postId, "post id") };
    res.json({ comments: await social.listComments(options), pagination: { limit: options.limit, offset: options.offset } });
  } catch (error) { next(error); }
};

const createComment = async (req, res, next) => {
  try {
    const id = await social.createComment({
      postId: positiveInteger(req.params.postId, "post id"),
      userId: req.user.id,
      body: requiredText(req.body?.body, "body", 1000)
    });
    res.status(201).json({ id });
  } catch (error) { handleDatabaseError(next, error); }
};

const updateComment = async (req, res, next) => {
  try {
    const id = positiveInteger(req.params.id, "comment id");
    if (!await social.updateComment(id, requiredText(req.body?.body, "body", 1000))) {
      throw httpError(404, "COMMENT_NOT_FOUND", "Comment not found");
    }
    res.json({ id, updated: true });
  } catch (error) { next(error); }
};

const deleteComment = async (req, res, next) => {
  try {
    const id = positiveInteger(req.params.id, "comment id");
    if (!await social.deleteComment(id)) throw httpError(404, "COMMENT_NOT_FOUND", "Comment not found");
    res.status(204).end();
  } catch (error) { next(error); }
};

export {
  createComment, createPost, deleteComment, deletePost, getComments, getPost,
  getPosts, likePost, unlikePost, updateComment, updatePost
};
