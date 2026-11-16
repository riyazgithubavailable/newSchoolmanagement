import {useCallback, useRef, useState} from "react";
import {apiRequest} from "@/lib/api";
import {API_KEY} from "@/config/env.ts";

export type RoleItem = {
    roleId: number;
    roleName: string;
    roleCode: string;
};

type RoleListResponse = {
    success: boolean;
    data: RoleItem[];
};

type State = {
    loading: boolean;
    error: string | null;
    roles: RoleItem[];
};

export function useRoleTypeList() {
    const [state, setState] = useState<State>({
        loading: false,
        error: null,
        roles: [],
    });

    const abortRef = useRef<AbortController | null>(null);

    const fetchRoles = useCallback(async () => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        setState((p) => ({...p, loading: true, error: null}));

        try {
            const res = await apiRequest<RoleListResponse>(
                "/PlantEmployee/RoleTypeList",{
                    method: "GET",
                    headers:{
                        Accept: "application/json",
                        "X-API-KEY": API_KEY,
                    }
                }
            );
      
            setState({
                loading: false,
                error: null,
                roles: res?.data || [],
            });

            return res?.data || [];
        } catch (e: any) {
            const msg =
                e?.name === "AbortError"
                    ? "Request cancelled"
                    : e?.message || "Failed to fetch role list";

            setState((p) => ({...p, loading: false, error: msg}));
            throw e;
        }
    }, []);

    return {
        ...state,
        fetchRoles,
    };
}