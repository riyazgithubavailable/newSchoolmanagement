import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Clock,
  LogIn,
  LogOut,
  Percent,
  Plane,
} from "lucide-react";
import { toast } from "sonner";

import { useCheckInOut, useMyAttendance } from "@/hooks/useTeacherQueries";
import type { StaffAttendanceRecord, StaffAttendanceStatus } from "@/types/school";
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
  secondaryBtn,
} from "@/components/shared/PageKit";

const STATUS_STYLE: Record<StaffAttendanceStatus, { cell: string; pill: string }> = {
  Present: { cell: "bg-green-100 text-green-800", pill: "bg-green-50 text-green-700" },
  Late: { cell: "bg-amber-100 text-amber-800", pill: "bg-amber-50 text-amber-700" },
  "Half Day": { cell: "bg-sky-100 text-sky-800", pill: "bg-sky-50 text-sky-700" },
  Absent: { cell: "bg-red-100 text-red-800", pill: "bg-red-50 text-red-700" },
  "On Leave": { cell: "bg-purple-100 text-purple-800", pill: "bg-purple-50 text-purple-700" },
  Holiday: { cell: "bg-pink-50 text-pink-700", pill: "bg-pink-50 text-pink-700" },
  Weekend: { cell: "bg-gray-50 text-gray-400", pill: "bg-gray-100 text-gray-500" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function hoursWorked(r: StaffAttendanceRecord) {
  if (!r.checkIn || !r.checkOut) return "—";
  const [ih, im] = r.checkIn.split(":").map(Number);
  const [oh, om] = r.checkOut.split(":").map(Number);
  const mins = oh * 60 + om - (ih * 60 + im);
  return mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "—";
}

export default function TeacherMyAttendance() {
  const { data, isLoading, isError, error, refetch } = useMyAttendance();
  const { checkIn, checkOut } = useCheckInOut();

  const now = new Date();
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  const byDate = useMemo(() => {
    const map = new Map<string, StaffAttendanceRecord>();
    data?.records.forEach((r) => map.set(r.date, r));
    if (data?.today) map.set(data.today.date, data.today);
    return map;
  }, [data]);

  const earliest = useMemo(() => {
    const first = data?.records[0]?.date;
    return first ? new Date(`${first.slice(0, 7)}-01T00:00:00`) : month;
  }, [data, month]);

  const isCurrentMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  const canGoBack = month > earliest;

  const monthRecords = useMemo(() => {
    const prefix = toKey(month).slice(0, 7);
    return [...byDate.values()].filter((r) => r.date.startsWith(prefix)).sort((a, b) => b.date.localeCompare(a.date));
  }, [byDate, month]);

  const stats = useMemo(() => {
    const count = (s: StaffAttendanceStatus) => monthRecords.filter((r) => r.status === s).length;
    const present = count("Present");
    const late = count("Late");
    const half = count("Half Day");
    const absent = count("Absent");
    const leave = count("On Leave");
    const working = present + late + half + absent + leave;
    const percent = working ? Math.round(((present + late + half * 0.5) / working) * 100) : 0;
    return { present, late, half, absent, leave, percent };
  }, [monthRecords]);

  /* calendar cells: leading blanks + days of month */
  const cells = useMemo(() => {
    const first = new Date(month);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out: (Date | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(month.getFullYear(), month.getMonth(), d));
    return out;
  }, [month]);

  const shiftMonth = (delta: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const today = data?.today ?? null;
  const isSunday = now.getDay() === 0;

  const doCheckIn = () =>
    checkIn.mutate(undefined, {
      onSuccess: (r) =>
        r.status === "Late"
          ? toast.warning(`Checked in at ${r.checkIn} — marked late (school starts ${data?.schoolStartTime})`)
          : toast.success(`Checked in at ${r.checkIn}`),
      onError: (e) => toast.error(errorMessage(e)),
    });

  const doCheckOut = () =>
    checkOut.mutate(undefined, {
      onSuccess: (r) => toast.success(`Checked out at ${r.checkOut}`),
      onError: (e) => toast.error(errorMessage(e)),
    });

  if (isLoading)
    return (
      <PageShell>
        <LoadingState label="Loading attendance..." />
      </PageShell>
    );
  if (isError || !data)
    return (
      <PageShell>
        <ErrorState message={errorMessage(error)} onRetry={refetch} />
      </PageShell>
    );

  return (
    <PageShell>
      <PageHeader
        icon={<CalendarCheck size={25} />}
        title="My Attendance"
        description="Your daily check-in record and monthly attendance summary."
      />

      {/* Today */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-[#0F1B33] p-5 text-white shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm text-white/70">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="mt-1 text-xl font-bold">
            {isSunday
              ? "It's Sunday — no check-in needed"
              : !today
                ? "You haven't checked in yet"
                : today.checkOut
                  ? "Day complete. See you tomorrow!"
                  : `Checked in · ${today.status}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} /> School starts {data.schoolStartTime}
            </span>
            {today?.checkIn && (
              <span className="inline-flex items-center gap-1.5">
                <LogIn size={15} /> In {today.checkIn}
              </span>
            )}
            {today?.checkOut && (
              <span className="inline-flex items-center gap-1.5">
                <LogOut size={15} /> Out {today.checkOut}
              </span>
            )}
          </div>
        </div>
        {!isSunday && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={doCheckIn}
              disabled={!!today || checkIn.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#C6952F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b3842a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LogIn size={17} /> Check In
            </button>
            <button
              type="button"
              onClick={doCheckOut}
              disabled={!today?.checkIn || !!today?.checkOut || checkOut.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LogOut size={17} /> Check Out
            </button>
          </div>
        )}
      </div>

      <SummaryGrid>
        <SummaryCard
          title="Attendance"
          value={`${stats.percent}%`}
          hint={month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          icon={<Percent size={21} />}
          color="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          title="Present"
          value={stats.present + stats.late}
          hint={`${stats.late} late · ${stats.half} half day`}
          icon={<CalendarCheck size={21} />}
          color="bg-green-50 text-green-600"
        />
        <SummaryCard title="Absent" value={stats.absent} icon={<CalendarX size={21} />} color="bg-red-50 text-red-600" />
        <SummaryCard title="On Leave" value={stats.leave} icon={<Plane size={21} />} color="bg-purple-50 text-purple-600" />
      </SummaryGrid>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Calendar */}
        <Panel
          title={month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          actions={
            <div className="flex gap-1">
              <button
                type="button"
                className={`${secondaryBtn} px-2.5`}
                onClick={() => shiftMonth(-1)}
                disabled={!canGoBack}
                aria-label="Previous month"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                className={`${secondaryBtn} px-2.5`}
                onClick={() => shiftMonth(1)}
                disabled={isCurrentMonth}
                aria-label="Next month"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-1 text-[11px] font-semibold uppercase text-gray-400">
                {d}
              </div>
            ))}
            {cells.map((d, i) => {
              if (!d) return <div key={`b${i}`} />;
              const key = toKey(d);
              const rec = byDate.get(key);
              const isToday = key === toKey(now);
              const future = d > now && !isToday;
              return (
                <div
                  key={key}
                  title={
                    rec
                      ? `${fmtDate(key)} · ${rec.status}${rec.checkIn ? ` · ${rec.checkIn}–${rec.checkOut ?? "…"}` : ""}${rec.remark ? ` · ${rec.remark}` : ""}`
                      : fmtDate(key)
                  }
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-semibold",
                    rec ? STATUS_STYLE[rec.status].cell : future ? "text-gray-300" : "bg-[#FBF9F3] text-gray-400",
                    isToday && "ring-2 ring-[#0F1B33] ring-offset-1",
                  )}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(STATUS_STYLE) as StaffAttendanceStatus[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                <span className={cn("h-3 w-3 rounded", STATUS_STYLE[s].cell)} /> {s}
              </span>
            ))}
          </div>
        </Panel>

        {/* Log */}
        <Panel title="Daily Log" description="Most recent first." bodyClassName="p-0">
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full min-w-[440px] text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-[#F0EDE4] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">In</th>
                  <th className="px-4 py-3">Out</th>
                  <th className="px-4 py-3">Hours</th>
                </tr>
              </thead>
              <tbody>
                {monthRecords
                  .filter((r) => r.status !== "Weekend")
                  .map((r) => (
                    <tr key={r.date} className="border-b border-[#F7F5EF] last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-[#0F1B33]">
                        {fmtDate(r.date, { day: "2-digit", month: "short", weekday: "short" })}
                      </td>
                      <td className="px-4 py-3">
                        <Pill className={STATUS_STYLE[r.status].pill}>{r.status}</Pill>
                        {r.remark && <p className="mt-1 text-xs text-gray-400">{r.remark}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{r.checkIn ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{r.checkOut ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{hoursWorked(r)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {monthRecords.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-500">No records for this month.</p>
            )}
          </div>
        </Panel>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Something wrong in your record? Contact the school office or{" "}
        <Link to="/teacher/leave" className="font-medium text-[#0F1B33] underline">
          apply for leave
        </Link>{" "}
        for past absences.
      </p>
    </PageShell>
  );
}
