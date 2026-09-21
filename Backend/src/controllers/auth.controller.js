import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import * as users from "../models/user.model.js";
import * as refreshTokens from "../models/refreshToken.model.js";
import httpError from "../utils/httpError.js";

const createToken = (user) => {
  if (!env.jwtSecret) {
    throw httpError(500, "AUTH_CONFIGURATION_ERROR", "Authentication is not configured");
  }
  return jwt.sign(
    { role: user.role },
    env.jwtSecret,
    { subject: String(user.id), expiresIn: env.jwtExpiresIn, algorithm: "HS256" }
  );
};

const refreshCookieName = "jamn_refresh";
const refreshCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000
};
const refreshCookieClearOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/api/auth"
};

const readCookie = (req, name) => {
  const prefix = `${name}=`;
  const value = (req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : null;
};

const readRefreshToken = (req) => readCookie(req, refreshCookieName) || req.body?.refreshToken;

const sendSession = async (res, user, status = 200) => {
  const accessToken = createToken(user);
  const refreshToken = await refreshTokens.create(user.id);
  res.cookie(refreshCookieName, refreshToken, refreshCookieOptions);
  res.set("Cache-Control", "no-store");
  return res.status(status).json({ user, accessToken });
};

const register = async (req, res, next) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await users.create({ ...req.body, passwordHash });
    return await sendSession(res, user, 201);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return next(httpError(409, "ACCOUNT_EXISTS", "That username or email is already in use"));
    }
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await users.findByEmail(req.body.email);
    const matches = user && user.is_active ? await bcrypt.compare(req.body.password, user.password_hash) : false;
    if (!user || !matches) {
      return next(httpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect"));
    }

    delete user.password_hash;
    delete user.is_active;
    return await sendSession(res, user);
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await users.findById(req.user.id);
    if (!user) return next(httpError(404, "USER_NOT_FOUND", "User not found"));
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const currentToken = readRefreshToken(req);
    if (!currentToken) return next(httpError(401, "REFRESH_TOKEN_REQUIRED", "A refresh token is required"));

    const session = await refreshTokens.rotate(currentToken);
    res.cookie(refreshCookieName, session.token, refreshCookieOptions);
    res.set("Cache-Control", "no-store");
    return res.json({ user: session.user, accessToken: createToken(session.user) });
  } catch (error) {
    if (["INVALID_REFRESH_TOKEN", "REFRESH_TOKEN_REUSED"].includes(error.code)) {
      res.clearCookie(refreshCookieName, refreshCookieClearOptions);
      return next(httpError(401, error.code, error.message));
    }
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = readRefreshToken(req);
    if (token) await refreshTokens.revoke(token);
    res.clearCookie(refreshCookieName, refreshCookieClearOptions);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    await refreshTokens.revokeAll(req.user.id);
    res.clearCookie(refreshCookieName, refreshCookieClearOptions);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

export { login, logout, logoutAll, me, refresh, register };
