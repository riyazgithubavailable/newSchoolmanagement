// src/services/authService.ts
// Real backend calls: POST /auth/login, /auth/register, /auth/logout, GET /auth/me

import { apiRequest } from "@/lib/api";
import { toAuthUser, type ApiUser } from "@/lib/apiUser";
import type { UserRole } from "@/config/roles";
import type { AuthUser } from "@/types/school";

export interface LoginPayload {
  /** omit only for the platform super admin */
  schoolCode?: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterPayload {
  schoolCode: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface ApiTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    const data = await apiRequest<{ user: ApiUser; tokens: ApiTokens }>("/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
    return {
      user: toAuthUser(data.user),
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    };
  },

  /** Creates a PENDING account — the school must approve it before login. */
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const data = await apiRequest<{ user: ApiUser }>("/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
    return toAuthUser(data.user);
  },

  /** Revokes this device's refresh token. Never throws — logout must always succeed locally. */
  async logout(refreshToken: string | null): Promise<void> {
    if (!refreshToken) return;
    try {
      await apiRequest("/auth/logout", { method: "POST", body: { refreshToken }, skipAuth: true });
    } catch {
      /* offline / already revoked — nothing to do */
    }
  },

  async me(): Promise<AuthUser> {
    const data = await apiRequest<{ user: ApiUser }>("/auth/me");
    return toAuthUser(data.user);
  },
};

/* ------------------------------------------------------------------ */
/* Passwords                                                           */
/* ------------------------------------------------------------------ */

export type ChangePasswordResult = LoginResult;

export const passwordService = {
  /** Signs out other devices; returns fresh tokens for this one. */
  async changePassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResult> {
    const data = await apiRequest<{ user: ApiUser; tokens: ApiTokens }>("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
    return {
      user: toAuthUser(data.user),
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    };
  },

  /** Always resolves the same way (doesn't reveal whether the email exists). */
  async forgotPassword(payload: { schoolCode?: string; email: string }): Promise<{ devResetToken?: string }> {
    return apiRequest<{ devResetToken?: string } | null>("/auth/forgot-password", {
      method: "POST",
      body: payload,
      skipAuth: true,
    }).then((d) => d ?? {});
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiRequest("/auth/reset-password", { method: "POST", body: { token, newPassword }, skipAuth: true });
  },
};

/** Same rule as the backend (backend/src/modules/auth/auth.schemas.ts → passwordRule) */
export function passwordProblems(pw: string): string[] {
  const out: string[] = [];
  if (pw.length < 8) out.push("At least 8 characters");
  if (!/[A-Za-z]/.test(pw)) out.push("At least one letter");
  if (!/\d/.test(pw)) out.push("At least one number");
  return out;
}
