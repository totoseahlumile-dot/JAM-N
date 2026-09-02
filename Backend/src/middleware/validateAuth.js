import httpError from "../utils/httpError.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_]+$/;

const validateRegistration = (req, res, next) => {
  const { username, email, password, displayName, role = "listener" } = req.body;
  const issues = [];

  if (typeof username !== "string" || username.length < 3 || username.length > 30 || !usernamePattern.test(username)) {
    issues.push("username must be 3-30 characters and contain only letters, numbers, or underscores");
  }
  if (typeof email !== "string" || email.length > 255 || !emailPattern.test(email)) {
    issues.push("email must be a valid email address");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    issues.push("password must be 8-72 characters");
  }
  if (typeof displayName !== "string" || displayName.trim().length < 1 || displayName.trim().length > 80) {
    issues.push("displayName must be 1-80 characters");
  }
  if (!["listener", "artist"].includes(role)) {
    issues.push("role must be listener or artist");
  }

  if (issues.length > 0) {
    const error = httpError(400, "VALIDATION_ERROR", "The request contains invalid fields");
    error.details = issues;
    return next(error);
  }

  req.body = {
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
    displayName: displayName.trim(),
    role
  };
  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || !emailPattern.test(email) || typeof password !== "string" || password.length === 0) {
    return next(httpError(400, "VALIDATION_ERROR", "A valid email and password are required"));
  }
  req.body.email = email.trim().toLowerCase();
  return next();
};

export { validateRegistration, validateLogin };
