import { apiRequest } from "@/lib/api"
import { PlantStockResponse, PrimarySegregationDashboardResponse, SalesDashboardResponse, SecondarySegregationDashboardResponse, VehicleDashboardResponse, WasteProcessingResponse, WeighBridgeDashboardResponse } from "@/types/dashboard"
import { useQuery } from "@tanstack/react-query"

//WeighBridgeOperatorDashboard
export function usefetchWeighBridgeDashboard(plantId: number,
    fromDate: string,
    toDate: string) {

    return useQuery<WeighBridgeDashboardResponse>({
        queryKey: ["weighbridge-dashboard", plantId, fromDate, toDate],
        queryFn: async () => {
            const res = await apiRequest<WeighBridgeDashboardResponse>(`/Dashboard/WeighBridgeOperator?plantId=${plantId}`, {
                method: "GET",
                headers: {
                    ...(fromDate && { "fromDate": fromDate }),
                    ...(toDate && { "toDate": toDate }),
                },
            })
            return res
        },
        enabled: !!plantId,
        staleTime: 0,
    })
}
//WasteStockDashboard
export function useFetchWasteStockDashboard(  plantId: number,
  processingInputId: number,
  fromDate: string,
  toDate: string) {
        
    return useQuery({
          queryKey:["plant-stock-dashboard", plantId, processingInputId, fromDate, toDate],
            queryFn: async () => {
                const res = await apiRequest<PlantStockResponse>(`/Dashboard/PlantStock?plantId=${plantId}&processingInputId=${processingInputId}`, {
                    method: "GET",
                    headers: {
                        ...(fromDate && { "fromDate": fromDate }),
                        ...(toDate && { "toDate": toDate }),
                    },
                })
                return res
            },
            enabled: !!plantId,
            staleTime: 0,
    })
  }

  export function useFetchWasteProcessingDashboard(  plantId: number,
  processingInputId: number,
  fromDate: string,
  toDate: string) {
     return useQuery({
            queryKey:["waste-processing-dashboard", plantId, processingInputId, fromDate, toDate],
            queryFn: async () => {
                  const res = await apiRequest<WasteProcessingResponse>(`/Dashboard/WasteProcessingSupervisor?plantId=${plantId}&processingInputId=${processingInputId}`, {
                      method: "GET",
                      headers: {
                          ...(fromDate && { "fromDate": fromDate }),
                          ...(toDate && { "toDate": toDate }),
                      },
                  })
                  return res
            },
            enabled: !!plantId,
            staleTime: 0,

     })
  }
  // for Secondary Segregation Dashboard
  export function useFetchSecondarySegregationDashboard( plantId: number,
    fromDate: string,
    toDate: string){
       return useQuery({
            queryKey:["secondary-segregation-dashboard", plantId, fromDate, toDate],
            queryFn:async () =>{
                const res = await apiRequest<SecondarySegregationDashboardResponse>(`/Dashboard/SecondarySegregationSupervisor?plantId=${plantId}`,{
                    method: "GET",
                    headers: {
                        ...(fromDate && { "fromDate": fromDate }),
                        ...(toDate && { "toDate": toDate }),
                    },
                    
                })
                return res
            },
            enabled: !!plantId,
            staleTime: 0,
       })
  }
  //for Sales Dashboard
  export function useFetchSalesDashboard( plantId: number,
    fromDate: string,
    toDate: string){
        return useQuery({
            queryKey:["sales-dashboard", plantId, fromDate, toDate],
            queryFn:async () =>{
                 const res = await apiRequest<SalesDashboardResponse>(`/Dashboard/PlantSale?plantId=${plantId}`,{
                    method: "GET",
                    headers: {
                        ...(fromDate && { "fromDate": fromDate }),
                        ...(toDate && { "toDate": toDate }),
                    },
                 })
                 return res
            },
            enabled: !!plantId,
            staleTime: 0,
        })
    }
    //forPrimary Segregation Dashboard
    export function useFetchPrimarySegregationDashboard( plantId: number,
        fromDate: string,
        toDate: string){
            return useQuery({
                queryKey:["primary-segregation-dashboard", plantId, fromDate, toDate],
                queryFn:async () =>{
                        const res = await apiRequest<PrimarySegregationDashboardResponse>(`/Dashboard/PrimarySegregationSupervisor?plantId=${plantId}`,{
                            method: "GET",
                            headers: {
                                ...(fromDate && { "fromDate": fromDate }),
                                ...(toDate && { "toDate": toDate }),
                            },
                        })
                        return res
                },
                enabled: !!plantId,
                staleTime: 0,
            })
        }
        //for Gate Operator Dashboard
        export function useFetchGateOperatorDashboard( plantId: number,
            fromDate: string,
            toDate: string){
                return useQuery({
                    queryKey:["gate-operator-dashboard", plantId, fromDate, toDate],
                    queryFn:async ()=>{
                        const res = await apiRequest<VehicleDashboardResponse>(`/Dashboard/GateOperator?plantId=${plantId}`,{
                            method: "GET",
                            headers: {
                                ...(fromDate && { "fromDate": fromDate }),
                                ...(toDate && { "toDate": toDate }),
                            },
                        })
                        return res
                    },
                    enabled: !!plantId,
                    staleTime: 0,
                })
            }
               