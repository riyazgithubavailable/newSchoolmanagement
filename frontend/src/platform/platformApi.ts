// Platform owner API: /api/v1/platform/*

import { apiRequest, apiRequestFull } from "@/lib/api";
import { toAuthUser, type ApiUser } from "@/lib/apiUser";
import type { AuthUser } from "@/types/school";

export interface PlatformUser extends AuthUser {
  twoFactorEnabled: boolean;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface PlatformSession {
  user: PlatformUser;
  accessToken: string;
  refreshToken: string;
}

type ApiPlatformUser = ApiUser & { twoFactorEnabled?: boolean };

const toUser = (u: ApiPlatformUser): PlatformUser => ({ ...toAuthUser(u), twoFactorEnabled: !!u.twoFactorEnabled });
const toSession = (d: { user: ApiPlatformUser; tokens: Tokens }): PlatformSession => ({
  user: toUser(d.user),
  accessToken: d.tokens.accessToken,
  refreshToken: d.tokens.refreshToken,
});

export type LoginStep =
  | { kind: "code"; challengeToken: string }
  | { kind: "session"; session: PlatformSession };

export const platformApi = {
  /** Step 1. Either asks for the 6-digit code, or (first sign-in) returns a setup-only session. */
  async login(email: string, password: string): Promise<LoginStep> {
    const d = await apiRequest<{ twoFactorRequired: boolean; challengeToken?: string; user?: ApiPlatformUser; tokens?: Tokens }>(
      "/platform/auth/login",
      { method: "POST", body: { email, password }, skipAuth: true, headers: { "X-Client": "platform" } },
    );
    return d.twoFactorRequired
      ? { kind: "code", challengeToken: d.challengeToken! }
      : { kind: "session", session: toSession(d as { user: ApiPlatformUser; tokens: Tokens }) };
  },

  /** Step 2. */
  async verifyCode(challengeToken: string, code: string): Promise<PlatformSession> {
    const d = await apiRequest<{ user: ApiPlatformUser; tokens: Tokens }>("/platform/auth/verify-2fa", {
      method: "POST",
      body: { challengeToken, code },
      skipAuth: true,
      headers: { "X-Client": "platform" },
    });
    return toSession(d);
  },

  async me(): Promise<PlatformUser> {
    return toUser((await apiRequest<{ user: ApiPlatformUser }>("/platform/auth/me")).user);
  },

  startSetup: () => apiRequest<{ secret: string; otpauthUrl: string }>("/platform/2fa/setup", { method: "POST" }),

  async enable(code: string): Promise<PlatformSession> {
    return toSession(await apiRequest<{ user: ApiPlatformUser; tokens: Tokens }>("/platform/2fa/enable", { method: "POST", body: { code } }));
  },

  async auditLogs(page = 1, action = "") {
    const qs = new URLSearchParams({ page: String(page), limit: "30", ...(action ? { action } : {}) });
    const res = await apiRequestFull<AuditEntry[]>(`/platform/audit-logs?${qs}`);
    return { items: res.data, meta: res.meta as { page: number; totalPages: number; total: number } };
  },
};

export interface AuditEntry {
  id: string;
  action: string;
  actorEmail: string | null;
  actorRole: string | null;
  schoolId: string | null;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}
