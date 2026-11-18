import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schoolService, type StaffRole, type UserStatus } from "@/services/schoolService";

/** Everything under ["school"] is refreshed after any change, keeping the
 *  dashboard checklist, class list and staff counts in sync. */
const ROOT = ["school"] as const;
export const schoolKeys = {
  overview: [...ROOT, "overview"] as const,
  profile: [...ROOT, "profile"] as const,
  years: [...ROOT, "years"] as const,
  templates: [...ROOT, "templates"] as const,
  classes: [...ROOT, "classes"] as const,
  subjects: [...ROOT, "subjects"] as const,
  suggestions: [...ROOT, "suggestions"] as const,
  assignments: (p: object) => [...ROOT, "assignments", p] as const,
  staff: (p: object) => [...ROOT, "staff", p] as const,
};

export const useSchoolOverview = () => useQuery({ queryKey: schoolKeys.overview, queryFn: schoolService.overview });
export const useSchoolProfile = () => useQuery({ queryKey: schoolKeys.profile, queryFn: schoolService.getProfile });
export const useAcademicYears = () => useQuery({ queryKey: schoolKeys.years, queryFn: schoolService.academicYears });
export const useClassTemplates = () =>
  useQuery({ queryKey: schoolKeys.templates, queryFn: schoolService.classTemplates, staleTime: Infinity });
export const useClasses = () => useQuery({ queryKey: schoolKeys.classes, queryFn: schoolService.classes });
export const useSubjects = () => useQuery({ queryKey: schoolKeys.subjects, queryFn: schoolService.subjects });
export const useSubjectSuggestions = () =>
  useQuery({ queryKey: schoolKeys.suggestions, queryFn: schoolService.subjectSuggestions, staleTime: Infinity });
export const useAssignments = (p: { sectionId?: string; teacherId?: string }, enabled = true) =>
  useQuery({ queryKey: schoolKeys.assignments(p), queryFn: () => schoolService.assignments(p), enabled });
export const useStaff = (p: { role?: StaffRole; status?: UserStatus; search?: string } = {}) =>
  useQuery({ queryKey: schoolKeys.staff(p), queryFn: () => schoolService.staff(p) });

/** Any school mutation → refresh all school data. */
export function useSchoolMutation<T, R>(fn: (arg: T) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ROOT }),
  });
}
