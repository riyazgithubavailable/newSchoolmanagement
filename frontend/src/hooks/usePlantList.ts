import { useCallback, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";

export type PlantItem = {
    plantId: number;
    plantRefId: string;
    plantName: string;
};

type PlantListResponse = {
    success: boolean;
    data: PlantItem[];
};

type State = {
    loading: boolean;
    error: string | null;
    plants: PlantItem[];
};

export function usePlantList({ ulbId }: { ulbId?: number } = {}) {
    const [state, setState] = useState<State>({
        loading: false,
        error: null,
        plants: [],
    });

    const abortRef = useRef<AbortController | null>(null);

    const fetchPlants = useCallback(async () => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        // if (!ulbId) {
        //     setState((p) => ({ ...p, loading: false, error: null }));
        //     return [];
        // }
        setState((p) => ({ ...p, loading: true, error: null }));

        try {
            const url = ulbId
                ? `/PlantEmployee/PlantList?ulbId=${ulbId}`
                : `/PlantEmployee/PlantList`;
            const res = await apiRequest<PlantListResponse>(url);
            setState({
                loading: false,
                error: null,
                plants: res?.data || [],
            });
       
            return res?.data || [];
        } catch (e: any) {
            const msg =
                e?.name === "AbortError"
                    ? "Request cancelled"
                    : e?.message || "Failed to fetch plant list";

            setState((p) => ({ ...p, loading: false, error: msg }));
            throw e;
        }
    }, [ulbId]);

    return {
        ...state,
        fetchPlants,
    };
}