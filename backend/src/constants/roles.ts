// Same role names as the web app (frontend/src/config/roles.ts) and the Kotlin app.

export const ROLES = {
  /** Platform owner — manages schools; belongs to no school */
  SUPER_ADMIN: "SUPER_ADMIN",
  PRINCIPAL: "PRINCIPAL",
  /** School office staff: fees, admissions, staff records */
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export const ALL_ROLES = Object.values(ROLES) as Role[];


/** Roles that can approve / manage accounts inside a school */
export const SCHOOL_MANAGER_ROLES: Role[] = [ROLES.PRINCIPAL, ROLES.ADMIN];

export const USER_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
  DISABLED: "DISABLED",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
