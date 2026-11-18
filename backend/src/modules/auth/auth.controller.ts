import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import { authService, type ClientInfo } from "./auth.service.js";

/** Clients identify themselves with `X-Client: web` or `X-Client: android` */
const clientInfo = (req: Request): ClientInfo => ({
  client: String(req.headers["x-client"] ?? "unknown").slice(0, 30),
  userAgent: String(req.headers["user-agent"] ?? ""),
});

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body as RegisterInput);
    sendSuccess(res, { user }, {
      status: 201,
      message: "Account created. You can log in once the school approves your account.",
    });
  },

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
};
