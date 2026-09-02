import express from "express";
import * as authController from "../controllers/auth.controller.js";
import authenticate from "../middleware/authenticate.js";
import { validateRegistration, validateLogin } from "../middleware/validateAuth.js";

const router = express.Router();

router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/me", authenticate, authController.me);

export default router;
