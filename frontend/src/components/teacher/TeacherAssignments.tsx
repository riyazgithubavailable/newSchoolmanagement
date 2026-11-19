
import { Fragment, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Clock3,
  Plus,
  Search,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type AssignmentStatus = "Active" | "Completed" | "Overdue";

type Assignment = {
  id: number;
  title: string;
  description: string;
  className: string;
  section: string;
  subject: string;
  assignedDate: string;
  dueDate: string;
  totalStudents: number;
  submitted: number;
  status: AssignmentStatus;
};

const initialAssignments: Assignment[] = [
  {
    id: 1,
    title: "Algebra – Chapter 5 Exercises",
    description: "Complete exercise 5.1 and 5.2 from the mathematics textbook.",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    assignedDate: "2026-11-10",
    dueDate: "2026-11-20",
    totalStudents: 40,
    submitted: 32,
    status: "Active",
  },
  {
    id: 2,
    title: "Quadratic Equations Worksheet",
    description: "Solve all questions from the quadratic equations worksheet.",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    assignedDate: "2026-11-05",
    dueDate: "2026-11-14",
    totalStudents: 40,
    submitted: 38,
    status: "Overdue",
  },
  {
    id: 3,
    title: "Science – Human Body Project",
    description: "Prepare a short project explaining the human digestive system.",
    className: "Class 9",
    section: "B",
    subject: "Science",
    assignedDate: "2026-11-08",
    dueDate: "2026-11-25",
    totalStudents: 35,
    submitted: 12,
    status: "Active",
  },
  {
    id: 4,
    title: "English Grammar Practice",
    description: "Complete the grammar exercises on tenses and active voice.",
    className: "Class 9",
    section: "B",
    subject: "English",
    assignedDate: "2026-10-25",
    dueDate: "2026-11-05",
    totalStudents: 35,
    submitted: 35,
    status: "Completed",
  },
  {
    id: 5,
    title: "Trigonometry Practice Set",
    description: "Solve the assigned trigonometry problems with steps.",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    assignedDate: "2026-11-12",
    dueDate: "2026-11-28",
    totalStudents: 40,
    submitted: 18,
    status: "Active",
  },
  {
    id: 6,
    title: "Computer Fundamentals",
    description: "Write notes on computer hardware and software components.",
    className: "Class 9",
    section: "A",
    subject: "Computer Science",
    assignedDate: "2026-10-20",
    dueDate: "2026-10-30",
    totalStudents: 32,
    submitted: 32,
    status: "Completed",
  },
];

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function TeacherAssignments() {
  const navigate = useNavigate();

  const [assignments] = useState<Assignment[]>(initialAssignments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(
    null
  );

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        `${assignment.title} ${assignment.description} ${assignment.className} ${assignment.subject}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesClass =
        selectedClass === "All Classes" ||
        assignment.className === selectedClass;

      const matchesSubject =
        selectedSubject === "All Subjects" ||
        assignment.subject === selectedSubject;

      const matchesStatus =
        selectedStatus === "All Status" ||
        assignment.status === selectedStatus;

      return (
        matchesSearch &&
        matchesClass &&
        matchesSubject &&
        matchesStatus
      );
    });
  }, [
    assignments,
    searchTerm,
    selectedClass,
    selectedSubject,
    selectedStatus,
  ]);

  const activeCount = assignments.filter(
    (item) => item.status === "Active"
  ).length;

  const completedCount = assignments.filter(
    (item) => item.status === "Completed"
  ).length;

  const overdueCount = assignments.filter(
    (item) => item.status === "Overdue"
  ).length;

  const totalSubmissions = assignments.reduce(
    (total, item) => total + item.submitted,
    0
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedClass("All Classes");
    setSelectedSubject("All Subjects");
    setSelectedStatus("All Status");
    setExpandedAssignment(null);
  };

  const getStatusStyle = (status: AssignmentStatus) => {
    switch (status) {
      case "Active":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "Completed":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Overdue":
        return "border-red-200 bg-red-50 text-red-700";
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#FBF9F3] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">

          {/* Page Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-[#8B867A]">
                <BookOpen className="h-4 w-4" />
                <span>Teacher Portal</span>
                <span>/</span>
                <span className="text-[#5E6472]">Assignments</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
                All Assignments
              </h1>

              <p className="mt-1 text-sm text-[#6B7280]">
                Create, track and manage assignments for your classes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/teacher/assignments/create")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F1B33] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D2B49]"
            >
              <Plus className="h-4 w-4" />
              Create Assignment
            </button>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Assignments"
              value={assignments.length}
              subtitle="All created assignments"
              icon={<ClipboardList className="h-5 w-5" />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Active"
              value={activeCount}
              subtitle="Currently accepting submissions"
              icon={<Clock3 className="h-5 w-5" />}
              iconClass="bg-violet-50 text-violet-700"
            />

            <SummaryCard
              title="Completed"
              value={completedCount}
              subtitle="Completed assignments"
              icon={<BookOpen className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-700"
            />

            <SummaryCard
              title="Overdue"
              value={overdueCount}
              subtitle={`${totalSubmissions} total submissions`}
              icon={<CalendarDays className="h-5 w-5" />}
              iconClass="bg-amber-50 text-amber-700"
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
                className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#0F1B33]"
              >
                <RotateCcw className="h-4 w-4" />
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <FilterSelect
                label="Class"
                value={selectedClass}
                options={[
                  "All Classes",
                  "Class 9",
                  "Class 10",
                ]}
                onChange={setSelectedClass}
              />

              <FilterSelect
                label="Subject"
                value={selectedSubject}
                options={[
                  "All Subjects",
                  "Mathematics",
                  "Science",
                  "English",
                  "Computer Science",
                ]}
                onChange={setSelectedSubject}
              />

              <FilterSelect
                label="Status"
                value={selectedStatus}
                options={[
                  "All Status",
                  "Active",
                  "Completed",
                  "Overdue",
                ]}
                onChange={setSelectedStatus}
              />
            </div>
          </div>

          {/* Assignment Table */}
          <div className="overflow-hidden rounded-xl border border-[#E8E4D9] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E8E4D9] p-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#0F1B33]">
                  Assignment List
                </h2>
                <p className="mt-1 text-sm text-[#8B867A]">
                  Showing {filteredAssignments.length} of {assignments.length} assignments
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B867A]" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-[#DCD6C9] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0F1B33] sm:w-72"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-[#F8F6F0]">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-[#8B867A]">
                    <th className="px-5 py-4">Assignment</th>
                    <th className="px-5 py-4">Class / Section</th>
                    <th className="px-5 py-4">Subject</th>
                    <th className="px-5 py-4">Due Date</th>
                    <th className="px-5 py-4">Submissions</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F0EDE5]">
                  {filteredAssignments.map((assignment) => {
                    const isExpanded =
                      expandedAssignment === assignment.id;

                    const submissionPercentage = Math.round(
                      (assignment.submitted / assignment.totalStudents) * 100
                    );

                    return (
                      <Fragment key={assignment.id}>
                      <tbody  className="contents">
                        <tr className="transition hover:bg-[#FCFBF8]">
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#0F1B33]">
                              {assignment.title}
                            </p>
                            <p className="mt-1 text-xs text-[#8B867A]">
                              Assigned: {formatDate(assignment.assignedDate)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#0F1B33]">
                              {assignment.className}
                            </p>
                            <p className="mt-1 text-xs text-[#8B867A]">
                              Section {assignment.section}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-[#5E6472]">
                            {assignment.subject}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#5E6472]">
                            {formatDate(assignment.dueDate)}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-[#0F1B33]">
                              {assignment.submitted}/{assignment.totalStudents}
                            </p>
                            <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-[#E8E4D9]">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${submissionPercentage}%` }}
                              />
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(assignment.status)}`}
                            >
                              {assignment.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAssignment(
                                  isExpanded ? null : assignment.id
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-[#DCD6C9] bg-white px-3 py-2 text-xs font-medium text-[#0F1B33] transition hover:bg-[#F5F2EA]"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              {isExpanded ? "Hide" : "View"}
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={7}
                              className="bg-[#FCFBF8] px-5 py-5"
                            >
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="md:col-span-2">
                                  <h3 className="text-sm font-semibold text-[#0F1B33]">
                                    Assignment Description
                                  </h3>
                                  <p className="mt-2 text-sm text-[#6B7280]">
                                    {assignment.description}
                                  </p>
                                </div>

                                <div className="rounded-lg border border-[#E8E4D9] bg-white p-4">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1B33]">
                                    <Users className="h-4 w-4" />
                                    Submission Progress
                                  </div>
                                  <p className="mt-3 text-2xl font-bold text-[#0F1B33]">
                                    {submissionPercentage}%
                                  </p>
                                  <p className="mt-1 text-xs text-[#8B867A]">
                                    {assignment.submitted} submitted ·{" "}
                                    {assignment.totalStudents - assignment.submitted} pending
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      </Fragment>
                    );
                  })}

                  {filteredAssignments.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-[#8B867A]"
                      >
                        No assignments found. Try changing your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// Summary Card
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
    <div className="rounded-xl border border-[#E8E4D9] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#8B867A]">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-[#0F1B33]">{value}</h2>
          <p className="mt-1 text-xs text-[#8B867A]">{subtitle}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Reusable Filter
type FilterSelectProps = {
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
}: FilterSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#5E6472]">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
