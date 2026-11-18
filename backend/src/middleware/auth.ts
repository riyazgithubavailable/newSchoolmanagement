import type { NextFunction, Request, Response } from "express";
import type { Role } from "../constants/roles.js";
import { verifyAccessToken } from "../modules/auth/tokens.js";
import { ApiError } from "../utils/ApiError.js";

/** Requires `Authorization: Bearer <accessToken>` (same for web and mobile). */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("UNAUTHORIZED", "Missing Authorization: Bearer <token> header.");
  }
  req.auth = verifyAccessToken(token);
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
