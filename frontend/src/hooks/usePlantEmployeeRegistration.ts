import {useCallback, useRef, useState} from "react";
import {apiRequest} from "@/lib/api";
import {getProfileData} from "@/lib/auth";
import {API_KEY} from "@/config/env.ts";

type PlantListResponse = {
    code: number;
    status: string;
    message: string;
    plantList: { plantId: number; plantRefId: string }[];
};

type ProfileData = {
    plantId?: number;
    PlantId?: number;
};

type RegisterPayload = {
    ULBId:number;
    PlantId?: number; // ✅ allow plant from UI
    RoleId: number;
    FullName: string;
    MobileNo: string;
    Email: string;
    EmployeePhotoBase64:string;
    Username: string;
    Password: string;
};

type State = {
    bootLoading: boolean;
    loading: boolean;
    error: string | null;
    plantId: number;
};

export function usePlantEmployeeRegistration() {
    const [state, setState] = useState<State>({
        bootLoading: false,
        loading: false,
        error: null,
        plantId: 0,
    });

    const abortRef = useRef<AbortController | null>(null);

    // ✅ Resolve plantId from profile (fallback to first plant from API)
    const init = useCallback(async () => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        setState((p) => ({...p, bootLoading: true, error: null}));

        try {
            const profile = getProfileData<ProfileData>() || {};
            const pid = Number(profile.plantId ?? profile.PlantId ?? 0);

            let resolvedPlantId = pid;

            if (!resolvedPlantId || resolvedPlantId === 0) {
                const plantRes = await apiRequest<PlantListResponse>(
                    "/PlantEmployee/PlantList"
                );
                resolvedPlantId = plantRes?.plantList?.[0]?.plantId ?? 0;
            }

            setState((p) => ({
                ...p,
                bootLoading: false,
                plantId: resolvedPlantId,
                error: null,
            }));

            return resolvedPlantId;
        } catch (e: any) {
            const msg = e?.message || "Failed to resolve plantId";
            setState((p) => ({...p, bootLoading: false, error: msg}));
            throw e;
        }
    }, []);

    const register = useCallback(
        async (payload: RegisterPayload) => {
            setState((p) => ({...p, loading: true, error: null}));

            try {
                // ✅ Prefer UI-selected PlantId, else fallback to resolved plantId
                const finalPlantId = Number(payload.PlantId ?? state.plantId ?? 0);
                if (!finalPlantId || finalPlantId === 0) {
                    throw new Error("PlantId not selected/resolved. Please select a plant.");
                }

                const finalPayload = {...payload, PlantId: finalPlantId, "AppId": 3098,};

                const res = await apiRequest("/PlantEmployee/registration", {
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-KEY": API_KEY
                    },
                    method: "POST",
                    body: finalPayload,
                });

                setState((p) => ({...p, loading: false}));
                return res;
            } catch (e: any) {
                const msg = e?.message || "Employee registration failed";
                setState((p) => ({...p, loading: false, error: msg}));
                throw e;
            }
        },
        [state.plantId]
    );

    return {
        ...state,
        init,
        register,
    };
}