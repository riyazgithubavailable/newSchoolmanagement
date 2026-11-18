import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import { authController } from "./auth.controller.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas.js";

// Express 5 forwards errors from async handlers to errorHandler automatically.
export const authRouter = Router();

authRouter.post("/register", registerLimiter, validate(registerSchema), authController.register);
authRouter.post("/login", loginLimiter, validate(loginSchema), authController.login);
authRouter.post("/refresh", validate(refreshSchema), authController.refresh);
authRouter.post("/logout", validate(refreshSchema), authController.logout);
authRouter.get("/me", requireAuth, authController.me);
