import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiRequest} from "@/lib/api";

// -----------------------------
// TYPES
// -----------------------------
export interface PlantVehicle {
    plantVehicleId: number;
    plantId: number;
    ulbId: number;
    plantVehicleTypeId: number;
    vehicleTypeName: string;
    vehicleNumber: string;
    mobileNo?: string;
    rfidTagNo?: string;
    gpsDeviceId?: string;
    ownerName?: string;
    ownerType?: string;
    wardRoute?: string;
    vehicleCapacityTon?: number;
    fuelType?: string;
    vehicleModel?: string;
    chassisNumber?: string;
    address?: string;
    agreementNumber?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    pollutionCertValidTill?: string;
    insuranceValidTill?: string;
    fitnessValidTill?: string;
    rcCopyAttached?: boolean;
    vehiclePhotoAttached?: boolean;

    isActive: boolean;
    createdBy?: number;
    createdDate: string;

    // compatibility aliases for old UI
    capacityInTon?: number;
    chassisNo?: string;

    // old fields are not coming from API now
    driverName?: string;
    driverMobile?: string;
    engineNo?: string;
    remarks?: string;
    rcCopyImageBase64?: string;
    vehiclePhotoBase64?: string;
}

export interface GetPlantVehicleResponse {
    success: boolean;
    data: PlantVehicleApi[];
    message?: string;
}

interface PlantVehicleApi {
    plantVehicleId: number;
    plantId: number;
    ulbId: number;
    plantVehicleTypeId: number;
    vehicleTypeName: string;
    vehicleNumber: string;
    rfidTagNo?: string;
    gpsDeviceId?: string;
    ownerName?: string;
    ownerType?: string;
    wardRoute?: string;
    vehicleCapacityTon?: number;
    fuelType?: string;
    vehicleModel?: string;
    chassisNumber?: string;
    address?: string;
    agreementNumber?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    pollutionCertValidTill?: string;
    insuranceValidTill?: string;
    fitnessValidTill?: string;
    rcCopyAttached?: boolean;
    vehiclePhotoAttached?: boolean;
    isActive: boolean;
    createdBy?: number;
    createdDate: string;
}

export interface RegisterVehiclePayload {
    PlantId?: number;
    ULBId: number;
    PlantVehicleTypeId: number;
    VehicleNumber: string;
    OwnerType?: string;
    WardRoute?: string;
    VehicleCapacityTon?: number;
    FuelType?: string;
    VehicleModel?: string;
    ChassisNumber?: string;
    RFIDTagNo?: string;
    GPSDeviceId?: string;
    OwnerName?: string;
    Address?: string;
    AgreementNumber?: string;
    ContractStartDate?: string;
    ContractEndDate?: string;
    PollutionCertValidTill?: string;
    InsuranceValidTill?: string;
    FitnessValidTill?: string;
    RCCopyAttached?: boolean;
    VehiclePhotoAttached?: boolean;
    RCCopyImageBase64?: string;
    VehiclePhotoBase64?: string;
}

export interface UpdateVehiclePayload {
    PlantVehicleTypeId: number;
    VehicleNumber: string;
    RFIDTagNo?: string;
    GPSDeviceId?: string;
    OwnerName?: string;
    OwnerType?: string;
    WardRoute?: string;
    VehicleCapacityTon?: number;
    FuelType?: string;
    VehicleModel?: string;
    ChassisNumber?: string;
    Address?: string;
    AgreementNumber?: string;
    ContractStartDate?: string;
    ContractEndDate?: string;
    PollutionCertValidTill?: string;
    InsuranceValidTill?: string;
    FitnessValidTill?: string;
    RCCopyAttached?: boolean;
    VehiclePhotoAttached?: boolean;
}

export interface SetVehicleStatusPayload {
    IsActive: boolean;
    Reason?: string;
    StatusChangeDate: string;
}

export interface ApiResponse<T = unknown> {
    success?: boolean;
    message?: string;
    data?: T;
}

// -----------------------------
// GET VEHICLE PHOTOS
// -----------------------------
export interface VehiclePhotos {
    plantVehicleId: number;
    rcCopyImageBase64: string | null;
    vehiclePhotoBase64: string | null;
}

export interface GetVehiclePhotosResponse {
    success: boolean;
    data: VehiclePhotos;
}

export const useVehiclePhotos = (plantVehicleId: number | null) => {
    return useQuery<VehiclePhotos, Error>({
        queryKey: ["vehicle-photos", plantVehicleId],
        queryFn: async () => {
            const res = await apiRequest<GetVehiclePhotosResponse>(
                `/PlantVehicle/GetVehiclePhotos/${plantVehicleId}`
            );
            return res?.data;
        },
        enabled: !!plantVehicleId, // only fetch when ID is available
        staleTime: 1000 * 60 * 5, // cache for 5 mins
    });
};

// -----------------------------
// GET ALL VEHICLES
// -----------------------------
export const usePlantVehicles = (availableOnly?: boolean) => {
    return useQuery<PlantVehicle[], Error>({
        queryKey: ["plant-vehicles", availableOnly],
        queryFn: async () => {
            const url  = availableOnly ? `/PlantVehicle/GetVehicle?availableOnly=${availableOnly}` : "/PlantVehicle/GetVehicle";
            const res = await apiRequest<GetPlantVehicleResponse>(
                url
            );

            return (res?.data ?? []).map((item) => ({
                ...item,

                // compatibility mapping for existing UI usage
                capacityInTon: item.vehicleCapacityTon,
                chassisNo: item.chassisNumber,

                // not present in latest response
                driverName: "",
                driverMobile: "",
                engineNo: "",
                remarks: "",
            }));
        },
        staleTime:0,
    });
};

// -----------------------------
// REGISTER VEHICLE
// -----------------------------
export const useRegisterVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse, Error, RegisterVehiclePayload>({
        mutationFn: async (payload) => {
            return await apiRequest<ApiResponse>("/PlantVehicle/RegisterVehicle", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["plant-vehicles"]});
        },
    });
};

// -----------------------------
// UPDATE VEHICLE
// -----------------------------
export const useUpdateVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse,
        Error,
        { plantVehicleId: number | string } & UpdateVehiclePayload
    >({
        mutationFn: async ({plantVehicleId, ...payload}) => {
            return await apiRequest<ApiResponse>(
                `/PlantVehicle/UpdateVehicle/${plantVehicleId}`,
                {
                    method: "PATCH",
                    body: payload,
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["plant-vehicles"]});
        },
    });
};

// -----------------------------
// SET VEHICLE STATUS
// -----------------------------
export const useSetVehicleStatus = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse,
        Error,
        { plantVehicleId: number | string } & SetVehicleStatusPayload
    >({
        mutationFn: async ({plantVehicleId, ...payload}) => {
            return await apiRequest<ApiResponse>(
                `/PlantVehicle/SetVehicleStatus/${plantVehicleId}`,
                {
                    method: "PATCH",
                    body: payload,
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["plant-vehicles"]});
        },
    });
};