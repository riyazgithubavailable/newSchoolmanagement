import { apiRequest } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaleRates {
    PETE: number;
    HDPE: number;
    PVC: number;
    LDPE: number;
    PP: number;
    PS: number;
    OtherPlastic: number;
    Newspaper: number;
    OfficePaper: number;
    Cardboard: number;
    MixedPaper: number;
    Aluminum: number;
    Steel: number;
    ClearGlass: number;
    BrownGlass: number;
    GreenGlass: number;
    MixedGlass: number;
    Compost: number;
    Biogas: number;
    RecoveredMetal: number;
    RecoveredPlastic: number;
    Ash: number;
    RDFFuel: number;
}


export interface SaleRatesData {
    plantId: number;
    rates: SaleRates;
    minimums: SaleRates;
}

interface ApiWrapper<T> {
    success: boolean;
    message?: string;
    data: T;
}

// Row shape for the table (flattened from the rates object)
export interface SaleRateRow {
    category: string; // e.g. "PETE" — matches outputCategoryName
    label: string;    // e.g. "PET (PETE)"
    rate: number;
    minimums: number;
}

export interface AddSaleRatePayload {
    outputCategoryId: number;
    rate: number;
}

export interface AddSaleMinRatePayload {
    outputCategoryId: number;
    saleMinimum: number;
}


export interface UpdateSaleRatePayload {
    outputCategoryId: number;
    newRate: number;
    saleMinimum: number;

}

export interface UpdateSaleRateResult {
    plantId: number;
    outputCategoryId: number;
    outputCategory: string;
    oldRate: number;
    newRate: number;
    changedBy: number;
        saleMinimum: number;

}

export interface SaleRateHistoryRecord {
    _id: string;
    plantId: number;
    outputCategoryId: number;
    outputCategory: string;
    oldRate: number;
    newRate: number;
    changedBy: number;
    isActive: boolean;
    changedDate: string;
    createdAt: string;
    updatedAt: string;

}

export interface SaleRateHistoryData {
    plantId: number;
    totalRecords: number;
    history: SaleRateHistoryRecord[];
}

export interface SaleRateHistoryParams {
    fromDate?: string;          // YYYY-MM-DD
    toDate?: string;            // YYYY-MM-DD
    outputCategoryId?: number;  // optional filter
}

export interface AddSalePayload {
    outputCategoryId: number;
    quantityTon: number;

}

export interface SaleRecord {
    _id: string;
    plantId: number;
    outputCategoryId: number;
    outputCategory: string;
    quantityTon: number;
    ratePerTon: number;
    totalAmount: number;
    soldBy: number;
    saleDate: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SaleSummary {
    totalSalesAmount: number;
    totalQuantitySoldTon: number;
    totalSalesTransactions: number;
    activeSalesCount: number;
    deletedSalesCount: number;
}
export interface SalesHistoryData {
    plantId: number;
    includeDeleted: boolean;
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    fromDate: string;
    toDate: string;
    sales: SaleRecord[];
    summary: SaleSummary;
}

interface ApiWrapper<T> {
    success: boolean;
    code: number;
    status: string;
    data: T;
}

export interface SalesHistoryParams {
    fromDate?: string;  // yyyy-MM-dd
    toDate?: string;  // yyyy-MM-dd
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
}
// ─── Display labels (optional friendly names) ─────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
    PETE: "PET (PETE)",
    HDPE: "HDPE",
    PVC: "PVC",
    LDPE: "LDPE",
    PP: "Polypropylene (PP)",
    PS: "Polystyrene (PS)",
    OtherPlastic: "Other Plastic",
    Newspaper: "Newspaper",
    OfficePaper: "Office Paper",
    Cardboard: "Cardboard",
    MixedPaper: "Mixed Paper",
    Aluminum: "Aluminum",
    Steel: "Steel",
    ClearGlass: "Clear Glass",
    BrownGlass: "Brown Glass",
    GreenGlass: "Green Glass",
    MixedGlass: "Mixed Glass",
    Compost: "Compost",
    Biogas: "Biogas",
    RecoveredMetal: "Recovered Metal",
    RecoveredPlastic: "Recovered Plastic",
    Ash: "Ash",
    RDFFuel: "RDF Fuel",
};

// ─── Get Sale Rates ─────────────────────────────────────────────────────────────

async function fetchSaleRates(): Promise<SaleRatesData> {
    const res = await apiRequest<ApiWrapper<SaleRatesData>>(
        "/PlantSale/GetSaleRates",
        { method: "GET" }
    );
    return res.data;
}

export function usePlantSaleRates() {
    return useQuery({
        queryKey: ["plant-sale-rates"],
        queryFn: fetchSaleRates,
        staleTime: 0,
        select: (data): SaleRateRow[] =>
            Object.entries(data.rates).map(([category, rate], index) => ({
                category,
                label: CATEGORY_LABELS[category] ?? category,
                rate,
                minimums: data.minimums[index + 1] ?? 0,
            })),
    });
}

// ─── Add Sale Rate ──────────────────────────────────────────────────────────────

async function addSaleRate(
    payload: AddSaleRatePayload,

): Promise<ApiWrapper<unknown>> {
    return await apiRequest<ApiWrapper<unknown>>("/PlantSale/AddSaleRate", {
        method: "POST",
        body: payload,
    });
}

export function useAddSaleRate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addSaleRate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plant-sale-rates"] });
        },
    });
}

// ─── Add Sale Miniumum Rate ──────────────────────────────────────────────────────────────

async function addSaleMinRate(
    payload: AddSaleMinRatePayload
): Promise<ApiWrapper<unknown>> {
    return await apiRequest<ApiWrapper<unknown>>("/PlantSale/AddSaleMinimum", {
        method: "POST",
        body: payload,
    });
}

export function useAddSaleMinRate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addSaleMinRate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plant-sale-rates"] });
        },
    });
}

// ─── Update Sale Rate ───────────────────────────────────────────────────────────

async function updateSaleRate(
    payload: UpdateSaleRatePayload
): Promise<ApiWrapper<UpdateSaleRateResult>> {
    return await apiRequest<ApiWrapper<UpdateSaleRateResult>>(
        "/PlantSale/UpdateSaleRate",
        {
            method: "PATCH",
            body: payload,
        }
    );
}

export function useUpdateSaleRate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateSaleRate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plant-sale-rates"] });
        },
    });
}

// ─── Get Sale Rate History ───────────────────────────────────────────────────────────

async function fetchSaleRateHistory(
    params: SaleRateHistoryParams
): Promise<SaleRateHistoryData> {
    const query = new URLSearchParams();
    if (params.fromDate) query.set("fromDate", params.fromDate);
    if (params.toDate) query.set("toDate", params.toDate);
    if (params.outputCategoryId) query.set("outputCategoryId", String(params.outputCategoryId));

    const url = `/PlantSale/GetSaleRateHistory?${query.toString()}`;

    const res = await apiRequest<ApiWrapper<SaleRateHistoryData>>(url, {
        method: "GET",
    });
    return res.data;
}

export function useSaleRateHistory(params: SaleRateHistoryParams) {
    return useQuery({
        queryKey: ["sale-rate-history", params.fromDate, params.toDate, params.outputCategoryId],
        queryFn: () => fetchSaleRateHistory(params),
        staleTime: 0,
        enabled: !!params.fromDate && !!params.toDate,
    });
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchSalesHistory(
    params: SalesHistoryParams
): Promise<SalesHistoryData> {
    const query = new URLSearchParams();


    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.includeDeleted !== undefined) query.set("includeDeleted", String(params.includeDeleted));

    const res = await apiRequest<ApiWrapper<SalesHistoryData>>(
        `/PlantSale/GetSalesHistory?${query.toString()}`,
        {
            method: "GET",
            headers: {
                fromdate: params.fromDate ?? new Date().toISOString().split("T")[0],
                todate: params.toDate ?? new Date().toISOString().split("T")[0],
            },
        }
    );

    if (!res?.success) throw new Error("Failed to fetch sales history");

    return res.data
}

export function useSalesHistory(params: SalesHistoryParams) {

    return useQuery({
        queryKey: ["sales-history", params.fromDate, params.toDate, params.page, params.limit, params.includeDeleted],
        queryFn: () => fetchSalesHistory(params),
        staleTime: 0,
        enabled: !!params.fromDate && !!params.toDate,
    });
}

// ─── Delete Sale ──────────────────────────────────────────────────────────────

async function deleteSale(
    saleId: string
): Promise<ApiWrapper<unknown>> {
    return await apiRequest<ApiWrapper<unknown>>(`/PlantSale/DeleteSale/${saleId}`, {
        method: "DELETE",
    });
}

export function useDeleteSale() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSale,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales-history"] });
        },
    });
}

// ─── Add Sale ────────────────────────────────────────────────────────────────────

async function addSale(
    payload: AddSalePayload
): Promise<ApiWrapper<unknown>> {
    return await apiRequest<ApiWrapper<unknown>>("/PlantSale/SellStock", {
        method: "POST",
        body: payload,
    });
}

export function useAddSale() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addSale,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales-history"] });
        },
    });
}

