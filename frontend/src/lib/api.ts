import {API_URL} from "@/config/env";
import {getToken} from "@/lib/auth";

type ApiOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    signal?: AbortSignal;
    headers?: Record<string, string>;
};

export async function apiRequest<T>(
    path: string,
    opts: ApiOptions = {}
): Promise<T> {
    const url = `${API_URL}${path}`;

    const token = getToken();
     
    const res = await fetch(url, {
        method: opts.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...(opts.headers || {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return data as T;
}