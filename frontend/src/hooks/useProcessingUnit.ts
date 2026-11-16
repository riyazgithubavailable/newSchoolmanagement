import { apiRequest } from "@/lib/api";
import { ProcessingDetailsResponse, ProcessingUnitApiResponse, WasteProcessingImportResponse, WasteSummaryForProcessingImport } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SegregationResult } from "./useSecondarySegregation";
import { residueData, residuePayload, ResidueResponse } from "./usePrimarySegregation";

type processingInputData = {
    processingInputId: number;
    inputMaterialName: string;
    wasteSubTypeId: number;
    isActive: boolean;
    createdDate: string;
}
type processingOutputData = {

    processingOutputId: number;
    outputCategoryId: number;
    processingInputId: number;
    processingTypeId: number;
    processingTypeName: string;
    outputCategoryName: string;
    outputCode: number;
    unitOfMeasure: string;
    isActive: boolean;
    createdDate: string;
}
type processingInput = {
    success: boolean;
    data: processingInputData[] | processingInputData;
}
type processingOutput = {
    success: boolean;
    data: processingOutputData[] | processingOutputData;
}

type addProcessingInputPayload = {
    success: boolean;
    message: string;
    data: {
        processingId: string;
        plantId: number;
        plantName: string;
        batchId: string;
        processingId_serial: number;
        processingTypeId: number;
        processingType: string;
        outputCategoryId: number;
        outputCategory: string;
        quantityOutput: number;
        unitOfMeasure: string;
        totalProcessedQty: number;
        processedBy: string;
        processedDate: string;
        isDeleted: boolean;
        createdAt: string;
        updatedAt: string
    }
}

export interface OutputCategoryItem {
    outputCategoryId: number;
    outputCategoryName: string;
    totalQuantityTon: number;
}

export interface WasteSubTypeItem {
    wasteSubTypeId: number;
    wasteSubTypeName: string;
    totalQuantityTon: number;
    outputCategories: OutputCategoryItem[];
}

export interface WasteTypeSummary {
    wasteTypeId: number;
    wasteTypeName: string;
    subTypes: WasteSubTypeItem[];
}
export type feedDataForProcessing = {
    feedId: string;
    plantId: number;
    plantName: string;
    wasteSubTypeId: number;
    wasteSubType: string;
    processingType: string;
    quantityKg: number;
    fedBy: string;
    fedDate: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string
}
//GetFeedForProcessing
type FeedResponseForProcessing = {
     success: boolean;
    data: feedDataForProcessing[] ;
  available: {
    totalTon: number;
    summary: WasteSummaryForProcessingImport[];
  };
}
type processingType = {
    processingTypeId: number;
    processingTypeName: string;
    description: string;
    isActive: boolean;
    createdDate: string;
}
export function useProcessingUnit(params?: {
    plantId?: number;
    fromDate?: string;
    toDate?: string;
}) {
    return useQuery({
        queryKey: ["processing-unit", params.plantId, params.fromDate, params.toDate],

        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.plantId !== undefined)
                query.append("plantId", String(params.plantId));
            const res = await apiRequest<ProcessingUnitApiResponse>(
                `/WasteProcessing/GetInput${query.toString() ? `?${query.toString()}` : ""
                }`,

                {
                    method: "GET",
                    headers: {
                        fromdate: params.fromDate ?? new Date().toISOString().split("T")[0],
                        todate: params.toDate ?? new Date().toISOString().split("T")[0],
                    }

                }
            );

            return res.data;
        },
    });
}

export function useProcessingSummary(params?: {
    plantId?: number;
    fromDate?: string;
    toDate?: string;
}) {
    return useQuery({
        queryKey: ["processing-summary", params?.plantId, params?.fromDate, params?.toDate],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.plantId !== undefined)
                query.append("plantId", String(params.plantId));

            const res = await apiRequest<{
                success: boolean;
                data: any[];
                processingSummary: {
                    totalQuantityTon: number;
                    summary: WasteTypeSummary[];
                };
            }>(
                `/WasteProcessing/GetProcessing${query.toString() ? `?${query.toString()}` : ""}`,
                {
                    method: "GET",
                    headers: {
                        fromdate: params?.fromDate ?? new Date().toISOString().split("T")[0],
                        todate: params?.toDate ?? new Date().toISOString().split("T")[0],
                    },
                }
            );

            return res.processingSummary ?? null;
        },
    });
}
export function useProcessingUnitDetails(params?: {
    plantId?: number;
    batchId?: string;
    fromDate?: string;
    toDate?: string;
}) {
    return useQuery({
        queryKey: ["processing-unit", params.plantId, params.batchId, params.fromDate, params.toDate],

        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.plantId !== undefined)
                query.append("plantId", String(params.plantId));
            if (params?.batchId) query.append("batchId", params.batchId);
            const res = await apiRequest<ProcessingDetailsResponse>(
                `/WasteProcessing/GetProcessing${query.toString() ? `?${query.toString()}` : ""
                }`,

                {
                    method: "GET",
                    headers: {
                        fromdate: params.fromDate ?? new Date().toISOString().split("T")[0],
                        todate: params.toDate ?? new Date().toISOString().split("T")[0],
                    }

                }
            );

            return res;
        },
    });
}
const fetchProcessingInput = async () => {
    const res = await apiRequest<processingInput>(`/WasteProcessing/GetProcessingInput`, {
        method: "GET",
    });

    if (!res?.success) {
        throw new Error("Failed To Fetch Waste Types");
    }

    if (Array.isArray(res.data)) {
        return res.data;
    }

    return res.data ? [res.data] : [];
};
const fetchProcessingOutput = async (inputId: number, processingTypeId?: number) => {
    const query = new URLSearchParams();
    if (inputId !== undefined) {
        query.append("processingInputId", String(inputId));
    }
    if (processingTypeId !== undefined) {
        query.append("processingTypeId", String(processingTypeId));
    }
    const res = await apiRequest<processingOutput>(`/WasteProcessing/GetProcessingOutput${query.toString() ? `?${query.toString()}` : ""}`, {
        method: "GET",
    });

    if (!res?.success) {
        throw new Error("Failed To Fetch Waste Types");
    }

    if (Array.isArray(res.data)) {
        return res.data;
    }

    return res.data ? [res.data] : [];
};

export function useProcessingType() {
         return useQuery({
            queryKey: ["processing-type"],
            queryFn: async () => {
                const res = await apiRequest<{
                    success: boolean;
                    data: processingType[];
                }>("/WasteProcessing/GetProcessingType", {
                    method: "GET",
                })
    
                return res.data;
            },
         })
}
export function useProcessingOutput( inputId?: number, processingTypeId?: number) {
    return useQuery<processingOutputData[]>({
        queryKey: ["processing-output", inputId, processingTypeId],
        queryFn: () => fetchProcessingOutput(inputId, processingTypeId),
        enabled: true,
        staleTime: 0,
    });
}
export const useProcessingInput = () => {
    return useQuery<processingInputData[]>({
        queryKey: ["processing-input"],
        queryFn: () => fetchProcessingInput(),
    });
};
//Add Batch
export function useAddBatchForProcessing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            PlantId: number;
            WasteSubTypeId: number;
            // ProcessingTypeId: number;
            QuantityKg: number;
        }) => {
            return apiRequest<ProcessingUnitApiResponse>(
                "/WasteProcessing/AddInput",
                { method: "POST", body: payload }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["processing-unit-for-import"] });
        },
    });
}
//Add Processing 
/* ================= ADD ================= */

export function useAddProcessing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            PlantId: number;
            OutputCategoryId: number;
            QuantityOutput: number;
        }) => {
            return apiRequest<addProcessingInputPayload>(
                "/WasteProcessing/AddProcessing",
                {
                    method: "POST",
                    body: payload,
                }
            );
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["processing-unit"],
            });
        },
    });
}


// Add this alongside your existing useProcessingOutput hook

export function useProcessingOutputByInput(processingInputId: number | null) {
    return useQuery({
        queryKey: ["processing-output", processingInputId],
        queryFn: () => fetchProcessingOutput(processingInputId!),
        enabled: !!processingInputId, // ← only fetches when a waste type is selected
        staleTime: 0,
    });
}
//ImportInputForProcessing
export function useProcessingUnitForImport(params?: {
    batchId?: string;
    plantId?: number;
    fromDate?: string;
    toDate?: string;
}) {
    return useQuery<WasteProcessingImportResponse>({
        queryKey: [
            "processing-unit-for-import",
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

            return apiRequest<WasteProcessingImportResponse>(
                `/WasteProcessing/GetInput${query.toString() ? `?${query.toString()}` : ""
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

//processingUnitForFeed
//get feed
export function useProcessingUnitForFeed(params?: {
    plantId?: number;
    fromDate?: string;
    toDate?: string;
}) {
    return useQuery({
        queryKey: ["processing-unit-feed", params?.plantId, params?.fromDate, params?.toDate],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.plantId !== undefined)
                query.append("plantId", String(params.plantId));
            const res = await apiRequest<FeedResponseForProcessing>(`/WasteProcessing/GetFeed?${query.toString() ? `?${query.toString()}` : ""}`, {
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
//AddFeed
export function useAddFeedForProcessing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            PlantId: number;
            WasteSubTypeId: number;
            ProcessingTypeId: number;
            QuantityKg: number;
        }) => {
            return apiRequest<ProcessingUnitApiResponse>(
                "/WasteProcessing/AddFeed",
                { method: "POST", body: payload }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["processing-unit-feed"] });
        },
    });
}
//ProcessingUnitForResidue
export const useProcessingUnitResidue = (params?: {
    plantId?: number;
    fromDate?: string;
    toDate?: string;
}) => {
    const param = new URLSearchParams();
    if (params?.plantId !== undefined) param.append("plantId", String(params.plantId));
    return useQuery({
        queryKey: ["processing-unit-residue"],
        queryFn: async () => {
            const res = await apiRequest<ResidueResponse>(`/WasteProcessing/GetResidue${param.toString() ? `?${param.toString()}` : ""}`, {
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
//AddResidueForProcessing
export const useAddResidueForProcessing = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<residueData, Error, residuePayload>({
        mutationFn: async (payload) => {
            return await apiRequest<residueData>("/WasteProcessing/RecordResidue", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["processing-unit-residue"] });
        }
    })
    return {
        register: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error,
    }

}