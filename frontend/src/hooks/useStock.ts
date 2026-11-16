import { apiRequest } from "@/lib/api";
import { addStockResponse, stockResponse } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Summary Types ────────────────────────────────────────────────────────────
export interface stockData {
    stockId:          string;
    plantId:          number;
    plantName:        string;
    outputCategoryId: number;
    outputCategory:   string;
    quantityKg:       number;
    unitOfMeasure:    string;
    transferredBy:    string;
    transferDate:     string;
    isDeleted:        boolean;
    createdAt:        string;
    updatedAt:        string;
}
export interface OutputCategory {
    outputCategoryId: number;
    outputCategoryName: string;
    totalQuantityTon: number;
}

export interface WasteSubType {
    wasteSubTypeId: number;
    wasteSubTypeName: string;
    totalQuantityTon: number;
    outputCategories: OutputCategory[];
}

export interface WasteTypeSummary {
    wasteTypeId: number;
    wasteTypeName: string;
    subTypes: WasteSubType[];
}

export interface StockSummary {
    totalQuantityTon: number;
    summary: WasteTypeSummary[];
}

// ─── useStock ─────────────────────────────────────────────────────────────────


export function useStock(params?: {
    plantId?:  number;
    fromDate?: string;
    toDate?:   string;
}) {
    return useQuery({
        queryKey: ["stock", params],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.plantId !== undefined)
                query.append("plantId", String(params.plantId));

            const res = await apiRequest<{
                success: boolean;
                data: { records: stockData[]; summary: StockSummary };
            }>(
                `/PlantStock/GetStock${query.toString() ? `?${query.toString()}` : ""}`,
                {
                    method: "GET",
                    headers: {
                        fromdate: params?.fromDate ?? new Date().toISOString().split("T")[0],
                        todate:   params?.toDate   ?? new Date().toISOString().split("T")[0],
                    },
                }
            );

            // apiRequest returns the full body { success, data }
            // so res.data is { records[], summary }
            // and res.data.records is the array
            console.log("stock res:", res);
            return res.data?.records ?? [];
        },
    });
}

// ─── useStockSummary ──────────────────────────────────────────────────────────

export function useStockSummary(params?: {
    plantId?:  number;
    fromDate?: string;
    toDate?:   string;
}) {
    return useQuery({
        queryKey: ["stock-summary", params],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.plantId !== undefined)
                query.append("plantId", String(params.plantId));

            const res = await apiRequest<{
                success: boolean;
                data: { records: any[]; summary: StockSummary };
            }>(
                `/PlantStock/GetStock${query.toString() ? `?${query.toString()}` : ""}`,
                {
                    method: "GET",
                    headers: {
                        fromdate: params?.fromDate ?? new Date().toISOString().split("T")[0],
                        todate:   params?.toDate   ?? new Date().toISOString().split("T")[0],
                    },
                }
            );

            console.log("summary res:", res);
            return res.data?.summary ?? null;
        },
    });
}

// ─── useAddStock ──────────────────────────────────────────────────────────────

export function useAddStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            PlantId: number;
            OutputCategoryId: number;
            QuantityKg: number;
        }) => {
            return apiRequest<addStockResponse>("/PlantStock/AddStock", {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock"] });
            queryClient.invalidateQueries({ queryKey: ["stock-summary"] });
        },
    });
}