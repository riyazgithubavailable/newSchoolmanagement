import type { AccessPayload } from "../modules/auth/tokens.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth — the logged-in user from the access token */
      auth?: AccessPayload;
    }
  }
}

export {};
