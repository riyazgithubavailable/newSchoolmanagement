// School Setup: profile, academic year, classes & sections, subjects.
// Tab is kept in the URL (?tab=) so dashboard links open the right one.

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarRange, Check, Layers, Plus, Save, Settings2, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { useAuth } from "@/contexts/AuthContext";
import {
  useAcademicYears,
  useClassTemplates,
  useClasses,
  useSchoolMutation,
  useSchoolProfile,
  useSubjectSuggestions,
  useSubjects,
} from "@/hooks/useSchoolQueries";
import { schoolService, type Board, type ClassInfo, type SchoolProfile } from "@/services/schoolService";
import { ApiError } from "@/lib/api";
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

type Tab = "profile" | "year" | "classes" | "subjects";
const TABS: Tab[] = ["profile", "year", "classes", "subjects"];

const confirmDelete = async (what: string) =>
  (
    await Swal.fire({
      title: `Delete ${what}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    })
  ).isConfirmed;

const fieldErrors = (err: unknown) =>
  err instanceof ApiError && err.details ? Object.fromEntries(err.details.map((d) => [d.field, d.message])) : {};

export default function SchoolSetup() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS.includes(params.get("tab") as Tab) ? params.get("tab") : "profile") as Tab;

  return (
    <PageShell>
      <PageHeader
        icon={<Settings2 size={25} />}
        title="School Setup"
        description="Your school's basic structure. Teachers, attendance and marks are built on top of this."
      />
      <Tabs
        value={tab}
        onChange={(t) => setParams({ tab: t }, { replace: true })}
        tabs={[
          { value: "profile", label: "School Profile" },
          { value: "year", label: "Academic Year" },
          { value: "classes", label: "Classes & Sections" },
          { value: "subjects", label: "Subjects" },
        ]}
      />
      {tab === "profile" && <ProfileTab />}
      {tab === "year" && <YearTab />}
      {tab === "classes" && <ClassesTab />}
      {tab === "subjects" && <SubjectsTab />}
    </PageShell>
  );
}

/* ================================ Profile ================================= */

const BOARDS: { value: Board; label: string }[] = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE / ISC" },
  { value: "STATE", label: "State Board" },
  { value: "IB", label: "IB" },
  { value: "OTHER", label: "Other" },
];

function ProfileTab() {
  const { user } = useAuth();
  const canEdit = user?.role === "PRINCIPAL";
  const { data, isLoading, isError, error, refetch } = useSchoolProfile();
  const save = useSchoolMutation((p: Partial<SchoolProfile>) => schoolService.updateProfile(p));
  const [form, setForm] = useState<Partial<SchoolProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState message={errorMessage(error)} onRetry={refetch} />;

  const set = (k: keyof SchoolProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    setErrors({});
    save.mutate(
      {
        name: form.name?.trim(),
        phone: form.phone?.trim() ?? "",
        email: form.email?.trim() ?? "",
        address: form.address?.trim() || null,
        board: (form.board || null) as Board | null,
        affiliationNo: form.affiliationNo?.trim() || null,
        website: form.website?.trim() || null,
      },
      {
        onSuccess: () => toast.success("School profile saved"),
        onError: (e) => {
          setErrors(fieldErrors(e));
          toast.error(errorMessage(e));
        },
      },
    );
  };

  return (
    <Panel
      title="School Profile"
      description={canEdit ? "Shown on report cards, notices and the parent app." : "Only the principal can edit the school profile."}
      actions={
        canEdit && (
          <button type="button" className={primaryBtn} onClick={submit} disabled={save.isPending}>
            <Save size={16} /> {save.isPending ? "Saving..." : "Save"}
          </button>
        )
      }
    >
      <fieldset disabled={!canEdit} className="grid gap-4 md:grid-cols-2">
        <Field label="School name" required error={errors.name}>
          <input className={inputClass} value={form.name ?? ""} onChange={set("name")} />
        </Field>
        <Field label="School code" hint="Set by InstituteOS — users type this at sign in.">
          <input className={inputClass} value={data.code} disabled />
        </Field>
        <Field label="Board" error={errors.board}>
          <select className={inputClass} value={form.board ?? ""} onChange={set("board")}>
            <option value="">Select board</option>
            {BOARDS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Affiliation number" error={errors.affiliationNo}>
          <input className={inputClass} value={form.affiliationNo ?? ""} onChange={set("affiliationNo")} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input className={inputClass} value={form.phone ?? ""} onChange={set("phone")} />
        </Field>
        <Field label="Office email" error={errors.email}>
          <input className={inputClass} value={form.email ?? ""} onChange={set("email")} />
        </Field>
        <Field label="Website" error={errors.website}>
          <input className={inputClass} value={form.website ?? ""} onChange={set("website")} placeholder="https://" />
        </Field>
        <Field label="Address" error={errors.address} className="md:col-span-2">
          <textarea className={`${inputClass} min-h-[80px]`} value={form.address ?? ""} onChange={set("address")} />
        </Field>
      </fieldset>
    </Panel>
  );
}

/* ============================== Academic year ============================== */

/** April–March is the usual Indian school year */
function suggestYear() {
  const now = new Date();
  const start = now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1;
  return { name: `${start}-${String(start + 1).slice(2)}`, startDate: `${start}-04-01`, endDate: `${start + 1}-03-31` };
}

function YearTab() {
  const { data: years = [], isLoading, isError, error, refetch } = useAcademicYears();
  const add = useSchoolMutation(schoolService.addAcademicYear);
  const setCurrent = useSchoolMutation(schoolService.setCurrentYear);
  const remove = useSchoolMutation(schoolService.deleteAcademicYear);
  const [form, setForm] = useState(suggestYear);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () =>
    add.mutate(form, {
      onSuccess: (y) => {
        toast.success(`Academic year ${y.name} added${y.isCurrent ? " and set as current" : ""}`);
        setErrors({});
      },
      onError: (e) => {
        setErrors(fieldErrors(e));
        toast.error(errorMessage(e));
      },
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Panel title="Add academic year" description="The first year you add becomes the current one.">
        <div className="space-y-4">
          <Field label="Name" required error={errors.name} hint='Format "2026-27"'>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts" required error={errors.startDate}>
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="Ends" required error={errors.endDate}>
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
          </div>
          <button type="button" className={primaryBtn} onClick={submit} disabled={add.isPending}>
            <Plus size={16} /> Add year
          </button>
        </div>
      </Panel>

      <Panel title="Academic years" bodyClassName="p-0">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={errorMessage(error)} onRetry={refetch} />
        ) : !years.length ? (
          <EmptyState title="No academic year yet" description="Add the current year to get started." />
        ) : (
          <ul className="divide-y divide-[#F7F5EF]">
            {years.map((y) => (
              <li key={y.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <CalendarRange className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-[#0F1B33]">
                      {y.name} {y.isCurrent && <Pill className="ml-1 bg-green-50 text-green-700">Current</Pill>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fmtDate(y.startDate)} – {fmtDate(y.endDate)}
                    </p>
                  </div>
                </div>
                {!y.isCurrent && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className={`${secondaryBtn} px-3 py-1.5 text-xs`}
                      onClick={() =>
                        setCurrent.mutate(y.id, {
                          onSuccess: () => toast.success(`${y.name} is now the current year`),
                          onError: (e) => toast.error(errorMessage(e)),
                        })
                      }
                    >
                      <Star size={13} /> Make current
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${y.name}`}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        if (await confirmDelete(`academic year ${y.name}`))
                          remove.mutate(y.id, { onError: (e) => toast.error(errorMessage(e)) });
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/* =========================== Classes & sections =========================== */

const NEXT_SECTION = (existing: string[]) => {
  for (let i = 0; i < 26; i++) {
    const n = String.fromCharCode(65 + i);
    if (!existing.includes(n)) return n;
  }
  return "";
};

function ClassesTab() {
  const { data: classes = [], isLoading, isError, error, refetch } = useClasses();
  const [templateOpen, setTemplateOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const addSection = useSchoolMutation(schoolService.addSection);
  const deleteSection = useSchoolMutation(schoolService.deleteSection);
  const deleteClass = useSchoolMutation(schoolService.deleteClass);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={refetch} />;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className={primaryBtn} onClick={() => setTemplateOpen(true)}>
          <Layers size={16} /> Add from template
        </button>
        <button type="button" className={secondaryBtn} onClick={() => setCustomOpen(true)}>
          <Plus size={16} /> Custom class
        </button>
      </div>

      {!classes.length ? (
        <Panel>
          <EmptyState
            title="No classes yet"
            description="Start with a template (e.g. Nursery – 12). You can add or remove classes later."
            action={
              <button type="button" className={primaryBtn} onClick={() => setTemplateOpen(true)}>
                <Layers size={16} /> Add from template
              </button>
            }
          />
        </Panel>
      ) : (
        <Panel title={`${classes.length} classes`} bodyClassName="p-0">
          <ul className="divide-y divide-[#F7F5EF]">
            {classes.map((c) => (
              <ClassRow
                key={c.id}
                cls={c}
                onAddSection={() =>
                  addSection.mutate(
                    { classId: c.id, name: NEXT_SECTION(c.sections.map((s) => s.name)) },
                    { onError: (e) => toast.error(errorMessage(e)) },
                  )
                }
                onDeleteSection={async (id, label) => {
                  if (await confirmDelete(`section ${label}`)) deleteSection.mutate(id, { onError: (e) => toast.error(errorMessage(e)) });
                }}
                onDeleteClass={async () => {
                  if (await confirmDelete(`${c.name}${c.stream ? ` (${c.stream})` : ""} and its sections`))
                    deleteClass.mutate(c.id, { onError: (e) => toast.error(errorMessage(e)) });
                }}
              />
            ))}
          </ul>
        </Panel>
      )}

      <TemplateModal open={templateOpen} onClose={() => setTemplateOpen(false)} />
      <CustomClassModal open={customOpen} onClose={() => setCustomOpen(false)} />
    </>
  );
}

function ClassRow({
  cls,
  onAddSection,
  onDeleteSection,
  onDeleteClass,
}: {
  cls: ClassInfo;
  onAddSection: () => void;
  onDeleteSection: (id: string, label: string) => void;
  onDeleteClass: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3">
      <div className="w-40 shrink-0">
        <p className="font-semibold text-[#0F1B33]">{cls.name}</p>
        {cls.stream && <p className="text-xs text-gray-500">{cls.stream}</p>}
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {cls.sections.map((s) => (
          <span
            key={s.id}
            title={s.classTeacher ? `Class teacher: ${s.classTeacher.fullName}` : "No class teacher yet"}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-semibold",
              s.classTeacher ? "border-green-200 bg-green-50 text-green-800" : "border-[#E8E4D9] bg-white text-[#0F1B33]",
            )}
          >
            {s.name}
            <button
              type="button"
              aria-label={`Delete section ${s.label}`}
              onClick={() => onDeleteSection(s.id, s.label)}
              className="rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={onAddSection}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#C6952F] px-2.5 py-1 text-xs font-semibold text-[#8a6a22] hover:bg-[#C6952F]/10"
        >
          <Plus size={12} /> Section
        </button>
      </div>
      <button type="button" aria-label={`Delete ${cls.name}`} onClick={onDeleteClass} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
        <Trash2 size={15} />
      </button>
    </li>
  );
}

function SectionPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-gray-600">Sections in each class</p>
      <div className="flex flex-wrap gap-2">
        {["A", "B", "C", "D", "E"].map((s) => {
          const on = value.includes(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((x) => x !== s) : [...value, s].sort())}
              className={cn(
                "h-10 w-10 rounded-xl border text-sm font-bold transition",
                on ? "border-[#0F1B33] bg-[#0F1B33] text-white" : "border-[#E8E4D9] text-gray-600 hover:bg-[#F5F3ED]",
              )}
            >
              {s}
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-gray-400">You can add or remove sections for individual classes later.</p>
    </div>
  );
}

function TemplateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: templates = [] } = useClassTemplates();
  const create = useSchoolMutation(({ id, sections }: { id: string; sections: string[] }) =>
    schoolService.addClassesFromTemplate(id, sections),
  );
  const [templateId, setTemplateId] = useState("UPTO_12");
  const [sections, setSections] = useState(["A"]);
  const chosen = templates.find((t) => t.id === templateId);

  const submit = () =>
    create.mutate(
      { id: templateId, sections },
      {
        onSuccess: (r) => {
          toast.success(`${r.created} classes added${r.skipped ? ` (${r.skipped} already existed)` : ""}`);
          onClose();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add classes from a template"
      description="Classes that already exist are skipped."
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={primaryBtn} onClick={submit} disabled={!sections.length || create.isPending}>
            <Check size={16} /> {create.isPending ? "Adding..." : "Add classes"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-2">
          {templates.map((t) => (
            <label
              key={t.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                templateId === t.id ? "border-[#0F1B33] bg-[#FBF9F3]" : "border-[#E8E4D9] hover:bg-[#FBF9F3]",
              )}
            >
              <input type="radio" name="template" className="accent-[#0F1B33]" checked={templateId === t.id} onChange={() => setTemplateId(t.id)} />
              <span className="font-semibold text-[#0F1B33]">{t.label}</span>
              <span className="ml-auto text-xs text-gray-500">{t.classes.length} classes</span>
            </label>
          ))}
        </div>
        {chosen && (
          <p className="text-xs text-gray-500">
            {chosen.classes.map((c) => c.name).join(", ")}
          </p>
        )}
        <SectionPicker value={sections} onChange={setSections} />
        <p className="text-xs text-gray-500">For Class 11–12 with streams (Science / Commerce / Arts) use <b>Custom class</b>.</p>
      </div>
    </Modal>
  );
}

function CustomClassModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useSchoolMutation(schoolService.addClass);
  const empty = { name: "", order: "", stream: "", sections: ["A"] };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // "Class 11" → order 14 to keep the standard ordering
  const guessOrder = (name: string) => {
    const m = name.match(/(\d+)/);
    if (/nursery/i.test(name)) return "1";
    if (/lkg/i.test(name)) return "2";
    if (/ukg/i.test(name)) return "3";
    return m ? String(Number(m[1]) + 3) : "";
  };

  const close = () => {
    setForm(empty);
    setErrors({});
    onClose();
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Class name is required.";
    if (form.order === "" || Number.isNaN(Number(form.order))) e.order = "Enter a number.";
    setErrors(e);
    if (Object.keys(e).length) return;
    create.mutate(
      { name: form.name.trim(), order: Number(form.order), stream: form.stream.trim() || null, sections: form.sections },
      {
        onSuccess: () => {
          toast.success("Class added");
          close();
        },
        onError: (err) => {
          setErrors(fieldErrors(err));
          toast.error(errorMessage(err));
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Custom class"
      description="Use this for streams (Class 11 Science) or classes not in the templates."
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={close}>
            Cancel
          </button>
          <button type="button" className={primaryBtn} onClick={submit} disabled={create.isPending}>
            <Plus size={16} /> Add class
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class name" required error={errors.name}>
            <input
              className={inputClass}
              value={form.name}
              placeholder="Class 11"
              onChange={(e) => setForm({ ...form, name: e.target.value, order: form.order || guessOrder(e.target.value) })}
            />
          </Field>
          <Field label="Stream" hint="Only for 11–12" error={errors.stream}>
            <select className={inputClass} value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })}>
              <option value="">None</option>
              <option>Science</option>
              <option>Commerce</option>
              <option>Arts</option>
              <option>Vocational</option>
            </select>
          </Field>
          <Field label="Order" required error={errors.order} hint="Used for sorting and promotion (Nursery 1 … Class 12 = 15)">
            <input className={inputClass} inputMode="numeric" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </Field>
        </div>
        <SectionPicker value={form.sections} onChange={(sections) => setForm({ ...form, sections })} />
      </div>
    </Modal>
  );
}

/* ================================ Subjects ================================= */

function SubjectsTab() {
  const { data: subjects = [], isLoading, isError, error, refetch } = useSubjects();
  const { data: suggestions = [] } = useSubjectSuggestions();
  const addMany = useSchoolMutation(schoolService.addSubjects);
  const remove = useSchoolMutation(schoolService.deleteSubject);
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  const existing = useMemo(() => new Set(subjects.map((s) => s.name.toLowerCase())), [subjects]);
  const available = suggestions.filter((s) => !existing.has(s.toLowerCase()));

  const submit = () => {
    const names = [...picked, ...custom.split(",").map((s) => s.trim()).filter(Boolean)];
    if (!names.length) return toast.error("Pick or type at least one subject.");
    addMany.mutate(names, {
      onSuccess: (r) => {
        toast.success(`${r.created} subject${r.created === 1 ? "" : "s"} added`);
        setPicked([]);
        setCustom("");
      },
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Add subjects" description="Tap suggestions or type your own (comma separated).">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {available.map((s) => {
              const on = picked.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(on ? picked.filter((x) => x !== s) : [...picked, s])}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    on ? "border-[#0F1B33] bg-[#0F1B33] text-white" : "border-[#E8E4D9] text-gray-600 hover:bg-[#F5F3ED]",
                  )}
                >
                  {on && "✓ "}
                  {s}
                </button>
              );
            })}
          </div>
          <Field label="Other subjects">
            <input className={inputClass} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Robotics, French" />
          </Field>
          <button type="button" className={primaryBtn} onClick={submit} disabled={addMany.isPending}>
            <Plus size={16} /> Add {picked.length + custom.split(",").filter((s) => s.trim()).length || ""} subject(s)
          </button>
        </div>
      </Panel>

      <Panel title={`Subjects (${subjects.length})`} bodyClassName="p-0">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={errorMessage(error)} onRetry={refetch} />
        ) : !subjects.length ? (
          <EmptyState title="No subjects yet" />
        ) : (
          <ul className="divide-y divide-[#F7F5EF]">
            {subjects.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium text-[#0F1B33]">{s.name}</span>
                <button
                  type="button"
                  aria-label={`Delete ${s.name}`}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  onClick={async () => {
                    if (await confirmDelete(s.name)) remove.mutate(s.id, { onError: (e) => toast.error(errorMessage(e)) });
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
