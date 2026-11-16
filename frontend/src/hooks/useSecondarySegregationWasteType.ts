import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiRequest} from "@/lib/api";
import { PrimarySegregationWasteType } from "./usePrimarySegregationWasteType";

export interface SecondarySegregationWasteType {
    wasteSubTypeId: number;
    wasteTypeId: number;
    wasteSubTypeName: string;
    isActive: boolean;
    createdDate: string;
}

interface SecondarySegregationWasteTypeApiResponse {
    success: boolean;
    data: SecondarySegregationWasteType | SecondarySegregationWasteType[];
    message?: string;
}

interface MutationApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface AddSecondarySegregationWasteTypePayload {
    WasteTypeId: number;
    WasteSubTypeName: string;
}

export interface UpdateSecondarySegregationWasteTypePayload {
    WasteTypeId?: number;
    wasteSubTypeId?: number;
    WasteSubTypeName?: string;
    isActive?: boolean;
}
 const fetchSecondarySegregationWasteTypes = async (
    wasteSubTypeId?: number | string
): Promise<SecondarySegregationWasteType[]> => {
    const path = wasteSubTypeId
        ? `/SecondarySegregation/GetWasteSubType?wasteTypeId=${wasteSubTypeId}`
        : `/SecondarySegregation/GetWasteSubType`;

    const res = await apiRequest<SecondarySegregationWasteTypeApiResponse>(path, {
        method: "GET",
    });

    if (!res?.success) {
        throw new Error(res?.message || "Failed To Fetch Waste Types");
    }

    if (Array.isArray(res.data)) {
        return res.data;
    }

    return res.data ? [res.data] : [];
};

const addSecondarySegregationWasteType = async (
    payload: AddSecondarySegregationWasteTypePayload
): Promise<MutationApiResponse> => {
    const res = await apiRequest<MutationApiResponse>(
        `/SecondarySegregation/AddWasteSubType`,
        {
            method: "POST",
            body: payload,
        }
    );

    if (!res?.success) {
        throw new Error(res?.message || "Failed To Add Waste Type");
    }

    return res;
};

const updateSecondarySegregationWasteType = async (
    payload: UpdateSecondarySegregationWasteTypePayload
): Promise<MutationApiResponse> => {
    const res = await apiRequest<MutationApiResponse>(
        `/SecondarySegregation/UpdateWasteSubType/${payload.wasteSubTypeId}`,
        {
            method: "PATCH",
            body: {
                WasteTypeId: payload.WasteTypeId,
                WasteSubTypeName: payload.WasteSubTypeName,
                IsActive: payload.isActive,
            },
        }
    );

    if (!res?.success) {
        throw new Error(res?.message || "Failed To Update Waste Type");
    }

    return res;
};

/* Main Hook - Singular Name To Match Existing UI Import */
export const useSecondarySegregationWasteType = () => {
    return useQuery<SecondarySegregationWasteType[]>({
        queryKey: ["secondary-segregation-waste-types"],
        queryFn: () => fetchSecondarySegregationWasteTypes(),
    });
};

/* By Id Hook */
export const useSecondarySegregationWasteTypeById = (
    wasteTypeId?: number | string
) => {
    return useQuery<SecondarySegregationWasteType[]>({
        queryKey: ["secondary-segregation-waste-type", wasteTypeId],
        queryFn: () => fetchSecondarySegregationWasteTypes(wasteTypeId),
        enabled: !!wasteTypeId,
    });
};

// /* Optional Alias - In Case Any Other File Uses Plural Name */
// export const usePrimarySegregationWasteTypes = usePrimarySegregationWasteType;

export const useAddSecondarySegregationWasteType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addSecondarySegregationWasteType,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["secondary-segregation-waste-types"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["secondary-segregation-waste-type"],
                }),
            ]);
        },
    });
};

export const useUpdateSecondarySegregationWasteType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateSecondarySegregationWasteType,
        onSuccess: async (_data, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["secondary-segregation-waste-types"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["secondary-segregation-waste-type", variables.WasteTypeId],
                }),
            ]);
        },
    });
};