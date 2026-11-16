import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiRequest} from "@/lib/api";

// -----------------------------
// TYPES
// -----------------------------
export interface PlantVehicleType {
    isActive: boolean;
    vehicleTypeId: number;
    vehicleTypeName: string;
    capacityInTon: number;
    
}

interface GetVehicleTypeResponse {
    success?: boolean;
    message?: string;
    data?: PlantVehicleType[];
}

interface ApiResponse<T = unknown> {
    success?: boolean;
    message?: string;
    data?: T;
}

export interface AddVehicleTypePayload {
    VehicleTypeName: string;
    CapacityInTon: number;
}

export interface UpdateVehicleTypePayload {
    VehicleTypeName: string;
    CapacityInTon: number;
}

export interface ToggleVehicleTypeStatusPayload {
    IsActive: boolean;
}

// -----------------------------
// GET VEHICLE TYPES
// -----------------------------
export const useVehicleTypes = () => {
    return useQuery<PlantVehicleType[], Error>({
        queryKey: ["vehicle-types"],
        queryFn: async () => {
            const res = await apiRequest<GetVehicleTypeResponse>(
                "/PlantVehicle/GetVehicleType"
            );
            return res?.data ?? [];
        },
    });
};

// -----------------------------
// ADD VEHICLE TYPE
// -----------------------------
export const useVehicleTypeRegistration = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ApiResponse, Error, AddVehicleTypePayload>({
        mutationFn: async (payload) => {
            return await apiRequest<ApiResponse>("/PlantVehicle/AddVehicleType", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["vehicle-types"]});
        },
    });

    return {
        register: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error,
    };
};

// -----------------------------
// UPDATE VEHICLE TYPE
// -----------------------------
export const useUpdateVehicleType = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse,
        Error,
        {
            vehicleTypeId: number | string;
            VehicleTypeName: string;
            CapacityInTon: number;
        }
    >({
        mutationFn: async ({vehicleTypeId, ...payload}) => {
            return await apiRequest<ApiResponse>(
                `/PlantVehicle/UpdateVehicleType/${vehicleTypeId}`,
                {
                    method: "PATCH",
                    body: payload,
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["vehicle-types"]});
        },
    });
};

// -----------------------------
// TOGGLE VEHICLE TYPE STATUS
// -----------------------------
export const useToggleVehicleTypeStatus = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse,
        Error,
        {
            vehicleTypeId: number | string;
            IsActive: boolean;
        }
    >({
        mutationFn: async ({vehicleTypeId, ...payload}) => {
            return await apiRequest<ApiResponse>(
                `/PlantVehicle/SetVehicleTypeStatus/${vehicleTypeId}`,
                {
                    method: "PATCH",
                    body: payload,
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["vehicle-types"]});
        },
    });
};