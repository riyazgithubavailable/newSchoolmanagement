import { apiRequest } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpoilageRecord {
    spoilageId:          string;
    plantId:             number;
    outputCategoryId:    number;
    outputCategoryName:  string;
    quantityKg:          number;
    spoilageReason:      string;
    reportedBy:          string;
    reportedDate:        string;
    notes:               string;
    createdAt:           string;
    updatedAt:           string;
}

export interface SpoilageByCategoryRecord {
    outputCategoryId:   number;
    outputCategoryName: string;
    totalSpoiledKg:     number;
    recordCount:        number;
}

export interface SpoilageSummary {
    totalSpoiledKg: number;
    byCategory:     SpoilageByCategoryRecord[];
}

export interface SpoilageData {
    records: SpoilageRecord[];
    summary: SpoilageSummary;
}

interface ApiWrapper<T> {
    success: boolean;
    data:    T;
}

interface SpoilageParams {
    fromDate?: string; // yyyy-MM-dd
    toDate?:   string; // yyyy-MM-dd
}

// ─── Add Spoilage ─────────────────────────────────────────────────────────────

export interface AddSpoilagePayload {
    plantId:         number;
    outputCategoryId: number;
    quantityKg:      number;
    spoilageReason:  string;
    notes?:          string;
}


// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchSpoilage(params: SpoilageParams): Promise<SpoilageData> {
    const query = new URLSearchParams();
    if (params.fromDate) query.set("fromDate", params.fromDate);
    if (params.toDate)   query.set("toDate",   params.toDate);


const res = await apiRequest<ApiWrapper<SpoilageData>>(
    `/PlantStock/GetSpoilage`,
    {
        method: "GET",
        headers: {
            ...(params.fromDate && { "fromDate": params.fromDate }),
            ...(params.toDate   && { "toDate":   params.toDate   }),
        },
    }
);
    if (!res?.success) throw new Error("Failed to fetch spoilage records");

    return res.data;
}

export function usePlantSpoilage(params: SpoilageParams) {
    return useQuery({
        queryKey: ["plant-spoilage", params.fromDate, params.toDate],
        queryFn:  () => fetchSpoilage(params),
        staleTime: 0,
        enabled: !!params.fromDate && !!params.toDate,
    });
}

//Add Spoilage Record



async function addSpoilage(payload: AddSpoilagePayload): Promise<ApiWrapper<SpoilageRecord>> {
    return await apiRequest<ApiWrapper<SpoilageRecord>>("/PlantStock/RecordSpoilage", {
        method: "POST",
        body: payload,
    });
}

export function useAddSpoilage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addSpoilage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plant-spoilage"] });
        },
    });
}