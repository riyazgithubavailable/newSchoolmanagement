// src/hooks/usePlantPlates.ts
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiRequest} from "@/lib/api";
import {API_KEY} from "@/config/env";

// -----------------------------------
// TYPES
// -----------------------------------
export interface Division {
    divisionId: number;
    divisionName: string;
}

export interface District {
    districtId: number;
    districtName: string;
}

export interface ULB {
    ulbId: number;
    ulbName: string;
}

export interface ULBWisePlantCount {
    ulbId: number;
    ulbName: string;
    totalPlantCount: number;
    qrTagCount: number;
    approvedCount: number;
}

interface ApiListResponse<T> {
    success: boolean;
    data: T[];
    message?: string;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface AllocatePlantPlatesPayload {
    DivisionId: number;
    DistrictId: number;
    ULBId: number;
    Series: string;
    StartNo: number;
    EndNo: number;
}
type ULBResponse = {
    success: boolean;
    data: {
        ulbId: number;
        ulbName: string;
    };
};

// -----------------------------------
// COMMON HEADERS
// -----------------------------------
const defaultHeaders = {
    "x-api-key": API_KEY,
};

// -----------------------------------
// GET DIVISIONS
// -----------------------------------
export function usePlantDivisions() {
    return useQuery({
        queryKey: ["plant-divisions"],
        queryFn: async () => {
            const res = await apiRequest<ApiListResponse<Division>>(
                "/ProcessingPlant/GetDivisions",
                {
                    method: "GET",
                    headers: defaultHeaders,
                }
            );

            return res.data ?? [];
        },
    });
}

// -----------------------------------
// GET DISTRICTS
// -----------------------------------
export function usePlantDistricts(divisionId?: number | null) {
    return useQuery({
        queryKey: ["plant-districts", divisionId],
        enabled: !!divisionId,
        queryFn: async () => {
            const res = await apiRequest<ApiListResponse<District>>(
                `/ProcessingPlant/GetDistricts?divisionId=${divisionId}`,
                {
                    method: "GET",
                    headers: defaultHeaders,
                }
            );

            return res.data ?? [];
        },
    });
}

// -----------------------------------
// GET ULB LIST
// -----------------------------------
export function usePlantULBList(districtId?: number | null) {
    return useQuery({
        queryKey: ["plant-ulb-list", districtId],
        enabled: !!districtId,
        queryFn: async () => {
            const res = await apiRequest<ApiListResponse<ULB>>(
                `/ProcessingPlant/GetULBList?districtId=${districtId}`,
                {
                    method: "GET",
                    headers: defaultHeaders,
                }
            );

            return res.data ?? [];
        },
    });
}

// -----------------------------------
// GET ULB WISE PLANT COUNTS
// -----------------------------------
export function useULBWisePlantCounts() {
    return useQuery({
        queryKey: ["ulb-wise-plant-counts"],
        queryFn: async () => {
            const res = await apiRequest<ApiListResponse<ULBWisePlantCount>>(
                "/ProcessingPlant/GetULBWisePlantCounts",
                {
                    method: "GET",
                    headers: defaultHeaders,
                }
            );

            return res.data ?? [];
        },
    });
}

// -----------------------------------
// ALLOCATE PLANT PLATES
// -----------------------------------
export function useAllocatePlantPlates() {
    const queryClient = useQueryClient();

    return useMutation({
       mutationFn: async (payload: AllocatePlantPlatesPayload) => {
            const res = await apiRequest<ApiResponse>(
                "/ProcessingPlant/AllocatePlantPlates",
                {
                    method: "POST",
                    body: payload,
                    headers: defaultHeaders,
                }
            );

            if (!res.success) {
                throw new Error(res.message || "Failed To Allocate Plant Plates");
            }

            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["plant-divisions"]});
            queryClient.invalidateQueries({queryKey: ["plant-districts"]});
            queryClient.invalidateQueries({queryKey: ["plant-ulb-list"]});
            queryClient.invalidateQueries({queryKey: ["ulb-wise-plant-counts"]});
        },
    });
}

export function useULBName(ulbId: number | null) {
    return useQuery({
        queryKey: ["ulb-name", ulbId],
        queryFn: async (): Promise<ULBResponse["data"]> => {
            const res = await apiRequest<ULBResponse>(
                `/ProcessingPlant/GetULBName?ulbId=${ulbId}`
            );

            if (!res.success) {
                throw new Error("Failed To Fetch ULB Name");
            }

            return res.data;
        },
        enabled: !!ulbId, // only call when ulbId is available
    });
}