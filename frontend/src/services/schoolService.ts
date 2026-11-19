// src/services/schoolService.ts
// Principal / Admin API: /api/v1/school/*, /api/v1/staff, /api/v1/users

import { apiRequest } from "@/lib/api";

/* --------------------------------- Types --------------------------------- */

export type Board = "CBSE" | "ICSE" | "STATE" | "IB" | "OTHER";

export interface SchoolProfile {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  board: Board | null;
  affiliationNo: string | null;
  website: string | null;
  status: string;
}

export interface SchoolOverview {
  school: SchoolProfile;
  academicYear: { id: string; name: string } | null;
  counts: {
    teachers: number;
    admins: number;
    pendingAccounts: number;
    classes: number;
    sections: number;
    sectionsWithoutClassTeacher: number;
    subjects: number;
    subjectAssignments: number;
  };
  setup: {
    profile: boolean;
    academicYear: boolean;
    classes: boolean;
    subjects: boolean;
    staff: boolean;
    classTeachers: boolean;
    subjectTeachers: boolean;
  };
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SectionInfo {
  id: string;
  name: string;
  label: string;
  roomNo: string | null;
  classTeacher: { id: string; fullName: string } | null;
  subjectCount: number;
}

export interface ClassInfo {
  id: string;
  name: string;
  order: number;
  stream: string | null;
  sections: SectionInfo[];
}

export interface ClassTemplate {
  id: string;
  label: string;
  classes: { name: string; order: number }[];
}

export interface Subject {
  id: string;
  name: string;
  code: string | null;
}

export interface Assignment {
  id: string;
  section: { id: string; label: string };
  subject: { id: string; name: string };
  teacher: { id: string; fullName: string };
}

export type StaffRole = "PRINCIPAL" | "ADMIN" | "TEACHER";
export type UserStatus = "PENDING" | "ACTIVE" | "REJECTED" | "DISABLED";

export interface StaffProfileFields {
  employeeId: string | null;
  designation: string | null;
  qualification: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  joiningDate: string | null;
}

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  status: UserStatus;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  profile: StaffProfileFields;
  classTeacherOf: { sectionId: string; label: string } | null;
  subjectAssignments: number;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  phone?: string;
  role: "TEACHER" | "ADMIN";
  password: string;
  profile: Partial<StaffProfileFields>;
}

/* -------------------------------- Calls ---------------------------------- */

const q = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && s.set(k, v));
  const str = s.toString();
  return str ? `?${str}` : "";
};

export const schoolService = {
  overview: () => apiRequest<SchoolOverview>("/school/overview"),

  getProfile: () => apiRequest<SchoolProfile>("/school/profile"),
  updateProfile: (p: Partial<SchoolProfile>) => apiRequest<SchoolProfile>("/school/profile", { method: "PATCH", body: p }),

  academicYears: () => apiRequest<AcademicYear[]>("/school/academic-years"),
  addAcademicYear: (y: { name: string; startDate: string; endDate: string; isCurrent?: boolean }) =>
    apiRequest<AcademicYear>("/school/academic-years", { method: "POST", body: y }),
  setCurrentYear: (id: string) => apiRequest<AcademicYear>(`/school/academic-years/${id}/set-current`, { method: "POST" }),
  deleteAcademicYear: (id: string) => apiRequest<null>(`/school/academic-years/${id}`, { method: "DELETE" }),

  classTemplates: () => apiRequest<ClassTemplate[]>("/school/class-templates"),
  classes: () => apiRequest<ClassInfo[]>("/school/classes"),
  addClass: (c: { name: string; order: number; stream?: string | null; sections: string[] }) =>
    apiRequest<{ id: string }>("/school/classes", { method: "POST", body: c }),
  addClassesFromTemplate: (templateId: string, sections: string[]) =>
    apiRequest<{ created: number; skipped: number }>("/school/classes/from-template", {
      method: "POST",
      body: { templateId, sections },
    }),
  deleteClass: (id: string) => apiRequest<null>(`/school/classes/${id}`, { method: "DELETE" }),
  addSection: (s: { classId: string; name: string; roomNo?: string | null }) =>
    apiRequest<{ id: string }>("/school/sections", { method: "POST", body: s }),
  updateSection: (id: string, s: { name?: string; roomNo?: string | null }) =>
    apiRequest<{ id: string }>(`/school/sections/${id}`, { method: "PATCH", body: s }),
  deleteSection: (id: string) => apiRequest<null>(`/school/sections/${id}`, { method: "DELETE" }),
  setClassTeacher: (sectionId: string, teacherId: string | null) =>
    apiRequest<{ id: string }>(`/school/sections/${sectionId}/class-teacher`, { method: "PUT", body: { teacherId } }),

  subjectSuggestions: () => apiRequest<string[]>("/school/subject-suggestions"),
  subjects: () => apiRequest<Subject[]>("/school/subjects"),
  addSubjects: (names: string[]) =>
    apiRequest<{ created: number; skipped: number }>("/school/subjects/bulk", { method: "POST", body: { names } }),
  updateSubject: (id: string, s: { name: string; code?: string | null }) =>
    apiRequest<Subject>(`/school/subjects/${id}`, { method: "PATCH", body: s }),
  deleteSubject: (id: string) => apiRequest<null>(`/school/subjects/${id}`, { method: "DELETE" }),

  assignments: (p: { sectionId?: string; teacherId?: string } = {}) => apiRequest<Assignment[]>(`/school/assignments${q(p)}`),
  assign: (a: { sectionId: string; subjectId: string; teacherId: string }) =>
    apiRequest<{ id: string }>("/school/assignments", { method: "PUT", body: a }),
  unassign: (id: string) => apiRequest<null>(`/school/assignments/${id}`, { method: "DELETE" }),

  staff: (p: { role?: StaffRole; status?: UserStatus; search?: string } = {}) =>
    apiRequest<StaffMember[]>(`/staff${q(p)}`),
  addStaff: (s: CreateStaffPayload) => apiRequest<StaffMember>("/staff", { method: "POST", body: s }),
  updateStaff: (id: string, s: { fullName?: string; phone?: string; profile?: Partial<StaffProfileFields> }) =>
    apiRequest<StaffMember>(`/staff/${id}`, { method: "PATCH", body: s }),
  setUserStatus: (id: string, status: "ACTIVE" | "REJECTED" | "DISABLED") =>
    apiRequest<unknown>(`/users/${id}/status`, { method: "PATCH", body: { status } }),
  resetUserPassword: (id: string, newPassword: string) =>
    apiRequest<unknown>(`/users/${id}/reset-password`, { method: "POST", body: { newPassword } }),
};
