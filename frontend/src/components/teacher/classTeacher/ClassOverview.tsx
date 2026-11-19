import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  CalendarDays,
  Cake,
  ClipboardCheck,
  Crown,
  MessageSquare,
  School,
  Search,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";

import { useClassOverview, useClassStudents, useStudentProgress } from "@/hooks/useTeacherQueries";
import { classLabel } from "@/services/teacherService";
import type { ClassOverview as Overview } from "@/types/school";
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
  fmtDate,
  inputClass,
} from "@/components/shared/PageKit";
import { attentionReasons } from "./progressUtils";

const EVENT_STYLE: Record<Overview["upcoming"][number]["type"], string> = {
  Exam: "bg-purple-50 text-purple-700",
  Event: "bg-emerald-50 text-emerald-700",
  PTM: "bg-blue-50 text-blue-700",
  Holiday: "bg-amber-50 text-amber-700",
};

export default function ClassOverview() {
  const overview = useClassOverview();
  const students = useClassStudents();
  const progress = useStudentProgress();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const attention = useMemo(
    () =>
      (progress.data ?? [])
        .map((p) => ({ p, reasons: attentionReasons(p) }))
        .filter((x) => x.reasons.length > 0),
    [progress.data],
  );

  const birthdays = useMemo(() => {
    const m = new Date().getMonth() + 1;
    return (students.data ?? [])
      .filter((s) => Number(s.dateOfBirth.slice(5, 7)) === m)
      .sort((a, b) => a.dateOfBirth.slice(8).localeCompare(b.dateOfBirth.slice(8)));
  }, [students.data]);

  const directory = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = students.data ?? [];
    return q
      ? list.filter((s) => `${s.name} ${s.rollNo} ${s.parentName} ${s.admissionNo}`.toLowerCase().includes(q))
      : list;
  }, [students.data, search]);

  if (overview.isLoading)
    return (
      <PageShell>
        <LoadingState label="Loading class..." />
      </PageShell>
    );
  if (overview.isError || !overview.data)
    return (
      <PageShell>
        <ErrorState message={errorMessage(overview.error)} onRetry={overview.refetch} />
      </PageShell>
    );

  const o = overview.data;
  const attendedToday = o.todayAttendance.present + o.todayAttendance.late;
  const todayPct = Math.round((attendedToday / o.totalStudents) * 100);
  const nextPtm = o.upcoming.find((u) => u.type === "PTM");

  return (
    <PageShell>
      <PageHeader
        icon={<School size={25} />}
        title={`My Class · ${classLabel(o)}`}
        description={`Class teacher view · Room ${o.roomNo} · Academic year ${o.academicYear}`}
        actions={
          <>
            <Link
              to="/teacher/attendance/mark"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E8E4D9] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F1B33] hover:bg-[#F5F3ED]"
            >
              <ClipboardCheck size={17} /> Mark Attendance
            </Link>
            <Link
              to="/teacher/class-teacher/parents"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F1B33] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154]"
            >
              <UsersRound size={17} /> Message Parents
            </Link>
          </>
        }
      />

      <SummaryGrid>
        <SummaryCard
          title="Students"
          value={o.totalStudents}
          hint={`${o.boys} boys · ${o.girls} girls`}
          icon={<Users size={21} />}
          color="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          title="Present Today"
          value={`${attendedToday}/${o.totalStudents}`}
          hint={`${todayPct}% · ${o.todayAttendance.absent} absent · ${o.todayAttendance.late} late`}
          icon={<UserCheck size={21} />}
          color="bg-green-50 text-green-600"
        />
        <SummaryCard
          title="Need Attention"
          value={progress.isLoading ? "…" : attention.length}
          hint="Low attendance or marks"
          icon={<AlertTriangle size={21} />}
          color="bg-red-50 text-red-600"
        />
        <SummaryCard
          title="Next PTM"
          value={nextPtm ? fmtDate(nextPtm.date, { day: "2-digit", month: "short" }) : "—"}
          hint={nextPtm ? nextPtm.title : "Not scheduled"}
          icon={<CalendarDays size={21} />}
          color="bg-orange-50 text-orange-600"
        />
      </SummaryGrid>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Weekly attendance */}
        <Panel title="This Week's Attendance" description="% of students present each day" className="xl:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={o.weeklyAttendance} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE4" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} unit="%" />
                <Tooltip formatter={(v: number) => [`${v}%`, "Present"]} cursor={{ fill: "#FBF9F3" }} />
                <Bar dataKey="percent" fill="#2463d4" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Leadership & upcoming */}
        <div className="space-y-6">
          <Panel title="Class Leadership">
            <div className="space-y-3">
              <LeaderRow role="Monitor" name={o.monitor} />
              <LeaderRow role="Vice Monitor" name={o.viceMonitor} />
            </div>
          </Panel>
          <Panel title="Upcoming">
            <ul className="space-y-3">
              {o.upcoming.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0F1B33]">{u.title}</p>
                    <p className="text-xs text-gray-500">{fmtDate(u.date, { weekday: "short", day: "2-digit", month: "short" })}</p>
                  </div>
                  <Pill className={EVENT_STYLE[u.type]}>{u.type}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Needs attention */}
        <Panel
          title="Students Needing Attention"
          description="Attendance below 75% or average below 50%"
          className="xl:col-span-2"
          actions={
            <Link to="/teacher/class-teacher/progress" className="text-sm font-semibold text-[#2463d4] hover:underline">
              View progress →
            </Link>
          }
          bodyClassName="p-0"
        >
          {progress.isLoading ? (
            <LoadingState />
          ) : attention.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">Everyone is on track. 🎉</p>
          ) : (
            <ul className="divide-y divide-[#F7F5EF]">
              {attention.map(({ p, reasons }) => (
                <li key={p.student.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F1B33]">
                      {p.student.rollNo}. {p.student.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {reasons.map((r) => (
                        <Pill key={r} className="bg-red-50 text-red-700">
                          {r}
                        </Pill>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/teacher/class-teacher/progress?student=${p.student.id}`)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F1B33] hover:bg-[#F5F3ED]"
                    >
                      <TrendingUp size={14} /> Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/teacher/messages?to=${p.student.parentId}`)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2463d4] hover:bg-blue-50"
                    >
                      <MessageSquare size={14} /> Parent
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Birthdays */}
        <Panel title="Birthdays This Month">
          {birthdays.length === 0 ? (
            <p className="text-sm text-gray-500">No birthdays this month.</p>
          ) : (
            <ul className="space-y-2.5">
              {birthdays.map((s) => (
                <li key={s.id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                    <Cake size={15} />
                  </span>
                  <span className="flex-1 font-medium text-[#0F1B33]">{s.name}</span>
                  <span className="text-xs text-gray-500">{fmtDate(s.dateOfBirth, { day: "2-digit", month: "short" })}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Subject teachers */}
        <Panel title="Subject Teachers" className="xl:col-span-1" bodyClassName="p-0">
          <ul className="divide-y divide-[#F7F5EF]">
            {o.subjectTeachers.map((t) => (
              <li key={t.subject} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div>
                  <p className="font-semibold text-[#0F1B33]">{t.subject}</p>
                  <p className="text-xs text-gray-500">{t.teacherName}</p>
                </div>
                <span className="text-xs text-gray-400">{t.periodsPerWeek}/wk</span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Student directory */}
        <Panel
          title="Student Directory"
          description={`${o.totalStudents} students`}
          className="xl:col-span-2"
          actions={
            <div className="relative w-full sm:w-60">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className={`${inputClass} py-2 pl-9`}
                placeholder="Search student or parent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          }
          bodyClassName="p-0"
        >
          {students.isLoading ? (
            <LoadingState />
          ) : (
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#F0EDE4] text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Roll</th>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Parent</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3 text-right">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {directory.map((s) => (
                    <tr key={s.id} className="border-b border-[#F7F5EF] last:border-0">
                      <td className="px-5 py-3 font-semibold text-gray-500">{s.rollNo}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-[#0F1B33]">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.admissionNo}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{s.parentName}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-700">{s.parentPhone}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/teacher/messages?to=${s.parentId}`)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2463d4] hover:bg-blue-50"
                        >
                          <MessageSquare size={14} /> Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {directory.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No students match.</p>}
            </div>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}

function LeaderRow({ role, name }: { role: string; name: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", "bg-amber-50 text-amber-600")}>
        <Crown size={16} />
      </span>
      <div>
        <p className="text-sm font-semibold text-[#0F1B33]">{name}</p>
        <p className="text-xs text-gray-500">{role}</p>
      </div>
    </div>
  );
}
