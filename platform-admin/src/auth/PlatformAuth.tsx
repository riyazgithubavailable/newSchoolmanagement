// Who is signed in, plus the route guards.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ApiError } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { SESSION_EXPIRED_EVENT, clearSession, getSession, saveSession, type PlatformUser, type Session } from "@/lib/session";
import { platformApi } from "@/api/platformApi";

interface Ctx {
  user: PlatformUser | null;
  start: (s: Session) => void;
  logout: () => Promise<void>;
}

const PlatformAuthContext = createContext<Ctx | undefined>(undefined);

export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(() => getSession()?.user ?? null);

  const start = useCallback((s: Session) => {
    queryClient.clear();
    saveSession(s);
    setUser(s.user);
  }, []);

  const logout = useCallback(async () => {
    const rt = getSession()?.refreshToken;
    clearSession();
    queryClient.clear();
    setUser(null);
    await platformApi.logout(rt);
  }, []);

  useEffect(() => {
    const onExpired = () => {
      queryClient.clear();
      setUser(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  // confirm a stored session on start-up
  useEffect(() => {
    if (!getSession()) return;
    platformApi
      .me()
      .then((fresh) => {
        const s = getSession();
        if (s) saveSession({ ...s, user: fresh });
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

// eslint-disable-next-line react-refresh/only-export-components
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

/** Login screen: signed-in owners go straight in. */
export function PublicOnly() {
  const { user } = usePlatformAuth();
  if (!user) return <Outlet />;
  return <Navigate to={user.twoFactorEnabled ? "/schools" : "/setup-2fa"} replace />;
}
