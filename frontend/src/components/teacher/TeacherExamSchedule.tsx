
"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Clock3,
  BookOpen,
  Plus,
  Filter,
  RotateCcw,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { AppLayouts } from "@/layout/AppLayouts";
import AdvancedTable, { ColumnType } from "@/utils/AdvancedTable";


type ExamStatus = "Upcoming" | "Completed" | "Ongoing";

type Exam = {
  id: number;
  examName: string;
  className: string;
  section: string;
  subject: string;
  examDate: string;
  startTime: string;
  duration: string;
  maxMarks: number;
  status: ExamStatus;
};

const initialExams: Exam[] = [
  {
    id: 1,
    examName: "Mid Term Examination",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    examDate: "2026-11-20",
    startTime: "09:00",
    duration: "3 Hours",
    maxMarks: 100,
    status: "Upcoming",
  },
  {
    id: 2,
    examName: "Mid Term Examination",
    className: "Class 10",
    section: "A",
    subject: "Science",
    examDate: "2026-11-22",
    startTime: "09:00",
    duration: "3 Hours",
    maxMarks: 100,
    status: "Upcoming",
  },
  {
    id: 3,
    examName: "Unit Test 2",
    className: "Class 9",
    section: "B",
    subject: "English",
    examDate: "2026-11-12",
    startTime: "10:00",
    duration: "2 Hours",
    maxMarks: 50,
    status: "Completed",
  },
  {
    id: 4,
    examName: "Unit Test 2",
    className: "Class 9",
    section: "A",
    subject: "Computer Science",
    examDate: "2026-11-18",
    startTime: "11:00",
    duration: "2 Hours",
    maxMarks: 50,
    status: "Ongoing",
  },
];

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const emptyForm = {
  examName: "",
  className: "Class 10",
  section: "A",
  subject: "Mathematics",
  examDate: "",
  startTime: "09:00",
  duration: "3 Hours",
  maxMarks: "100",
};

export default function TeacherExamSchedule() {
  const [exams, setExams] = useState<Exam[]>(initialExams);

  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Class and status filters are handled here.
  // Search is handled internally by AdvancedTable.
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesClass =
        selectedClass === "All Classes" ||
        exam.className === selectedClass;

      const matchesStatus =
        selectedStatus === "All Status" ||
        exam.status === selectedStatus;

      return matchesClass && matchesStatus;
    });
  }, [exams, selectedClass, selectedStatus]);

  const upcomingCount = exams.filter(
    (exam) => exam.status === "Upcoming"
  ).length;

  const completedCount = exams.filter(
    (exam) => exam.status === "Completed"
  ).length;

  const ongoingCount = exams.filter(
    (exam) => exam.status === "Ongoing"
  ).length;

  const clearFilters = () => {
    setSelectedClass("All Classes");
    setSelectedStatus("All Status");
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (exam: Exam) => {
    setForm({
      examName: exam.examName,
      className: exam.className,
      section: exam.section,
      subject: exam.subject,
      examDate: exam.examDate,
      startTime: exam.startTime,
      duration: exam.duration,
      maxMarks: String(exam.maxMarks),
    });

    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const existingExam = exams.find(
      (exam) => exam.id === editingId
    );

    const examData: Exam = {
      ...form,
      id: editingId ?? Date.now(),
      maxMarks: Number(form.maxMarks),
      status: existingExam?.status ?? "Upcoming",
    };

    if (editingId !== null) {
      setExams((prev) =>
        prev.map((exam) =>
          exam.id === editingId ? examData : exam
        )
      );
    } else {
      setExams((prev) => [...prev, examData]);
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      setExams((prev) => prev.filter((exam) => exam.id !== id));
    }
  };

  const getStatusStyle = (status: ExamStatus) => {
    switch (status) {
      case "Upcoming":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "Completed":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Ongoing":
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  // AdvancedTable columns
  const columns = useMemo<ColumnType<Exam>[]>(
    () => [
      {
        key: "examName",
        header: "Examination",
        defaultWidth: 230,
        minWidth: 180,
        cell: (exam) => (
          <div>
            <p className="text-sm font-semibold text-[#0F1B33]">
              {exam.examName}
            </p>
            <p className="mt-1 text-xs text-[#8B867A]">
              Exam ID: #{exam.id}
            </p>
          </div>
        ),
        sortValue: (exam) => exam.examName,
        exportValue: (exam) => exam.examName,
      },
      {
        key: "className",
        header: "Class / Section",
        defaultWidth: 150,
        cell: (exam) => (
          <div>
            <p className="text-sm font-semibold text-[#0F1B33]">
              {exam.className}
            </p>
            <p className="mt-1 text-xs text-[#8B867A]">
              Section {exam.section}
            </p>
          </div>
        ),
        sortValue: (exam) => `${exam.className} ${exam.section}`,
        exportValue: (exam) => `${exam.className} - ${exam.section}`,
      },
      {
        key: "subject",
        header: "Subject",
        defaultWidth: 160,
        cell: (exam) => (
          <span className="text-sm text-[#5E6472]">
            {exam.subject}
          </span>
        ),
        sortValue: (exam) => exam.subject,
      },
      {
        key: "examDate",
        header: "Exam Date",
        defaultWidth: 140,
        cell: (exam) => (
          <span className="text-sm text-[#5E6472]">
            {formatDate(exam.examDate)}
          </span>
        ),
        sortValue: (exam) => exam.examDate,
        exportValue: (exam) => formatDate(exam.examDate),
      },
      {
        key: "startTime",
        header: "Time",
        defaultWidth: 110,
        cell: (exam) => (
          <span className="text-sm text-[#5E6472]">
            {exam.startTime}
          </span>
        ),
      },
      {
        key: "duration",
        header: "Duration",
        defaultWidth: 120,
        cell: (exam) => (
          <span className="text-sm text-[#5E6472]">
            {exam.duration}
          </span>
        ),
      },
      {
        key: "maxMarks",
        header: "Max Marks",
        defaultWidth: 110,
        align: "center",
        cell: (exam) => (
          <span className="text-sm font-medium text-[#0F1B33]">
            {exam.maxMarks}
          </span>
        ),
        sortValue: (exam) => exam.maxMarks,
      },
      {
        key: "status",
        header: "Status",
        defaultWidth: 130,
        cell: (exam) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(exam.status)}`}
          >
            {exam.status}
          </span>
        ),
        sortValue: (exam) => exam.status,
      },
      {
        key: "actions",
        header: "Actions",
        defaultWidth: 110,
        align: "center",
        hideable: false,
        exportable: false,
        cell: (exam) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openEditForm(exam)}
              title="Edit Exam"
              className="rounded-lg border border-[#DCD6C9] p-2
                text-[#0F1B33] transition-all duration-200
                hover:bg-[#F8F6F0] hover:border-[#0F1B33]"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => handleDelete(exam.id)}
              title="Delete Exam"
              className="rounded-lg border border-red-200 p-2
                text-red-600 transition-all duration-200
                hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AppLayouts>
      <div className="min-h-screen bg-[#FBF9F3] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">

          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-[#8B867A]">
                <BookOpen className="h-4 w-4" />
                <span>Teacher Portal</span>
                <span>/</span>
                <span>Exams & Results</span>
                <span>/</span>
                <span className="text-[#5E6472]">Exam Schedule</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
                Exam Schedule
              </h1>

              <p className="mt-1 text-sm text-[#6B7280]">
                Create, schedule and manage examinations for your classes.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2
                rounded-lg bg-[#0F1B33] px-4 py-2.5
                text-sm font-medium text-white
                transition-all duration-200
                hover:bg-[#1D2B49]
                hover:shadow-md
                active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Schedule Exam
            </button>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Exams"
              value={exams.length}
              subtitle="All scheduled examinations"
              icon={<ClipboardList className="h-5 w-5" />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Upcoming"
              value={upcomingCount}
              subtitle="Examinations scheduled ahead"
              icon={<CalendarDays className="h-5 w-5" />}
              iconClass="bg-violet-50 text-violet-700"
            />

            <SummaryCard
              title="Ongoing"
              value={ongoingCount}
              subtitle="Currently in progress"
              icon={<Clock3 className="h-5 w-5" />}
              iconClass="bg-amber-50 text-amber-700"
            />

            <SummaryCard
              title="Completed"
              value={completedCount}
              subtitle="Examinations completed"
              icon={<BookOpen className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-700"
            />
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl border border-[#E8E4D9] bg-white p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#0F1B33]" />
                <h2 className="font-semibold text-[#0F1B33]">
                  Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#0F1B33]"
              >
                <RotateCcw className="h-4 w-4" />
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FilterSelect
                label="Class"
                value={selectedClass}
                options={["All Classes", "Class 9", "Class 10"]}
                onChange={setSelectedClass}
              />

              <FilterSelect
                label="Status"
                value={selectedStatus}
                options={[
                  "All Status",
                  "Upcoming",
                  "Ongoing",
                  "Completed",
                ]}
                onChange={setSelectedStatus}
              />
            </div>
          </div>

          {/* Advanced Exam Table */}
          <AdvancedTable<Exam>
            title="Examination List"
            description={`Showing ${filteredExams.length} of ${exams.length} examinations`}
            data={filteredExams}
            columns={columns}
            enableSearch={true}
            searchPlaceholder="Search examinations..."
            searchKeys={[
              "examName",
              "className",
              "section",
              "subject",
              "status",
              "examDate",
            ]}
            enablePagination={true}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50, 100, 150]}
            enableColumnToggle={true}
            enableColumnResize={true}
            stickyHeader={true}
            enableExport={true}
            enablePDFExport={true}
            exportFileName="exam-schedule"
            exportSheetName="Exam Schedule"
            rowKey={(exam) => exam.id}
            initialSort={{
              key: "examDate",
              dir: "asc",
            }}
            emptyText="No examinations found. Try changing your filters."
          />
        </div>
      </div>

      {/* Create / Edit Exam Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8E4D9] p-5">
              <div>
                <h2 className="text-lg font-bold text-[#0F1B33]">
                  {editingId ? "Edit Examination" : "Schedule New Exam"}
                </h2>
                <p className="mt-1 text-sm text-[#8B867A]">
                  Enter examination details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F5F2EA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                  Exam Name *
                </label>
                <input
                  required
                  value={form.examName}
                  onChange={(e) =>
                    setForm({ ...form, examName: e.target.value })
                  }
                  placeholder="e.g. Mid Term Examination"
                  className="w-full rounded-lg border border-[#DCD6C9] px-3 py-2.5 text-sm outline-none focus:border-[#0F1B33]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormSelect
                  label="Class"
                  value={form.className}
                  options={["Class 9", "Class 10"]}
                  onChange={(value) =>
                    setForm({ ...form, className: value })
                  }
                />

                <FormSelect
                  label="Section"
                  value={form.section}
                  options={["A", "B", "C"]}
                  onChange={(value) =>
                    setForm({ ...form, section: value })
                  }
                />

                <FormSelect
                  label="Subject"
                  value={form.subject}
                  options={[
                    "Mathematics",
                    "Science",
                    "English",
                    "Computer Science",
                  ]}
                  onChange={(value) =>
                    setForm({ ...form, subject: value })
                  }
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                    Exam Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.examDate}
                    onChange={(e) =>
                      setForm({ ...form, examDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCD6C9] px-3 py-2.5 text-sm outline-none focus:border-[#0F1B33]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                    Start Time *
                  </label>
                  <input
                    required
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCD6C9] px-3 py-2.5 text-sm outline-none focus:border-[#0F1B33]"
                  />
                </div>

                <FormSelect
                  label="Duration"
                  value={form.duration}
                  options={["1 Hour", "2 Hours", "3 Hours", "3.5 Hours"]}
                  onChange={(value) =>
                    setForm({ ...form, duration: value })
                  }
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                    Maximum Marks *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.maxMarks}
                    onChange={(e) =>
                      setForm({ ...form, maxMarks: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#DCD6C9] px-3 py-2.5 text-sm outline-none focus:border-[#0F1B33]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E8E4D9] pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-[#DCD6C9] px-4 py-2.5 text-sm font-medium text-[#5E6472] hover:bg-[#F8F6F0]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#0F1B33] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D2B49]"
                >
                  {editingId ? "Update Exam" : "Schedule Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayouts>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
};

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: SummaryCardProps) {
  return (
    <div
      className="rounded-xl border border-[#E8E4D9] bg-white p-5
        transition-all duration-200
        hover:border-[#DCD6C9]
        hover:bg-[#F8F6F0]
        hover:-translate-y-0.5
        hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#8B867A]">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-[#0F1B33]">
            {value}
          </h2>
          <p className="mt-1 text-xs text-[#8B867A]">{subtitle}</p>
        </div>

        <div className={`rounded-lg p-2.5 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

type SelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: SelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#5E6472]">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#DCD6C9] bg-white px-3 py-2.5 text-sm text-[#0F1B33] outline-none focus:border-[#0F1B33]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: SelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#5E6472]">
        {label} *
      </label>

      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#DCD6C9] bg-white px-3 py-2.5 text-sm text-[#0F1B33] outline-none focus:border-[#0F1B33]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
