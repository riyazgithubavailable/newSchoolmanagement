// src/lib/auth.ts
export const TOKEN_KEY = "dwpps_token";
export const PROFILE_KEY = "profileData";

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  const t = getToken();
  return !!t && t.length > 10;
}

export function getProfileData<T = any>(): T | null {
  const raw = sessionStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
