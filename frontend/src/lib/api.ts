// src/lib/api.ts
// Fetch wrapper for the backend (same API the Android app uses).
//  • adds `Authorization: Bearer <token>` and `X-Client: web`
//  • unwraps { success, data } and throws ApiError for { success:false, error }
//  • on 401 TOKEN_EXPIRED refreshes the session ONCE and retries the request

import { API_URL } from "@/config/env";
import { toAuthUser, type ApiUser } from "@/lib/apiUser";
import {
  SESSION_EXPIRED_EVENT,
  clearSession,
  getAccessToken,
  getRefreshToken,
  updateSession,
} from "@/lib/auth";

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

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  /** don't attach the access token / don't try to refresh (login, register...) */
  skipAuth?: boolean;
};

export interface ApiResult<T> {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

async function rawRequest<T>(path: string, opts: ApiOptions): Promise<ApiResult<T>> {
  if (!API_URL) {
    throw new ApiError(0, "NO_API_URL", "API URL is not configured. Set VITE_API_URL in frontend/.env.");
  }
  const token = opts.skipAuth ? null : getAccessToken();

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method || "GET",
      signal: opts.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Client": "web",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your internet connection or try again later.");
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const e = json?.error;
    throw new ApiError(
      res.status,
      e?.code ?? "HTTP_ERROR",
      e?.message ?? `Request failed (${res.status}).`,
      e?.details,
    );
  }
  return { data: json.data as T, message: json.message, meta: json.meta };
}

/* ------------------------------------------------------------------ */
/* Token refresh — only one in flight at a time                         */
/* ------------------------------------------------------------------ */

let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;
      try {
        const { data } = await rawRequest<{ user: ApiUser; tokens: { accessToken: string; refreshToken: string } }>(
          "/auth/refresh",
          { method: "POST", body: { refreshToken }, skipAuth: true },
        );
        updateSession({
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          user: toAuthUser(data.user),
        });
        return true;
      } catch (err) {
        // network blip → keep the session; anything else → it's over
        if (err instanceof ApiError && err.code === "NETWORK_ERROR") return false;
        clearSession();
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        return false;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/** Full result including message/meta (for paginated lists etc.) */
export async function apiRequestFull<T>(path: string, opts: ApiOptions = {}): Promise<ApiResult<T>> {
  try {
    return await rawRequest<T>(path, opts);
  } catch (err) {
    if (!opts.skipAuth && err instanceof ApiError && err.status === 401 && err.code === "TOKEN_EXPIRED") {
      if (await refreshSession()) return rawRequest<T>(path, opts);
    }
    throw err;
  }
}

/** Returns just `data` — what most callers need */
export async function apiRequest<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  return (await apiRequestFull<T>(path, opts)).data;
}
