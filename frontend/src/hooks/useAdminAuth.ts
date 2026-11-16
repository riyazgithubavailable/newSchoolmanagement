import { API_KEY, API_URL } from "@/config/env.ts";

export type AdminLoginRequest = {
    Username: string;
    Password: string;
};

export type AdminLoginResponse = {
    success: boolean;
    message: string;
    data: {
        token: string;
        adminId: number;
        fullName: string;
        roleName: string;
        roleCode: string;
        // other fields depending on the backend response
    };
};

export async function adminLogin(
    payload: AdminLoginRequest,
    opts?: { signal?: AbortSignal },
): Promise<AdminLoginResponse> {

    const res = await fetch(`${API_URL}/Auth/adminLogin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
            "accept": "application/json"
        },
        body: JSON.stringify(payload),
        signal: opts?.signal,
    });

    const data = (await res.json().catch(() => null)) as AdminLoginResponse | null;

    if (!res.ok) {
        const msg = data?.message || `Admin Login failed (${res.status})`;
        throw new Error(msg);
    }

    if (!data) throw new Error("Invalid server response");
    return data;
}
