import type { NextFunction, Request, Response } from "express";
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

/**
 * Requires `Authorization: Bearer <accessToken>` (same for web and mobile).
 * Users who still have to change a temporary password are blocked here.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  req.auth = readToken(req);
  if (req.auth.mustChangePassword) {
    throw ApiError.forbidden("PASSWORD_CHANGE_REQUIRED", "Please set a new password before continuing.");
  }
  next();
}

/** Like requireAuth, but also lets through users who must change their password. */
export function requireAuthAllowPasswordChange(req: Request, _res: Response, next: NextFunction) {
  req.auth = readToken(req);
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
