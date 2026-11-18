// Staff: teachers and office admins of the school.

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Ban, Check, KeyRound, Pencil, Search, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { useAuth } from "@/contexts/AuthContext";
import { useSchoolMutation, useStaff } from "@/hooks/useSchoolQueries";
import {
  schoolService,
  type CreateStaffPayload,
  type StaffMember,
  type StaffRole,
  type UserStatus,
} from "@/services/schoolService";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/config/roles";
import { CredentialsModal, generatePassword, type Credentials } from "@/components/shared/Credentials";
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

type Filter = "all" | "teachers" | "admins" | "pending" | "disabled";

const FILTERS: Record<Filter, { role?: StaffRole; status?: UserStatus }> = {
  all: {},
  teachers: { role: "TEACHER" },
  admins: { role: "ADMIN" },
  pending: { status: "PENDING" },
  disabled: { status: "DISABLED" },
};

const STATUS_STYLE: Record<UserStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  PENDING: "bg-amber-50 text-amber-700",
  REJECTED: "bg-gray-100 text-gray-500",
  DISABLED: "bg-red-50 text-red-700",
};

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function StaffPage() {
  const { user } = useAuth();
  const isPrincipal = user?.role === "PRINCIPAL";
  const [params, setParams] = useSearchParams();
  const filter: Filter = params.get("status") === "PENDING" ? "pending" : ((params.get("view") as Filter) ?? "all");
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search.trim());

  const { data: staff = [], isLoading, isError, error, refetch } = useStaff({ ...FILTERS[filter], search: debounced || undefined });

  const setStatus = useSchoolMutation(({ id, status }: { id: string; status: "ACTIVE" | "REJECTED" | "DISABLED" }) =>
    schoolService.setUserStatus(id, status),
  );
  const resetPassword = useSchoolMutation(({ id, pw }: { id: string; pw: string }) => schoolService.resetUserPassword(id, pw));

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const changeStatus = async (s: StaffMember, status: "ACTIVE" | "REJECTED" | "DISABLED") => {
    const verb = { ACTIVE: s.status === "PENDING" ? "Approve" : "Enable", REJECTED: "Reject", DISABLED: "Disable" }[status];
    const res = await Swal.fire({
      title: `${verb} ${s.fullName}?`,
      text: status === "DISABLED" ? "They will be signed out everywhere and can't sign in until enabled again." : undefined,
      icon: status === "ACTIVE" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: verb,
      confirmButtonColor: status === "ACTIVE" ? "#0F1B33" : "#dc2626",
    });
    if (!res.isConfirmed) return;
    setStatus.mutate(
      { id: s.id, status },
      { onSuccess: () => toast.success(`${s.fullName}: ${verb.toLowerCase()}d`), onError: (e) => toast.error(errorMessage(e)) },
    );
  };

  const doReset = async (s: StaffMember) => {
    const res = await Swal.fire({
      title: `Reset password for ${s.fullName}?`,
      text: "A temporary password will be created. They'll be signed out and must choose a new password at next sign in.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reset password",
      confirmButtonColor: "#0F1B33",
    });
    if (!res.isConfirmed) return;
    const pw = generatePassword();
    resetPassword.mutate(
      { id: s.id, pw },
      {
        onSuccess: () =>
          setCredentials({
            title: "Temporary password set",
            schoolName: user?.schoolName ?? "",
            schoolCode: user?.schoolCode ?? "",
            email: s.email,
            password: pw,
            roleLabel: ROLE_LABELS[s.role],
          }),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  // a principal's account can only be managed by a principal (and never your own here)
  const canManage = (s: StaffMember) => s.id !== user?.id && (s.role === "TEACHER" || isPrincipal);

  return (
    <PageShell>
      <PageHeader
        icon={<Users size={25} />}
        title="Staff"
        description="Create accounts for teachers and office staff. They sign in with the school code, their email and a temporary password."
        actions={
          <button type="button" className={primaryBtn} onClick={() => setAddOpen(true)}>
            <UserPlus size={17} /> Add Staff
          </button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={filter}
          onChange={(v) => setParams(v === "all" ? {} : v === "pending" ? { status: "PENDING" } : { view: v }, { replace: true })}
          tabs={[
            { value: "all", label: "All" },
            { value: "teachers", label: "Teachers" },
            { value: "admins", label: "Office admins" },
            { value: "pending", label: "Pending approval" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
        <div className="relative mb-5 lg:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className={`${inputClass} pl-9`} placeholder="Search name, email or employee ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Panel bodyClassName="p-0">
        {isLoading ? (
          <LoadingState label="Loading staff..." />
        ) : isError ? (
          <ErrorState message={errorMessage(error)} onRetry={refetch} />
        ) : !staff.length ? (
          <EmptyState
            title={filter === "pending" ? "No pending accounts" : "No staff found"}
            description={filter === "all" && !debounced ? "Add your first teacher to get started." : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE4] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Class teacher</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last sign in</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-[#F7F5EF] last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#0F1B33]">{s.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {s.email}
                        {s.profile.employeeId ? ` · ${s.profile.employeeId}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-800">{ROLE_LABELS[s.role]}</p>
                      {s.profile.designation && <p className="text-xs text-gray-500">{s.profile.designation}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {s.role === "TEACHER" ? (
                        <>
                          {s.classTeacherOf?.label ?? "—"}
                          <p className="text-xs text-gray-400">{s.subjectAssignments} subject class(es)</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Pill className={STATUS_STYLE[s.status]}>{s.status === "ACTIVE" ? "Active" : s.status.toLowerCase()}</Pill>
                      {s.mustChangePassword && s.status === "ACTIVE" && <p className="mt-1 text-xs text-gray-400">Temporary password</p>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-600">{s.lastLoginAt ? fmtDate(s.lastLoginAt) : "Never"}</td>
                    <td className="px-5 py-3">
                      {canManage(s) && (
                        <div className="flex justify-end gap-1">
                          {s.status === "PENDING" ? (
                            <>
                              <IconBtn title="Approve" className="text-green-700 hover:bg-green-50" onClick={() => changeStatus(s, "ACTIVE")}>
                                <Check size={16} />
                              </IconBtn>
                              <IconBtn title="Reject" className="text-red-600 hover:bg-red-50" onClick={() => changeStatus(s, "REJECTED")}>
                                <X size={16} />
                              </IconBtn>
                            </>
                          ) : (
                            <>
                              <IconBtn title="Edit" className="text-[#0F1B33] hover:bg-[#F5F3ED]" onClick={() => setEditing(s)}>
                                <Pencil size={16} />
                              </IconBtn>
                              <IconBtn title="Reset password" className="text-blue-600 hover:bg-blue-50" onClick={() => doReset(s)}>
                                <KeyRound size={16} />
                              </IconBtn>
                              {s.status === "DISABLED" ? (
                                <IconBtn title="Enable" className="text-green-700 hover:bg-green-50" onClick={() => changeStatus(s, "ACTIVE")}>
                                  <Check size={16} />
                                </IconBtn>
                              ) : (
                                <IconBtn title="Disable" className="text-red-600 hover:bg-red-50" onClick={() => changeStatus(s, "DISABLED")}>
                                  <Ban size={16} />
                                </IconBtn>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <StaffFormModal
        open={addOpen}
        canCreateAdmin={isPrincipal}
        onClose={() => setAddOpen(false)}
        onCreated={(c) => {
          setAddOpen(false);
          setCredentials({ ...c, schoolName: user?.schoolName ?? "", schoolCode: user?.schoolCode ?? "" });
        }}
      />
      <StaffFormModal open={!!editing} member={editing} onClose={() => setEditing(null)} />
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </PageShell>
  );
}

function IconBtn({ children, title, className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { title: string }) {
  return (
    <button type="button" title={title} aria-label={title} className={cn("rounded-lg p-2", className)} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Add / edit                                                           */
/* ------------------------------------------------------------------ */

const blank = () => ({
  fullName: "",
  email: "",
  phone: "",
  role: "TEACHER" as "TEACHER" | "ADMIN",
  password: generatePassword(),
  employeeId: "",
  designation: "",
  qualification: "",
  gender: "",
  joiningDate: "",
});

function StaffFormModal({
  open,
  member,
  canCreateAdmin = false,
  onClose,
  onCreated,
}: {
  open: boolean;
  member?: StaffMember | null;
  canCreateAdmin?: boolean;
  onClose: () => void;
  onCreated?: (c: Omit<Credentials, "schoolName" | "schoolCode">) => void;
}) {
  const editing = !!member;
  const create = useSchoolMutation(schoolService.addStaff);
  const update = useSchoolMutation(({ id, body }: { id: string; body: Parameters<typeof schoolService.updateStaff>[1] }) =>
    schoolService.updateStaff(id, body),
  );
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      member
        ? {
            ...blank(),
            fullName: member.fullName,
            email: member.email,
            phone: member.phone ?? "",
            role: member.role === "ADMIN" ? "ADMIN" : "TEACHER",
            employeeId: member.profile.employeeId ?? "",
            designation: member.profile.designation ?? "",
            qualification: member.profile.qualification ?? "",
            gender: member.profile.gender ?? "",
            joiningDate: member.profile.joiningDate ?? "",
          }
        : blank(),
    );
  }, [open, member]);

  const set = (k: keyof ReturnType<typeof blank>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const profile = {
    employeeId: form.employeeId.trim() || null,
    designation: form.designation.trim() || null,
    qualification: form.qualification.trim() || null,
    gender: (form.gender || null) as CreateStaffPayload["profile"]["gender"],
    joiningDate: form.joiningDate || null,
  };

  const onError = (e: unknown) => {
    if (e instanceof ApiError) {
      const fe = Object.fromEntries((e.details ?? []).map((d) => [d.field.replace("profile.", ""), d.message]));
      if (e.code === "EMAIL_TAKEN") fe.email = e.message;
      if (e.code === "EMPLOYEE_ID_TAKEN") fe.employeeId = e.message;
      setErrors(fe);
    }
    toast.error(errorMessage(e));
  };

  const submit = () => {
    if (form.fullName.trim().length < 2) return setErrors({ fullName: "Full name is required." });
    if (editing && member) {
      update.mutate(
        { id: member.id, body: { fullName: form.fullName.trim(), phone: form.phone.trim(), profile } },
        {
          onSuccess: () => {
            toast.success("Saved");
            onClose();
          },
          onError,
        },
      );
      return;
    }
    create.mutate(
      {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        password: form.password,
        profile,
      },
      {
        onSuccess: (s) =>
          onCreated?.({ title: "Staff account created", email: s.email, password: form.password, roleLabel: ROLE_LABELS[s.role] }),
        onError,
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? `Edit ${member?.fullName}` : "Add Staff"}
      description={editing ? "Email can't be changed." : "They'll be asked to choose their own password at first sign in."}
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={primaryBtn} onClick={submit} disabled={create.isPending || update.isPending}>
            {editing ? "Save" : "Create account"}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.fullName}>
          <input className={inputClass} value={form.fullName} onChange={set("fullName")} />
        </Field>
        <Field label="Email (login)" required={!editing} error={errors.email}>
          <input className={inputClass} value={form.email} onChange={set("email")} disabled={editing} />
        </Field>
        {!editing && (
          <Field label="Role" required>
            <select className={inputClass} value={form.role} onChange={set("role")}>
              <option value="TEACHER">Teacher</option>
              {canCreateAdmin && <option value="ADMIN">Office admin</option>}
            </select>
          </Field>
        )}
        <Field label="Phone" error={errors.phone}>
          <input className={inputClass} value={form.phone} onChange={set("phone")} />
        </Field>
        <Field label="Employee ID" error={errors.employeeId}>
          <input className={inputClass} value={form.employeeId} onChange={set("employeeId")} />
        </Field>
        <Field label="Designation" hint="e.g. PGT, TGT, PRT, Accountant">
          <input className={inputClass} value={form.designation} onChange={set("designation")} />
        </Field>
        <Field label="Qualification">
          <input className={inputClass} value={form.qualification} onChange={set("qualification")} />
        </Field>
        <Field label="Gender">
          <select className={inputClass} value={form.gender} onChange={set("gender")}>
            <option value="">—</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
        <Field label="Joining date">
          <input type="date" className={inputClass} value={form.joiningDate} onChange={set("joiningDate")} />
        </Field>
        {!editing && (
          <Field label="Temporary password" required error={errors.password} hint="Generated for you — shown once after saving.">
            <div className="flex gap-2">
              <input className={`${inputClass} font-mono`} value={form.password} onChange={set("password")} />
              <button type="button" className={`${secondaryBtn} px-3`} onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}>
                <KeyRound size={15} />
              </button>
            </div>
          </Field>
        )}
      </div>
    </Modal>
  );
}
