// Platform owner sign-in, 2-step verification and audit log: /api/v1/platform/*

import { apiRequest, apiRequestFull, toPlatformUser } from "@/lib/api";
import type { Session } from "@/lib/session";

type ApiUser = Parameters<typeof toPlatformUser>[0];
interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const toSession = (d: { user: ApiUser; tokens: Tokens }): Session => ({
  user: toPlatformUser(d.user),
  accessToken: d.tokens.accessToken,
  refreshToken: d.tokens.refreshToken,
});

export type LoginStep = { kind: "code"; challengeToken: string } | { kind: "session"; session: Session };

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

export const platformApi = {
  /** Step 1. Asks for the 6-digit code, or (first sign-in) returns a setup-only session. */
  async login(email: string, password: string): Promise<LoginStep> {
    const d = await apiRequest<{ twoFactorRequired: boolean; challengeToken?: string; user?: ApiUser; tokens?: Tokens }>(
      "/platform/auth/login",
      { method: "POST", body: { email, password }, skipAuth: true },
    );
    return d.twoFactorRequired
      ? { kind: "code", challengeToken: d.challengeToken! }
      : { kind: "session", session: toSession(d as { user: ApiUser; tokens: Tokens }) };
  },

  /** Step 2. */
  async verifyCode(challengeToken: string, code: string): Promise<Session> {
    return toSession(
      await apiRequest<{ user: ApiUser; tokens: Tokens }>("/platform/auth/verify-2fa", {
        method: "POST",
        body: { challengeToken, code },
        skipAuth: true,
      }),
    );
  },

  async me() {
    return toPlatformUser((await apiRequest<{ user: ApiUser }>("/platform/auth/me")).user);
  },

  startSetup: () => apiRequest<{ secret: string; otpauthUrl: string }>("/platform/2fa/setup", { method: "POST" }),

  async enable(code: string): Promise<Session> {
    return toSession(await apiRequest<{ user: ApiUser; tokens: Tokens }>("/platform/2fa/enable", { method: "POST", body: { code } }));
  },

  /** Revokes the refresh token on the server. Never throws. */
  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    try {
      await apiRequest("/auth/logout", { method: "POST", body: { refreshToken }, skipAuth: true });
    } catch {
      /* already revoked / offline */
    }
  },

  async auditLogs(page = 1, action = "") {
    const qs = new URLSearchParams({ page: String(page), limit: "30", ...(action ? { action } : {}) });
    const res = await apiRequestFull<AuditEntry[]>(`/platform/audit-logs?${qs}`);
    return { items: res.data, meta: res.meta as { page: number; totalPages: number; total: number } };
  },
};
