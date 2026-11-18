// Backend user (GET /auth/me, POST /auth/login) → frontend AuthUser.

import type { UserRole } from "@/config/roles";
import type { AuthUser } from "@/types/school";

/** Shape returned by the API (see backend/src/modules/auth/auth.service.ts → sessionUser) */
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
  /** teachers only: the section they are class teacher of */
  classTeacherOf?: {
    sectionId: string;
    classId: string;
    className: string;
    stream: string | null;
    section: string;
    label: string;
  } | null;
}

export function toAuthUser(u: ApiUser): AuthUser {
  const ct = u.classTeacherOf ?? null;
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    schoolCode: u.school?.code ?? "",
    schoolName: u.school?.name ?? "",
    mustChangePassword: !!u.mustChangePassword,
    // set by the principal in "Class & Subject Teachers"
    isClassTeacher: !!ct,
    classTeacherOf: ct
      ? { classId: ct.sectionId, className: ct.stream ? `${ct.className} ${ct.stream}` : ct.className, section: ct.section }
      : null,
  };
}
