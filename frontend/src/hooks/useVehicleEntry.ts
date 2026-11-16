import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

// ================= TYPES =================

export interface VehicleEntry {
    entryId: string;
    plantVehicleId: number;
    plantId: number;
    vehicleNumber: string;
    vehicleTypeName: string;
    driverName: string;
    mobileNo: string;
    inTime: string;
    outTime: string | null;
    entryBy: string;
    exitBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface VehicleEntryPhotos {
    entryId: string;
    entryPhotoBase64: string | null;
    exitPhotoBase64: string | null;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export type CommonParams = {
    plantId?: number;
    fromDate?: string;
    toDate?: string;
};

// ================= GET ALL ENTRIES =================

export const useVehicleEntry = (params?: CommonParams) => {
    const { plantId, fromDate, toDate } = params || {};

    return useQuery({
        queryKey: ["vehicle-entry", plantId, fromDate, toDate],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (plantId != null) query.append("plantId", String(plantId));
            if (fromDate) query.append("fromDate", fromDate);
            if (toDate) query.append("toDate", toDate);

            const url = `/PlantVehicle/GetVehicleEntry?${query.toString()}`;
            const res = await apiRequest<ApiResponse<VehicleEntry[]>>(url, { method: "GET",
             headers: {
                 ...(fromDate && { "fromDate": fromDate }),
                 ...(toDate && { "toDate": toDate }),
             }
             });
            return res.data || [];
        },
        enabled: true,
        staleTime:0,
    });
};

// ================= GET ENTRY/EXIT PHOTOS =================
// Called only when the details modal is opened for a specific entry.
// Fetches both entryPhotoBase64 and exitPhotoBase64 from the dedicated endpoint.

export const useVehicleEntryPhotos = (entryId: string | null) => {
    return useQuery({
        queryKey: ["vehicle-entry-photos", entryId],
        queryFn: async () => {
            const res = await apiRequest<ApiResponse<VehicleEntryPhotos>>(
                `/PlantVehicle/GetVehicleEntryExitPhotos/${entryId}`,
                { method: "GET" }
            );
            return res.data;
        },
        enabled: !!entryId,
        staleTime: 1000 * 60 * 5,
    });
};

// ================= CREATE ENTRY =================

export const useCreateVehicleEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            DriverId: number;
            PlantVehicleId: number;
            PlantId: number;
            DriverName: string;
            MobileNo: string;
            EntryPhotoBase64?: string;
        }) => {
            return apiRequest("/PlantVehicle/VehicleEntry", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-entry"] });
        },
    });
};

// ================= EXIT ENTRY =================

export const useVehicleExit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            entryId,
            ExitPhotoBase64,
        }: {
            entryId: string;
            ExitPhotoBase64?: string;
        }) => {
            return apiRequest(`/PlantVehicle/VehicleExit/${entryId}`, {
                method: "PATCH",
                body: { ExitPhotoBase64 },
            });
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-entry"] });
            // Invalidate photo cache so exit photo loads fresh next time modal opens
            queryClient.invalidateQueries({
                queryKey: ["vehicle-entry-photos", variables.entryId],
            });
        },
    });
};