// src/config/roles.ts
// Single source of truth for user types. Must match backend/src/constants/roles.ts.

export const ROLES = {
  /** Platform owner — manages schools, belongs to no school */
  SUPER_ADMIN: "SUPER_ADMIN",
  PRINCIPAL: "PRINCIPAL",
  /** School office staff: fees, admissions, staff records, transport... */
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: UserRole[] = Object.values(ROLES);

/** Human readable role name (header, profile, etc.) */
export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  PRINCIPAL: "Principal",
  ADMIN: "School Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
};

/** Subtitle shown in the sidebar under the InstituteOS logo */
export const ROLE_WORKSPACE: Record<UserRole, string> = {
  SUPER_ADMIN: "Platform Console",
  PRINCIPAL: "Principal Console",
  ADMIN: "School Office",
  TEACHER: "Teacher Workspace",
  STUDENT: "Student Portal",
  PARENT: "Parent Portal",
};

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && (ALL_ROLES as string[]).includes(value);

/** URL prefix per role, e.g. /teacher/..., /super-admin/... */
export const ROLE_PATH: Record<UserRole, string> = {
  SUPER_ADMIN: "super-admin",
  PRINCIPAL: "principal",
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
};

/** Where a user lands after login / when they hit a page they can't access */
export const getHomeRoute = (role?: UserRole | null) => (role ? `/${ROLE_PATH[role]}/dashboard` : "/");
