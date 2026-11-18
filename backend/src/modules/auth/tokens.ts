import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { Role } from "../../constants/roles.js";
import { ApiError } from "../../utils/ApiError.js";

/** What every access token carries — enough to authorize without a DB hit */
export interface AccessPayload {
  sub: string; // user id
  role: Role;
  schoolId: string | null;
}

interface RefreshPayload {
  sub: string;
  jti: string;
}

const ISSUER = "instituteos-api";

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as SignOptions["expiresIn"],
    issuer: ISSUER,
    audience: "access",
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret, { issuer: ISSUER, audience: "access" });
    return decoded as AccessPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // clients should call /auth/refresh when they see this code
      throw ApiError.unauthorized("TOKEN_EXPIRED", "Access token expired.");
    }
    throw ApiError.unauthorized("INVALID_TOKEN", "Invalid access token.");
  }
}

export function signRefreshToken(userId: string): { token: string; expiresAt: Date } {
  const payload: RefreshPayload = { sub: userId, jti: crypto.randomUUID() };
  const token = jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as SignOptions["expiresIn"],
    issuer: ISSUER,
    audience: "refresh",
  });
  const { exp } = jwt.decode(token) as { exp: number };
  return { token, expiresAt: new Date(exp * 1000) };
}

export function verifyRefreshToken(token: string): RefreshPayload {
  try {
    return jwt.verify(token, env.jwt.refreshSecret, { issuer: ISSUER, audience: "refresh" }) as RefreshPayload;
  } catch {
    throw ApiError.unauthorized("INVALID_REFRESH_TOKEN", "Session expired. Please log in again.");
  }
}

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

/** seconds until the access token expires — sent to clients so they can refresh early */
export function accessTokenTtlSeconds(token: string): number {
  const { exp, iat } = jwt.decode(token) as { exp: number; iat: number };
  return exp - iat;
}
