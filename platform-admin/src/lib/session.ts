// Platform session lives in sessionStorage only: closing the browser always
// signs the platform owner out.

export interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  role: "SUPER_ADMIN";
  twoFactorEnabled: boolean;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: PlatformUser;
}

const KEY = "iosp_session";

export function getSession(): Session | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as Session | null;
    return s && s.accessToken && s.refreshToken && s.user?.role === "SUPER_ADMIN" ? s : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}

/** Fired when the session ends outside React (refresh token rejected). */
export const SESSION_EXPIRED_EVENT = "iosp:session-expired";
