import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiRequest} from "@/lib/api";

export interface PlantEmployee {
    plantEmployeeId: number;
    profilePhotoBase64: string;
    plantId: number;
    roleId: number;
    roleName: string;
    roleCode: string;
    fullName: string;
    mobileNo: string;
    email: string;
    username: string;
    isActive: boolean;
    createdDate: string;
}

interface PlantEmployeeApiResponse {
    success: boolean;
    data: PlantEmployee | PlantEmployee[];
    message?: string;
}

interface MutationApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface UpdatePlantEmployeePayload {
    plantEmployeeId: number;
    FullName: string;
    MobileNo: string;
    Email: string;
    RoleId: number;
}

export interface TogglePlantEmployeeStatusPayload {
    plantEmployeeId: number;
    IsActive: boolean;
    Reason?: string;
    StatusChangedDate: string;
}

export const fetchPlantEmployees = async (
    plantEmployeeId?: number | string
): Promise<PlantEmployee[]> => {
    const path = plantEmployeeId
        ? `/PlantEmployee/GetEmployee/?plantEmployeeId=${plantEmployeeId}`
        : `/PlantEmployee/GetEmployee/`;

    const res = await apiRequest<PlantEmployeeApiResponse>(path);

    if (!res?.success) {
        throw new Error(res?.message || "Failed To Fetch Plant Employees");
    }

    if (Array.isArray(res.data)) {
        return res.data;
    }

    return res.data ? [res.data] : [];
};

const updatePlantEmployee = async (
    payload: UpdatePlantEmployeePayload
): Promise<MutationApiResponse> => {
    const {plantEmployeeId, ...body} = payload;

    const res = await apiRequest<MutationApiResponse>(
        `/PlantEmployee/UpdateEmployee/${plantEmployeeId}`,
        {
            method: "PATCH",
            body,
        }
    );

    if (!res?.success) {
        throw new Error(res?.message || "Failed To Update Employee");
    }

    return res;
};

const togglePlantEmployeeStatus = async (
    payload: TogglePlantEmployeeStatusPayload
): Promise<MutationApiResponse> => {
    const {plantEmployeeId, IsActive, Reason, StatusChangedDate} = payload;

    const body: {
        IsActive: boolean;
        Reason?: string;
        StatusChangedDate: string;
    } = {
        IsActive,
        StatusChangedDate,
    };

    if (IsActive) {
        body.Reason = "Employee Reactivated";
    } else if (Reason?.trim()) {
        body.Reason = Reason.trim();
    }

    const res = await apiRequest<MutationApiResponse>(
        `/PlantEmployee/DeactivateEmployee/${plantEmployeeId}`,
        {
            method: "PATCH",
            body,
        }
    );

    if (!res?.success) {
        throw new Error(
            res?.message ||
            `Failed To ${IsActive ? "Activate" : "Deactivate"} Employee`
        );
    }

    return res;
};

export const usePlantEmployees = () => {
    return useQuery<PlantEmployee[]>({
        queryKey: ["plant-employees"],
        queryFn: () => fetchPlantEmployees(),
    });
};

export const usePlantEmployeeById = (plantEmployeeId?: number | string) => {
    return useQuery<PlantEmployee[]>({
        queryKey: ["plant-employee", plantEmployeeId],
        queryFn: () => fetchPlantEmployees(plantEmployeeId),
        enabled: !!plantEmployeeId,
    });
};

export const useUpdatePlantEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePlantEmployee,
        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ["plant-employees"]}),
                queryClient.invalidateQueries({
                    queryKey: ["plant-employee", variables.plantEmployeeId],
                }),
            ]);
        },
    });
};

export const useTogglePlantEmployeeStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: togglePlantEmployeeStatus,
        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ["plant-employees"]}),
                queryClient.invalidateQueries({
                    queryKey: ["plant-employee", variables.plantEmployeeId],
                }),
            ]);
        },
    });
};