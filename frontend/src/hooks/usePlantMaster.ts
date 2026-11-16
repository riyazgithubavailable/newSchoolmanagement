import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiRequest} from "@/lib/api";
import {API_KEY} from "@/config/env";

// -----------------------------------
// TYPES
// -----------------------------------
export interface PlantMaster {
    plantId: number;
    ulbId: number;
    ulbName: string | null;
    plantReferenceId: string;
    plantName: string | null;
    plantCode: string | null;
    registrationNumber: string | null;
    plantAddress: string | null;
    latitude: number | null;
    longitude: number | null;
    totalCapacityTPD: number | null;
    operationalDate: string | null;
    ownerType: string | null;
    contactPerson: string | null;
    mobileNo: string | null;
    qrTagStatus: boolean;
    qrTagDate: string | null;
    approvalStatus: number;
    approvalRemarks: string | null;
    isActive: boolean;
    createdDate: string;
}
 
// Optional Alias So UI Code Can Use Either Name
export type PlantMasterItem = PlantMaster;

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

export interface RegisterPlantPayload {
    ULBId: number;
    PlantName: string;
    PlantCode: string;
    RegistrationNumber: string;
    PlantReferenceId: string;
    PlantAddress: string;
    Latitude: number;
    Longitude: number;
    TotalCapacityTPD: number;
    OperationalDate: string;
    OwnerType: string;
    ContactPerson: string;
    MobileNo: string;
}

export interface SetPlantStatusPayload {
    IsActive: boolean;
    Reason?: string;
    StatusChangeDate?: string;
    StatusChangedDate?: string;
}

export interface TagPlantQrPayload {
    AppId: number;
    PlantReferenceId: string;
    UserId: number;
    Latitude: number;
    Longitude: number;
    PlantPlateImgBase64: string;
    PlateImageBase64: string;
}
export interface imageResponse {
    success: boolean;
    data: {
        plantId: number;
        plantPlateImageBase64: string;
        plateImageBase64: string;
        latitude?: number;
        longitude?: number;
        uploadedDate?: string;
    };
    message?: string;
}
// -----------------------------------
// COMMON HEADERS
// -----------------------------------
const defaultHeaders = {
    "x-api-key": API_KEY,
};

// -----------------------------------
// GET ALL PLANTS
// -----------------------------------
export function usePlants(plantId?: number,ulbId?: number) {
    return useQuery({
        queryKey: ["plants", plantId, ulbId],
        queryFn: async () => {
            let url = "/ProcessingPlant/GetPlant";
            const params = new URLSearchParams();
            if(plantId) params.append("plantId", plantId.toString());
            if(ulbId) params.append("ulbId", ulbId.toString());
            if(params.toString()){
                url += `?${params.toString()}`;
            }
            const res = await apiRequest<ApiListResponse<PlantMaster>>(
                url,
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
// GET SINGLE PLANT
// Handles Both Array Response And Object Response
// -----------------------------------
export function usePlant(plantId?: number | null) {
    return useQuery({
        queryKey: ["plant", plantId],
        enabled: !!plantId,
        queryFn: async () => {
            const res = await apiRequest<
                ApiSingleResponse<PlantMaster> | ApiListResponse<PlantMaster>
            >(`/ProcessingPlant/GetPlant?plantId=${plantId}`, {
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
//forImage
export function usePlantImage(plantId?: number | null) {
      console.log("usePlantImage Hook Called", plantId);
    return useQuery({
        queryKey: ["plantImage", plantId],
        enabled: !!plantId,
        queryFn: async () => {
            const res = await apiRequest<imageResponse>(
                `/ProcessingPlant/GetPlantImages/${plantId}`,
                {
                    method: "GET",
                    headers: defaultHeaders,
                }
            );
            return res.data ?? null;
        },
    });
}


// -----------------------------------
// UPDATE PLANT
// endpoint: /ProcessingPlant/RegisterPlant/{plantId}?plantId={plantId}
// -----------------------------------
export function useUpdatePlant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
                               plantId,
                               payload,
                           }: {
            plantId: number;
            payload: RegisterPlantPayload;
        }) => {
            const numericPlantId = Number(plantId);

            if (Number.isNaN(numericPlantId) || numericPlantId <= 0) {
                throw new Error("Invalid Plant Id");
            }

            return await apiRequest<ApiResponse>(
                `/ProcessingPlant/RegisterPlant/${numericPlantId}`,
                {
                    method: "PATCH",
                    body: payload,
                    headers: defaultHeaders,
                }
            );
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: ["plants"]});
            queryClient.invalidateQueries({queryKey: ["plant", variables.plantId]});
        },
    });
}

// -----------------------------------
// SET PLANT STATUS
// -----------------------------------
export function useSetPlantStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
                               plantId,
                               payload,
                           }: {
            plantId: number;
            payload: SetPlantStatusPayload;
        }) => {
            const finalPayload = {
                IsActive: payload.IsActive,
                Reason: payload.Reason ?? "",
                StatusChangeDate:
                    payload.StatusChangeDate ??
                    payload.StatusChangedDate ??
                    new Date().toISOString(),
            };

            return await apiRequest<ApiResponse>(
                `/ProcessingPlant/SetPlantStatus/${plantId}`,
                {
                    method: "PATCH",
                    body: finalPayload,
                    headers: defaultHeaders,
                }
            );
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: ["plants"]});
            queryClient.invalidateQueries({queryKey: ["plant", variables.plantId]});
        },
    });
}

// -----------------------------------
// COMPATIBILITY ALIAS
// -----------------------------------
export const useTogglePlantStatus = useSetPlantStatus;

// -----------------------------------
// TAG QR
// -----------------------------------
export function useTagPlantQr() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: TagPlantQrPayload) => {
            return await apiRequest<ApiResponse>(
                "/ProcessingPlant/tag-qr",
                {
                    method: "POST",
                    body: payload,
                    headers: defaultHeaders,
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["plants"]});
        },
    });
}