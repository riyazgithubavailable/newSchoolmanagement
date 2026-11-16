import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Driver {
    driverId:       number;
    plantVehicleId: number;
    driverName:     string;
    mobileNumber:   string;
    isActive:       boolean;
    createdDate:    string;
    vehicleNumber:  string;
}

export interface DriversResponse {
    driverExists: boolean;
    drivers:      Driver[];
}

interface ApiWrapper<T> {
    success: boolean;
    message: string;
    data:    T;
}

export interface AddDriverPayload {
    PlantVehicleId: number;
    DriverName:     string;
    MobileNumber:   string;
}

export interface UpdateDriverPayload {
    PlantVehicleId?: number;
    DriverName?:     string;
    MobileNumber?:   string;
    IsActive?:       boolean;
}

// ─── Fetch Drivers ────────────────────────────────────────────────────────────

async function fetchDrivers(vehicleNumber?: string): Promise<DriversResponse> {
    const url = vehicleNumber
        ? `/Driver/GetDriver?vehicleNumber=${encodeURIComponent(vehicleNumber)}`
        : `/Driver/GetDriver`;

    const res = await apiRequest<ApiWrapper<DriversResponse>>(url, { method: "GET" });
    return res.data;
}
export function useDrivers(vehicleNumber: string) {
    return useQuery({
        queryKey: ["drivers", vehicleNumber],
        queryFn: () => fetchDrivers(vehicleNumber),
        enabled: true,
        staleTime: 0,
    });
}

// ─── Add Driver ───────────────────────────────────────────────────────────────

async function addDriver(payload: AddDriverPayload): Promise<ApiWrapper<Driver>> {
    return await apiRequest<ApiWrapper<Driver>>("/Driver/AddDriver", {
        method: "POST",
        body:   payload,
    });
}

export function useAddDriver() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addDriver,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["drivers"] });
        },
    });
}

// ─── Update Driver ────────────────────────────────────────────────────────────

async function updateDriver(
    driverId: number,
    payload:  UpdateDriverPayload
): Promise<ApiWrapper<Driver>> {
    return await apiRequest<ApiWrapper<Driver>>(
        `/Driver/UpdateDriver/${driverId}`,
        {
            method: "PATCH",
            body: payload,
        }
    );
}

export function useUpdateDriver() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ driverId, payload }: { driverId: number; payload: UpdateDriverPayload }) =>
            updateDriver(driverId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["drivers"] });
        },
    });
}

export function useToggleDriverStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ driverId, isActive }: { driverId: number; isActive: boolean }) =>
            updateDriver(driverId, { IsActive: isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["drivers"] });
        },
    });
}