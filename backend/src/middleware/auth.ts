import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import type { Role } from "../constants/roles.js";
import { verifyAccessToken } from "../modules/auth/tokens.js";
import { ApiError } from "../utils/ApiError.js";

function readToken(req: Request) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("UNAUTHORIZED", "Missing Authorization: Bearer <token> header.");
  }
  return verifyAccessToken(token);
}

/** Pending "first steps" a session must finish before it can do anything else. */
function blockPendingSteps(req: Request, allow: { passwordChange?: boolean; mfaSetup?: boolean }) {
  if (req.auth!.mustChangePassword && !allow.passwordChange) {
    throw ApiError.forbidden("PASSWORD_CHANGE_REQUIRED", "Please set a new password before continuing.");
  }
  if (req.auth!.mfaSetupRequired && !allow.mfaSetup) {
    throw ApiError.forbidden("MFA_SETUP_REQUIRED", "Set up 2-step verification before continuing.");
  }
}

/**
 * Requires `Authorization: Bearer <accessToken>` (same for web and mobile).
 * Sessions that still must change a temporary password or set up 2-step
 * verification are blocked here.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  req.auth = readToken(req);
  blockPendingSteps(req, {});
  next();
}

/** Like requireAuth, but lets through users who must change their password (and see /me). */
export function requireAuthAllowPasswordChange(req: Request, _res: Response, next: NextFunction) {
  req.auth = readToken(req);
  blockPendingSteps(req, { passwordChange: true, mfaSetup: true });
  next();
}

/** Like requireAuth, but lets through a platform owner who hasn't set up 2FA yet. */
export function requireAuthAllowMfaSetup(req: Request, _res: Response, next: NextFunction) {
  req.auth = readToken(req);
  blockPendingSteps(req, { mfaSetup: true });
  next();
}

/** Use after requireAuth. */
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      throw ApiError.forbidden("FORBIDDEN", "Your role is not allowed to do this.");
    }
    next();
  };

/** The current user's school — every school-level query must filter by this. */
export function currentSchoolId(req: Request): string {
  const schoolId = req.auth?.schoolId;
  if (!schoolId) throw ApiError.forbidden("NO_SCHOOL", "This action requires a school account.");
  return schoolId;
}

const normalizeIp = (ip: string) => ip.replace(/^::ffff:/, "");

/** PLATFORM_ALLOWED_IPS in .env → only those IPs reach the platform API. */
export function platformIpAllowlist(req: Request, _res: Response, next: NextFunction) {
  const allowed = env.platform.allowedIps;
  if (allowed.length && !allowed.includes(normalizeIp(req.ip ?? ""))) {
    // looks like a missing route — doesn't reveal that the platform API exists
    throw ApiError.notFound("NOT_FOUND", `Route ${req.method} ${req.originalUrl} not found`);
  }
  next();
}
