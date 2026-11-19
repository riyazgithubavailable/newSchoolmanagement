// Session for the Platform Admin app. Stored in sessionStorage only, so
// closing the browser always signs the platform owner out.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ApiError } from "@/lib/api";
import { SESSION_EXPIRED_EVENT, clearSession, getRefreshToken, getSession, saveSession, updateSession } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { authService } from "@/services/authService";
import { platformApi, type PlatformSession, type PlatformUser } from "./platformApi";

interface Ctx {
  user: PlatformUser | null;
  start: (s: PlatformSession) => void;
  logout: () => Promise<void>;
}

const PlatformAuthContext = createContext<Ctx | undefined>(undefined);

function storedOwner(): PlatformUser | null {
  const s = getSession();
  if (!s) return null;
  if (s.user.role !== "SUPER_ADMIN") {
    clearSession(); // a school session has no business here
    return null;
  }
  return s.user as PlatformUser;
}

export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(storedOwner);

  const start = useCallback((s: PlatformSession) => {
    queryClient.clear();
    saveSession({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }, false);
    setUser(s.user);
  }, []);

  const logout = useCallback(async () => {
    const rt = getRefreshToken();
    clearSession();
    queryClient.clear();
    setUser(null);
    await authService.logout(rt);
  }, []);

  useEffect(() => {
    const onExpired = () => {
      queryClient.clear();
      setUser(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  // confirm the stored session on start-up
  useEffect(() => {
    if (!getSession()) return;
    platformApi
      .me()
      .then((fresh) => {
        const s = getSession();
        if (s) updateSession({ ...s, user: fresh });
        setUser(fresh);
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearSession();
          setUser(null);
        }
      });
  }, []);

  const value = useMemo(() => ({ user, start, logout }), [user, start, logout]);
  return <PlatformAuthContext.Provider value={value}>{children}</PlatformAuthContext.Provider>;
}

export function usePlatformAuth() {
  const ctx = useContext(PlatformAuthContext);
  if (!ctx) throw new Error("usePlatformAuth must be used within PlatformAuthProvider");
  return ctx;
}

/** Signed in AND 2FA on. */
export function RequireOwner() {
  const { user } = usePlatformAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />;
  if (!user.twoFactorEnabled) return <Navigate to="/setup-2fa" replace />;
  return <Outlet />;
}

/** Signed in, 2FA not yet set up. */
export function RequireSetup() {
  const { user } = usePlatformAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.twoFactorEnabled) return <Navigate to="/schools" replace />;
  return <Outlet />;
}
