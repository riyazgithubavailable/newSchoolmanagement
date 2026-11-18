import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from "./auth.schemas.js";
import { authService, type ClientInfo } from "./auth.service.js";

/** Clients identify themselves with `X-Client: web` or `X-Client: android` */
const clientInfo = (req: Request): ClientInfo => ({
  client: String(req.headers["x-client"] ?? "unknown").slice(0, 30),
  userAgent: String(req.headers["user-agent"] ?? ""),
});

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput, clientInfo(req));
    sendSuccess(res, result, { message: "Login successful." });
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.body.refreshToken, clientInfo(req));
    sendSuccess(res, result);
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, null, { message: "Logged out." });
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.auth!.sub);
    sendSuccess(res, { user });
  },

  async changePassword(req: Request, res: Response) {
    const result = await authService.changePassword(req.auth!.sub, req.body as ChangePasswordInput, clientInfo(req));
    sendSuccess(res, result, { message: "Password changed. Other devices have been signed out." });
  },

  async forgotPassword(req: Request, res: Response) {
    const dev = await authService.forgotPassword(req.body as ForgotPasswordInput);
    sendSuccess(res, dev, {
      message: "If an account exists with these details, a password reset link has been sent to its email.",
    });
  },

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body as ResetPasswordInput);
    sendSuccess(res, null, { message: "Password updated. You can now sign in with your new password." });
  },
};
