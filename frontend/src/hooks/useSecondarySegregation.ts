import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { fedData, PrimarySegregationFeed, residueData, residuePayload, ResidueResponse } from "./usePrimarySegregation";

type ApiSingleResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export interface SecondarySegregation {
    segregationId: string;
    plantId: number;
    plantName: string;
    wasteSubTypeId: number;
    wasteSubType: string;
    quantityKg: number;
    processedBy: string;
    processedDate: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

/* ─── Summary Types ─── */
export interface AvailableSubType {
    wasteSubType: string;
    availableQty: number;
}

export interface AvailableWasteType {
    wasteTypeId: number;
    subTypes: AvailableSubType[];
}
interface WaitingPileSummaryForSecondary {
    totalTon: number;
    dry: number;
    wet: number;
    hazardous: number;
    bioMedical: number
}
type FedSummaryForSecondary = {
    totalTon: number;
    dry: number;
    wet: number;
    hazardous: number;
    bioMedical: number
}
interface SegregationSummary {
    waitingPile: WaitingPileSummaryForSecondary;
    fed: FedSummaryForSecondary;
    output: OutputSummaryForSecondary;
    inProcessTon: number;
    totalResidueTon: number;
}

type WasteSubTypeResponse = {
    success: boolean;
    data: WasteSubType[];
};


type OutputSummaryForSecondary = {
    totalTon: number;
    summary: WasteTypeSummary[];

}
export interface SegregationResult {
    success: boolean;
    data: SecondarySegregation[];
    summary: SegregationSummary;
    available: AvailableSummaryForSecondary;
}

interface AvailableSummaryForSecondary {
    inProcessTon: number;
}


type FeedResponseForSecondary = {
    success: boolean;
    data: PrimarySegregationFeed[];
    available: {
        totalTon: number;
        dry: number;
        wet: number;
        hazardous: number;
        bioMedical: number
    }
}


type PayloadDataForSecondaryFeed = {
    PlantId: number;
    WasteTypeId: number;
    QuantityKg: number;
}
/* ================= GET ================= */
export interface WasteSubType {
    wasteSubTypeId: number;
    wasteSubTypeName: string;
    totalQuantityTon: number;
}

export interface WasteSubType {
    wasteSubTypeId: number;
    wasteSubTypeName: string;
    totalQuantityTon: number;
}

export interface WasteTypeSummary {
    wasteTypeId: number;
    wasteTypeName: string;
    totalQuantityTon: number;
    subTypes: WasteSubType[];
}

type outputDataForSecondary = {
    success: boolean;
    message: string;
    data: SecondarySegregation
}

type payLoadDataForSecondary = {
    PlantId: number;
    WasteSubTypeId: number;
    QuantityKg: number
} 


export interface WasteCategory {
    totalTon: number;
    dry: number;
    wet: number;
    hazardous: number;
    bioMedical: number;
}

export interface OutputSummary {
    totalTon: number;
    summary: WasteTypeSummary[];
}



export interface AvailableWaste {
    inProcessTon: number;
}

export interface SegregationRecord {
    segregationId: string;
    plantId: number;
    plantName: string;
    wasteSubTypeId: number;
    wasteSubType: string;
    quantityKg: number;
    processedBy: string;
    processedDate: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SegregationResult {
    success: boolean;
    data: SegregationRecord[];
    summary: SegregationSummary;
    available: AvailableWaste;
}

/* ================= GET ================= */


export function useSecondarySegregation(params?: {
    batchId?: string;
    plantId?: number;
    fromDate?: string;
    toDate?: string;
}) {
    return useQuery<SegregationResult>({
        queryKey: [
            "secondary-segregation",
            params?.batchId,
            params?.plantId,
            params?.fromDate,
            params?.toDate,
        ],

        queryFn: async () => {
            const query = new URLSearchParams();

            if (params?.batchId) {
                query.append("batchId", params.batchId);
            }

            if (params?.plantId !== undefined) {
                query.append("plantId", String(params.plantId));
            }

            const fromDate =
                params?.fromDate ?? new Date().toISOString().split("T")[0];

            const toDate = params?.toDate ?? new Date().toISOString().split("T")[0];

            return apiRequest<SegregationResult>(
                `/SecondarySegregation/GetSegregation${query.toString() ? `?${query.toString()}` : ""
                }`,
                {
                    method: "GET",
                    headers: {
                        fromdate: fromDate,
                        todate: toDate,
                    },
                }
            );
        },
    });
}


/* ================= ADD ================= */

export function useAddSecondarySegregation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            PlantId: number;
            BatchId: string;
            WasteSubTypeId: number;
            QuantityKg: number;
        }) => {
            return apiRequest<ApiSingleResponse<SecondarySegregation>>(
                "/SecondarySegregation/AddSegregation",
                { method: "POST", body: payload }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["secondary-segregation"] });
        },
    });
}

/* ================= UPDATE ================= */

export function useUpdateSecondarySegregation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            segregationId,
            data,
        }: {
            segregationId: string;
            data: { WasteSubTypeId: number; QuantityKg: number };
        }) => {
            return apiRequest<ApiSingleResponse<SecondarySegregation>>(
                `/SecondarySegregation/UpdateSegregation/${segregationId}`,
                { method: "PATCH", body: data }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["secondary-segregation"] });
        },
    });
}

/* ================= DELETE / RESTORE ================= */

export function useDeleteSecondarySegregation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            segregationId,
            isDeleted,
        }: {
            segregationId: string;
            isDeleted: boolean;
        }) => {
            return apiRequest<ApiSingleResponse<SecondarySegregation>>(
                `/SecondarySegregation/SetSegregationStatus/${segregationId}`,
                { method: "PATCH", body: { IsDeleted: isDeleted } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["secondary-segregation"] });
        },
        onError: (error) => {
            console.error("Delete/Restore failed", error);
        },
    });
}

// ── Get waste sub types ─────────────────────────────────────────────
export const useWasteSubTypes = (
    wasteTypeId?: number,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ["waste-sub-types", wasteTypeId],
        queryFn: async () => {
            const res = await apiRequest<WasteSubTypeResponse>(
                `/SecondarySegregation/GetWasteSubType?wasteTypeId=${wasteTypeId}`,
                {
                    method: "GET",
                }
            );

            return res.data || [];
        },
        enabled: enabled && !!wasteTypeId,
        staleTime: 1000 * 60 * 5, // 5 min cache
    });
};
//SecondFeed
//get feed
export function useSecondarySegregationFeed(params?: {
    plantId?: number;
    fromDate?: string;
    toDate?: string;
}) {
    return useQuery({
        queryKey: ["secondary-segregation-feed", params?.plantId, params?.fromDate, params?.toDate],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.plantId !== undefined)
                query.append("plantId", String(params.plantId));
            const res = await apiRequest<FeedResponseForSecondary>(`/SecondarySegregation/GetFeed${query.toString() ? `?${query.toString()}` : ""}`, {
                method: "GET",
                headers: {
                    fromdate: params.fromDate,
                    todate: params.toDate
                },
            })
            return res
        }
    })
}
//addFeedBatch 
export const useAddFeedForSecondary = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<fedData, Error, PayloadDataForSecondaryFeed>({
        mutationFn: async (payload) => {
            return await apiRequest<fedData>("/SecondarySegregation/AddFeed", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["secondary-segregation-feed"] });
        }
    })
    return {
        register: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error,
    }

}
//get Residue 
export const useSecondarySegregationResidue = (params?: {
    plantId?: number;
    fromDate?: string;
    toDate?: string;
}) => {
    const param = new URLSearchParams();
    if (params?.plantId !== undefined) param.append("plantId", String(params.plantId));
    return useQuery({
        queryKey: ["secondary-segregation-residue"],
        queryFn: async () => {
            const res = await apiRequest<ResidueResponse>(`/SecondarySegregation/GetResidue${param.toString() ? `?${param.toString()}` : ""}`, {
                method: "GET",
                headers: {
                    fromdate: params.fromDate,
                    todate: params.toDate
                },
            })
            return res
        }
    })
}
//addResidue 
export const useAddResidueForSecondary = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<residueData, Error, residuePayload>({
        mutationFn: async (payload) => {
            return await apiRequest<residueData>("/SecondarySegregation/RecordResidue", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["secondary-segregation-residue"] });
        }
    })
    return {
        register: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error,
    }

}
//addOutputSecondary
//addOutputPrimary 
export const useAddOutputForSecondary = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<outputDataForSecondary, Error, payLoadDataForSecondary>({
        mutationFn: async (payload) => {
            return await apiRequest<outputDataForSecondary>("/SecondarySegregation/AddSegregation", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["secondary-segregation"] });
        }
    })
    return {
        register: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error,
    }

}