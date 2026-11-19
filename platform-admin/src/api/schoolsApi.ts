// src/services/platformService.ts
// Platform owner API: /api/v1/platform/schools

import { apiRequest, apiRequestFull } from "@/lib/api";

export type SchoolStatus = "ACTIVE" | "SUSPENDED";

export interface SchoolPrincipal {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  lastLoginAt: string | null;
}

export interface SchoolSummary {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: SchoolStatus;
  createdAt: string | null;
  principals: SchoolPrincipal[];
  userCounts: {
    total: number;
    principals: number;
    admins: number;
    teachers: number;
    students: number;
    parents: number;
    pending: number;
  };
}

export interface SchoolListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  summary: { schools: number; active: number; suspended: number };
}

export interface ListSchoolsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SchoolStatus | "";
}

export interface PrincipalPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface CreateSchoolPayload {
  school: { name: string; code: string; email?: string; phone?: string; address?: string };
  principal: PrincipalPayload;
}

export const platformService = {
  async listSchools(params: ListSchoolsParams = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    const res = await apiRequestFull<SchoolSummary[]>(`/platform/schools?${qs.toString()}`);
    return { items: res.data, meta: res.meta as unknown as SchoolListMeta };
  },

  getSchool: (id: string) => apiRequest<SchoolSummary>(`/platform/schools/${id}`),

  createSchool: (payload: CreateSchoolPayload) =>
    apiRequest<SchoolSummary>("/platform/schools", { method: "POST", body: payload }),

  setSchoolStatus: (id: string, status: SchoolStatus) =>
    apiRequest<SchoolSummary>(`/platform/schools/${id}/status`, { method: "PATCH", body: { status } }),

  addPrincipal: (id: string, payload: PrincipalPayload) =>
    apiRequest<SchoolSummary>(`/platform/schools/${id}/principals`, { method: "POST", body: payload }),
};

/** Sets a temporary password; the principal must change it at next sign in. */
export const resetPrincipalPassword = (schoolId: string, userId: string, newPassword: string) =>
  apiRequest<null>(`/platform/schools/${schoolId}/principals/${userId}/reset-password`, {
    method: "POST",
    body: { newPassword },
  });
