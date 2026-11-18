// Class teachers and subject teachers, one section at a time.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, BookOpen, School, UserCheck, X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { ROLE_PATH } from "@/config/roles";
import {
  useAssignments,
  useClasses,
  useSchoolMutation,
  useSchoolOverview,
  useStaff,
  useSubjects,
} from "@/hooks/useSchoolQueries";
import { schoolService, type SectionInfo } from "@/services/schoolService";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  PageShell,
  Panel,
  Pill,
  errorMessage,
  inputClass,
} from "@/components/shared/PageKit";

export default function AssignmentsPage() {
  const { user } = useAuth();
  const base = `/${ROLE_PATH[user?.role ?? "PRINCIPAL"]}`;
  const classes = useClasses();
  const overview = useSchoolOverview();
  const [sectionId, setSectionId] = useState<string | null>(null);

  const allSections = useMemo(() => (classes.data ?? []).flatMap((c) => c.sections), [classes.data]);
  useEffect(() => {
    if (!sectionId && allSections[0]) setSectionId(allSections[0].id);
  }, [allSections, sectionId]);
  const section = allSections.find((s) => s.id === sectionId) ?? null;

  if (classes.isLoading)
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    );
  if (classes.isError)
    return (
      <PageShell>
        <ErrorState message={errorMessage(classes.error)} onRetry={classes.refetch} />
      </PageShell>
    );

  return (
    <PageShell>
      <PageHeader
        icon={<UserCheck size={25} />}
        title="Class & Subject Teachers"
        description="Pick a section, then choose its class teacher and who teaches each subject."
      />

      {!allSections.length ? (
        <Panel>
          <EmptyState
            title="No sections yet"
            description="Create classes and sections first."
            action={
              <Link to={`${base}/setup?tab=classes`} className="rounded-xl bg-[#0F1B33] px-4 py-2 text-sm font-semibold text-white">
                Go to School Setup
              </Link>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* section list */}
          <Panel title="Sections" bodyClassName="max-h-[70dvh] overflow-y-auto p-2">
            {(classes.data ?? []).map((c) =>
              c.sections.length ? (
                <div key={c.id} className="mb-2">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {c.name}
                    {c.stream ? ` · ${c.stream}` : ""}
                  </p>
                  {c.sections.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSectionId(s.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                        s.id === sectionId ? "bg-[#0F1B33] text-white" : "text-gray-700 hover:bg-[#F5F3ED]",
                      )}
                    >
                      <span className="font-semibold">{s.label}</span>
                      {!s.classTeacher && (
                        <span title="No class teacher" className={cn("h-2 w-2 rounded-full", s.id === sectionId ? "bg-amber-300" : "bg-amber-500")} />
                      )}
                    </button>
                  ))}
                </div>
              ) : null,
            )}
          </Panel>

          {section && <SectionEditor section={section} hasYear={!!overview.data?.academicYear} base={base} />}
        </div>
      )}
    </PageShell>
  );
}

function SectionEditor({ section, hasYear, base }: { section: SectionInfo; hasYear: boolean; base: string }) {
  const teachers = useStaff({ role: "TEACHER", status: "ACTIVE" });
  const subjects = useSubjects();
  const assignments = useAssignments({ sectionId: section.id }, hasYear);
  const setClassTeacher = useSchoolMutation(({ teacherId }: { teacherId: string | null }) =>
    schoolService.setClassTeacher(section.id, teacherId),
  );
  const assign = useSchoolMutation(schoolService.assign);
  const unassign = useSchoolMutation(schoolService.unassign);

  const bySubject = new Map((assignments.data ?? []).map((a) => [a.subject.id, a]));
  const teacherList = teachers.data ?? [];

  return (
    <div className="space-y-6">
      <Panel
        title={
          <span className="flex items-center gap-2">
            <School size={18} /> {section.label}
          </span>
        }
        description="Class teacher: takes attendance, tracks progress and talks to parents of this section."
      >
        {teacherList.length === 0 && !teachers.isLoading ? (
          <p className="text-sm text-gray-500">
            No active teachers yet.{" "}
            <Link to={`${base}/staff`} className="font-semibold text-[#2463d4] underline">
              Add staff
            </Link>
          </p>
        ) : (
          <Field label="Class teacher" hint="A teacher can be class teacher of only one section.">
            <select
              className={`${inputClass} max-w-md`}
              value={section.classTeacher?.id ?? ""}
              disabled={setClassTeacher.isPending}
              onChange={(e) =>
                setClassTeacher.mutate(
                  { teacherId: e.target.value || null },
                  {
                    onSuccess: () => toast.success(e.target.value ? "Class teacher assigned" : "Class teacher removed"),
                    onError: (err) => toast.error(errorMessage(err)),
                  },
                )
              }
            >
              <option value="">— Not assigned —</option>
              {teacherList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                  {t.classTeacherOf && t.classTeacherOf.sectionId !== section.id ? ` (class teacher of ${t.classTeacherOf.label})` : ""}
                </option>
              ))}
            </select>
          </Field>
        )}
      </Panel>

      <Panel
        title={
          <span className="flex items-center gap-2">
            <BookOpen size={18} /> Subject teachers
          </span>
        }
        description="Changes are saved immediately."
        bodyClassName="p-0"
      >
        {!hasYear ? (
          <div className="flex items-center gap-3 px-5 py-4 text-sm text-amber-800">
            <AlertTriangle size={18} />
            <span>
              Add the current academic year first.{" "}
              <Link to={`${base}/setup?tab=year`} className="font-semibold underline">
                School Setup → Academic Year
              </Link>
            </span>
          </div>
        ) : subjects.isLoading || assignments.isLoading ? (
          <LoadingState />
        ) : !(subjects.data ?? []).length ? (
          <EmptyState
            title="No subjects yet"
            action={
              <Link to={`${base}/setup?tab=subjects`} className="rounded-xl bg-[#0F1B33] px-4 py-2 text-sm font-semibold text-white">
                Add subjects
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-[#F7F5EF]">
            {(subjects.data ?? []).map((subj) => {
              const current = bySubject.get(subj.id);
              return (
                <li key={subj.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className="w-48 font-medium text-[#0F1B33]">{subj.name}</span>
                  <select
                    aria-label={`Teacher for ${subj.name}`}
                    className={`${inputClass} max-w-xs flex-1 py-2`}
                    value={current?.teacher.id ?? ""}
                    onChange={(e) => {
                      const teacherId = e.target.value;
                      if (!teacherId && current) {
                        unassign.mutate(current.id, { onError: (err) => toast.error(errorMessage(err)) });
                      } else if (teacherId) {
                        assign.mutate(
                          { sectionId: section.id, subjectId: subj.id, teacherId },
                          { onError: (err) => toast.error(errorMessage(err)) },
                        );
                      }
                    }}
                  >
                    <option value="">— Not assigned —</option>
                    {teacherList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                  {current ? (
                    <button
                      type="button"
                      aria-label={`Remove teacher for ${subj.name}`}
                      onClick={() => unassign.mutate(current.id, { onError: (err) => toast.error(errorMessage(err)) })}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <X size={15} />
                    </button>
                  ) : (
                    <Pill className="bg-amber-50 text-amber-700">Not assigned</Pill>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
