import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarCheck,
  Eye,
  EyeOff,
  MessageSquare,
  Percent,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { useAddRemark, useDeleteRemark, useStudentProgress } from "@/hooks/useTeacherQueries";
import { classLabel } from "@/services/teacherService";
import type { RemarkType, StudentProgress } from "@/types/school";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Modal,
  PageHeader,
  PageShell,
  Panel,
  Pill,
  SummaryCard,
  SummaryGrid,
  errorMessage,
  fmtDate,
  inputClass,
  primaryBtn,
  secondaryBtn,
} from "@/components/shared/PageKit";
import {
  ASSIGNMENT_THRESHOLD,
  ATTENDANCE_THRESHOLD,
  BAND_STYLE,
  MARKS_THRESHOLD,
  attentionReasons,
  performanceBand,
  pctTone,
  type Band,
} from "./progressUtils";

type SortKey = "roll" | "average" | "attendance";

const TrendIcon = ({ trend }: { trend: StudentProgress["trend"] }) =>
  trend === "up" ? (
    <ArrowUpRight size={17} className="text-green-600" aria-label="Improving" />
  ) : trend === "down" ? (
    <ArrowDownRight size={17} className="text-red-600" aria-label="Dropping" />
  ) : (
    <ArrowRight size={17} className="text-gray-400" aria-label="Steady" />
  );

export default function StudentProgressPage() {
  const { data = [], isLoading, isError, error, refetch } = useStudentProgress();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [band, setBand] = useState<"All" | Band>("All");
  const [sort, setSort] = useState<SortKey>("roll");
  const selectedId = params.get("student");

  const selected = data.find((p) => p.student.id === selectedId) ?? null;
  const openStudent = (id: string | null) => setParams(id ? { student: id } : {}, { replace: true });

  const stats = useMemo(() => {
    if (!data.length) return null;
    const avg = (f: (p: StudentProgress) => number) => Math.round(data.reduce((s, p) => s + f(p), 0) / data.length);
    const top = [...data].sort((a, b) => b.averagePercent - a.averagePercent)[0];
    return {
      classAvg: avg((p) => p.averagePercent),
      attendance: avg((p) => p.attendancePercent),
      atRisk: data.filter((p) => performanceBand(p) === "At Risk").length,
      top,
    };
  }, [data]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = data.filter(
      (p) =>
        (band === "All" || performanceBand(p) === band) &&
        (!q || `${p.student.name} ${p.student.rollNo}`.toLowerCase().includes(q)),
    );
    return list.sort((a, b) =>
      sort === "average"
        ? b.averagePercent - a.averagePercent
        : sort === "attendance"
          ? a.attendancePercent - b.attendancePercent
          : a.student.rollNo - b.student.rollNo,
    );
  }, [data, search, band, sort]);

  return (
    <PageShell>
      <PageHeader
        icon={<TrendingUp size={25} />}
        title="Student Progress"
        description={
          data[0] ? `Academic progress of every student in ${classLabel(data[0].student)}.` : "Academic progress of your class."
        }
      />

      {isLoading ? (
        <LoadingState label="Loading progress..." />
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={refetch} />
      ) : (
        <>
          {stats && (
            <SummaryGrid>
              <SummaryCard title="Class Average" value={`${stats.classAvg}%`} icon={<Percent size={21} />} color="bg-blue-50 text-blue-600" />
              <SummaryCard
                title="Avg Attendance"
                value={`${stats.attendance}%`}
                icon={<CalendarCheck size={21} />}
                color="bg-green-50 text-green-600"
              />
              <SummaryCard
                title="At Risk"
                value={stats.atRisk}
                hint={`< ${ATTENDANCE_THRESHOLD}% attendance or < ${MARKS_THRESHOLD}% marks`}
                icon={<AlertTriangle size={21} />}
                color="bg-red-50 text-red-600"
              />
              <SummaryCard
                title="Top Performer"
                value={`${stats.top.averagePercent}%`}
                hint={stats.top.student.name}
                icon={<Award size={21} />}
                color="bg-amber-50 text-amber-600"
              />
            </SummaryGrid>
          )}

          <Panel
            title="Class Performance"
            description="Click a student to see subject-wise marks and add remarks."
            bodyClassName="p-0"
            actions={
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <div className="relative sm:w-52">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className={`${inputClass} py-2 pl-9`}
                    placeholder="Search name or roll"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select className={`${inputClass} py-2 sm:w-36`} value={band} onChange={(e) => setBand(e.target.value as typeof band)} aria-label="Filter by band">
                  <option value="All">All bands</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Average</option>
                  <option>At Risk</option>
                </select>
                <select className={`${inputClass} py-2 sm:w-44`} value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
                  <option value="roll">Sort: Roll no.</option>
                  <option value="average">Sort: Highest average</option>
                  <option value="attendance">Sort: Lowest attendance</option>
                </select>
              </div>
            }
          >
            {rows.length === 0 ? (
              <EmptyState title="No students match" description="Try another filter." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead>
                    <tr className="border-b border-[#F0EDE4] text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3">Roll</th>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3 text-right">Attendance</th>
                      <th className="px-5 py-3 text-right">Average</th>
                      <th className="px-5 py-3 text-right">Assignments</th>
                      <th className="px-5 py-3 text-center">Grade</th>
                      <th className="px-5 py-3 text-center">Trend</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => {
                      const b = performanceBand(p);
                      return (
                        <tr
                          key={p.student.id}
                          onClick={() => openStudent(p.student.id)}
                          className="cursor-pointer border-b border-[#F7F5EF] transition last:border-0 hover:bg-[#FBF9F3]"
                        >
                          <td className="px-5 py-3 font-semibold text-gray-500">{p.student.rollNo}</td>
                          <td className="px-5 py-3">
                            <p className="font-semibold text-[#0F1B33]">{p.student.name}</p>
                            {p.remarks.length > 0 && (
                              <p className="text-xs text-gray-400">
                                {p.remarks.length} remark{p.remarks.length > 1 ? "s" : ""}
                              </p>
                            )}
                          </td>
                          <td className={cn("px-5 py-3 text-right font-semibold", pctTone(p.attendancePercent, ATTENDANCE_THRESHOLD, 90))}>
                            {p.attendancePercent}%
                          </td>
                          <td className={cn("px-5 py-3 text-right font-semibold", pctTone(p.averagePercent, MARKS_THRESHOLD, 75))}>
                            {p.averagePercent}%
                          </td>
                          <td className={cn("px-5 py-3 text-right font-semibold", pctTone(p.assignmentCompletion, ASSIGNMENT_THRESHOLD, 85))}>
                            {p.assignmentCompletion}%
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-[#0F1B33]">{p.grade}</td>
                          <td className="px-5 py-3">
                            <span className="flex justify-center">
                              <TrendIcon trend={p.trend} />
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <Pill className={BAND_STYLE[b]}>{b}</Pill>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      )}

      <StudentDetail progress={selected} onClose={() => openStudent(null)} />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */

const REMARK_STYLE: Record<RemarkType, string> = {
  Positive: "bg-green-50 text-green-700",
  Concern: "bg-red-50 text-red-700",
  General: "bg-gray-100 text-gray-700",
};

function StudentDetail({ progress, onClose }: { progress: StudentProgress | null; onClose: () => void }) {
  const navigate = useNavigate();
  const addRemark = useAddRemark();
  const deleteRemark = useDeleteRemark();
  const [remark, setRemark] = useState({ type: "General" as RemarkType, text: "", visibleToParent: true });
  const [remarkError, setRemarkError] = useState("");

  useEffect(() => {
    setRemark({ type: "General", text: "", visibleToParent: true });
    setRemarkError("");
  }, [progress?.student.id]);

  const latestExam = progress?.subjects[0]?.scores.at(-1)?.exam ?? "";
  const subjectData = useMemo(
    () =>
      progress?.subjects.map((s) => ({
        subject: s.subject.replace("Social Science", "SST").replace("Computer Science", "CS"),
        score: s.scores.at(-1)?.percent ?? 0,
      })) ?? [],
    [progress],
  );
  const examTrend = useMemo(() => {
    if (!progress) return [];
    return progress.subjects[0].scores.map((sc, i) => ({
      exam: sc.exam,
      average: Math.round(progress.subjects.reduce((s, sub) => s + sub.scores[i].percent, 0) / progress.subjects.length),
    }));
  }, [progress]);

  if (!progress) return null;
  const { student } = progress;
  const reasons = attentionReasons(progress);

  const saveRemark = () => {
    if (remark.text.trim().length < 5) {
      setRemarkError("Please write at least 5 characters.");
      return;
    }
    setRemarkError("");
    addRemark.mutate(
      { studentId: student.id, ...remark, text: remark.text.trim() },
      {
        onSuccess: () => {
          toast.success(remark.visibleToParent ? "Remark added and shared with parent" : "Private remark added");
          setRemark({ type: "General", text: "", visibleToParent: true });
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  const removeRemark = async (id: string) => {
    const res = await Swal.fire({
      title: "Delete remark?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (res.isConfirmed) deleteRemark.mutate(id, { onSuccess: () => toast.success("Remark deleted") });
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={`${student.rollNo}. ${student.name}`}
      description={`${classLabel(student)} · ${student.admissionNo} · Parent: ${student.parentName}`}
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={() => navigate(`/teacher/messages?to=${student.parentId}`)}>
            <MessageSquare size={16} /> Message Parent
          </button>
          <button type="button" className={primaryBtn} onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Attendance" value={`${progress.attendancePercent}%`} tone={pctTone(progress.attendancePercent, ATTENDANCE_THRESHOLD, 90)} />
          <MiniStat label="Average" value={`${progress.averagePercent}%`} tone={pctTone(progress.averagePercent, MARKS_THRESHOLD, 75)} />
          <MiniStat label="Assignments" value={`${progress.assignmentCompletion}%`} tone={pctTone(progress.assignmentCompletion, ASSIGNMENT_THRESHOLD, 85)} />
          <MiniStat label="Grade" value={progress.grade} tone="text-[#0F1B33]" />
        </div>

        {reasons.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm text-red-800">
            <AlertTriangle size={16} /> Needs attention:
            {reasons.map((r) => (
              <Pill key={r} className="bg-white text-red-700">
                {r}
              </Pill>
            ))}
          </div>
        )}

        {/* charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#F0EDE4] p-3">
            <p className="mb-2 text-sm font-semibold text-[#0F1B33]">Subject-wise · {latestExam}</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE4" />
                  <XAxis dataKey="subject" fontSize={11} tickLine={false} axisLine={false} interval={0} />
                  <YAxis domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Score"]} cursor={{ fill: "#FBF9F3" }} />
                  <Bar dataKey="score" fill="#2463d4" radius={[5, 5, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-[#F0EDE4] p-3">
            <p className="mb-2 text-sm font-semibold text-[#0F1B33]">Average across exams</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={examTrend} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE4" />
                  <XAxis dataKey="exam" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Average"]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="average" name="Average %" stroke="#C6952F" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* marks table */}
        <div className="overflow-x-auto rounded-xl border border-[#F0EDE4]">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-[#F0EDE4] bg-[#FBF9F3] text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2.5">Subject</th>
                {progress.subjects[0].scores.map((s) => (
                  <th key={s.exam} className="px-4 py-2.5 text-right">
                    {s.exam}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {progress.subjects.map((s) => (
                <tr key={s.subject} className="border-b border-[#F7F5EF] last:border-0">
                  <td className="px-4 py-2.5 font-medium text-[#0F1B33]">{s.subject}</td>
                  {s.scores.map((sc) => (
                    <td key={sc.exam} className={cn("px-4 py-2.5 text-right font-semibold", pctTone(sc.percent, MARKS_THRESHOLD, 75))}>
                      {sc.percent}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* remarks */}
        <div>
          <p className="mb-3 font-semibold text-[#0F1B33]">Class Teacher Remarks</p>
          <div className="rounded-xl border border-[#F0EDE4] p-4">
            <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
              <Field label="Type">
                <select
                  className={inputClass}
                  value={remark.type}
                  onChange={(e) => setRemark({ ...remark, type: e.target.value as RemarkType })}
                >
                  <option>General</option>
                  <option>Positive</option>
                  <option>Concern</option>
                </select>
              </Field>
              <Field label="Remark" error={remarkError}>
                <textarea
                  className={`${inputClass} min-h-[70px] resize-y`}
                  value={remark.text}
                  maxLength={500}
                  onChange={(e) => setRemark({ ...remark, text: e.target.value })}
                  placeholder="e.g. Participates actively in class discussions."
                />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#0F1B33]"
                  checked={remark.visibleToParent}
                  onChange={(e) => setRemark({ ...remark, visibleToParent: e.target.checked })}
                />
                Visible to parent
              </label>
              <button type="button" className={primaryBtn} onClick={saveRemark} disabled={addRemark.isPending}>
                <Plus size={16} /> Add Remark
              </button>
            </div>
          </div>

          {progress.remarks.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No remarks yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {progress.remarks.map((r) => (
                <li key={r.id} className="flex items-start gap-3 rounded-xl bg-[#FBF9F3] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill className={REMARK_STYLE[r.type]}>{r.type}</Pill>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        {r.visibleToParent ? <Eye size={12} /> : <EyeOff size={12} />}
                        {r.visibleToParent ? "Shared with parent" : "Private"}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDate(r.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-gray-700">{r.text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRemark(r.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete remark"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl bg-[#FBF9F3] px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn("mt-1 text-xl font-bold", tone)}>{value}</p>
    </div>
  );
}
