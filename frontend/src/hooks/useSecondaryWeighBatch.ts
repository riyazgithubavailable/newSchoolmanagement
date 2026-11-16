import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommonParams } from "./useVehicleEntry";
import { apiRequest } from "@/lib/api";
import { WeighBatchData, WeighBatchDataForSecondary } from "@/types/types";

export type PayloadData = {
    PlantId: number;
    WasteTypeId: number;
    QuantityKg: number;

}


export const useSecondaryWeighBatch = (params?: CommonParams) => {
    const { plantId, fromDate, toDate } = params || {};

    return useQuery({
        queryKey: ["Secondary-weigh-batch", plantId, fromDate, toDate],
        queryFn: async () => {
            const res = await apiRequest<WeighBatchDataForSecondary>(`/SecondarySegregation/GetInput?plantId=${plantId}`,
                {
                    method: "GET",
                    headers: {
                        ...(fromDate && { "fromDate": fromDate }),
                        ...(toDate && { "toDate": toDate }),
                    },
                }
            );
            return res;
        },
        enabled: true,
        staleTime: 0,
    });
};

// ── Add weigh batch ──────────────────────────────────────────────────────────
export const useAddWeighBatchForSecondary = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<WeighBatchData, Error, PayloadData>({
        mutationFn: async (payload) => {
            return await apiRequest<WeighBatchData>("/SecondarySegregation/AddInput", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["Secondary-weigh-batch"] });
        },
    });

    return {
        register: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error,
    };
};

// ── Complete secondary batch ─────────────────────────────────────────────────
export const useCompleteSecondaryBatch = () => {
    const queryClient = useQueryClient();

        const mutation = useMutation<
            { success: any; message: string; data: any },
            Error,
            string  // batchId
        >({
            mutationFn: async (batchId: string) => {
            return await apiRequest(`/SecondarySegregation/CompleteBatch/${batchId}`, {
                method: "PATCH",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["Secondary-weigh-batch"] });
            queryClient.invalidateQueries({ queryKey: ["secondary-segregation"] });
        },
        onError: (error) => {
            console.error("Complete batch failed:", error);
        },
    });

    return {
        completeBatch: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error,
    };
};



