import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommonParams } from "./useVehicleEntry";
import { apiRequest } from "@/lib/api";
import { WeighBatchApiResponse, WeighBatchData } from "@/types/types";
import { register } from "module";
 type PayloadData = {
    PlantId: number;
    WeighBridgeWasteTypeId: number;
    QuantityKg: number;
}
export const useWeighBatch = (params?: CommonParams) => {
    const { plantId, fromDate, toDate } = params || {};

    return useQuery({
        queryKey: ["weigh-batch", plantId, fromDate, toDate],
        queryFn:async () =>{
             const res = await apiRequest<WeighBatchData>(`/WasteSegregation/GetInput?plantId=${plantId}`,
                {
                    method: "GET",
                    headers: {
                        ...(fromDate && { "fromDate": fromDate }),
                        ...(toDate && { "toDate": toDate }),
                    },
                }
             );
             return res
        },
        enabled: true,
        staleTime: 0,
    })
}
//wasteType
export function useWasteType () {
         return useQuery({
             queryKey: ["waste-type"],
             queryFn: async () => {
                 const res = await apiRequest<WeighBatchApiResponse>("/WeighBridge/GetWasteType");
                 return res.data;
             },
             staleTime:5 * 60 * 1000
         })
}
//Add weigh batch
export const useAddWeighBatch = () => {
      const queryClient = useQueryClient();
      const mutation  = useMutation<WeighBatchData,Error,PayloadData>({
        mutationFn:async (payload) => {
             return await apiRequest<WeighBatchData>("/WasteSegregation/AddInput", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["weigh-batch"]});
        }
      })
      return {
          register: mutation.mutateAsync,
          loading: mutation.isPending,
          error: mutation.error,
      }
      
}