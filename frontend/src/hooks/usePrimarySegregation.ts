// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiRequest } from "@/lib/api";

// type ApiListResponse<T> = {
//     success: boolean;
//     data: T[];
//     message?: string;
// };

// type ApiSingleResponse<T> = {
//     success: boolean;
//     data: T;
//     message?: string;
// };

// export interface PrimarySegregation {
//     segregationId: string;
//     residueKg: number; // 👈 add this
//     plantId: number;
//     plantName?: string;
//     vehicleEntryId: string;
//     wasteTypeId: number;
//     wasteType: string;
//     quantityKg: number;
//     availableQty: number;
//     processedBy: string;
//     processedDate: string;
//     createdAt: string;
//     updatedAt: string;
//     isDeleted: boolean; // 👈 add this
// }

// export interface SummaryResponse {
//     success: boolean;
//     data: {
//         totalQuantityKg: number;
//         summary: Array<{
//             wasteType: string;
//             totalQuantityKg: number;
//         }>;
//     };
//     message?: string;
// }

// /* ================= GET ================= */

// type BatchResponse = {
//     batchId: string;
//     plantId: number;
//     plantName: string;
//     residueKg: number;
//     transactions: PrimarySegregation[];
// };

// export function usePrimarySegregation(params?: {
//     batchId?: string;
//     plantId?: number;
//     fromDate?: string;
//     toDate?: string;
// }) {
//     return useQuery({
//         queryKey: ["primary-segregation", params.batchId, params.plantId, params.fromDate, params.toDate],

//         queryFn: async () => {
//             const query = new URLSearchParams();
//             if (params?.plantId !== unde   fined)
//                 query.append("plantId", String(params.plantId));
//             if (params?.batchId) query.append("batchId", params.batchId);

//             const res = await apiRequest<ApiListResponse<BatchResponse>>(
//                 `/WasteSegregation/GetSegregation${query.toString() ? `?${query.toString()}` : ""
//                 }`,
//                 {
//                     method: "GET",
//                     headers: {

//                         fromdate: params.fromDate ?? new Date().toISOString().split("T")[0],
//                         todate: params.toDate ?? new Date().toISOString().split("T")[0],
//                     }

//                 }
//             );
//             /* 🔥 FLATTEN HERE */
//             const flattened: PrimarySegregation[] =
//                 res.data.flatMap((batch) =>
//                     batch.transactions.map((txn, index) => ({
//                         ...txn,
//                         plantId: batch.plantId || params?.plantId || 0,
//                         plantName: batch.plantName,
//                         residueKg: index === 0
//                             ? Number(batch.residueKg ?? 0)
//                             : 0,
//                     }))
//                 );

//             return flattened;
//         },
//     });
// }

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

type ApiSingleResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export interface PrimarySegregation {
  segregationId: string;
  plantId: number;
  plantName?: string;
  wasteTypeId: number;
  wasteType: string;
  quantityKg: number;
  processedBy: string;
  processedDate: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}


export interface SegregationSummary {
  waitingPile: WaitingPileSummary;
  fed: FedSummary;
  output: OutputSummary;
  inProcessTon: number;
  totalResidueTon: number;
}

export interface SegregationResponse {
  success: boolean;
  data: PrimarySegregation[];
  summary: SegregationSummary;
  available: AvailableSummary;
}
export interface WaitingPileSummary {
  totalTon: number;
  dry: number;
  wet: number;
  mixed: number;
}

export interface FedSummary {
  totalTon: number;
  dry: number;
  wet: number;
  mixed: number;
}

export interface OutputSummary {
  totalTon: number;
  dry: number;
  wet: number;
  hazardous: number;
  bioMedical: number;
}

export interface AvailableSummary {
  inProcessTon: number;
}
//feed 
export type PrimarySegregationFeed = {
  feedId: string;
  plantId: number;
  plantName: string;
  wasteType: string;
  quantityKg: number;
  fedBy: string;
  fedDate: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string
}
type FeedResponse = {
  success: boolean;
  data: PrimarySegregationFeed[];
  available: {
    totalTon: number;
    dry: number;
    wet: number;
    mixed: number
  }
}
export type fedData = {
  success: boolean;
  message: string
  data: PrimarySegregationFeed
}
type PayloadData = {
  PlantId: number;
  WeighBridgeWasteTypeId: number;
  QuantityKg: number;
}
type PayloadDataOutput = {
  PlantId: number;
  WasteTypeId: number;
  QuantityKg: number;
}

type outputData = {
  success: boolean;
  message: string;
  data: PrimarySegregation
}

//for Residue 
export interface ResidueResponse {
  success: boolean;
  data: {
    records: ResidueRecord[];
    summary: {
      totalResidueTon: number;
    };
    available: AvailableSummary;
  };
}

export interface ResidueRecord {
  residueId: string;
  plantId: number;
  plantName: string;
  residueKg: number;
  reportedBy: string;
  reportedDate: string;
  notes: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
//addResidue
export type residueData = {
  success: boolean;
  message: string;
  data: ResidueRecord
}

export type residuePayload = {
  PlantId: number;
  ResidueKg: number;
  Notes: string
}
export function usePrimarySegregation(params?: {
  batchId?: string;
  plantId?: number;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: [
      "primary-segregation",
      params?.batchId,
      params?.plantId,
      params?.fromDate,
      params?.toDate,
    ],

    queryFn: async () => {
      const query = new URLSearchParams();

      if (params?.plantId !== undefined) {
        query.append("plantId", String(params.plantId));
      }

      if (params?.batchId) {
        query.append("batchId", params.batchId);
      }

      const res = await apiRequest<SegregationResponse>(
        `/WasteSegregation/GetSegregation${query.toString() ? `?${query.toString()}` : ""
        }`,
        {
          method: "GET",
          headers: {
            fromdate: params.fromDate ?? new Date().toISOString().split("T")[0],
            todate: params.toDate ?? new Date().toISOString().split("T")[0],
          },
        }
      );
      return res;
    },
  });
}
/* ================= ADD ================= */

export function useAddPrimarySegregation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      PlantId: number;
      BatchId: string;
      WasteTypeId: number;
      QuantityKg: number;
    }) => {
      return apiRequest<ApiSingleResponse<PrimarySegregation>>(
        "/WasteSegregation/AddSegregation",
        {
          method: "POST",
          body: payload,
        }
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["primary-segregation"],
      });
    },
  });
}

/* ================= UPDATE ================= */

export function useUpdatePrimarySegregation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      segregationId,
      data,
    }: {
      segregationId: string;
      data: {
        WasteTypeId: number;
        QuantityKg: number;
      };
    }) => {
      return apiRequest<ApiSingleResponse<PrimarySegregation>>(
        `/WasteSegregation/UpdateSegregation/${segregationId}`,
        {
          method: "PATCH",
          body: data,
        }
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["primary-segregation"],
      });
    },
  });
}

/* ================= DELETE / RESTORE ================= */

export function useDeletePrimarySegregation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      segregationId,
      isDeleted,
    }: {
      segregationId: string;
      isDeleted: boolean;
    }) => {
      return apiRequest<ApiSingleResponse<PrimarySegregation>>(
        `/WasteSegregation/SetSegregationStatus/${segregationId}`,
        {
          method: "PATCH",
          body: { IsDeleted: isDeleted },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["primary-segregation"],
      });
    },
    onError: (error) => {
      console.error("Delete/Restore failed", error);
    },
  });
}
//get feed
export function usePrimarySegregationFeed(params?: {
  plantId?: number;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: ["primary-segregation-feed", params?.plantId, params?.fromDate, params?.toDate],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.plantId !== undefined)
        query.append("plantId", String(params.plantId));
      const res = await apiRequest<FeedResponse>(`/WasteSegregation/GetFeed${query.toString() ? `?${query.toString()}` : ""}`, {
        method: "GET",
        headers: {
          fromdate: params.fromDate,
          todate: params.toDate
        },
      })
      return res
    }
  })
}
//addFeedBatch 
export const useAddFeed = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<fedData, Error, PayloadData>({
    mutationFn: async (payload) => {
      return await apiRequest<fedData>("/WasteSegregation/AddFeed", {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["primary-segregation-feed"] });
    }
  })
  return {
    register: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  }

}
//addOutputPrimary 
export const useAddOutput = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<outputData, Error, PayloadDataOutput>({
    mutationFn: async (payload) => {
      return await apiRequest<outputData>("/WasteSegregation/AddSegregation", {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["primary-segregation"] });
    }
  })
  return {
    register: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  }

}
//get Residue 
export const usePrimarySegregationResidue = (params?: {
  plantId?: number;
  fromDate?: string;
  toDate?: string;
}) => {
      const param = new URLSearchParams();
      if (params?.plantId !== undefined) param.append("plantId",String(params.plantId));
  return useQuery({
    queryKey: ["primary-segregation-residue"],
    queryFn: async () => {
      const res = await apiRequest<ResidueResponse>(`/WasteSegregation/GetResidue${param.toString() ? `?${param.toString()}` : ""}`, {
        method: "GET",
        headers: {
          fromdate: params.fromDate,
          todate: params.toDate
        },
      })
      return res
    }
  })
}
//addResidue 
export const useAddResidue = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<residueData, Error, residuePayload>({
    mutationFn: async (payload) => {
      return await apiRequest<residueData>("/WasteSegregation/RecordResidue", {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["primary-segregation-residue"] });
    }
  })
  return {
    register: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  }

}