import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  GraduationCap,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Save,
  School,
  UserCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { getInitials } from "@/lib/nameUtils";
import {
  useChangePassword,
  useTeacherProfile,
  useUpdatePreferences,
  useUpdateProfile,
} from "@/hooks/useTeacherQueries";
import { classLabel } from "@/services/teacherService";
import type { TeacherProfile as Profile, TeacherProfileUpdate } from "@/types/school";
import {
  ErrorState,
  Field,
  LoadingState,
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

type Tab = "personal" | "professional" | "security" | "preferences";

export default function TeacherProfile() {
  const { data: profile, isLoading, isError, error, refetch } = useTeacherProfile();
  const [tab, setTab] = useState<Tab>("personal");

  return (
    <PageShell>
      <PageHeader
        icon={<UserCircle size={25} />}
        title="My Profile"
        description="View your details and manage account settings."
      />

      {isLoading ? (
        <LoadingState label="Loading profile..." />
      ) : isError || !profile ? (
        <ErrorState message={errorMessage(error)} onRetry={refetch} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <ProfileCard profile={profile} />

          <div className="min-w-0">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "personal", label: "Personal" },
                { value: "professional", label: "Professional" },
                { value: "security", label: "Security" },
                { value: "preferences", label: "Notifications" },
              ]}
            />
            {tab === "personal" && <PersonalTab profile={profile} />}
            {tab === "professional" && <ProfessionalTab profile={profile} />}
            {tab === "security" && <SecurityTab />}
            {tab === "preferences" && <PreferencesTab profile={profile} />}
          </div>
        </div>
      )}
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */

function ProfileCard({ profile }: { profile: Profile }) {
  const totalPeriods = profile.teaching.reduce((s, t) => s + t.periodsPerWeek, 0);
  return (
    <aside className="h-fit rounded-2xl border border-[#E8E4D9] bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0F1B33] text-3xl font-bold text-white ring-4 ring-[#F5F3ED]">
          {getInitials(profile.fullName)}
        </div>
        <h2 className="mt-4 text-xl font-bold text-[#0F1B33]">{profile.fullName}</h2>
        <p className="text-sm text-gray-500">{profile.designation}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Pill className="bg-[#F5F3ED] text-[#0F1B33]">{profile.employeeId}</Pill>
          {profile.classTeacherOf && (
            <Pill className="bg-green-50 text-green-700">
              <BadgeCheck size={13} /> Class Teacher · {classLabel(profile.classTeacherOf)}
            </Pill>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <InfoLine icon={<Mail size={15} />} value={profile.email} />
        <InfoLine icon={<Phone size={15} />} value={profile.phone} />
        <InfoLine icon={<Briefcase size={15} />} value={profile.department} />
        <InfoLine icon={<CalendarDays size={15} />} value={`Joined ${fmtDate(profile.joiningDate)}`} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[#F0EDE4] pt-5 text-center">
        <Stat label="Years" value={profile.experienceYears} />
        <Stat label="Classes" value={profile.teaching.length} />
        <Stat label="Periods/wk" value={totalPeriods} />
      </div>
    </aside>
  );
}

const InfoLine = ({ icon, value }: { icon: React.ReactNode; value: string }) => (
  <p className="flex items-center gap-3 text-gray-600">
    <span className="text-gray-400">{icon}</span>
    <span className="min-w-0 truncate">{value}</span>
  </p>
);

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div>
    <p className="text-xl font-bold text-[#0F1B33]">{value}</p>
    <p className="text-[11px] text-gray-500">{label}</p>
  </div>
);

const ReadOnly = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-1.5 text-xs font-semibold text-gray-600">{label}</p>
    <p className="rounded-xl bg-[#FBF9F3] px-3 py-2.5 text-sm text-[#0F1B33]">{value || "—"}</p>
  </div>
);

/* ------------------------------------------------------------------ */

const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const pick = (p: Profile): TeacherProfileUpdate => ({
  phone: p.phone,
  address: p.address,
  bloodGroup: p.bloodGroup,
  emergencyContactName: p.emergencyContactName,
  emergencyContactPhone: p.emergencyContactPhone,
});

function PersonalTab({ profile }: { profile: Profile }) {
  const update = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<TeacherProfileUpdate>(pick(profile));
  const [errors, setErrors] = useState<Partial<Record<keyof TeacherProfileUpdate, string>>>({});

  useEffect(() => {
    if (!editing) setForm(pick(profile));
  }, [profile, editing]);

  const set = (k: keyof TeacherProfileUpdate) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = () => {
    const e: typeof errors = {};
    if (!PHONE_RE.test(form.phone.trim())) e.phone = "Enter a valid phone number.";
    if (!PHONE_RE.test(form.emergencyContactPhone.trim())) e.emergencyContactPhone = "Enter a valid phone number.";
    if (!form.emergencyContactName.trim()) e.emergencyContactName = "Required.";
    if (form.address.trim().length < 10) e.address = "Please enter your full address.";
    setErrors(e);
    if (Object.keys(e).length) return;

    update.mutate(form, {
      onSuccess: () => {
        toast.success("Profile updated");
        setEditing(false);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  const cancel = () => {
    setErrors({});
    setEditing(false);
  };

  return (
    <Panel
      title="Personal Information"
      description="Name, email and date of birth can only be changed by the school office."
      actions={
        editing ? (
          <div className="flex gap-2">
            <button type="button" className={secondaryBtn} onClick={cancel}>
              <X size={16} /> Cancel
            </button>
            <button type="button" className={primaryBtn} onClick={save} disabled={update.isPending}>
              <Save size={16} /> {update.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button type="button" className={secondaryBtn} onClick={() => setEditing(true)}>
            <Pencil size={16} /> Edit
          </button>
        )
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ReadOnly label="Full Name" value={profile.fullName} />
        <ReadOnly label="Email" value={profile.email} />
        <ReadOnly label="Gender" value={profile.gender} />
        <ReadOnly label="Date of Birth" value={fmtDate(profile.dateOfBirth)} />

        <Field label="Phone" required={editing} error={errors.phone}>
          <input className={inputClass} value={form.phone} onChange={set("phone")} disabled={!editing} />
        </Field>
        <Field label="Blood Group">
          <select className={inputClass} value={form.bloodGroup} onChange={set("bloodGroup")} disabled={!editing}>
            {BLOOD_GROUPS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Address" required={editing} error={errors.address} className="md:col-span-2">
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={form.address}
            onChange={set("address")}
            disabled={!editing}
          />
        </Field>
        <Field label="Emergency Contact Name" required={editing} error={errors.emergencyContactName}>
          <input
            className={inputClass}
            value={form.emergencyContactName}
            onChange={set("emergencyContactName")}
            disabled={!editing}
          />
        </Field>
        <Field label="Emergency Contact Phone" required={editing} error={errors.emergencyContactPhone}>
          <input
            className={inputClass}
            value={form.emergencyContactPhone}
            onChange={set("emergencyContactPhone")}
            disabled={!editing}
          />
        </Field>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */

function ProfessionalTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-6">
      <Panel title="Employment Details">
        <div className="grid gap-4 md:grid-cols-2">
          <ReadOnly label="Employee ID" value={profile.employeeId} />
          <ReadOnly label="Designation" value={profile.designation} />
          <ReadOnly label="Department" value={profile.department} />
          <ReadOnly label="Qualification" value={profile.qualification} />
          <ReadOnly label="Joining Date" value={fmtDate(profile.joiningDate)} />
          <ReadOnly label="Total Experience" value={`${profile.experienceYears} years`} />
        </div>
      </Panel>

      {profile.classTeacherOf && (
        <div className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-green-700">
            <School size={22} />
          </div>
          <div>
            <p className="font-bold text-green-900">Class Teacher of {classLabel(profile.classTeacherOf)}</p>
            <p className="text-sm text-green-800">
              You manage attendance, progress and parent communication for this section.
            </p>
          </div>
        </div>
      )}

      <Panel title="Teaching Assignments" description="Assigned by the school administration.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-[#F0EDE4] text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4 text-right">Periods / week</th>
              </tr>
            </thead>
            <tbody>
              {profile.teaching.map((t) => (
                <tr key={t.classId + t.subject} className="border-b border-[#F7F5EF] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#0F1B33]">
                    <span className="inline-flex items-center gap-2">
                      <GraduationCap size={15} className="text-gray-400" />
                      {classLabel(t)}
                      {profile.classTeacherOf?.classId === t.classId && (
                        <Pill className="bg-green-50 text-[10px] text-green-700">Class Teacher</Pill>
                      )}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{t.subject}</td>
                  <td className="py-3 pr-4 text-right text-gray-700">{t.periodsPerWeek}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SecurityTab() {
  const change = useChangePassword();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rules = [
    { ok: form.next.length >= 8, label: "At least 8 characters" },
    { ok: /[A-Za-z]/.test(form.next) && /\d/.test(form.next), label: "Letters and numbers" },
    { ok: /[^A-Za-z0-9]/.test(form.next), label: "One special character" },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.current) errs.current = "Enter your current password.";
    if (!rules.every((r) => r.ok)) errs.next = "Password doesn't meet all requirements.";
    if (form.next !== form.confirm) errs.confirm = "Passwords don't match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    change.mutate(
      { currentPassword: form.current, newPassword: form.next },
      {
        onSuccess: () => {
          toast.success("Password changed successfully");
          setForm({ current: "", next: "", confirm: "" });
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <Panel title="Change Password" description="Use a strong password you don't use anywhere else.">
      <form onSubmit={submit} className="max-w-md space-y-4">
        <Field label="Current Password" required error={errors.current}>
          <input
            type="password"
            autoComplete="current-password"
            className={inputClass}
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
          />
        </Field>
        <Field label="New Password" required error={errors.next}>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
          />
        </Field>
        <ul className="space-y-1 text-xs">
          {rules.map((r) => (
            <li key={r.label} className={r.ok ? "text-green-700" : "text-gray-400"}>
              {r.ok ? "✓" : "○"} {r.label}
            </li>
          ))}
        </ul>
        <Field label="Confirm New Password" required error={errors.confirm}>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </Field>
        <button type="submit" className={primaryBtn} disabled={change.isPending}>
          <KeyRound size={16} /> {change.isPending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */

const PREFS: { key: keyof Profile["preferences"]; label: string; description: string }[] = [
  { key: "emailNotifications", label: "Email notifications", description: "Notices and important updates by email." },
  { key: "smsNotifications", label: "SMS notifications", description: "Urgent alerts by SMS." },
  { key: "parentMessageAlerts", label: "Parent message alerts", description: "Notify me when a parent sends a message." },
  { key: "leaveStatusAlerts", label: "Leave status alerts", description: "Notify me when my leave is approved or rejected." },
];

function PreferencesTab({ profile }: { profile: Profile }) {
  const update = useUpdatePreferences();
  const [prefs, setPrefs] = useState(profile.preferences);
  const dirty = PREFS.some((p) => prefs[p.key] !== profile.preferences[p.key]);

  return (
    <Panel
      title="Notification Preferences"
      actions={
        <button
          type="button"
          className={primaryBtn}
          disabled={!dirty || update.isPending}
          onClick={() =>
            update.mutate(prefs, {
              onSuccess: () => toast.success("Preferences saved"),
              onError: (err) => toast.error(errorMessage(err)),
            })
          }
        >
          <Save size={16} /> Save
        </button>
      }
    >
      <ul className="divide-y divide-[#F0EDE4]">
        {PREFS.map((p) => (
          <li key={p.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <label htmlFor={`pref-${p.key}`} className="cursor-pointer">
              <p className="font-semibold text-[#0F1B33]">{p.label}</p>
              <p className="text-sm text-gray-500">{p.description}</p>
            </label>
            <Switch
              id={`pref-${p.key}`}
              checked={prefs[p.key]}
              onCheckedChange={(v) => setPrefs((s) => ({ ...s, [p.key]: v }))}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
