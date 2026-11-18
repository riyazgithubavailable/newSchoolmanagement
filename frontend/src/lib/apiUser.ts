// Backend user (GET /auth/me, POST /auth/login) → frontend AuthUser.

import { teacherProfile } from "@/mock/db";
import type { UserRole } from "@/config/roles";
import type { AuthUser } from "@/types/school";

/** Shape returned by the API (see backend/src/modules/auth/auth.service.ts → toPublicUser) */
export interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: string;
  schoolId: string | null;
  school: { id: string; code: string; name: string } | null;
  lastLoginAt: string | null;
  mustChangePassword?: boolean;
}

export function toAuthUser(u: ApiUser): AuthUser {
  const base: AuthUser = {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    schoolCode: u.school?.code ?? "",
    schoolName: u.school?.name ?? "",
    mustChangePassword: !!u.mustChangePassword,
  };

  // TODO(API): class-teacher assignment will come from the academics API
  // (classes collection). Until then every teacher gets the demo section so the
  // Class Teacher pages (which still use mock data) remain reachable.
  if (u.role === "TEACHER") {
    base.isClassTeacher = !!teacherProfile.classTeacherOf;
    base.classTeacherOf = teacherProfile.classTeacherOf;
  }
  return base;
}
