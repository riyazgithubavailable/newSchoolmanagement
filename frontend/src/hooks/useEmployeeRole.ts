import { apiRequest } from "@/lib/api";
import { EmployeeRole, EmployeeRoleResponse } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { E } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";
interface ApiResponse<T = unknown> {
    success?: boolean;
    message?: string;
    data?: T;
}
export const useEmployeeRoles = () => {
    return useQuery<EmployeeRole[], Error>({
        queryKey: ["employee-roles"],
        queryFn: async () => {
            const res = await apiRequest<EmployeeRoleResponse>(
                "/PlantEmployee/RoleTypeList",{
                method: "GET",
                headers: {
                    "X-API-KEY": import.meta.env.VITE_API_KEY ,
                }
        });
            return res?.data ?? [];
        },
    });
}
//ADD Employee Role
export const useEmployeeRoleRegistration = () =>{
    const queryClient = useQueryClient();
     const mutation = useMutation<ApiResponse,Error, {RoleName:string,RoleCode:string}>({
        mutationFn:async (payload) =>{
            return await apiRequest<ApiResponse>(
                "/PlantEmployee/RoleTypeList",
                {
                    method: "POST",
                    body: payload
                }
            );
         }   ,
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["employee-roles"]})
        }
     });
     return {
        register: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error
     }
}
//UPDATE AND TOGGLE Employee Role Status
export const useUpdateEmployeeRole = () =>{
    const queryClient = useQueryClient();
     const mutation = useMutation<ApiResponse,Error, {roleId?:number,RoleName?:string,IsActive?:boolean,RoleCode?:string}>({
        mutationFn:async (payload) =>{
            return await apiRequest<ApiResponse>(
                `/PlantEmployee/RoleTypeList/${payload.roleId}`,
                {
                    method: "PATCH",
                    body: payload
                }
            );
         }   ,
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["employee-roles"]})
        }
     });
     return {
        update: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error
     }
}