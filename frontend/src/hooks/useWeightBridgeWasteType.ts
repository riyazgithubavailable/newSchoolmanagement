import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiRequest} from "@/lib/api";
import {API_KEY} from "@/config/env";

export interface WeightBridgeWasteType {
    weighBridgeWasteTypeId: number;
    wasteType: string;
    isActive: boolean;
    createdDate: string;
}

export type WeightBridgeWasteTypeItem = WeightBridgeWasteType;

interface ApiListResponse<T> {
    success: boolean;
    data: T[];
    message?: string;
}

interface ApiSingleResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface AddWeightBridgeWasteTypePayload {
    WasteType: string;
}

export interface UpdateWeightBridgeWasteTypePayload {
    WasteType?: string;
    IsActive?: boolean;
}

const defaultHeaders = {
    "x-api-key": API_KEY,
};

export function useWeightBridgeWasteTypes() {
    return useQuery({
        queryKey: ["weight-bridge-waste-types"],
        queryFn: async () => {
            const res = await apiRequest<ApiListResponse<WeightBridgeWasteType>>(
                "/WeighBridge/GetWasteType",
                {
                    method: "GET",
                    headers: defaultHeaders,
                }
            );

            return res.data ?? [];
        },
    });
}

export function useWeightBridgeWasteType(wasteTypeId?: number | null) {
    return useQuery({
        queryKey: ["weight-bridge-waste-type", wasteTypeId],
        enabled: !!wasteTypeId,
        queryFn: async () => {
            const res = await apiRequest<
                ApiSingleResponse<WeightBridgeWasteType> | ApiListResponse<WeightBridgeWasteType>
            >(`/WeighBridge/GetWasteType?wasteTypeId=${wasteTypeId}`, {
                method: "GET",
                headers: defaultHeaders,
            });

            if (Array.isArray(res.data)) {
                return res.data[0] ?? null;
            }

            return res.data ?? null;
        },
    });
}

export function useAddWeightBridgeWasteType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: AddWeightBridgeWasteTypePayload) => {
            return await apiRequest<ApiResponse>(
                "/WeighBridge/AddWasteType",
                {
                    method: "POST",
                    body: payload,
                    headers: defaultHeaders,
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["weight-bridge-waste-types"]});
        },
    });
}

export function useUpdateWeightBridgeWasteType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
                               wasteTypeId,
                               payload,
                           }: {
            wasteTypeId: number;
            payload: UpdateWeightBridgeWasteTypePayload;
        }) => {
            const numericWasteTypeId = Number(wasteTypeId);

            if (Number.isNaN(numericWasteTypeId) || numericWasteTypeId <= 0) {
                throw new Error("Invalid Waste Type Id");
            }

            return await apiRequest<ApiResponse>(
                `/WeighBridge/UpdateWasteType/${numericWasteTypeId}`,
                {
                    method: "PATCH",
                    body: payload,
                    headers: defaultHeaders,
                }
            );
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: ["weight-bridge-waste-types"]});
            queryClient.invalidateQueries({
                queryKey: ["weight-bridge-waste-type", variables.wasteTypeId],
            });
        },
    });
}