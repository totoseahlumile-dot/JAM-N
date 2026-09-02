import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import * as users from "../models/user.model.js";
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

const register = async (req, res, next) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await users.create({ ...req.body, passwordHash });
    res.status(201).json({ user, accessToken: createToken(user) });
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
    return res.json({ user, accessToken: createToken(user) });
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

export { register, login, me };
