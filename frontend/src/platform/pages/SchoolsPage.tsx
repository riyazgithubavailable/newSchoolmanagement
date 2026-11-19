// Platform owner: onboard schools (school + principal) and manage them.

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Pause,
  Play,
  Plus,
  School,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  useAddPrincipal,
  useCreateSchool,
  useResetPrincipalPassword,
  useSchools,
  useSetSchoolStatus,
} from "../usePlatformQueries";
import type { PrincipalPayload, SchoolStatus, SchoolSummary } from "../platformService";
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
import { CredentialsModal, generatePassword, type Credentials } from "@/components/shared/Credentials";

const PAGE_SIZE = 10;

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function SchoolsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SchoolStatus | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search.trim());

  useEffect(() => setPage(1), [debouncedSearch, status]);

  const { data, isLoading, isError, error, refetch, isFetching } = useSchools({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status,
  });
  const setSchoolStatus = useSetSchoolStatus();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewing, setViewing] = useState<SchoolSummary | null>(null);
  const [addPrincipalFor, setAddPrincipalFor] = useState<SchoolSummary | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const summary = data?.meta.summary;

  const toggleStatus = async (s: SchoolSummary) => {
    const suspend = s.status === "ACTIVE";
    const res = await Swal.fire({
      title: suspend ? `Suspend ${s.name}?` : `Activate ${s.name}?`,
      text: suspend
        ? `All ${s.userCounts.total} users of this school will be logged out and won't be able to sign in.`
        : "Users of this school will be able to sign in again.",
      icon: suspend ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: suspend ? "Suspend" : "Activate",
      confirmButtonColor: suspend ? "#dc2626" : "#0F1B33",
    });
    if (!res.isConfirmed) return;
    setSchoolStatus.mutate(
      { id: s.id, status: suspend ? "SUSPENDED" : "ACTIVE" },
      {
        onSuccess: () => toast.success(suspend ? `${s.code} suspended` : `${s.code} activated`),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <PageShell>
      <PageHeader
        icon={<Building2 size={25} />}
        title="Schools"
        description="Onboard new schools and manage the ones using InstituteOS."
        actions={
          <button type="button" className={primaryBtn} onClick={() => setCreateOpen(true)}>
            <Plus size={17} /> Add School
          </button>
        }
      />

      <SummaryGrid>
        <SummaryCard title="Total Schools" value={summary?.schools ?? "—"} icon={<School size={21} />} color="bg-blue-50 text-blue-600" />
        <SummaryCard title="Active" value={summary?.active ?? "—"} icon={<CheckCircle2 size={21} />} color="bg-green-50 text-green-600" />
        <SummaryCard title="Suspended" value={summary?.suspended ?? "—"} icon={<Pause size={21} />} color="bg-red-50 text-red-600" />
        <SummaryCard
          title="Users (this page)"
          value={data ? data.items.reduce((s, x) => s + x.userCounts.total, 0) : "—"}
          icon={<Users size={21} />}
          color="bg-orange-50 text-orange-600"
        />
      </SummaryGrid>

      <Panel
        title="All Schools"
        description={data ? `${data.meta.total} school${data.meta.total === 1 ? "" : "s"}` : undefined}
        bodyClassName="p-0"
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className={`${inputClass} py-2 pl-9`}
                placeholder="Search name, code or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className={`${inputClass} py-2 sm:w-40`}
              value={status}
              onChange={(e) => setStatus(e.target.value as SchoolStatus | "")}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        }
      >
        {isLoading ? (
          <LoadingState label="Loading schools..." />
        ) : isError ? (
          <ErrorState message={errorMessage(error)} onRetry={refetch} />
        ) : !data?.items.length ? (
          <EmptyState
            title={debouncedSearch || status ? "No schools match" : "No schools yet"}
            description={debouncedSearch || status ? "Try a different search or filter." : "Add your first school to get started."}
            action={
              !debouncedSearch && !status ? (
                <button type="button" className={primaryBtn} onClick={() => setCreateOpen(true)}>
                  <Plus size={17} /> Add School
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className={cn("overflow-x-auto transition-opacity", isFetching && "opacity-60")}>
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE4] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">School</th>
                  <th className="px-5 py-3">Principal</th>
                  <th className="px-5 py-3">Users</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Added</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((s) => {
                  const p = s.principals[0];
                  return (
                    <tr key={s.id} className="border-b border-[#F7F5EF] last:border-0">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-[#0F1B33]">{s.name}</p>
                        <p className="text-xs text-gray-500">
                          <span className="font-mono font-semibold text-[#0F1B33]">{s.code}</span>
                          {s.address ? ` · ${s.address}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        {p ? (
                          <>
                            <p className="font-medium text-gray-800">{p.fullName}</p>
                            <p className="text-xs text-gray-500">
                              {p.email}
                              {s.principals.length > 1 ? ` · +${s.principals.length - 1} more` : ""}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-red-600">No principal</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-[#0F1B33]">{s.userCounts.total}</p>
                        <p className="text-xs text-gray-500">
                          {s.userCounts.teachers} teachers · {s.userCounts.students} students
                          {s.userCounts.pending > 0 && <span className="text-amber-700"> · {s.userCounts.pending} pending</span>}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <Pill className={s.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                          {s.status === "ACTIVE" ? "Active" : "Suspended"}
                        </Pill>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-600">{s.createdAt ? fmtDate(s.createdAt) : "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <IconBtn title="View details" onClick={() => setViewing(s)} className="text-blue-600 hover:bg-blue-50">
                            <Eye size={16} />
                          </IconBtn>
                          <IconBtn title="Add principal" onClick={() => setAddPrincipalFor(s)} className="text-[#0F1B33] hover:bg-[#F5F3ED]">
                            <UserPlus size={16} />
                          </IconBtn>
                          <IconBtn
                            title={s.status === "ACTIVE" ? "Suspend" : "Activate"}
                            onClick={() => toggleStatus(s)}
                            disabled={setSchoolStatus.isPending}
                            className={s.status === "ACTIVE" ? "text-red-600 hover:bg-red-50" : "text-green-700 hover:bg-green-50"}
                          >
                            {s.status === "ACTIVE" ? <Pause size={16} /> : <Play size={16} />}
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#F0EDE4] px-5 py-3 text-sm text-gray-600">
            <span>
              Page {data.meta.page} of {data.meta.totalPages}
            </span>
            <div className="flex gap-1">
              <button type="button" className={`${secondaryBtn} px-2.5 py-1.5`} disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={`${secondaryBtn} px-2.5 py-1.5`}
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Panel>

      <CreateSchoolModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(c) => {
          setCreateOpen(false);
          setCredentials(c);
        }}
      />
      <AddPrincipalModal
        school={addPrincipalFor}
        onClose={() => setAddPrincipalFor(null)}
        onCreated={(c) => {
          setAddPrincipalFor(null);
          setCredentials(c);
        }}
      />
      <SchoolDetailModal
        school={viewing}
        onClose={() => setViewing(null)}
        onPasswordReset={(c) => {
          setViewing(null);
          setCredentials(c);
        }}
      />
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </PageShell>
  );
}

function IconBtn({
  children,
  title,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { title: string }) {
  return (
    <button type="button" title={title} aria-label={title} className={cn("rounded-lg p-2 disabled:opacity-40", className)} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/** Suggest a code from the name: "Delhi Public School" → "DPS" */
const suggestCode = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePrincipal(p: PrincipalPayload, prefix = "principal.") {
  const e: Record<string, string> = {};
  if (p.fullName.trim().length < 2) e[`${prefix}fullName`] = "Principal name is required.";
  if (!EMAIL_RE.test(p.email.trim())) e[`${prefix}email`] = "Enter a valid email address.";
  if (p.phone && !PHONE_RE.test(p.phone.trim())) e[`${prefix}phone`] = "Enter a valid phone number.";
  if (p.password.length < 8 || !/[A-Za-z]/.test(p.password) || !/\d/.test(p.password))
    e[`${prefix}password`] = "At least 8 characters with a letter and a number.";
  return e;
}

/** Backend field errors ("school.code") → form error map */
function fieldErrors(err: unknown, prefix = ""): Record<string, string> | null {
  if (!(err instanceof ApiError)) return null;
  if (err.details?.length) {
    return Object.fromEntries(err.details.map((d) => [prefix + d.field, d.message]));
  }
  if (err.code === "SCHOOL_CODE_TAKEN") return { "school.code": err.message };
  if (err.code === "EMAIL_TAKEN") return { [`${prefix || "principal."}email`]: err.message };
  return null;
}

function PasswordField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(true);
  return (
    <Field label="Password" required error={error} hint="Share this with the principal. They can change it later.">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            className={`${inputClass} pr-10 font-mono`}
            value={value}
            autoComplete="new-password"
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button type="button" className={`${secondaryBtn} px-3`} onClick={() => onChange(generatePassword())}>
          <KeyRound size={15} /> Generate
        </button>
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/* Create school                                                        */
/* ------------------------------------------------------------------ */

const emptyForm = () => ({
  school: { name: "", code: "", email: "", phone: "", address: "" },
  principal: { fullName: "", email: "", phone: "", password: generatePassword() },
});

function CreateSchoolModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (c: Credentials) => void;
}) {
  const create = useCreateSchool();
  const [form, setForm] = useState(emptyForm);
  const [codeTouched, setCodeTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const close = () => {
    setForm(emptyForm());
    setErrors({});
    setCodeTouched(false);
    onClose();
  };

  const setSchool = (k: keyof typeof form.school, v: string) =>
    setForm((f) => {
      const school = { ...f.school, [k]: v };
      if (k === "name" && !codeTouched) school.code = suggestCode(v);
      return { ...f, school };
    });
  const setPrincipal = (k: keyof typeof form.principal, v: string) =>
    setForm((f) => ({ ...f, principal: { ...f.principal, [k]: v } }));

  const submit = () => {
    const s = form.school;
    const e: Record<string, string> = {};
    if (s.name.trim().length < 3) e["school.name"] = "School name is required.";
    if (!/^[A-Z0-9-]{3,12}$/.test(s.code.trim().toUpperCase())) e["school.code"] = "3–12 letters, numbers or dashes (e.g. DPS01).";
    if (s.email && !EMAIL_RE.test(s.email.trim())) e["school.email"] = "Enter a valid email address.";
    if (s.phone && !PHONE_RE.test(s.phone.trim())) e["school.phone"] = "Enter a valid phone number.";
    Object.assign(e, validatePrincipal(form.principal));
    setErrors(e);
    if (Object.keys(e).length) return;

    const payload = {
      school: {
        name: s.name.trim(),
        code: s.code.trim().toUpperCase(),
        email: s.email.trim() || undefined,
        phone: s.phone.trim() || undefined,
        address: s.address.trim() || undefined,
      },
      principal: {
        fullName: form.principal.fullName.trim(),
        email: form.principal.email.trim(),
        phone: form.principal.phone.trim() || undefined,
        password: form.principal.password,
      },
    };
    create.mutate(payload, {
      onSuccess: (school) => {
        toast.success(`${school.name} created`);
        onCreated({
          title: "School created",
          roleLabel: "Principal",
          schoolName: school.name,
          schoolCode: school.code,
          email: payload.principal.email.toLowerCase(),
          password: payload.principal.password,
        });
        setForm(emptyForm());
        setCodeTouched(false);
      },
      onError: (err) => {
        const fe = fieldErrors(err);
        if (fe) setErrors(fe);
        toast.error(errorMessage(err));
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="Add School"
      description="Creates the school and its principal account. The principal can sign in immediately."
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={close}>
            Cancel
          </button>
          <button type="button" className={primaryBtn} onClick={submit} disabled={create.isPending}>
            <Plus size={16} /> {create.isPending ? "Creating..." : "Create School"}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <section>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F1B33]">
            <School size={16} /> School details
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="School name" required error={errors["school.name"]} className="sm:col-span-2">
              <input className={inputClass} value={form.school.name} onChange={(e) => setSchool("name", e.target.value)} placeholder="e.g. Delhi Public School" />
            </Field>
            <Field label="School code" required error={errors["school.code"]} hint="Users type this at login. Can't be changed later.">
              <input
                className={`${inputClass} font-mono uppercase`}
                value={form.school.code}
                maxLength={12}
                onChange={(e) => {
                  setCodeTouched(true);
                  setSchool("code", e.target.value.toUpperCase());
                }}
                placeholder="DPS01"
              />
            </Field>
            <Field label="Phone" error={errors["school.phone"]}>
              <input className={inputClass} value={form.school.phone} onChange={(e) => setSchool("phone", e.target.value)} />
            </Field>
            <Field label="Office email" error={errors["school.email"]}>
              <input className={inputClass} value={form.school.email} onChange={(e) => setSchool("email", e.target.value)} />
            </Field>
            <Field label="Address">
              <input className={inputClass} value={form.school.address} onChange={(e) => setSchool("address", e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="border-t border-[#F0EDE4] pt-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F1B33]">
            <ShieldCheck size={16} /> Principal account
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors["principal.fullName"]}>
              <input className={inputClass} value={form.principal.fullName} onChange={(e) => setPrincipal("fullName", e.target.value)} />
            </Field>
            <Field label="Email (login)" required error={errors["principal.email"]}>
              <input className={inputClass} value={form.principal.email} onChange={(e) => setPrincipal("email", e.target.value)} />
            </Field>
            <Field label="Phone" error={errors["principal.phone"]}>
              <input className={inputClass} value={form.principal.phone} onChange={(e) => setPrincipal("phone", e.target.value)} />
            </Field>
            <PasswordField value={form.principal.password} onChange={(v) => setPrincipal("password", v)} error={errors["principal.password"]} />
          </div>
        </section>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Add principal                                                        */
/* ------------------------------------------------------------------ */

const emptyPrincipal = (): PrincipalPayload => ({ fullName: "", email: "", phone: "", password: generatePassword() });

function AddPrincipalModal({
  school,
  onClose,
  onCreated,
}: {
  school: SchoolSummary | null;
  onClose: () => void;
  onCreated: (c: Credentials) => void;
}) {
  const add = useAddPrincipal();
  const [form, setForm] = useState<PrincipalPayload>(emptyPrincipal);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (school) {
      setForm(emptyPrincipal());
      setErrors({});
    }
  }, [school]);

  if (!school) return null;

  const submit = () => {
    const e = validatePrincipal(form, "");
    setErrors(e);
    if (Object.keys(e).length) return;
    const payload = { ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone?.trim() || undefined };
    add.mutate(
      { id: school.id, payload },
      {
        onSuccess: () => {
          toast.success("Principal added");
          onCreated({
            title: "Principal added",
          roleLabel: "Principal",
            schoolName: school.name,
            schoolCode: school.code,
            email: payload.email.toLowerCase(),
            password: payload.password,
          });
        },
        onError: (err) => {
          const fe = fieldErrors(err, "");
          if (fe) setErrors(err instanceof ApiError && err.code === "EMAIL_TAKEN" ? { email: err.message } : fe);
          toast.error(errorMessage(err));
        },
      },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add Principal"
      description={`${school.name} (${school.code}) · existing principals keep their access.`}
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={primaryBtn} onClick={submit} disabled={add.isPending}>
            <UserPlus size={16} /> {add.isPending ? "Adding..." : "Add Principal"}
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Full name" required error={errors.fullName}>
          <input className={inputClass} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </Field>
        <Field label="Email (login)" required error={errors.email}>
          <input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <PasswordField value={form.password} onChange={(v) => setForm({ ...form, password: v })} error={errors.password} />
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Details & credentials                                                */
/* ------------------------------------------------------------------ */

function SchoolDetailModal({
  school,
  onClose,
  onPasswordReset,
}: {
  school: SchoolSummary | null;
  onClose: () => void;
  onPasswordReset: (c: Credentials) => void;
}) {
  const reset = useResetPrincipalPassword();
  if (!school) return null;
  const c = school.userCounts;

  const resetPassword = async (p: SchoolSummary["principals"][number]) => {
    const ok = await Swal.fire({
      title: `Reset password for ${p.fullName}?`,
      text: "A new temporary password will be created. They will be signed out everywhere and must choose their own password at next sign in.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reset password",
      confirmButtonColor: "#0F1B33",
    });
    if (!ok.isConfirmed) return;
    const newPassword = generatePassword();
    reset.mutate(
      { schoolId: school.id, userId: p.id, newPassword },
      {
        onSuccess: () =>
          onPasswordReset({
            title: "Temporary password set",
          roleLabel: "Principal",
            schoolName: school.name,
            schoolCode: school.code,
            email: p.email,
            password: newPassword,
          }),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };
  return (
    <Modal open onClose={onClose} title={school.name} description={`School code ${school.code}`} size="lg">
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Status" value={school.status === "ACTIVE" ? "Active" : "Suspended"} />
          <Info label="Added" value={school.createdAt ? fmtDate(school.createdAt) : "—"} />
          <Info label="Office email" value={school.email} />
          <Info label="Phone" value={school.phone} />
          <Info label="Address" value={school.address} className="sm:col-span-2" />
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-[#0F1B33]">Users</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              ["Principals", c.principals],
              ["Admins", c.admins],
              ["Teachers", c.teachers],
              ["Students", c.students],
              ["Parents", c.parents],
              ["Pending", c.pending],
            ].map(([label, n]) => (
              <div key={label} className="rounded-xl bg-[#FBF9F3] px-3 py-2 text-center">
                <p className="text-lg font-bold text-[#0F1B33]">{n}</p>
                <p className="text-[11px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-[#0F1B33]">Principals</p>
          <ul className="divide-y divide-[#F7F5EF] rounded-xl border border-[#F0EDE4]">
            {school.principals.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-[#0F1B33]">{p.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {p.email}
                    {p.phone ? ` · ${p.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {p.lastLoginAt ? `Last login ${fmtDate(p.lastLoginAt)}` : "Never logged in"}
                  </span>
                  <button
                    type="button"
                    onClick={() => resetPassword(p)}
                    disabled={reset.isPending}
                    className={`${secondaryBtn} px-2.5 py-1.5 text-xs`}
                  >
                    <KeyRound size={13} /> Reset password
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value, className }: { label: string; value: string | null; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm text-[#0F1B33]">{value || "—"}</p>
    </div>
  );
}
