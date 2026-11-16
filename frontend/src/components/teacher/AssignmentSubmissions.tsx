
import { useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RotateCcw,
  Eye,
  X,
  FileText,
  Download,
  MessageSquare,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayouts } from "@/layout/AppLayouts";

type SubmissionStatus = "Pending" | "Reviewed" | "Late";

type Submission = {
  id: number;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  assignmentTitle: string;
  subject: string;
  submittedDate: string;
  dueDate: string;
  fileName: string;
  status: SubmissionStatus;
  marks: number | null;
  maxMarks: number;
  feedback: string;
};

const initialSubmissions: Submission[] = [
  {
    id: 1,
    studentName: "Aarav Sharma",
    rollNumber: "STU-1001",
    className: "Class 10",
    section: "A",
    assignmentTitle: "Algebra – Chapter 5 Exercises",
    subject: "Mathematics",
    submittedDate: "2026-11-15",
    dueDate: "2026-11-20",
    fileName: "aarav_algebra_assignment.pdf",
    status: "Pending",
    marks: null,
    maxMarks: 100,
    feedback: "",
  },
  {
    id: 2,
    studentName: "Ananya Patel",
    rollNumber: "STU-1002",
    className: "Class 10",
    section: "A",
    assignmentTitle: "Algebra – Chapter 5 Exercises",
    subject: "Mathematics",
    submittedDate: "2026-11-14",
    dueDate: "2026-11-20",
    fileName: "ananya_algebra.pdf",
    status: "Reviewed",
    marks: 88,
    maxMarks: 100,
    feedback: "Good work. Keep practicing.",
  },
  {
    id: 3,
    studentName: "Rohan Verma",
    rollNumber: "STU-1003",
    className: "Class 9",
    section: "B",
    assignmentTitle: "Science – Human Body Project",
    subject: "Science",
    submittedDate: "2026-11-27",
    dueDate: "2026-11-25",
    fileName: "rohan_science_project.pdf",
    status: "Late",
    marks: null,
    maxMarks: 100,
    feedback: "",
  },
  {
    id: 4,
    studentName: "Priya Singh",
    rollNumber: "STU-1004",
    className: "Class 10",
    section: "A",
    assignmentTitle: "Quadratic Equations Worksheet",
    subject: "Mathematics",
    submittedDate: "2026-11-12",
    dueDate: "2026-11-14",
    fileName: "priya_worksheet.pdf",
    status: "Reviewed",
    marks: 95,
    maxMarks: 100,
    feedback: "Excellent understanding of the concepts.",
  },
  {
    id: 5,
    studentName: "Kabir Mehta",
    rollNumber: "STU-1005",
    className: "Class 9",
    section: "B",
    assignmentTitle: "Science – Human Body Project",
    subject: "Science",
    submittedDate: "2026-11-18",
    dueDate: "2026-11-25",
    fileName: "kabir_human_body.pdf",
    status: "Pending",
    marks: null,
    maxMarks: 100,
    feedback: "",
  },
  {
    id: 6,
    studentName: "Ishita Gupta",
    rollNumber: "STU-1006",
    className: "Class 9",
    section: "B",
    assignmentTitle: "English Grammar Practice",
    subject: "English",
    submittedDate: "2026-11-04",
    dueDate: "2026-11-05",
    fileName: "ishita_grammar.pdf",
    status: "Reviewed",
    marks: 76,
    maxMarks: 100,
    feedback: "Well done. Revise tenses once again.",
  },
  {
    id: 7,
    studentName: "Aditya Joshi",
    rollNumber: "STU-1007",
    className: "Class 10",
    section: "A",
    assignmentTitle: "Algebra – Chapter 5 Exercises",
    subject: "Mathematics",
    submittedDate: "2026-11-16",
    dueDate: "2026-11-20",
    fileName: "aditya_algebra.pdf",
    status: "Pending",
    marks: null,
    maxMarks: 100,
    feedback: "",
  },
];

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function AssignmentSubmissions() {
  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  const pendingCount = submissions.filter(
    (item) => item.status === "Pending"
  ).length;

  const reviewedCount = submissions.filter(
    (item) => item.status === "Reviewed"
  ).length;

  const lateCount = submissions.filter(
    (item) => item.status === "Late"
  ).length;

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const searchText =
        `${item.studentName} ${item.rollNumber} ${item.assignmentTitle} ${item.subject}`
          .toLowerCase();

      const matchesSearch = searchText.includes(
        searchTerm.toLowerCase()
      );

      const matchesClass =
        selectedClass === "All Classes" ||
        item.className === selectedClass;

      const matchesSubject =
        selectedSubject === "All Subjects" ||
        item.subject === selectedSubject;

      const matchesStatus =
        selectedStatus === "All Status" ||
        item.status === selectedStatus;

      return (
        matchesSearch &&
        matchesClass &&
        matchesSubject &&
        matchesStatus
      );
    });
  }, [
    submissions,
    searchTerm,
    selectedClass,
    selectedSubject,
    selectedStatus,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedClass("All Classes");
    setSelectedSubject("All Subjects");
    setSelectedStatus("All Status");
  };

  const openReview = (submission: Submission) => {
    setSelectedSubmission(submission);
    setMarks(
      submission.marks === null ? "" : String(submission.marks)
    );
    setFeedback(submission.feedback);
  };

  const handleReviewSubmit = () => {
    if (!selectedSubmission) return;

    const enteredMarks = Number(marks);

    if (
      marks.trim() === "" ||
      !Number.isFinite(enteredMarks) ||
      enteredMarks < 0 ||
      enteredMarks > selectedSubmission.maxMarks
    ) {
      toast.error(
        `Enter marks between 0 and ${selectedSubmission.maxMarks}.`
      );
      return;
    }

    setSubmissions((previous) =>
      previous.map((item) =>
        item.id === selectedSubmission.id
          ? {
              ...item,
              marks: enteredMarks,
              feedback: feedback.trim(),
              status: "Reviewed",
            }
          : item
      )
    );

    setSelectedSubmission(null);
    toast.success("Submission reviewed successfully!");
  };

  const getStatusStyle = (status: SubmissionStatus) => {
    switch (status) {
      case "Pending":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "Reviewed":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Late":
        return "border-red-200 bg-red-50 text-red-700";
    }
  };

  return (
    <AppLayouts>
      <div className="min-h-screen bg-[#FBF9F3] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">

          {/* Page Header */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-[#8B867A]">
              <BookOpen className="h-4 w-4" />
              <span>Teacher Portal</span>
              <span>/</span>
              <span>Assignments</span>
              <span>/</span>
              <span className="text-[#5E6472]">Submissions</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
              Assignment Submissions
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              Review student work, evaluate submissions and provide feedback.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Submissions"
              value={submissions.length}
              subtitle="All received submissions"
              icon={<ClipboardList className="h-5 w-5" />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Pending Review"
              value={pendingCount}
              subtitle="Waiting for evaluation"
              icon={<Clock3 className="h-5 w-5" />}
              iconClass="bg-amber-50 text-amber-700"
            />

            <SummaryCard
              title="Reviewed"
              value={reviewedCount}
              subtitle="Evaluation completed"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-700"
            />

            <SummaryCard
              title="Late Submissions"
              value={lateCount}
              subtitle="Submitted after due date"
              icon={<AlertCircle className="h-5 w-5" />}
              iconClass="bg-red-50 text-red-700"
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
                ]}
                onChange={setSelectedSubject}
              />

              <FilterSelect
                label="Status"
                value={selectedStatus}
                options={[
                  "All Status",
                  "Pending",
                  "Reviewed",
                  "Late",
                ]}
                onChange={setSelectedStatus}
              />
            </div>
          </div>

          {/* Submission Table */}
          <div className="overflow-hidden rounded-xl border border-[#E8E4D9] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E8E4D9] p-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#0F1B33]">
                  Student Submissions
                </h2>
                <p className="mt-1 text-sm text-[#8B867A]">
                  Showing {filteredSubmissions.length} of {submissions.length} submissions
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B867A]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search student or assignment..."
                  className="w-full rounded-lg border border-[#DCD6C9] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0F1B33] sm:w-80"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-[#F8F6F0]">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-[#8B867A]">
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Assignment</th>
                    <th className="px-5 py-4">Class</th>
                    <th className="px-5 py-4">Submitted On</th>
                    <th className="px-5 py-4">Marks</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F0EDE5]">
                  {filteredSubmissions.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#FCFBF8]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#0F1B33]">
                          {item.studentName}
                        </p>
                        <p className="mt-1 text-xs text-[#8B867A]">
                          {item.rollNumber}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[230px] text-sm font-medium text-[#0F1B33]">
                          {item.assignmentTitle}
                        </p>
                        <p className="mt-1 text-xs text-[#8B867A]">
                          {item.subject}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#5E6472]">
                        {item.className} - {item.section}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#5E6472]">
                        {formatDate(item.submittedDate)}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#0F1B33]">
                        {item.marks === null
                          ? `— / ${item.maxMarks}`
                          : `${item.marks} / ${item.maxMarks}`}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => openReview(item)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#DCD6C9] bg-white px-3 py-2 text-xs font-medium text-[#0F1B33] transition hover:bg-[#F5F2EA]"
                        >
                          <Eye className="h-4 w-4" />
                          {item.status === "Reviewed" ? "View / Edit" : "Review"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredSubmissions.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-[#8B867A]"
                      >
                        No submissions found. Try changing your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0F1B33]/50 p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8E4D9] px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="review-modal-title"
                  className="text-lg font-bold text-[#0F1B33]"
                >
                  Review Submission
                </h2>
                <p className="mt-1 text-xs text-[#8B867A]">
                  Evaluate student work and provide feedback.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg p-2 text-[#8B867A] transition hover:bg-[#F5F2EA] hover:text-[#0F1B33]"
                aria-label="Close review modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-xl border border-[#E8E4D9] bg-[#FCFBF8] p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#8B867A]">Student</p>
                    <p className="mt-1 text-sm font-semibold text-[#0F1B33]">
                      {selectedSubmission.studentName}
                    </p>
                    <p className="text-xs text-[#8B867A]">
                      {selectedSubmission.rollNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8B867A]">Class / Subject</p>
                    <p className="mt-1 text-sm font-semibold text-[#0F1B33]">
                      {selectedSubmission.className} - {selectedSubmission.section}
                    </p>
                    <p className="text-xs text-[#8B867A]">
                      {selectedSubmission.subject}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs text-[#8B867A]">Assignment</p>
                    <p className="mt-1 text-sm font-semibold text-[#0F1B33]">
                      {selectedSubmission.assignmentTitle}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8B867A]">Submitted On</p>
                    <p className="mt-1 text-sm font-medium text-[#0F1B33]">
                      {formatDate(selectedSubmission.submittedDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8B867A]">Due Date</p>
                    <p className="mt-1 text-sm font-medium text-[#0F1B33]">
                      {formatDate(selectedSubmission.dueDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#0F1B33]">
                  Submitted File
                </p>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E8E4D9] p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0F1B33]">
                        {selectedSubmission.fileName}
                      </p>
                      <p className="text-xs text-[#8B867A]">
                        Sample attachment
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled
                    title="File preview will be available after backend integration"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#DCD6C9] px-3 py-2 text-xs font-medium text-[#8B867A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    File
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0F1B33]">
                  Marks Obtained
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max={selectedSubmission.maxMarks}
                    value={marks}
                    onChange={(event) => setMarks(event.target.value)}
                    placeholder="Enter marks"
                    className="w-full rounded-lg border border-[#DCD6C9] px-3 py-2.5 text-sm outline-none focus:border-[#0F1B33]"
                  />
                  <span className="shrink-0 text-sm text-[#8B867A]">
                    / {selectedSubmission.maxMarks}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0F1B33]">
                  <MessageSquare className="h-4 w-4" />
                  Teacher Feedback
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  maxLength={1000}
                  placeholder="Write feedback for the student..."
                  className="w-full resize-y rounded-lg border border-[#DCD6C9] px-3 py-3 text-sm outline-none focus:border-[#0F1B33]"
                />
                <p className="mt-1 text-right text-xs text-[#8B867A]">
                  {feedback.length}/1000 characters
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#E8E4D9] p-5 sm:flex-row sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg border border-[#DCD6C9] px-5 py-2.5 text-sm font-medium text-[#0F1B33] transition hover:bg-[#F5F2EA]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReviewSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F1B33] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D2B49]"
              >
                <Save className="h-4 w-4" />
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayouts>
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
          <p className="text-sm font-medium text-[#8B867A]">
            {title}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#0F1B33]">
            {value}
          </h2>
          <p className="mt-1 text-xs text-[#8B867A]">
            {subtitle}
          </p>
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
