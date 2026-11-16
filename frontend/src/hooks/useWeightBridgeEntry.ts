import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface WasteCollection {
    weighBridgeWasteTypeId: number;
    wasteType: string;
    netWeight: number;
}

export interface WeighBridgeWasteCollection {
    weighBridgeWasteTypeId: number;
    wasteType: string;
    netWeight: number;
}

export interface WeighBridgeEntry {
    weighBridgeWasteTypeId: number;
    weighBridgeEntryId: number;
    weighBridgeId: string;
    plantId: number;
    plantName: string;
    plantVehicleId: number;
    vehicleNumber: string;
    grossWeight: number;
    tareWeight: number;
    netWeight: number;
    wasteType: string;
    wasteCollection: WeighBridgeWasteCollection[];
    weighedBy: string;
    weighedTime: string; // ISO Date String
    isOverloaded: boolean;
    isDeleted: boolean;
    divisionId: number;
    districtId: number;
    ulbId: number;
    divisionName: string;
    districtName: string;
    ulbName: string;
}

export interface WeighBridgeAvailableSummary {
    dry: number;
    wet: number;
    mixed: number;
}

export interface WeighBridgeSummary {
    totalNetWeightTon: number;
    totalAvailableWeightTon: number;
    available: WeighBridgeAvailableSummary;
}

// Main API Response Type
export interface WeighBridgeResponse {
    success: boolean;
    data: WeighBridgeEntry[];
    summary: WeighBridgeSummary;
}


export interface GetWeightBridgeEntryParams {
    weighBridgeId?: string;
    entryId?: string | number;
    plantId?: string | number;
    fromDate?: string; // ISO date string
    toDate?: string;   // ISO date string
    divisionId?: string | number;
    districtId?: string | number;
    ulbId?: string | number;
}
export type WasteItem = {
    WeighBridgeWasteTypeId: number;
    GrossWeight: number;
    TareWeight: number;
};

export type AddWeightBridgeEntryPayload = {
    PlantId: number;
    PlantVehicleId: number;
    WasteCollection: WasteItem[];
};

export interface UpdateWeightBridgeEntryPayload {
    WeighBridgeWasteTypeId?: number;
    GrossWeight?: number;
    TareWeight?: number;
}

export interface DeleteWeightBridgeEntryPayload {
    IsDeleted: boolean;
}

// ─── WeighBridge Summary ──────────────────────────────────────────────────────

export interface WeighBridgeSummaryItem {
    wasteType: string;
    totalNetWeightKg: number;
}

export interface WeighBridgeSummaryData {
    totalNetWeightKg: number;
    summary: WeighBridgeSummaryItem[];
}

// ─── Shared ───────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

const WEIGHT_BRIDGE_QUERY_KEY = "weight-bridge-entry";
const WEIGH_BRIDGE_SUMMARY_QUERY_KEY = "weigh-bridge-summary";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// function buildQuery(params?: GetWeightBridgeEntryParams) {
//     if (!params) return "";

//     const searchParams = new URLSearchParams();

//     if (params.weighBridgeId) {
//         searchParams.append("weighBridgeId", String(params.weighBridgeId));
//     }

//     if (params.entryId !== undefined && params.entryId !== null) {
//         searchParams.append("entryId", String(params.entryId));
//     }

//     if (params.plantId !== undefined && params.plantId !== null) {
//         searchParams.append("plantId", String(params.plantId));
//     }

//     const query = searchParams.toString();
//     return query ? `?${query}` : "";
// }

// ─── Weight Bridge Entries ────────────────────────────────────────────────────

export async function getWeightBridgeEntries(
    params?: GetWeightBridgeEntryParams,
) {
    const queryParams = new URLSearchParams({
        plantId: String(params?.plantId ?? 0),
        divisionId: String(params?.divisionId ?? 0),
        districtId: String(params?.districtId ?? 0),
        ulbId: String(params?.ulbId ?? 0),
    });

    const res = await apiRequest<
        ApiResponse<WeighBridgeEntry[]> & {
            summary: {
                totalNetWeightTon: number;
                totalAvailableWeightTon: number;
                available: {
                    dry: number;
                    wet: number;
                    mixed: number;
                };
            };
        }
    >(
        `/WeighBridge/GetWeighBridgeEntry?${queryParams.toString()}`,
        {
            method: "GET",
            headers: {
                ...(params?.fromDate && {
                    fromDate: params.fromDate,
                }),
                ...(params?.toDate && {
                    toDate: params.toDate,
                }),
            },
        },
    );

    return {
        data: Array.isArray(res?.data) ? res.data : [],
        summary: res?.summary,
    };
}
export function useWeightBridgeEntries(params?: GetWeightBridgeEntryParams) {
    return useQuery({
        queryKey: [WEIGHT_BRIDGE_QUERY_KEY, params],
        queryFn: () => getWeightBridgeEntries(params),
    });
}

export async function addWeightBridgeEntry(payload: AddWeightBridgeEntryPayload) {
    const res = await apiRequest<ApiResponse<WeighBridgeResponse>>(
        "/WeighBridge/AddWeighBridgeEntry",
        {
            method: "POST",
            body: payload,
        },
    );
    return res;
}

export function useAddWeightBridgeEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addWeightBridgeEntry,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [WEIGHT_BRIDGE_QUERY_KEY],
            });
        },
        onError: (error) => {
            console.error("Add failed", error);
        },
    });
}

export async function updateWeightBridgeEntry(
    weighBridgeId: string,
    payload: UpdateWeightBridgeEntryPayload,
) {
    const res = await apiRequest<ApiResponse<WeighBridgeResponse>>(
        `/WeighBridge/UpdateWeighBridgeEntry/${weighBridgeId}`,
        {
            method: "PATCH",
            body: (payload),
        },
    );
    return res;
}

export function useUpdateWeightBridgeEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            weighBridgeId,
            payload,
        }: {
            weighBridgeId: string;
            payload: UpdateWeightBridgeEntryPayload;
        }) => updateWeightBridgeEntry(weighBridgeId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [WEIGHT_BRIDGE_QUERY_KEY] });
        },
    });
}

export async function deleteWeightBridgeEntry(
    weighBridgeId: string,
    payload: DeleteWeightBridgeEntryPayload,
) {
    const res = await apiRequest<ApiResponse<WeighBridgeResponse>>(
        `/WeighBridge/SetWeighBridgeEntryStatus/${weighBridgeId}`,
        {
            method: "PATCH",
            body: payload,
        },
    );
    return res;
}

export function useDeleteWeightBridgeEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            weighBridgeId,
            payload,
        }: {
            weighBridgeId: string;
            payload: DeleteWeightBridgeEntryPayload;
        }) => deleteWeightBridgeEntry(weighBridgeId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [WEIGHT_BRIDGE_QUERY_KEY] });
        },
        onError: (error) => {
            console.error("Delete/Restore failed", error);
        },
    });
}

// ─── WeighBridge Summary ──────────────────────────────────────────────────────

export async function getWeighBridgeSummary(): Promise<WeighBridgeSummaryData> {
    const res = await apiRequest<ApiResponse<WeighBridgeSummaryData>>(
        "/WeighBridge/GetWeighBridgeSummary",
        { method: "GET" },
    );
    return res.data;
}

export function useWeighBridgeSummary() {
    return useQuery({
        queryKey: [WEIGH_BRIDGE_SUMMARY_QUERY_KEY],
        queryFn: getWeighBridgeSummary,
        staleTime: 5 * 60 * 1000,
    });
}