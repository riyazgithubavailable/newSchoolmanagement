import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  platformService,
  type CreateSchoolPayload,
  type ListSchoolsParams,
  type PrincipalPayload,
  type SchoolStatus,
} from "@/services/platformService";

export const platformKeys = {
  schools: (p: ListSchoolsParams) => ["platform", "schools", p] as const,
  all: ["platform", "schools"] as const,
};

export const useSchools = (params: ListSchoolsParams) =>
  useQuery({
    queryKey: platformKeys.schools(params),
    queryFn: () => platformService.listSchools(params),
    placeholderData: keepPreviousData, // keep the table while typing in search
  });

function useSchoolMutation<T, R>(fn: (arg: T) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.all }),
  });
}

export const useCreateSchool = () =>
  useSchoolMutation((p: CreateSchoolPayload) => platformService.createSchool(p));

export const useSetSchoolStatus = () =>
  useSchoolMutation(({ id, status }: { id: string; status: SchoolStatus }) => platformService.setSchoolStatus(id, status));

export const useAddPrincipal = () =>
  useSchoolMutation(({ id, payload }: { id: string; payload: PrincipalPayload }) => platformService.addPrincipal(id, payload));
