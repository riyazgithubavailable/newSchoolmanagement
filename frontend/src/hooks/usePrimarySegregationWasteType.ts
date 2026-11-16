import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiRequest} from "@/lib/api";

export interface PrimarySegregationWasteType {
    wasteTypeId: number;
    wasteType: string;
    isActive: boolean;
    createdDate: string;
}

export interface PrimarySegregationWasteTypeApiResponse {
    success: boolean;
    data: PrimarySegregationWasteType | PrimarySegregationWasteType[];
    message?: string;
}

interface MutationApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface AddPrimarySegregationWasteTypePayload {
    WasteType: string;
}

export interface UpdatePrimarySegregationWasteTypePayload {
    wasteTypeId?: number;
    WasteType?: string;
    IsActive?: boolean
}

 const fetchPrimarySegregationWasteTypes = async (
    wasteTypeId?: number | string
): Promise<any> => {
    const path = wasteTypeId
        ? `/WasteSegregation/GetWasteType?wasteTypeId=${wasteTypeId}`
        : `/WasteSegregation/GetWasteType`;

    const res = await apiRequest<PrimarySegregationWasteTypeApiResponse>(path, {
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

const addPrimarySegregationWasteType = async (
    payload: AddPrimarySegregationWasteTypePayload
): Promise<MutationApiResponse> => {
    const res = await apiRequest<MutationApiResponse>(
        `/WasteSegregation/AddWasteType`,
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

const updatePrimarySegregationWasteType = async (
    payload: UpdatePrimarySegregationWasteTypePayload
): Promise<MutationApiResponse> => {
    const res = await apiRequest<MutationApiResponse>(
        `/WasteSegregation/UpdateWasteType/${payload.wasteTypeId}`,
        {
            method: "PATCH",
            body: {
                WasteType: payload.WasteType,
                IsActive:payload.IsActive
            },
        }
    );

    if (!res?.success) {
        throw new Error(res?.message || "Failed To Update Waste Type");
    }

    return res;
};

/* Main Hook - Singular Name To Match Existing UI Import */
export const usePrimarySegregationWasteType = (typeId?: number) => {
    return useQuery<PrimarySegregationWasteType[]>({
        queryKey: ["primary-segregation-waste-types",typeId],
        queryFn: () => fetchPrimarySegregationWasteTypes(typeId),
        enabled: true
    });
};

/* By Id Hook */
export const usePrimarySegregationWasteTypeById = (
    wasteTypeId?: number | string
) => {
    return useQuery<PrimarySegregationWasteType[]>({
        queryKey: ["primary-segregation-waste-type", wasteTypeId],
        queryFn: () => fetchPrimarySegregationWasteTypes(wasteTypeId),
        enabled: !!wasteTypeId,
    });
};

/* Optional Alias - In Case Any Other File Uses Plural Name */
export const usePrimarySegregationWasteTypes = usePrimarySegregationWasteType;

export const useAddPrimarySegregationWasteType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addPrimarySegregationWasteType,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["primary-segregation-waste-types"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["primary-segregation-waste-type"],
                }),
            ]);
        },
    });
};

export const useUpdatePrimarySegregationWasteType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePrimarySegregationWasteType,
        onSuccess: async (_data, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["primary-segregation-waste-types"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["primary-segregation-waste-type", variables.wasteTypeId],
                }),
            ]);
        },
    });
};