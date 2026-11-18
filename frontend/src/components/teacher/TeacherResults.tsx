import { useMemo, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Award,
  TrendingUp,
  Users,
  Eye,
  X,
  Filter,
  RotateCcw,
} from "lucide-react";

import AdvancedTable, { ColumnType } from "@/utils/AdvancedTable";

type ExamResult = {
  id: number;
  examId: string;
  examName: string;
  className: string;
  section: string;
  subject: string;
  rollNumber: string;
  studentName: string;
  obtainedMarks: number;
  totalMarks: number;
};

const initialResults: ExamResult[] = [
  {
    id: 1,
    examId: "exam-1",
    examName: "Mid Term Examination",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    rollNumber: "101",
    studentName: "Aarav Sharma",
    obtainedMarks: 85,
    totalMarks: 100,
  },
  {
    id: 2,
    examId: "exam-1",
    examName: "Mid Term Examination",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    rollNumber: "102",
    studentName: "Ananya Patel",
    obtainedMarks: 92,
    totalMarks: 100,
  },
  {
    id: 3,
    examId: "exam-1",
    examName: "Mid Term Examination",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    rollNumber: "103",
    studentName: "Rahul Verma",
    obtainedMarks: 28,
    totalMarks: 100,
  },
  {
    id: 4,
    examId: "exam-1",
    examName: "Mid Term Examination",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    rollNumber: "104",
    studentName: "Priya Singh",
    obtainedMarks: 76,
    totalMarks: 100,
  },
  {
    id: 5,
    examId: "exam-1",
    examName: "Mid Term Examination",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    rollNumber: "105",
    studentName: "Kabir Khan",
    obtainedMarks: 45,
    totalMarks: 100,
  },
  {
    id: 6,
    examId: "exam-2",
    examName: "Unit Test 2",
    className: "Class 9",
    section: "B",
    subject: "English",
    rollNumber: "201",
    studentName: "Ishita Joshi",
    obtainedMarks: 42,
    totalMarks: 50,
  },
  {
    id: 7,
    examId: "exam-2",
    examName: "Unit Test 2",
    className: "Class 9",
    section: "B",
    subject: "English",
    rollNumber: "202",
    studentName: "Aditya Rao",
    obtainedMarks: 35,
    totalMarks: 50,
  },
  {
    id: 8,
    examId: "exam-2",
    examName: "Unit Test 2",
    className: "Class 9",
    section: "B",
    subject: "English",
    rollNumber: "203",
    studentName: "Meera Deshmukh",
    obtainedMarks: 18,
    totalMarks: 50,
  },
  {
    id: 9,
    examId: "exam-2",
    examName: "Unit Test 2",
    className: "Class 9",
    section: "B",
    subject: "English",
    rollNumber: "204",
    studentName: "Arjun Mehta",
    obtainedMarks: 46,
    totalMarks: 50,
  },
];

const getPercentage = (obtained: number, total: number) =>
  total > 0 ? (obtained / total) * 100 : 0;

const getGrade = (percentage: number) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "D";
  return "F";
};

const getResult = (obtained: number, total: number) =>
  getPercentage(obtained, total) >= 35 ? "Pass" : "Fail";

export default function TeacherResults() {
  const [results] = useState<ExamResult[]>(initialResults);

  const [selectedExam, setSelectedExam] = useState("All Exams");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedStudent, setSelectedStudent] =
    useState<ExamResult | null>(null);

  const examOptions = useMemo(
    () => Array.from(new Set(results.map((item) => item.examName))),
    [results]
  );

  const classOptions = useMemo(
    () => Array.from(new Set(results.map((item) => item.className))),
    [results]
  );

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchesExam =
        selectedExam === "All Exams" ||
        item.examName === selectedExam;

      const matchesClass =
        selectedClass === "All Classes" ||
        item.className === selectedClass;

      return matchesExam && matchesClass;
    });
  }, [results, selectedExam, selectedClass]);

  const totalStudents = filteredResults.length;

  const passedStudents = filteredResults.filter(
    (item) => getResult(item.obtainedMarks, item.totalMarks) === "Pass"
  ).length;

  const failedStudents = totalStudents - passedStudents;

  const averagePercentage =
    totalStudents > 0
      ? filteredResults.reduce(
          (sum, item) =>
            sum + getPercentage(item.obtainedMarks, item.totalMarks),
          0
        ) / totalStudents
      : 0;

  const clearFilters = () => {
    setSelectedExam("All Exams");
    setSelectedClass("All Classes");
  };

  const columns = useMemo<ColumnType<ExamResult>[]>(
    () => [
      {
        key: "rollNumber",
        header: "Roll No.",
        defaultWidth: 100,
        sortValue: (row) => Number(row.rollNumber),
      },
      {
        key: "studentName",
        header: "Student Name",
        defaultWidth: 210,
        cell: (row) => (
          <div>
            <p className="text-sm font-semibold text-[#0F1B33]">
              {row.studentName}
            </p>
            <p className="mt-1 text-xs text-[#8B867A]">
              Student ID: #{row.id}
            </p>
          </div>
        ),
        sortValue: (row) => row.studentName,
      },
      {
        key: "className",
        header: "Class / Section",
        defaultWidth: 130,
        cell: (row) => (
          <span className="text-sm text-[#5E6472]">
            {row.className} - {row.section}
          </span>
        ),
        sortValue: (row) => `${row.className} ${row.section}`,
      },
      {
        key: "subject",
        header: "Subject",
        defaultWidth: 150,
        sortValue: (row) => row.subject,
      },
      {
        key: "obtainedMarks",
        header: "Obtained Marks",
        defaultWidth: 130,
        align: "center",
        cell: (row) => (
          <span className="text-sm font-semibold text-[#0F1B33]">
            {row.obtainedMarks}
          </span>
        ),
        sortValue: (row) => row.obtainedMarks,
      },
      {
        key: "totalMarks",
        header: "Total Marks",
        defaultWidth: 110,
        align: "center",
        sortValue: (row) => row.totalMarks,
      },
      {
        key: "percentage",
        header: "Percentage",
        defaultWidth: 120,
        align: "center",
        cell: (row) => (
          <span className="text-sm font-medium text-[#5E6472]">
            {getPercentage(
              row.obtainedMarks,
              row.totalMarks
            ).toFixed(1)}%
          </span>
        ),
        sortValue: (row) =>
          getPercentage(row.obtainedMarks, row.totalMarks),
        exportValue: (row) =>
          `${getPercentage(
            row.obtainedMarks,
            row.totalMarks
          ).toFixed(1)}%`,
      },
      {
        key: "grade",
        header: "Grade",
        defaultWidth: 90,
        align: "center",
        cell: (row) => (
          <span className="inline-flex rounded-md bg-[#F8F6F0] px-3 py-1 text-xs font-semibold text-[#0F1B33]">
            {getGrade(
              getPercentage(row.obtainedMarks, row.totalMarks)
            )}
          </span>
        ),
        sortValue: (row) =>
          getGrade(getPercentage(row.obtainedMarks, row.totalMarks)),
      },
      {
        key: "result",
        header: "Result",
        defaultWidth: 100,
        align: "center",
        cell: (row) => {
          const status = getResult(
            row.obtainedMarks,
            row.totalMarks
          );

          return (
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                status === "Pass"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {status}
            </span>
          );
        },
        sortValue: (row) =>
          getResult(row.obtainedMarks, row.totalMarks),
      },
      {
        key: "actions",
        header: "Actions",
        defaultWidth: 90,
        align: "center",
        hideable: false,
        exportable: false,
        cell: (row) => (
          <button
            type="button"
            onClick={() => setSelectedStudent(row)}
            title="View Result"
            className="rounded-lg border border-[#DCD6C9] p-2 text-[#0F1B33] transition hover:border-[#0F1B33] hover:bg-[#F8F6F0]"
          >
            <Eye className="h-4 w-4" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="min-h-screen bg-[#FBF9F3] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">

          {/* Header */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-[#8B867A]">
              <BookOpen className="h-4 w-4" />
              <span>Teacher Portal</span>
              <span>/</span>
              <span>Exams & Results</span>
              <span>/</span>
              <span className="text-[#5E6472]">Student Results</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
              Student Results
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              View and analyze student academic performance and examination results.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl border border-[#E8E4D9] bg-white p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#0F1B33]" />
                <h2 className="font-semibold text-[#0F1B33]">
                  Result Filters
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
                label="Examination"
                value={selectedExam}
                options={["All Exams", ...examOptions]}
                onChange={setSelectedExam}
              />

              <FilterSelect
                label="Class"
                value={selectedClass}
                options={["All Classes", ...classOptions]}
                onChange={setSelectedClass}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Students"
              value={totalStudents}
              subtitle="Students in selected filters"
              icon={<Users className="h-5 w-5" />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Passed"
              value={passedStudents}
              subtitle="Students successfully passed"
              icon={<GraduationCap className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-700"
            />

            <SummaryCard
              title="Failed"
              value={failedStudents}
              subtitle="Students below passing marks"
              icon={<Award className="h-5 w-5" />}
              iconClass="bg-red-50 text-red-700"
            />

            <SummaryCard
              title="Class Average"
              value={`${averagePercentage.toFixed(1)}%`}
              subtitle="Average student percentage"
              icon={<TrendingUp className="h-5 w-5" />}
              iconClass="bg-violet-50 text-violet-700"
            />
          </div>

          {/* Results Table */}
          <AdvancedTable<ExamResult>
            title="Examination Results"
            description={`Showing ${filteredResults.length} student results`}
            data={filteredResults}
            columns={columns}
            enableSearch={true}
            searchPlaceholder="Search students..."
            searchKeys={[
              "rollNumber",
              "studentName",
              "className",
              "section",
              "subject",
              "examName",
            ]}
            enablePagination={true}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50, 100]}
            enableColumnToggle={true}
            enableColumnResize={true}
            stickyHeader={true}
            enableExport={true}
            enablePDFExport={true}
            exportFileName="student-results"
            exportSheetName="Student Results"
            rowKey={(row) => row.id}
            initialSort={{
              key: "rollNumber",
              dir: "asc",
            }}
            emptyText="No student results found. Try changing your filters."
          />
        </div>
      </div>

      {/* Individual Result Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8E4D9] p-5">
              <div>
                <h2 className="text-lg font-bold text-[#0F1B33]">
                  Student Result
                </h2>
                <p className="mt-1 text-sm text-[#8B867A]">
                  Individual examination performance
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F5F2EA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs text-[#8B867A]">Student Name</p>
                <h3 className="mt-1 text-lg font-bold text-[#0F1B33]">
                  {selectedStudent.studentName}
                </h3>
                <p className="mt-1 text-sm text-[#5E6472]">
                  Roll No. {selectedStudent.rollNumber} ·{" "}
                  {selectedStudent.className} - {selectedStudent.section}
                </p>
              </div>

              <div className="rounded-lg bg-[#F8F6F0] p-4">
                <p className="text-xs text-[#8B867A]">Examination</p>
                <p className="mt-1 font-semibold text-[#0F1B33]">
                  {selectedStudent.examName}
                </p>
                <p className="mt-1 text-sm text-[#5E6472]">
                  Subject: {selectedStudent.subject}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ResultDetail
                  label="Obtained Marks"
                  value={String(selectedStudent.obtainedMarks)}
                />
                <ResultDetail
                  label="Maximum Marks"
                  value={String(selectedStudent.totalMarks)}
                />
                <ResultDetail
                  label="Percentage"
                  value={`${getPercentage(
                    selectedStudent.obtainedMarks,
                    selectedStudent.totalMarks
                  ).toFixed(1)}%`}
                />
                <ResultDetail
                  label="Grade"
                  value={getGrade(
                    getPercentage(
                      selectedStudent.obtainedMarks,
                      selectedStudent.totalMarks
                    )
                  )}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[#E8E4D9] p-4">
                <span className="text-sm font-medium text-[#5E6472]">
                  Final Result
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    getResult(
                      selectedStudent.obtainedMarks,
                      selectedStudent.totalMarks
                    ) === "Pass"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {getResult(
                    selectedStudent.obtainedMarks,
                    selectedStudent.totalMarks
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#E8E4D9] p-5">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg bg-[#0F1B33] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D2B49]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type SummaryCardProps = {
  title: string;
  value: number | string;
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
    <div className="rounded-xl border border-[#E8E4D9] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#DCD6C9] hover:bg-[#F8F6F0] hover:shadow-sm">
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

function ResultDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#E8E4D9] p-3">
      <p className="text-xs text-[#8B867A]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#0F1B33]">
        {value}
      </p>
    </div>
  );
}
