// src/api/usePlantEmployeeAuth.ts
import { API_KEY, API_URL } from "@/config/env.ts";

export type PlantRoleName =
    | "Plant Admin"
    | "Gate Operator"
    | "Segregation Supervisor"
    | "Stock Manager"
    | "Sales Manager";

export type PlantEmployeeLoginRequest = {
    Username: string;
    Password: string;
};

export type PlantEmployeeLoginResponse = {
    success: boolean;
    message: string;
    data: {
        token: string;
        plantEmployeeId: number;
        plantId: number;
        fullName: string;
        roleName: string;
        roleCode: string;
        ulbId: number;
    };
};

export async function loginPlantEmployee(
    payload: PlantEmployeeLoginRequest,
    opts?: { signal?: AbortSignal },
): Promise<PlantEmployeeLoginResponse> {

    const res = await fetch(`${API_URL}/Auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,   // ✅ ADDED HERE
        },
        body: JSON.stringify(payload),
        signal: opts?.signal,
    });

    const data = (await res.json().catch(() => null)) as PlantEmployeeLoginResponse | null;

    if (!res.ok) {
        const msg = data?.message || `Login failed (${res.status})`;
        throw new Error(msg);
    }

    if (!data) throw new Error("Invalid server response");
    return data;
}
