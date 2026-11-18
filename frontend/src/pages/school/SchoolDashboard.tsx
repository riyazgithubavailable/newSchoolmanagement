// Principal / Admin home: key numbers + a step-by-step setup checklist.

import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarRange,
  CheckCircle2,
  Circle,
  ClipboardList,
  GraduationCap,
  School,
  UserCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_PATH } from "@/config/roles";
import { useSchoolOverview } from "@/hooks/useSchoolQueries";
import type { SchoolOverview } from "@/services/schoolService";
import { cn } from "@/lib/utils";
import {
  ErrorState,
  LoadingState,
  PageHeader,
  PageShell,
  Panel,
  Pill,
  SummaryCard,
  SummaryGrid,
  errorMessage,
} from "@/components/shared/PageKit";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default function SchoolDashboard() {
  const { user } = useAuth();
  const base = `/${ROLE_PATH[user?.role ?? "PRINCIPAL"]}`;
  const { data, isLoading, isError, error, refetch } = useSchoolOverview();

  if (isLoading)
    return (
      <PageShell>
        <LoadingState label="Loading your school..." />
      </PageShell>
    );
  if (isError || !data)
    return (
      <PageShell>
        <ErrorState message={errorMessage(error)} onRetry={refetch} />
      </PageShell>
    );

  const steps = buildSteps(data, base);
  const done = steps.filter((s) => s.done).length;
  const c = data.counts;

  return (
    <PageShell>
      <PageHeader
        icon={<School size={25} />}
        title={`${greeting()}, ${user?.fullName.split(" ")[0] ?? ""}`}
        description={`${data.school.name} · School code ${data.school.code}${data.academicYear ? ` · Academic year ${data.academicYear.name}` : ""}`}
      />

      <SummaryGrid>
        <SummaryCard title="Teachers" value={c.teachers} hint={`${c.admins} office admin${c.admins === 1 ? "" : "s"}`} icon={<Users size={21} />} color="bg-blue-50 text-blue-600" />
        <SummaryCard
          title="Classes"
          value={c.classes}
          hint={`${c.sections} section${c.sections === 1 ? "" : "s"}`}
          icon={<GraduationCap size={21} />}
          color="bg-green-50 text-green-600"
        />
        <SummaryCard title="Subjects" value={c.subjects} hint={`${c.subjectAssignments} subject teachers assigned`} icon={<BookOpen size={21} />} color="bg-orange-50 text-orange-600" />
        <SummaryCard
          title="Without class teacher"
          value={c.sectionsWithoutClassTeacher}
          hint="sections"
          icon={<UserCheck size={21} />}
          color={c.sectionsWithoutClassTeacher ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}
        />
      </SummaryGrid>

      {c.pendingAccounts > 0 && (
        <Link
          to={`${base}/staff?status=PENDING`}
          className="mb-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 hover:bg-amber-100"
        >
          <span>
            <b>{c.pendingAccounts}</b> account{c.pendingAccounts === 1 ? " is" : "s are"} waiting for your approval.
          </span>
          <span className="font-semibold">Review →</span>
        </Link>
      )}

      <Panel
        title="School setup"
        description="Finish these steps so teachers can start taking attendance and marks."
        actions={
          <Pill className={done === steps.length ? "bg-green-50 text-green-700" : "bg-[#F5F3ED] text-[#0F1B33]"}>
            {done} / {steps.length} done
          </Pill>
        }
        bodyClassName="p-0"
      >
        <div className="h-1.5 bg-gray-100">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
        </div>
        <ol className="divide-y divide-[#F7F5EF]">
          {steps.map((s, i) => (
            <li key={s.title} className="flex items-center gap-4 px-5 py-4">
              {s.done ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" aria-label="Done" />
              ) : (
                <Circle className="h-6 w-6 shrink-0 text-gray-300" aria-label="Not done" />
              )}
              <div className="min-w-0 flex-1">
                <p className={cn("font-semibold", s.done ? "text-gray-500" : "text-[#0F1B33]")}>
                  {i + 1}. {s.title}
                </p>
                <p className="text-sm text-gray-500">{s.description}</p>
              </div>
              {!s.done && (
                <Link
                  to={s.to}
                  className="shrink-0 rounded-xl bg-[#0F1B33] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1c3154]"
                >
                  {s.cta}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </Panel>
    </PageShell>
  );
}

function buildSteps(d: SchoolOverview, base: string) {
  return [
    {
      title: "Complete the school profile",
      description: "Board, phone and address appear on report cards and notices.",
      done: d.setup.profile,
      to: `${base}/setup?tab=profile`,
      cta: "Edit profile",
    },
    {
      title: "Add the academic year",
      description: "E.g. 2026-27. Attendance, marks and assignments belong to a year.",
      done: d.setup.academicYear,
      to: `${base}/setup?tab=year`,
      cta: "Add year",
      icon: CalendarRange,
    },
    {
      title: "Create classes & sections",
      description: "Pick a template like Nursery – 12, then add sections A, B...",
      done: d.setup.classes,
      to: `${base}/setup?tab=classes`,
      cta: "Add classes",
    },
    {
      title: "Add subjects",
      description: "English, Mathematics, Science... choose from suggestions.",
      done: d.setup.subjects,
      to: `${base}/setup?tab=subjects`,
      cta: "Add subjects",
    },
    {
      title: "Add teachers",
      description: "Create accounts with a temporary password and share the login details.",
      done: d.setup.staff,
      to: `${base}/staff`,
      cta: "Add staff",
    },
    {
      title: "Assign class teachers",
      description: `${d.counts.sectionsWithoutClassTeacher} section(s) still need a class teacher.`,
      done: d.setup.classTeachers,
      to: `${base}/assignments`,
      cta: "Assign",
      icon: ClipboardList,
    },
    {
      title: "Assign subject teachers",
      description: "Who teaches which subject in each section.",
      done: d.setup.subjectTeachers,
      to: `${base}/assignments`,
      cta: "Assign",
    },
  ];
}
