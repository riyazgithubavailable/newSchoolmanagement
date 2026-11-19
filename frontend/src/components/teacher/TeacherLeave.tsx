import { useMemo, useState } from "react";
import { CalendarOff, CalendarPlus, Paperclip, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { useApplyLeave, useCancelLeave, useLeaveBalances, useLeaveRequests } from "@/hooks/useTeacherQueries";
import { countLeaveDays } from "@/services/teacherService";
import type { LeaveRequest, LeaveStatus, LeaveType } from "@/types/school";
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
  inputClass,
  primaryBtn,
  secondaryBtn,
} from "@/components/shared/PageKit";

const STATUS_STYLE: Record<LeaveStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

const BALANCE_COLOR: Record<LeaveType, string> = {
  "Casual Leave": "bg-blue-500",
  "Sick Leave": "bg-rose-500",
  "Earned Leave": "bg-emerald-500",
  "Unpaid Leave": "bg-gray-400",
};

type Filter = "All" | LeaveStatus;

export default function TeacherLeave() {
  const balances = useLeaveBalances();
  const requests = useLeaveRequests();
  const cancel = useCancelLeave();

  const [filter, setFilter] = useState<Filter>("All");
  const [applyOpen, setApplyOpen] = useState(false);

  const list = useMemo(() => requests.data ?? [], [requests.data]);
  const pendingByType = useMemo(() => {
    const m: Partial<Record<LeaveType, number>> = {};
    list.filter((l) => l.status === "Pending").forEach((l) => (m[l.type] = (m[l.type] ?? 0) + l.days));
    return m;
  }, [list]);

  const filtered = filter === "All" ? list : list.filter((l) => l.status === filter);
  const count = (s: LeaveStatus) => list.filter((l) => l.status === s).length;

  const handleCancel = async (l: LeaveRequest) => {
    const res = await Swal.fire({
      title: "Cancel leave request?",
      text: `${l.type} · ${fmtDate(l.fromDate)} – ${fmtDate(l.toDate)}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "Keep",
      confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;
    cancel.mutate(l.id, {
      onSuccess: () => toast.success("Leave request cancelled"),
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  return (
    <PageShell>
      <PageHeader
        icon={<CalendarOff size={25} />}
        title="Leave"
        description="Check your leave balance and apply for leave. Requests go to the principal for approval."
        actions={
          <button type="button" className={primaryBtn} onClick={() => setApplyOpen(true)}>
            <CalendarPlus size={17} /> Apply Leave
          </button>
        }
      />

      {/* Balances */}
      {balances.isLoading ? (
        <LoadingState label="Loading balances..." />
      ) : balances.isError ? (
        <ErrorState message={errorMessage(balances.error)} onRetry={balances.refetch} />
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {balances.data!
            .filter((b) => b.total > 0)
            .map((b) => {
              const pending = pendingByType[b.type] ?? 0;
              const available = b.total - b.used - pending;
              return (
                <div key={b.type} className="rounded-2xl border border-[#E8E4D9] bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">{b.type}</p>
                  <p className="mt-2 text-2xl font-bold text-[#0F1B33]">
                    {available}
                    <span className="text-sm font-medium text-gray-400"> / {b.total} available</span>
                  </p>
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className={BALANCE_COLOR[b.type]} style={{ width: `${(b.used / b.total) * 100}%` }} />
                    <div className="bg-amber-300" style={{ width: `${(pending / b.total) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {b.used} used{pending ? ` · ${pending} pending` : ""}
                  </p>
                </div>
              );
            })}
        </div>
      )}

      {/* Requests */}
      <Tabs
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: "All", label: "All", count: list.length },
          { value: "Pending", label: "Pending", count: count("Pending") },
          { value: "Approved", label: "Approved", count: count("Approved") },
          { value: "Rejected", label: "Rejected", count: count("Rejected") },
        ]}
      />

      <Panel title="My Leave Requests" bodyClassName="p-0">
        {requests.isLoading ? (
          <LoadingState />
        ) : requests.isError ? (
          <ErrorState message={errorMessage(requests.error)} onRetry={requests.refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No leave requests" description="Requests you apply for will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE4] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3">Days</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-[#F7F5EF] align-top last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0F1B33]">{l.type}</p>
                      <p className="text-xs text-gray-400">
                        {l.id} · applied {fmtDate(l.appliedOn, { day: "2-digit", month: "short" })}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                      {fmtDate(l.fromDate)}
                      {l.toDate !== l.fromDate && <> – {fmtDate(l.toDate)}</>}
                      {l.halfDay && <span className="block text-xs text-gray-400">Half day</span>}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#0F1B33]">{l.days}</td>
                    <td className="max-w-[260px] px-5 py-4 text-gray-600">
                      {l.reason}
                      {l.attachmentName && (
                        <span className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <Paperclip size={12} /> {l.attachmentName}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Pill className={STATUS_STYLE[l.status]}>{l.status}</Pill>
                      {l.reviewedBy && <p className="mt-1 text-xs text-gray-400">by {l.reviewedBy}</p>}
                      {l.reviewRemark && <p className="mt-0.5 text-xs italic text-gray-500">“{l.reviewRemark}”</p>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {l.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(l)}
                          disabled={cancel.isPending}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={15} /> Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <ApplyLeaveModal open={applyOpen} onClose={() => setApplyOpen(false)} pendingByType={pendingByType} />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */

const LEAVE_TYPES: LeaveType[] = ["Casual Leave", "Sick Leave", "Earned Leave", "Unpaid Leave"];

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const emptyForm = () => ({
  type: "Casual Leave" as LeaveType,
  fromDate: todayISO(),
  toDate: todayISO(),
  halfDay: false,
  reason: "",
  attachmentName: "",
});

function ApplyLeaveModal({
  open,
  onClose,
  pendingByType,
}: {
  open: boolean;
  onClose: () => void;
  pendingByType: Partial<Record<LeaveType, number>>;
}) {
  const apply = useApplyLeave();
  const { data: balances = [] } = useLeaveBalances();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const singleDay = form.fromDate === form.toDate;
  const days = countLeaveDays(form.fromDate, form.toDate, form.halfDay && singleDay);
  const bal = balances.find((b) => b.type === form.type);
  const available = bal ? bal.total - bal.used - (pendingByType[form.type] ?? 0) : 0;
  const needsCertificate = form.type === "Sick Leave" && days > 2;

  const close = () => {
    setForm(emptyForm());
    setErrors({});
    onClose();
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.fromDate) e.fromDate = "Required.";
    if (!form.toDate) e.toDate = "Required.";
    if (form.toDate < form.fromDate) e.toDate = "End date can't be before start date.";
    if (days <= 0 && !e.toDate) e.toDate = "Selected dates have no working days.";
    if (form.type !== "Unpaid Leave" && days > available) e.type = `Only ${available} day(s) available.`;
    if (form.reason.trim().length < 5) e.reason = "Please give a reason (min 5 characters).";
    if (needsCertificate && !form.attachmentName) e.attachment = "Medical certificate is required for sick leave over 2 days.";
    setErrors(e);
    if (Object.keys(e).length) return;

    apply.mutate(
      {
        type: form.type,
        fromDate: form.fromDate,
        toDate: form.toDate,
        halfDay: form.halfDay && singleDay,
        reason: form.reason.trim(),
        attachmentName: form.attachmentName || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Leave request submitted for approval");
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
      title="Apply for Leave"
      description="Sundays are excluded automatically."
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={close}>
            Cancel
          </button>
          <button type="button" className={primaryBtn} onClick={submit} disabled={apply.isPending}>
            <Send size={16} /> {apply.isPending ? "Submitting..." : "Submit Request"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label="Leave Type"
          required
          error={errors.type}
          hint={form.type === "Unpaid Leave" ? "Salary will be deducted for these days." : `${available} day(s) available`}
        >
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as LeaveType })}
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="From" required error={errors.fromDate}>
            <input
              type="date"
              className={inputClass}
              value={form.fromDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, fromDate: e.target.value, toDate: f.toDate < e.target.value ? e.target.value : f.toDate }))
              }
            />
          </Field>
          <Field label="To" required error={errors.toDate}>
            <input
              type="date"
              className={inputClass}
              min={form.fromDate}
              value={form.toDate}
              onChange={(e) => setForm({ ...form, toDate: e.target.value })}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FBF9F3] px-4 py-3">
          <label className={cn("flex items-center gap-2 text-sm", !singleDay && "opacity-50")}>
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#0F1B33]"
              checked={form.halfDay && singleDay}
              disabled={!singleDay}
              onChange={(e) => setForm({ ...form, halfDay: e.target.checked })}
            />
            Half day
          </label>
          <p className="text-sm text-gray-600">
            Total: <span className="font-bold text-[#0F1B33]">{days}</span> working day{days === 1 ? "" : "s"}
          </p>
        </div>

        <Field label="Reason" required error={errors.reason}>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={form.reason}
            maxLength={500}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Briefly explain the reason for leave"
          />
        </Field>

        <Field
          label={needsCertificate ? "Medical Certificate" : "Attachment (optional)"}
          required={needsCertificate}
          error={errors.attachment}
          hint="PDF or image, max 5 MB"
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F5F3ED] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#0F1B33]"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size > 5 * 1024 * 1024) {
                setErrors((x) => ({ ...x, attachment: "File is larger than 5 MB." }));
                e.target.value = "";
                return;
              }
              setErrors(({ attachment: _omit, ...rest }) => rest);
              setForm({ ...form, attachmentName: f?.name ?? "" });
            }}
          />
        </Field>
      </div>
    </Modal>
  );
}
