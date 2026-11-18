import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellRing,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Phone,
  Search,
  Send,
  Smartphone,
  Users,
  UsersRound,
  Video,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import {
  useBroadcasts,
  useClassStudents,
  usePtms,
  useSchedulePtm,
  useSendBroadcast,
  useUpdatePtmStatus,
} from "@/hooks/useTeacherQueries";
import type { BroadcastChannel, PtmMeeting, RsvpStatus, Student } from "@/types/school";
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
  Tabs,
  errorMessage,
  fmtDate,
  fmtRelative,
  inputClass,
  primaryBtn,
  secondaryBtn,
} from "@/components/shared/PageKit";

type Tab = "announce" | "ptm" | "directory";

export default function ParentCommunication() {
  const [tab, setTab] = useState<Tab>("announce");
  const students = useClassStudents();
  const ptms = usePtms();
  const upcomingPtms = (ptms.data ?? []).filter((p) => p.status === "Scheduled").length;

  return (
    <PageShell>
      <PageHeader
        icon={<UsersRound size={25} />}
        title="Parent Communication"
        description="Announcements, parent-teacher meetings and contacts for your class."
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "announce", label: "Announcements" },
          { value: "ptm", label: "PTM Meetings", count: upcomingPtms || undefined },
          { value: "directory", label: "Parent Directory", count: students.data?.length },
        ]}
      />

      {students.isLoading ? (
        <LoadingState />
      ) : students.isError ? (
        <ErrorState message={errorMessage(students.error)} onRetry={students.refetch} />
      ) : (
        <>
          {tab === "announce" && <AnnouncementsTab students={students.data!} />}
          {tab === "ptm" && <PtmTab students={students.data!} />}
          {tab === "directory" && <DirectoryTab students={students.data!} />}
        </>
      )}
    </PageShell>
  );
}

/* ================================================================== */
/* Announcements                                                       */
/* ================================================================== */

const TEMPLATES: { label: string; subject: string; body: string }[] = [
  {
    label: "Exam reminder",
    subject: "Upcoming examination",
    body: "Dear parents, exams are approaching. Please make sure your ward revises daily and gets enough rest. The timetable is available in the app.",
  },
  {
    label: "Homework pending",
    subject: "Pending homework",
    body: "Dear parent, your ward has pending homework/assignments. Kindly ensure they are completed and submitted by Monday.",
  },
  {
    label: "Absent today",
    subject: "Absent from school today",
    body: "Dear parent, your ward was marked absent today. Please send a leave note or contact the class teacher if this is unexpected.",
  },
  {
    label: "Holiday notice",
    subject: "School holiday",
    body: "Dear parents, the school will remain closed tomorrow. Classes will resume as usual on the next working day.",
  },
];

const CHANNELS: { value: BroadcastChannel; label: string; icon: React.ReactNode }[] = [
  { value: "App", label: "App", icon: <Smartphone size={14} /> },
  { value: "SMS", label: "SMS", icon: <MessageSquare size={14} /> },
  { value: "Email", label: "Email", icon: <Mail size={14} /> },
];

const emptyBroadcast = {
  subject: "",
  body: "",
  channels: ["App"] as BroadcastChannel[],
  audience: "all" as "all" | "selected",
  studentIds: [] as string[],
};

function AnnouncementsTab({ students }: { students: Student[] }) {
  const history = useBroadcasts();
  const send = useSendBroadcast();
  const [form, setForm] = useState(emptyBroadcast);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pickerOpen, setPickerOpen] = useState(false);

  const recipientCount = form.audience === "all" ? students.length : form.studentIds.length;
  const nameById = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);

  const toggleChannel = (c: BroadcastChannel) =>
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(c) ? f.channels.filter((x) => x !== c) : [...f.channels, c],
    }));

  const submit = async () => {
    const e: Record<string, string> = {};
    if (form.subject.trim().length < 3) e.subject = "Subject is required.";
    if (form.body.trim().length < 10) e.body = "Message is too short (min 10 characters).";
    if (!form.channels.length) e.channels = "Choose at least one channel.";
    if (form.audience === "selected" && !form.studentIds.length) e.audience = "Select at least one student.";
    if (form.channels.includes("SMS") && form.body.length > 320) e.body = "SMS messages are limited to 320 characters.";
    setErrors(e);
    if (Object.keys(e).length) return;

    const ok = await Swal.fire({
      title: `Send to ${recipientCount} parent${recipientCount > 1 ? "s" : ""}?`,
      text: `Via ${form.channels.join(", ")}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Send",
      confirmButtonColor: "#0F1B33",
    });
    if (!ok.isConfirmed) return;

    send.mutate(
      {
        subject: form.subject.trim(),
        body: form.body.trim(),
        channels: form.channels,
        studentIds: form.audience === "all" ? [] : form.studentIds,
      },
      {
        onSuccess: () => {
          toast.success("Announcement sent");
          setForm(emptyBroadcast);
          setErrors({});
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Panel title="New Announcement" description="Parents receive this in the app and any extra channels you choose.">
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-gray-600">Quick templates</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, subject: t.subject, body: t.body }))}
                  className="rounded-lg border border-[#E8E4D9] px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-[#F5F3ED]"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-gray-600">
              Recipients <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {(["all", "selected"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={form.audience === a}
                  onClick={() => (a === "selected" ? setPickerOpen(true) : setForm({ ...form, audience: "all" }))}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    form.audience === a ? "border-[#0F1B33] bg-[#0F1B33] text-white" : "border-[#E8E4D9] text-gray-600 hover:bg-[#F5F3ED]",
                  )}
                >
                  {a === "all" ? `All parents (${students.length})` : "Selected students"}
                </button>
              ))}
            </div>
            {form.audience === "selected" && form.studentIds.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                {form.studentIds.length} selected:{" "}
                {form.studentIds
                  .slice(0, 4)
                  .map((id) => nameById.get(id))
                  .join(", ")}
                {form.studentIds.length > 4 && ` +${form.studentIds.length - 4} more`} ·{" "}
                <button type="button" className="font-semibold text-[#2463d4]" onClick={() => setPickerOpen(true)}>
                  Edit
                </button>
              </p>
            )}
            {errors.audience && <p className="mt-1 text-xs text-red-600">{errors.audience}</p>}
          </div>

          <Field label="Subject" required error={errors.subject}>
            <input
              className={inputClass}
              value={form.subject}
              maxLength={100}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </Field>

          <Field
            label="Message"
            required
            error={errors.body}
            hint={`${form.body.length} characters${form.channels.includes("SMS") ? " · SMS limit 320" : ""}`}
          >
            <textarea
              className={`${inputClass} min-h-[130px] resize-y`}
              value={form.body}
              maxLength={1000}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </Field>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-gray-600">Send via</p>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => {
                const active = form.channels.includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleChannel(c.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                      active ? "border-[#2463d4] bg-blue-50 text-[#2463d4]" : "border-[#E8E4D9] text-gray-500 hover:bg-[#F5F3ED]",
                    )}
                  >
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>
            {errors.channels && <p className="mt-1 text-xs text-red-600">{errors.channels}</p>}
          </div>

          <button type="button" className={`${primaryBtn} w-full`} onClick={submit} disabled={send.isPending}>
            <Send size={16} /> {send.isPending ? "Sending..." : `Send to ${recipientCount} parent${recipientCount === 1 ? "" : "s"}`}
          </button>
        </div>
      </Panel>

      <Panel title="Sent Announcements" bodyClassName="p-0">
        {history.isLoading ? (
          <LoadingState />
        ) : history.isError ? (
          <ErrorState message={errorMessage(history.error)} onRetry={history.refetch} />
        ) : !history.data?.length ? (
          <EmptyState title="Nothing sent yet" />
        ) : (
          <ul className="max-h-[640px] divide-y divide-[#F7F5EF] overflow-y-auto">
            {history.data.map((b) => {
              const readPct = Math.round((b.readCount / b.recipientCount) * 100);
              return (
                <li key={b.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-[#0F1B33]">{b.subject}</p>
                    <span className="shrink-0 text-xs text-gray-400">{fmtRelative(b.sentAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{b.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <Pill className="bg-[#F5F3ED] text-[#0F1B33]">
                      <Users size={12} /> {b.studentIds.length ? `${b.recipientCount} selected` : `All ${b.recipientCount}`}
                    </Pill>
                    {b.channels.map((c) => (
                      <Pill key={c} className="bg-blue-50 text-blue-700">
                        {c}
                      </Pill>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full bg-green-500" style={{ width: `${readPct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">
                      Read by {b.readCount}/{b.recipientCount}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <StudentPicker
        open={pickerOpen}
        students={students}
        initial={form.studentIds}
        onClose={() => setPickerOpen(false)}
        onConfirm={(ids) => {
          setForm((f) => ({ ...f, audience: ids.length ? "selected" : "all", studentIds: ids }));
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

function StudentPicker({
  open,
  students,
  initial,
  onClose,
  onConfirm,
}: {
  open: boolean;
  students: Student[];
  initial: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [search, setSearch] = useState("");
  const [lastOpen, setLastOpen] = useState(open);

  // reset selection each time the picker opens
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setSelected(new Set(initial));
      setSearch("");
    }
  }

  const list = students.filter((s) => `${s.name} ${s.rollNo}`.toLowerCase().includes(search.trim().toLowerCase()));
  const allVisibleSelected = list.length > 0 && list.every((s) => selected.has(s.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      list.forEach((s) => (allVisibleSelected ? next.delete(s.id) : next.add(s.id)));
      return next;
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select Students"
      description="Their parents will receive the announcement."
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={primaryBtn} onClick={() => onConfirm([...selected])}>
            Done ({selected.size})
          </button>
        </>
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className={`${inputClass} pl-9`} placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button type="button" className={secondaryBtn} onClick={toggleAll}>
          {allVisibleSelected ? "Clear" : "Select all"}
        </button>
      </div>
      <ul className="max-h-[50dvh] divide-y divide-[#F7F5EF] overflow-y-auto rounded-xl border border-[#F0EDE4]">
        {list.map((s) => (
          <li key={s.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-[#FBF9F3]">
              <input type="checkbox" className="h-4 w-4 accent-[#0F1B33]" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
              <span className="w-6 text-xs font-semibold text-gray-400">{s.rollNo}</span>
              <span className="flex-1 text-sm font-medium text-[#0F1B33]">{s.name}</span>
              <span className="text-xs text-gray-500">{s.parentName}</span>
            </label>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

/* ================================================================== */
/* PTM                                                                 */
/* ================================================================== */

const PTM_STATUS_STYLE: Record<PtmMeeting["status"], string> = {
  Scheduled: "bg-blue-50 text-blue-700",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

const RSVP_STYLE: Record<RsvpStatus, string> = {
  Confirmed: "bg-green-50 text-green-700",
  Declined: "bg-red-50 text-red-700",
  Awaiting: "bg-amber-50 text-amber-700",
};

function PtmTab({ students }: { students: Student[] }) {
  const ptms = usePtms();
  const updateStatus = useUpdatePtmStatus();
  const sendBroadcast = useSendBroadcast();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [rsvpFor, setRsvpFor] = useState<PtmMeeting | null>(null);

  const changeStatus = async (p: PtmMeeting, status: PtmMeeting["status"]) => {
    const res = await Swal.fire({
      title: status === "Cancelled" ? "Cancel this meeting?" : "Mark meeting as completed?",
      text: status === "Cancelled" ? "Parents will be notified about the cancellation." : p.title,
      icon: status === "Cancelled" ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: status === "Cancelled" ? "Cancel meeting" : "Mark completed",
      cancelButtonText: "Back",
      confirmButtonColor: status === "Cancelled" ? "#dc2626" : "#0F1B33",
    });
    if (!res.isConfirmed) return;
    updateStatus.mutate(
      { id: p.id, status },
      {
        onSuccess: () => toast.success(status === "Cancelled" ? "Meeting cancelled" : "Meeting marked completed"),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  const remind = (p: PtmMeeting) => {
    const awaiting = p.rsvps.filter((r) => r.status === "Awaiting").map((r) => r.studentId);
    if (!awaiting.length) {
      toast.info("Everyone has already responded.");
      return;
    }
    sendBroadcast.mutate(
      {
        subject: `Reminder: ${p.title}`,
        body: `Dear parent, please confirm your attendance for the PTM on ${fmtDate(p.date)} (${p.startTime}–${p.endTime}) at ${p.venue}.`,
        channels: ["App", "SMS"],
        studentIds: awaiting,
      },
      {
        onSuccess: () => toast.success(`Reminder sent to ${awaiting.length} parent${awaiting.length > 1 ? "s" : ""}`),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className={primaryBtn} onClick={() => setScheduleOpen(true)}>
          <CalendarPlus size={17} /> Schedule PTM
        </button>
      </div>

      {ptms.isLoading ? (
        <LoadingState />
      ) : ptms.isError ? (
        <ErrorState message={errorMessage(ptms.error)} onRetry={ptms.refetch} />
      ) : !ptms.data?.length ? (
        <Panel>
          <EmptyState title="No meetings yet" description="Schedule your first parent-teacher meeting." />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {ptms.data.map((p) => {
            const c = (s: RsvpStatus) => p.rsvps.filter((r) => r.status === s).length;
            const total = p.rsvps.length || 1;
            return (
              <article key={p.id} className="rounded-2xl border border-[#E8E4D9] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#0F1B33]">{p.title}</h3>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock size={15} />
                        {fmtDate(p.date, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })} · {p.startTime}–{p.endTime}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        {p.mode === "Online" ? <Video size={15} /> : <MapPin size={15} />}
                        {p.venue}
                      </span>
                    </p>
                  </div>
                  <Pill className={PTM_STATUS_STYLE[p.status]}>{p.status}</Pill>
                </div>

                <p className="mt-3 text-sm text-gray-600">{p.agenda}</p>

                <div className="mt-4">
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="bg-green-500" style={{ width: `${(c("Confirmed") / total) * 100}%` }} />
                    <div className="bg-red-400" style={{ width: `${(c("Declined") / total) * 100}%` }} />
                    <div className="bg-amber-300" style={{ width: `${(c("Awaiting") / total) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    {c("Confirmed")} confirmed · {c("Declined")} declined · {c("Awaiting")} awaiting
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-[#F0EDE4] pt-4">
                  <button type="button" className={`${secondaryBtn} px-3 py-2 text-xs`} onClick={() => setRsvpFor(p)}>
                    <Users size={14} /> RSVPs
                  </button>
                  {p.status === "Scheduled" && (
                    <>
                      <button
                        type="button"
                        className={`${secondaryBtn} px-3 py-2 text-xs`}
                        onClick={() => remind(p)}
                        disabled={sendBroadcast.isPending}
                      >
                        <BellRing size={14} /> Remind pending
                      </button>
                      <button type="button" className={`${secondaryBtn} px-3 py-2 text-xs`} onClick={() => changeStatus(p, "Completed")}>
                        <CheckCircle2 size={14} /> Mark completed
                      </button>
                      <button
                        type="button"
                        className={`${secondaryBtn} px-3 py-2 text-xs text-red-600`}
                        onClick={() => changeStatus(p, "Cancelled")}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <SchedulePtmModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />

      <Modal
        open={!!rsvpFor}
        onClose={() => setRsvpFor(null)}
        title={rsvpFor ? `RSVPs · ${rsvpFor.title}` : ""}
        description={rsvpFor ? fmtDate(rsvpFor.date) : ""}
      >
        <ul className="divide-y divide-[#F7F5EF]">
          {rsvpFor?.rsvps.map((r) => {
            const s = students.find((x) => x.id === r.studentId);
            return (
              <li key={r.studentId} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F1B33]">{s?.parentName ?? r.studentId}</p>
                  <p className="truncate text-xs text-gray-500">Parent of {s?.name}</p>
                </div>
                <Pill className={RSVP_STYLE[r.status]}>{r.status}</Pill>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const emptyPtm = () => ({
  title: "",
  date: "",
  startTime: "10:00",
  endTime: "13:00",
  mode: "In Person" as PtmMeeting["mode"],
  venue: "",
  agenda: "",
});

function SchedulePtmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const schedule = useSchedulePtm();
  const [form, setForm] = useState(emptyPtm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const close = () => {
    setForm(emptyPtm());
    setErrors({});
    onClose();
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 3) e.title = "Title is required.";
    if (!form.date) e.date = "Pick a date.";
    else if (form.date < todayISO()) e.date = "Date can't be in the past.";
    else if (new Date(`${form.date}T00:00:00`).getDay() === 0) e.date = "Sunday is a holiday.";
    if (form.endTime <= form.startTime) e.endTime = "End time must be after start time.";
    if (!form.venue.trim()) e.venue = form.mode === "Online" ? "Add the meeting link." : "Add the venue.";
    if (form.agenda.trim().length < 10) e.agenda = "Add a short agenda (min 10 characters).";
    setErrors(e);
    if (Object.keys(e).length) return;

    schedule.mutate(
      { ...form, title: form.title.trim(), venue: form.venue.trim(), agenda: form.agenda.trim() },
      {
        onSuccess: () => {
          toast.success("PTM scheduled — invitations sent to all parents");
          close();
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Schedule PTM"
      description="All parents of your class will be invited."
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={close}>
            Cancel
          </button>
          <button type="button" className={primaryBtn} onClick={submit} disabled={schedule.isPending}>
            <Megaphone size={16} /> {schedule.isPending ? "Scheduling..." : "Schedule & Invite"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" required error={errors.title}>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Half Yearly Result PTM"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date" required error={errors.date}>
            <input type="date" min={todayISO()} className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Start" required>
            <input type="time" className={inputClass} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </Field>
          <Field label="End" required error={errors.endTime}>
            <input type="time" className={inputClass} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <Field label="Mode">
            <select
              className={inputClass}
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value as PtmMeeting["mode"] })}
            >
              <option>In Person</option>
              <option>Online</option>
            </select>
          </Field>
          <Field label={form.mode === "Online" ? "Meeting link" : "Venue"} required error={errors.venue}>
            <input
              className={inputClass}
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder={form.mode === "Online" ? "https://meet.example.com/..." : "Room B-204"}
            />
          </Field>
        </div>
        <Field label="Agenda" required error={errors.agenda}>
          <textarea
            className={`${inputClass} min-h-[90px] resize-y`}
            value={form.agenda}
            maxLength={500}
            onChange={(e) => setForm({ ...form, agenda: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ================================================================== */
/* Directory                                                           */
/* ================================================================== */

function DirectoryTab({ students }: { students: Student[] }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const list = students.filter((s) =>
    `${s.name} ${s.parentName} ${s.parentPhone} ${s.rollNo}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Panel
      title="Parent Directory"
      description="Contact details are shared only with the class teacher."
      bodyClassName="p-0"
      actions={
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className={`${inputClass} py-2 pl-9`}
            placeholder="Search student, parent or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[#F0EDE4] text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Roll</th>
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Parent</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-b border-[#F7F5EF] last:border-0">
                <td className="px-5 py-3 font-semibold text-gray-500">{s.rollNo}</td>
                <td className="px-5 py-3 font-semibold text-[#0F1B33]">{s.name}</td>
                <td className="px-5 py-3 text-gray-700">{s.parentName}</td>
                <td className="whitespace-nowrap px-5 py-3 text-gray-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400" /> {s.parentPhone}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700">{s.parentEmail}</td>
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
        {list.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No matches.</p>}
      </div>
    </Panel>
  );
}
