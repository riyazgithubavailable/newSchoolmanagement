
import { useCallback, useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { AppLayouts } from "@/layout/AppLayouts";
import AdvancedTable, { ColumnType } from "@/utils/AdvancedTable";

type Exam = {
  id: string;
  name: string;
  subject: string;
  className: string;
  section: string;
  maxMarks: number;
};

type StudentMark = {
  id: number;
  examId: string;
  rollNumber: string;
  studentName: string;
  marksObtained: number | "";
};

const exams: Exam[] = [
  {
    id: "exam-1",
    name: "Mid Term Examination",
    subject: "Mathematics",
    className: "Class 10",
    section: "A",
    maxMarks: 100,
  },
  {
    id: "exam-2",
    name: "Unit Test 2",
    subject: "English",
    className: "Class 9",
    section: "B",
    maxMarks: 50,
  },
];

const initialStudents: StudentMark[] = [
  {
    id: 1,
    examId: "exam-1",
    rollNumber: "101",
    studentName: "Aarav Sharma",
    marksObtained: 85,
  },
  {
    id: 2,
    examId: "exam-1",
    rollNumber: "102",
    studentName: "Ananya Patel",
    marksObtained: 92,
  },
  {
    id: 3,
    examId: "exam-1",
    rollNumber: "103",
    studentName: "Rahul Verma",
    marksObtained: 68,
  },
  {
    id: 4,
    examId: "exam-1",
    rollNumber: "104",
    studentName: "Priya Singh",
    marksObtained: "",
  },
  {
    id: 5,
    examId: "exam-1",
    rollNumber: "105",
    studentName: "Kabir Khan",
    marksObtained: 45,
  },
  {
    id: 6,
    examId: "exam-2",
    rollNumber: "201",
    studentName: "Ishita Joshi",
    marksObtained: 42,
  },
  {
    id: 7,
    examId: "exam-2",
    rollNumber: "202",
    studentName: "Aditya Rao",
    marksObtained: 35,
  },
  {
    id: 8,
    examId: "exam-2",
    rollNumber: "203",
    studentName: "Meera Deshmukh",
    marksObtained: "",
  },
  {
    id: 9,
    examId: "exam-2",
    rollNumber: "204",
    studentName: "Arjun Mehta",
    marksObtained: 28,
  },
];

const getPercentage = (
  marks: number | "",
  maxMarks: number
) => {
  if (marks === "") return 0;
  return (marks / maxMarks) * 100;
};

const getGrade = (percentage: number) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "D";
  return "F";
};

const getResult = (
  marks: number | "",
  maxMarks: number
) => {
  if (marks === "") return "Pending";
  return getPercentage(marks, maxMarks) >= 35
    ? "Pass"
    : "Fail";
};

export default function TeacherEnterMarks() {
  const [students, setStudents] =
    useState<StudentMark[]>(initialStudents);

  const [selectedExamId, setSelectedExamId] =
    useState("exam-1");

  const selectedExam = exams.find(
    (exam) => exam.id === selectedExamId
  )!;

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) => student.examId === selectedExamId
      ),
    [students, selectedExamId]
  );

  const pendingCount = filteredStudents.filter(
    (student) => student.marksObtained === ""
  ).length;

  const enteredCount =
    filteredStudents.length - pendingCount;

  const passedCount = filteredStudents.filter(
    (student) =>
      getResult(
        student.marksObtained,
        selectedExam.maxMarks
      ) === "Pass"
  ).length;

  const handleMarksChange = useCallback(
    (studentId: number, value: string) => {
      const marks =
        value === "" ? "" : Number(value);

      if (
        marks !== "" &&
        (!Number.isFinite(marks) ||
          marks < 0 ||
          marks > selectedExam.maxMarks)
      ) {
        return;
      }

      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId &&
          student.examId === selectedExamId
            ? { ...student, marksObtained: marks }
            : student
        )
      );
    },
    [selectedExam.maxMarks, selectedExamId]
  );

  const columns = useMemo<ColumnType<StudentMark>[]>(
    () => [
      {
        key: "rollNumber",
        header: "Roll No.",
        defaultWidth: 110,
        sortValue: (student) => Number(student.rollNumber),
      },
      {
        key: "studentName",
        header: "Student Name",
        defaultWidth: 220,
        cell: (student) => (
          <div>
            <p className="font-semibold text-sm text-[#0F1B33]">
              {student.studentName}
            </p>
            <p className="mt-1 text-xs text-[#8B867A]">
              Student ID: #{student.id}
            </p>
          </div>
        ),
        sortValue: (student) => student.studentName,
      },
      {
        key: "marksObtained",
        header: "Obtained Marks",
        defaultWidth: 160,
        align: "center",
        cell: (student) => (
          <input
            type="number"
            min={0}
            max={selectedExam.maxMarks}
            step="1"
            value={student.marksObtained}
            onChange={(event) =>
              handleMarksChange(
                student.id,
                event.target.value
              )
            }
            placeholder="Enter marks"
            aria-label={`Marks for ${student.studentName}`}
            className="w-28 rounded-lg border border-[#DCD6C9] bg-white px-3 py-2 text-center text-sm text-[#0F1B33] outline-none transition focus:border-[#0F1B33] focus:ring-2 focus:ring-[#0F1B33]/10"
          />
        ),
        sortValue: (student) =>
          student.marksObtained === ""
            ? -1
            : student.marksObtained,
        exportValue: (student) =>
          student.marksObtained === ""
            ? "Not Entered"
            : student.marksObtained,
      },
      {
        key: "percentage",
        header: "Percentage",
        defaultWidth: 120,
        align: "center",
        cell: (student) => (
          <span className="text-sm font-medium text-[#5E6472]">
            {student.marksObtained === ""
              ? "—"
              : `${getPercentage(
                  student.marksObtained,
                  selectedExam.maxMarks
                ).toFixed(1)}%`}
          </span>
        ),
        sortValue: (student) =>
          getPercentage(
            student.marksObtained,
            selectedExam.maxMarks
          ),
        exportValue: (student) =>
          student.marksObtained === ""
            ? "—"
            : `${getPercentage(
                student.marksObtained,
                selectedExam.maxMarks
              ).toFixed(1)}%`,
      },
      {
        key: "grade",
        header: "Grade",
        defaultWidth: 100,
        align: "center",
        cell: (student) => (
          <span className="text-sm font-semibold text-[#0F1B33]">
            {student.marksObtained === ""
              ? "—"
              : getGrade(
                  getPercentage(
                    student.marksObtained,
                    selectedExam.maxMarks
                  )
                )}
          </span>
        ),
        sortValue: (student) =>
          student.marksObtained === ""
            ? ""
            : getGrade(
                getPercentage(
                  student.marksObtained,
                  selectedExam.maxMarks
                )
              ),
      },
      {
        key: "result",
        header: "Result",
        defaultWidth: 120,
        align: "center",
        cell: (student) => {
          const result = getResult(
            student.marksObtained,
            selectedExam.maxMarks
          );

          const styles = {
            Pass: "border-emerald-200 bg-emerald-50 text-emerald-700",
            Fail: "border-red-200 bg-red-50 text-red-700",
            Pending: "border-amber-200 bg-amber-50 text-amber-700",
          };

          return (
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles[result]}`}
            >
              {result}
            </span>
          );
        },
        sortValue: (student) =>
          getResult(
            student.marksObtained,
            selectedExam.maxMarks
          ),
      },
    ],
    [handleMarksChange, selectedExam.maxMarks]
  );

  const handleSaveMarks = () => {
    const hasInvalidMarks = filteredStudents.some(
      (student) =>
        student.marksObtained !== "" &&
        (student.marksObtained < 0 ||
          student.marksObtained > selectedExam.maxMarks)
    );

    if (hasInvalidMarks) {
      window.alert("Please enter valid marks.");
      return;
    }

    if (pendingCount > 0) {
      window.alert(
        `Please enter marks for all students. ${pendingCount} student(s) are still pending.`
      );
      return;
    }

    window.alert(
      "Marks validated successfully! Backend saving will be connected later."
    );
  };

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
                <span className="text-[#5E6472]">
                  Enter Marks
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
                Enter Marks
              </h1>

              <p className="mt-1 text-sm text-[#6B7280]">
                Enter and update student examination marks.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveMarks}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F1B33] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D2B49] hover:shadow-md active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              Save Marks
            </button>
          </div>

          {/* Exam Selection */}
          <div className="mb-6 rounded-xl border border-[#E8E4D9] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#0F1B33]" />
              <h2 className="font-semibold text-[#0F1B33]">
                Examination Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="xl:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                  Select Examination
                </label>
                <select
                  value={selectedExamId}
                  onChange={(event) =>
                    setSelectedExamId(event.target.value)
                  }
                  className="w-full rounded-lg border border-[#DCD6C9] bg-white px-3 py-2.5 text-sm text-[#0F1B33] outline-none focus:border-[#0F1B33]"
                >
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} - {exam.subject}
                    </option>
                  ))}
                </select>
              </div>

              <InfoField
                label="Class / Section"
                value={`${selectedExam.className} - ${selectedExam.section}`}
              />

              <InfoField
                label="Maximum Marks"
                value={`${selectedExam.maxMarks} Marks`}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#8B867A]">
              <span className="rounded-md bg-[#F8F6F0] px-3 py-2">
                Subject: {selectedExam.subject}
              </span>
              <span className="rounded-md bg-[#F8F6F0] px-3 py-2">
                Students: {filteredStudents.length}
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Students"
              value={filteredStudents.length}
              subtitle="Students in selected exam"
              icon={<GraduationCap className="h-5 w-5" />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Marks Entered"
              value={enteredCount}
              subtitle="Students with marks"
              icon={<ClipboardList className="h-5 w-5" />}
              iconClass="bg-violet-50 text-violet-700"
            />

            <SummaryCard
              title="Pending"
              value={pendingCount}
              subtitle="Marks not entered yet"
              icon={<AlertCircle className="h-5 w-5" />}
              iconClass="bg-amber-50 text-amber-700"
            />

            <SummaryCard
              title="Passed"
              value={passedCount}
              subtitle="Students meeting pass criteria"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-700"
            />
          </div>

          {/* Marks Table */}
          <AdvancedTable<StudentMark>
            title="Student Marks"
            description={`Enter marks for ${selectedExam.subject} - ${selectedExam.className} ${selectedExam.section}`}
            data={filteredStudents}
            columns={columns}
            enableSearch={true}
            searchPlaceholder="Search students..."
            searchKeys={[
              "rollNumber",
              "studentName",
            ]}
            enablePagination={true}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50, 100]}
            enableColumnToggle={true}
            enableColumnResize={true}
            stickyHeader={true}
            enableExport={true}
            enablePDFExport={true}
            exportFileName="student-marks"
            exportSheetName="Student Marks"
            rowKey={(student) => student.id}
            initialSort={{
              key: "rollNumber",
              dir: "asc",
            }}
            emptyText="No students found for this examination."
          />

          {/* Instructions */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#E8E4D9] bg-white p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#8B867A]" />
            <div>
              <h3 className="text-sm font-semibold text-[#0F1B33]">
                Marks Entry Guidelines
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#8B867A]">
                Enter marks between 0 and {selectedExam.maxMarks}.
                Percentage and grade are calculated automatically.
                Students scoring 35% or above are marked as Pass.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayouts>
  );
}

type InfoFieldProps = {
  label: string;
  value: string;
};

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#5E6472]">
        {label}
      </label>
      <div className="rounded-lg border border-[#E8E4D9] bg-[#F8F6F0] px-3 py-2.5 text-sm font-medium text-[#0F1B33]">
        {value}
      </div>
    </div>
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
