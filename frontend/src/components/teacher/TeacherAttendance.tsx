
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  UserCheck,
  UserX,
  Clock3,
  Search,
  Check,
  Save,
  RotateCcw,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayouts } from "@/layout/AppLayouts";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Unmarked";

type Student = {
  id: number;
  rollNo: number;
  name: string;
  status: AttendanceStatus;
};

const initialStudents: Student[] = [
  { id: 1, rollNo: 1, name: "Aarav Sharma", status: "Unmarked" },
  { id: 2, rollNo: 2, name: "Ananya Patel", status: "Unmarked" },
  { id: 3, rollNo: 3, name: "Arjun Verma", status: "Unmarked" },
  { id: 4, rollNo: 4, name: "Diya Singh", status: "Unmarked" },
  { id: 5, rollNo: 5, name: "Ishaan Gupta", status: "Unmarked" },
  { id: 6, rollNo: 6, name: "Kavya Joshi", status: "Unmarked" },
  { id: 7, rollNo: 7, name: "Krish Mehta", status: "Unmarked" },
  { id: 8, rollNo: 8, name: "Meera Shah", status: "Unmarked" },
  { id: 9, rollNo: 9, name: "Rahul Kumar", status: "Unmarked" },
  { id: 10, rollNo: 10, name: "Saanvi Rao", status: "Unmarked" },
];

const today = new Date().toISOString().split("T")[0];

export default function TeacherAttendance() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toString().includes(searchTerm)
    );
  }, [students, searchTerm]);

  const presentCount = students.filter(
    (student) => student.status === "Present"
  ).length;

  const absentCount = students.filter(
    (student) => student.status === "Absent"
  ).length;

  const lateCount = students.filter(
    (student) => student.status === "Late"
  ).length;

  const unmarkedCount = students.filter(
    (student) => student.status === "Unmarked"
  ).length;

  const updateAttendance = (
    studentId: number,
    status: AttendanceStatus
  ) => {
    setStudents((previousStudents) =>
      previousStudents.map((student) =>
        student.id === studentId
          ? { ...student, status }
          : student
      )
    );
  };

  const markAllPresent = () => {
    setStudents((previousStudents) =>
      previousStudents.map((student) => ({
        ...student,
        status: "Present",
      }))
    );

    toast.success("All students marked as present.");
  };

  const resetAttendance = () => {
    setStudents((previousStudents) =>
      previousStudents.map((student) => ({
        ...student,
        status: "Unmarked",
      }))
    );

    toast.info("Attendance has been reset.");
  };

  const saveAttendance = () => {
    if (unmarkedCount > 0) {
      toast.error(
        `Please mark attendance for all ${unmarkedCount} remaining students.`
      );
      return;
    }

    // TODO: Connect this with the backend attendance API.
    console.log("Attendance Payload:", {
      class: selectedClass,
      section: selectedSection,
      subject: selectedSubject,
      date: attendanceDate,
      students: students.map(({ id, status }) => ({
        studentId: id,
        status,
      })),
    });

    toast.success("Attendance saved successfully!");
  };

  const statusStyle = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Absent":
        return "border-red-200 bg-red-50 text-red-700";
      case "Late":
        return "border-amber-200 bg-amber-50 text-amber-700";
      default:
        return "border-[#E8E4D9] bg-white text-[#8B867A]";
    }
  };

  return (
    <AppLayouts>
      <div className="min-h-screen bg-[#FBF9F3] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">

          {/* Page Header */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-[#8B867A]">
              <CalendarDays className="h-4 w-4" />
              <span>Teacher Portal</span>
              <span>/</span>
              <span>Attendance</span>
              <span>/</span>
              <span className="text-[#5E6472]">Mark Attendance</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
              Mark Attendance
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              Manage daily student attendance for your assigned classes.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Students"
              value={students.length}
              subtitle="Students in selected class"
              icon={<Users className="h-5 w-5" />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Present"
              value={presentCount}
              subtitle="Students present today"
              icon={<UserCheck className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-700"
            />

            <SummaryCard
              title="Absent"
              value={absentCount}
              subtitle="Students absent today"
              icon={<UserX className="h-5 w-5" />}
              iconClass="bg-red-50 text-red-700"
            />

            <SummaryCard
              title="Late"
              value={lateCount}
              subtitle={`${unmarkedCount} students not marked`}
              icon={<Clock3 className="h-5 w-5" />}
              iconClass="bg-amber-50 text-amber-700"
            />
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl border border-[#E8E4D9] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-[#0F1B33]" />
              <h2 className="font-semibold text-[#0F1B33]">
                Attendance Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FilterSelect
                label="Class"
                value={selectedClass}
                options={["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"]}
                onChange={setSelectedClass}
              />

              <FilterSelect
                label="Section"
                value={selectedSection}
                options={["A", "B", "C", "D"]}
                onChange={setSelectedSection}
              />

              <FilterSelect
                label="Subject"
                value={selectedSubject}
                options={["Mathematics", "Science", "English", "Computer Science"]}
                onChange={setSelectedSubject}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  max={today}
                  onChange={(event) => setAttendanceDate(event.target.value)}
                  className="w-full rounded-lg border border-[#DCD6C9] bg-white px-3 py-2.5 text-sm text-[#0F1B33] outline-none focus:border-[#0F1B33]"
                />
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="overflow-hidden rounded-xl border border-[#E8E4D9] bg-white">

            {/* Table Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#E8E4D9] p-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#0F1B33]">
                  Student Attendance
                </h2>
                <p className="mt-1 text-sm text-[#8B867A]">
                  {selectedClass} - Section {selectedSection} ·{" "}
                  {students.length} Students
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B867A]" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full rounded-lg border border-[#DCD6C9] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0F1B33] sm:w-52"
                  />
                </div>

                <button
                  type="button"
                  onClick={markAllPresent}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" />
                  Mark All Present
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-[#F8F6F0]">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-[#8B867A]">
                    <th className="px-5 py-4">Roll No.</th>
                    <th className="px-5 py-4">Student Name</th>
                    <th className="px-5 py-4">Current Status</th>
                    <th className="px-5 py-4 text-center">Mark Attendance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F0EDE5]">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="transition hover:bg-[#FCFBF8]">
                      <td className="px-5 py-4 text-sm text-[#6B7280]">
                        {student.rollNo.toString().padStart(2, "0")}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#0F1B33]">
                          {student.name}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyle(student.status)}`}
                        >
                          {student.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <StatusButton
                            label="Present"
                            active={student.status === "Present"}
                            onClick={() => updateAttendance(student.id, "Present")}
                            activeClass="bg-emerald-600 text-white border-emerald-600"
                          />

                          <StatusButton
                            label="Absent"
                            active={student.status === "Absent"}
                            onClick={() => updateAttendance(student.id, "Absent")}
                            activeClass="bg-red-600 text-white border-red-600"
                          />

                          <StatusButton
                            label="Late"
                            active={student.status === "Late"}
                            onClick={() => updateAttendance(student.id, "Late")}
                            activeClass="bg-amber-500 text-white border-amber-500"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-sm text-[#8B867A]">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col justify-between gap-3 border-t border-[#E8E4D9] bg-[#FCFBF8] p-5 sm:flex-row sm:items-center">
              <p className="text-sm text-[#8B867A]">
                {unmarkedCount > 0
                  ? `${unmarkedCount} students still need attendance marking.`
                  : "All students have been marked."}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetAttendance}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DCD6C9] bg-white px-4 py-2.5 text-sm font-medium text-[#0F1B33] transition hover:bg-[#F5F2EA]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={saveAttendance}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0F1B33] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D2B49]"
                >
                  <Save className="h-4 w-4" />
                  Save Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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

// Attendance Status Button
type StatusButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  activeClass: string;
};

function StatusButton({
  label,
  active,
  onClick,
  activeClass,
}: StatusButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? activeClass
          : "border-[#E8E4D9] bg-white text-[#6B7280] hover:bg-[#F8F6F0]"
      }`}
    >
      {label}
    </button>
  );
}
