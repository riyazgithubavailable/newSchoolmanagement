import { useMemo, useState } from "react";
import { Bell, BellRing, CheckCheck, Megaphone, Paperclip, Plus, Search, Send, Trash2, UserPen } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import {
  useCreateNotice,
  useDeleteNotice,
  useMarkAllNoticesRead,
  useMarkNoticeRead,
  useMyClasses,
  useNotices,
} from "@/hooks/useTeacherQueries";
import { classLabel } from "@/services/teacherService";
import type { ClassRef, Notice, NoticeCategory, NoticePriority } from "@/types/school";
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
  Tabs,
  errorMessage,
  fmtDate,
  fmtRelative,
  inputClass,
  primaryBtn,
  secondaryBtn,
} from "@/components/shared/PageKit";

const CATEGORIES: NoticeCategory[] = ["Academic", "Exam", "Event", "Holiday", "General"];

const categoryStyle: Record<NoticeCategory, string> = {
  Academic: "bg-blue-50 text-blue-700",
  Exam: "bg-purple-50 text-purple-700",
  Event: "bg-emerald-50 text-emerald-700",
  Holiday: "bg-amber-50 text-amber-700",
  General: "bg-gray-100 text-gray-700",
};

type Tab = "all" | "unread" | "mine";

export default function TeacherNotices() {
  const { data: notices = [], isLoading, isError, error, refetch } = useNotices();
  const markRead = useMarkNoticeRead();
  const markAll = useMarkAllNoticesRead();
  const deleteNotice = useDeleteNotice();

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | NoticeCategory>("All");
  const [selected, setSelected] = useState<Notice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const unread = notices.filter((n) => !n.isRead).length;
  const mine = notices.filter((n) => n.isMine).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notices.filter((n) => {
      if (tab === "unread" && n.isRead) return false;
      if (tab === "mine" && !n.isMine) return false;
      if (category !== "All" && n.category !== category) return false;
      if (q && !`${n.title} ${n.body} ${n.postedBy}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notices, tab, category, search]);

  const openNotice = (n: Notice) => {
    setSelected(n);
    if (!n.isRead) markRead.mutate(n.id);
  };

  const handleDelete = async (n: Notice) => {
    const res = await Swal.fire({
      title: "Delete notice?",
      text: `"${n.title}" will be removed for all students and parents.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;
    deleteNotice.mutate(n.id, {
      onSuccess: () => {
        toast.success("Notice deleted");
        setSelected(null);
      },
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  return (
    <PageShell>
      <PageHeader
        icon={<Bell size={25} />}
        title="Notices"
        description="School announcements and notices you've posted to your classes."
        actions={
          <>
            <button
              type="button"
              className={secondaryBtn}
              disabled={!unread || markAll.isPending}
              onClick={() => markAll.mutate(undefined, { onSuccess: () => toast.success("All notices marked as read") })}
            >
              <CheckCheck size={17} /> Mark all read
            </button>
            <button type="button" className={primaryBtn} onClick={() => setCreateOpen(true)}>
              <Plus size={17} /> Post Class Notice
            </button>
          </>
        }
      />

      <SummaryGrid>
        <SummaryCard title="Total Notices" value={notices.length} icon={<Bell size={21} />} color="bg-blue-50 text-blue-600" />
        <SummaryCard title="Unread" value={unread} icon={<BellRing size={21} />} color="bg-red-50 text-red-600" />
        <SummaryCard
          title="High Priority"
          value={notices.filter((n) => n.priority === "High").length}
          icon={<Megaphone size={21} />}
          color="bg-orange-50 text-orange-600"
        />
        <SummaryCard title="Posted by Me" value={mine} icon={<UserPen size={21} />} color="bg-green-50 text-green-600" />
      </SummaryGrid>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: "All", count: notices.length },
            { value: "unread", label: "Unread", count: unread },
            { value: "mine", label: "Posted by me", count: mine },
          ]}
        />
        <div className="mb-5 flex flex-col gap-2 sm:flex-row">
          <div className="relative sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search notices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={`${inputClass} sm:w-44`}
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <Panel bodyClassName="p-0">
        {isLoading ? (
          <LoadingState label="Loading notices..." />
        ) : isError ? (
          <ErrorState message={errorMessage(error)} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No notices found"
            description={tab === "unread" ? "You're all caught up." : "Try a different filter or search term."}
          />
        ) : (
          <ul className="divide-y divide-[#F0EDE4]">
            {filtered.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => openNotice(n)}
                  className={cn(
                    "flex w-full gap-3 px-4 py-4 text-left transition hover:bg-[#FBF9F3] md:px-5",
                    !n.isRead && "bg-blue-50/30",
                  )}
                >
                  <span
                    className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", n.isRead ? "bg-transparent" : "bg-blue-600")}
                    aria-label={n.isRead ? undefined : "Unread"}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill className={categoryStyle[n.category]}>{n.category}</Pill>
                      {n.priority === "High" && <Pill className="bg-red-50 text-red-700">High priority</Pill>}
                      {n.isMine && n.targetClasses && (
                        <Pill className="bg-[#F5F3ED] text-[#0F1B33]">To: {n.targetClasses.map(classLabel).join(", ")}</Pill>
                      )}
                    </div>
                    <p className={cn("mt-2 text-[15px] text-[#0F1B33]", n.isRead ? "font-medium" : "font-bold")}>{n.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{n.body}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span>{n.isMine ? "Posted by you" : n.postedBy}</span>
                      <span>{fmtRelative(n.publishedAt)}</span>
                      {n.attachmentName && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip size={12} /> {n.attachmentName}
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* View */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        description={selected ? `${selected.isMine ? "You" : selected.postedBy} · ${fmtDate(selected.publishedAt)}` : ""}
        footer={
          <>
            {selected?.isMine && (
              <button
                type="button"
                className={`${secondaryBtn} text-red-600`}
                onClick={() => selected && handleDelete(selected)}
                disabled={deleteNotice.isPending}
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button type="button" className={primaryBtn} onClick={() => setSelected(null)}>
              Close
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Pill className={categoryStyle[selected.category]}>{selected.category}</Pill>
              {selected.priority === "High" && <Pill className="bg-red-50 text-red-700">High priority</Pill>}
              <Pill className="bg-gray-100 text-gray-700">
                Audience: {selected.audience === "Class" && selected.targetClasses
                  ? selected.targetClasses.map(classLabel).join(", ")
                  : selected.audience}
              </Pill>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{selected.body}</p>
            {selected.attachmentName && (
              <button
                type="button"
                onClick={() => toast.info("Attachment download will work once the API is connected.")}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E8E4D9] px-3 py-2 text-sm font-medium text-[#0F1B33] hover:bg-[#F5F3ED]"
              >
                <Paperclip size={15} /> {selected.attachmentName}
              </button>
            )}
          </div>
        )}
      </Modal>

      <CreateNoticeModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */

const emptyForm = {
  title: "",
  body: "",
  category: "Academic" as NoticeCategory,
  priority: "Normal" as NoticePriority,
  classIds: [] as string[],
};

function CreateNoticeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: classes = [] } = useMyClasses();
  const create = useCreateNotice();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const close = () => {
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  const toggleClass = (id: string) =>
    setForm((f) => ({
      ...f,
      classIds: f.classIds.includes(id) ? f.classIds.filter((x) => x !== id) : [...f.classIds, id],
    }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 5) e.title = "Title must be at least 5 characters.";
    if (form.body.trim().length < 10) e.body = "Please write a little more detail (min 10 characters).";
    if (!form.classIds.length) e.classes = "Select at least one class.";
    setErrors(e);
    if (Object.keys(e).length) return;

    const targetClasses: ClassRef[] = classes.filter((c) => form.classIds.includes(c.classId));
    create.mutate(
      { title: form.title.trim(), body: form.body.trim(), category: form.category, priority: form.priority, targetClasses },
      {
        onSuccess: () => {
          toast.success("Notice posted to students and parents");
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
      title="Post Class Notice"
      description="Visible to students and parents of the selected classes."
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={close}>
            Cancel
          </button>
          <button type="button" className={primaryBtn} onClick={submit} disabled={create.isPending}>
            <Send size={16} /> {create.isPending ? "Posting..." : "Post Notice"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" required error={errors.title}>
          <input
            className={inputClass}
            value={form.title}
            maxLength={120}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Maths unit test on Friday"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as NoticeCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              className={inputClass}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as NoticePriority })}
            >
              <option>Normal</option>
              <option>High</option>
            </select>
          </Field>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-gray-600">
            Send to <span className="text-red-500">*</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {classes.map((c) => {
              const active = form.classIds.includes(c.classId);
              return (
                <button
                  key={c.classId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleClass(c.classId)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    active ? "border-[#0F1B33] bg-[#0F1B33] text-white" : "border-[#E8E4D9] text-gray-600 hover:bg-[#F5F3ED]",
                  )}
                >
                  {classLabel(c)}
                </button>
              );
            })}
          </div>
          {errors.classes && <span className="mt-1 block text-xs text-red-600">{errors.classes}</span>}
        </div>

        <Field label="Message" required error={errors.body} hint={`${form.body.length}/1000`}>
          <textarea
            className={`${inputClass} min-h-[130px] resize-y`}
            value={form.body}
            maxLength={1000}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Write the notice..."
          />
        </Field>
      </div>
    </Modal>
  );
}
