import { apiRequest } from "@/lib/api";
import { AttendanceResponse } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Params {
  fromDate?: string; // ISO date string
  toDate?: string;   // ISO date string
}
interface RegularizeParams {
  attendanceId: string;
  inTime: string;   // ISO string
  outTime: string;  // ISO string
}
export function useEmployeeAttendance({ fromDate, toDate }: Params) {
  return useQuery({
    queryKey: ["employee-attendance", fromDate, toDate], // 🔥 cache + refetch control

    queryFn: async () => {
      const res = await apiRequest<AttendanceResponse>(
        "/PlantEmployee/GetAttendance",
        {
          method: "GET",
          headers: {
            ...(fromDate && { "fromDate": fromDate }),
            ...(toDate && { "toDate": toDate }),
          },
        }
      );
   
      return res?.data || [];
    },

    enabled: true, // 🔥 always call (backend handle karega filter)
    staleTime: 0,
    
  });
}

export function useRegularizeAttendance () {
     const queryClient = useQueryClient();

     return useMutation({
        mutationFn:async ({ attendanceId, inTime, outTime }: RegularizeParams) => {
            const res  = await apiRequest(`/PlantEmployee/CheckOut/${attendanceId}`,   {
          method: "PATCH",
          body: {
            inTime,
            outTime,
          }, 
        });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employee-attendance"] });
        }

     })
}