import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/lib/api";
import {
  SESSION_EXPIRED_EVENT,
  clearSession,
  getRefreshToken,
  getSession,
  saveSession,
  updateSession,
} from "@/lib/auth";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/authService";
import type { AuthUser } from "@/types/school";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload, remember: boolean) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getSession()?.user ?? null);

  const endSession = useCallback(() => {
    clearSession();
    queryClient.clear();
    setUser(null);
  }, []);

  const login = useCallback(async (payload: LoginPayload, remember: boolean) => {
    const res = await authService.login(payload);
    queryClient.clear();
    saveSession({ accessToken: res.accessToken, refreshToken: res.refreshToken, user: res.user }, remember);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback((payload: RegisterPayload) => authService.register(payload), []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    endSession(); // log out locally first so the UI reacts instantly
    await authService.logout(refreshToken);
  }, [endSession]);

  // refresh token rejected inside lib/api.ts → back to login
  useEffect(() => {
    const onExpired = () => {
      queryClient.clear();
      setUser(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  // On app start, confirm the stored session is still valid (account may have
  // been disabled, school suspended...). Network errors keep the session.
  useEffect(() => {
    if (!getSession()) return;
    let cancelled = false;
    authService
      .me()
      .then((fresh) => {
        if (cancelled) return;
        const session = getSession();
        if (session) updateSession({ ...session, user: fresh });
        setUser(fresh);
      })
      .catch((err) => {
        if (!cancelled && err instanceof ApiError && (err.status === 401 || err.status === 403)) endSession();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated: !!user, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
