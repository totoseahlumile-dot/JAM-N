import express from "express";
import * as authController from "../controllers/auth.controller.js";
import authenticate from "../middleware/authenticate.js";
import { validateRegistration, validateLogin } from "../middleware/validateAuth.js";
import rateLimit from "../middleware/rateLimit.js";

const router = express.Router();

const credentialLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const refreshLimit = rateLimit({ windowMs: 60 * 1000, max: 30 });

router.post("/register", credentialLimit, validateRegistration, authController.register);
router.post("/login", credentialLimit, validateLogin, authController.login);
router.post("/refresh", refreshLimit, authController.refresh);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/me", authenticate, authController.me);

export default router;
