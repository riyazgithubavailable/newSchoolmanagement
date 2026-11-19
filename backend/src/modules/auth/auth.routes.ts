import { Router } from "express";
import { requireAuthAllowPasswordChange } from "../../middleware/auth.js";
import { forgotPasswordLimiter, loginLimiter } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import { authController } from "./auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
} from "./auth.schemas.js";

// Express 5 forwards errors from async handlers to errorHandler automatically.
export const authRouter = Router();

authRouter.post("/login", loginLimiter, validate(loginSchema), authController.login);
authRouter.post("/refresh", validate(refreshSchema), authController.refresh);
authRouter.post("/logout", validate(refreshSchema), authController.logout);

// reachable even while a temporary password must be changed
authRouter.get("/me", requireAuthAllowPasswordChange, authController.me);
authRouter.post(
  "/change-password",
  requireAuthAllowPasswordChange,
  validate(changePasswordSchema),
  authController.changePassword,
);

authRouter.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", forgotPasswordLimiter, validate(resetPasswordSchema), authController.resetPassword);
