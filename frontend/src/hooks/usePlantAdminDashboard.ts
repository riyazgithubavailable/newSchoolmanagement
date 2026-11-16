import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { DashboardData } from "../types/dashboard";

interface DashboardParams {
  fromDate?: string;
  toDate?: string;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}

export function usePlantAdminDashboard(params?: DashboardParams) {
  const from = params?.fromDate ?? new Date().toISOString().split("T")[0];
  const to = params?.toDate ?? new Date().toISOString().split("T")[0];

  return useQuery<DashboardData, Error>({
    queryKey: ["plant-admin-dashboard", from, to],
    queryFn: async () => {
      console.debug("[usePlantAdminDashboard] request headers:", { fromdate: from, todate: to });
      const response = await apiRequest<DashboardResponse>("/Dashboard/PlantAdmin", {
        method: "GET",
        headers: { fromdate: from, todate: to },
      });

      console.debug("[usePlantAdminDashboard] response:", response);
      if (!response || response.success === false) {
        throw new Error(response?.message ?? "Failed to fetch dashboard");
      }
      return response.data;
    },
    staleTime: 0,
    refetchInterval: 0,
  });
}

export interface Notification {
  notificationId: string;
  
  plantId: number;
  ulbId: number;
  type: "VEHICLE_ENTRY" | "VEHICLE_EXIT" | "WEIGHBRIDGE";
  date: string;
  time: string;
  vehicleNumber: string;
  message: string;
  createdAt: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

export function useNotification(plantId?: number) {
  return useQuery<Notification[], Error>({
    queryKey: ["notification", plantId],

    queryFn: async () => {
      const response =
        await apiRequest<ApiListResponse<Notification>>(
          `/Notifications${plantId ? `?plantId=${plantId}` : ""}`
        );

      return response.data;
    },

    staleTime: 0,
    refetchInterval: 5000, // refresh every 5 sec
  });
}