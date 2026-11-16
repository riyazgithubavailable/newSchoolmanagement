import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Admin {
    adminId: number;
    roleId: number;
    roleName: string;
    roleCode: string;
    fullName: string;
    username: string;
    mobileNo: string;
    email: string;
    divisionId: number | null;
    districtId: number | null;
    ulbId: number | null;
    isActive: boolean;
    createdDate: string;
    statusReason: string | null;
    statusChangeDate: string | null;
}

export interface GetAdminParams {
    adminId?: number;
    divisionId?: number;
    districtId?: number;
    ulbId?: number;
    roleId?: number;
}

export interface RegisterAdminPayload {
    RoleId: number;
    FullName: string;
    Username: string;
    Password: string;
    MobileNo: string;
    Email: string;
    DivisionId?: number;
    DistrictId?: number;
    ULBId?: number;
}

export interface UpdateAdminPayload {
    FullName?: string;
    MobileNo?: string;
    Email?: string;
    RoleId?: number;
    DivisionId?: number;
    DistrictId?: number;
    ULBId?: number;
    IsActive?: boolean;
    StatusReason?: string;
    StatusChangeDate?: string; // "YYYY-MM-DD"
}

// ─── Shared ───────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

const ADMIN_QUERY_KEY = "admins";

// ─── Get Admins ───────────────────────────────────────────────────────────────

export async function fetchAdmins(params?: GetAdminParams): Promise<Admin[]> {
    const searchParams = new URLSearchParams();
    if (params?.adminId    !== undefined) searchParams.append("adminId",    String(params.adminId));
    if (params?.divisionId !== undefined) searchParams.append("divisionId", String(params.divisionId));
    if (params?.districtId !== undefined) searchParams.append("districtId", String(params.districtId));
    if (params?.ulbId      !== undefined) searchParams.append("ulbId",      String(params.ulbId));
    if (params?.roleId     !== undefined) searchParams.append("roleId",     String(params.roleId));

    const query = searchParams.toString();
    const res = await apiRequest<ApiResponse<Admin[]>>(
        `/Admin/GetAdmin${query ? `?${query}` : ""}`,
        { method: "GET" },
    );
    return Array.isArray(res?.data) ? res.data : [];
}

export function useAdmins(params?: GetAdminParams) {
    return useQuery({
        queryKey: [ADMIN_QUERY_KEY, params],
        queryFn: () => fetchAdmins(params),
    });
}

// ─── Register Admin ───────────────────────────────────────────────────────────

export async function registerAdmin(payload: RegisterAdminPayload) {
    const res = await apiRequest<ApiResponse<Admin>>(
        "/Admin/RegisterAdmin",
        { method: "POST", body: payload },
    );
    return res;
}

export function useRegisterAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: registerAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY] });
        },
        onError: (error) => {
            console.error("Register admin failed", error);
        },
    });
}

// ─── Update Admin (edit details + activate/deactivate) ───────────────────────

export async function updateAdmin(adminId: number, payload: UpdateAdminPayload) {
    const res = await apiRequest<ApiResponse<Admin>>(
        `/Admin/UpdateAdmin/${adminId}`,
        { method: "PATCH", body: payload },
    );
    return res;
}

export function useUpdateAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            adminId,
            payload,
        }: {
            adminId: number;
            payload: UpdateAdminPayload;
        }) => updateAdmin(adminId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY] });
        },
        onError: (error) => {
            console.error("Update admin failed", error);
        },
    });
}