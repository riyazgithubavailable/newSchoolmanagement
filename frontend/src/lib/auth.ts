// src/lib/auth.ts
// Session persistence. "Remember me" → localStorage (survives browser restart),
// otherwise sessionStorage (cleared when the tab closes).

import { isUserRole } from "@/config/roles";
import type { AuthUser } from "@/types/school";

const ACCESS_KEY = "ios_access_token";
const REFRESH_KEY = "ios_refresh_token";
const USER_KEY = "ios_user";
const ALL_KEYS = [ACCESS_KEY, REFRESH_KEY, USER_KEY];

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const stores = () => [sessionStorage, localStorage];

/** the storage that currently holds the session (so refresh writes back to the same place) */
function activeStore(): Storage | null {
  return stores().find((s) => s.getItem(ACCESS_KEY)) ?? null;
}

export function getSession(): StoredSession | null {
  const store = activeStore();
  if (!store) return null;
  const accessToken = store.getItem(ACCESS_KEY);
  const refreshToken = store.getItem(REFRESH_KEY);
  try {
    const user = JSON.parse(store.getItem(USER_KEY) ?? "null") as AuthUser | null;
    if (accessToken && refreshToken && user && isUserRole(user.role)) {
      return { accessToken, refreshToken, user };
    }
  } catch {
    /* corrupted entry */
  }
  return null;
}

export const getAccessToken = () => activeStore()?.getItem(ACCESS_KEY) ?? null;
export const getRefreshToken = () => activeStore()?.getItem(REFRESH_KEY) ?? null;

export function saveSession(session: StoredSession, remember: boolean) {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(ACCESS_KEY, session.accessToken);
  store.setItem(REFRESH_KEY, session.refreshToken);
  store.setItem(USER_KEY, JSON.stringify(session.user));
}

/** after /auth/refresh — keep using the same storage */
export function updateSession(session: StoredSession) {
  const store = activeStore() ?? sessionStorage;
  store.setItem(ACCESS_KEY, session.accessToken);
  store.setItem(REFRESH_KEY, session.refreshToken);
  store.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  for (const s of stores()) ALL_KEYS.forEach((k) => s.removeItem(k));
  // keys used by the earlier mock build
  for (const s of stores()) ["ios_token"].forEach((k) => s.removeItem(k));
}

/** Fired when the session ends outside React (e.g. refresh token rejected) */
export const SESSION_EXPIRED_EVENT = "ios:session-expired";
