import { apiRequest } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
export type ULB = {
  ulbId: number;
  ulbName: string;
};

export type District = {
  districtId: number;
  districtName: string;
  ulbs: ULB[];
};

export type Division = {
  divisionId: number;
  divisionName: string;
  districts: District[];
  ulbId: ULB[];
};

export type HierarchyResponse = {
  success: boolean;
  data: Division[];
};
export function useHierarchy() {
  return useQuery<Division[]>({
    queryKey: ["Hierarchy"],

    queryFn: async () => {
      const res = await apiRequest<HierarchyResponse>(
        "/ProcessingPlant/GetDivisionHierarchy",
        {
          method: "GET",
        }
      );

      return res.data;
    },

    staleTime: 5 * 60 * 1000,
  });
}