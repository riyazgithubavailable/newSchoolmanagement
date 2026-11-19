// Fetch wrapper for the InstituteOS backend.
//  • adds `Authorization: Bearer <token>` and `X-Client: platform`
//  • unwraps { success, data } and throws ApiError for { success:false, error }
//  • on 401 TOKEN_EXPIRED refreshes the session ONCE and retries

import { SESSION_EXPIRED_EVENT, clearSession, getSession, saveSession, type PlatformUser } from "./session";

export const API_URL = (import.meta.env.VITE_API_URL ?? "").toString().replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** don't send the access token / don't try to refresh */
  skipAuth?: boolean;
};

export interface ApiResult<T> {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

/** Backend user → platform user */
export const toPlatformUser = (u: { id: string; fullName: string; email: string; twoFactorEnabled?: boolean }): PlatformUser => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  role: "SUPER_ADMIN",
  twoFactorEnabled: !!u.twoFactorEnabled,
});

async function raw<T>(path: string, opts: Options): Promise<ApiResult<T>> {
  if (!API_URL) throw new ApiError(0, "NO_API_URL", "API URL is not configured. Set VITE_API_URL in platform-admin/.env.");
  const token = opts.skipAuth ? null : getSession()?.accessToken;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      signal: opts.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Client": "platform",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection and try again.");
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const e = json?.error;
    throw new ApiError(res.status, e?.code ?? "HTTP_ERROR", e?.message ?? `Request failed (${res.status}).`, e?.details);
  }
  return { data: json.data as T, message: json.message, meta: json.meta };
}

let refreshing: Promise<boolean> | null = null;

function refresh(): Promise<boolean> {
  refreshing ??= (async () => {
    const s = getSession();
    if (!s) return false;
    try {
      const { data } = await raw<{ user: Parameters<typeof toPlatformUser>[0]; tokens: { accessToken: string; refreshToken: string } }>(
        "/auth/refresh",
        { method: "POST", body: { refreshToken: s.refreshToken }, skipAuth: true },
      );
      saveSession({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken, user: toPlatformUser(data.user) });
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") return false;
      clearSession();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function apiRequestFull<T>(path: string, opts: Options = {}): Promise<ApiResult<T>> {
  try {
    return await raw<T>(path, opts);
  } catch (err) {
    if (!opts.skipAuth && err instanceof ApiError && err.status === 401 && err.code === "TOKEN_EXPIRED" && (await refresh())) {
      return raw<T>(path, opts);
    }
    throw err;
  }
}

export async function apiRequest<T>(path: string, opts: Options = {}): Promise<T> {
  return (await apiRequestFull<T>(path, opts)).data;
}
