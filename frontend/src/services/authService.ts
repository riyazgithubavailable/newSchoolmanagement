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
