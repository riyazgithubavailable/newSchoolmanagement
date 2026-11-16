
import { Fragment, useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  UserCheck,
  UserX,
  Clock3,
  Search,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Filter,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { AppLayouts } from "@/layout/AppLayouts";

type AttendanceStatus = "Present" | "Absent" | "Late";

type StudentRecord = {
  id: number;
  rollNo: number;
  name: string;
  status: AttendanceStatus;
};

type AttendanceRecord = {
  id: number;
  date: string;
  className: string;
  section: string;
  subject: string;
  teacher: string;
  students: StudentRecord[];
};

const attendanceHistory: AttendanceRecord[] = [
  {
    id: 1,
    date: "2026-11-16",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    teacher: "Riyaz Sheikh",
    students: [
      { id: 1, rollNo: 1, name: "Aarav Sharma", status: "Present" },
      { id: 2, rollNo: 2, name: "Ananya Patel", status: "Present" },
      { id: 3, rollNo: 3, name: "Arjun Verma", status: "Absent" },
      { id: 4, rollNo: 4, name: "Diya Singh", status: "Present" },
      { id: 5, rollNo: 5, name: "Ishaan Gupta", status: "Late" },
      { id: 6, rollNo: 6, name: "Kavya Joshi", status: "Present" },
      { id: 7, rollNo: 7, name: "Krish Mehta", status: "Present" },
      { id: 8, rollNo: 8, name: "Meera Shah", status: "Present" },
      { id: 9, rollNo: 9, name: "Rahul Kumar", status: "Absent" },
      { id: 10, rollNo: 10, name: "Saanvi Rao", status: "Present" },
    ],
  },
  {
    id: 2,
    date: "2026-11-15",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    teacher: "Riyaz Sheikh",
    students: [
      { id: 1, rollNo: 1, name: "Aarav Sharma", status: "Present" },
      { id: 2, rollNo: 2, name: "Ananya Patel", status: "Absent" },
      { id: 3, rollNo: 3, name: "Arjun Verma", status: "Present" },
      { id: 4, rollNo: 4, name: "Diya Singh", status: "Present" },
      { id: 5, rollNo: 5, name: "Ishaan Gupta", status: "Present" },
      { id: 6, rollNo: 6, name: "Kavya Joshi", status: "Late" },
      { id: 7, rollNo: 7, name: "Krish Mehta", status: "Present" },
      { id: 8, rollNo: 8, name: "Meera Shah", status: "Present" },
      { id: 9, rollNo: 9, name: "Rahul Kumar", status: "Present" },
      { id: 10, rollNo: 10, name: "Saanvi Rao", status: "Present" },
    ],
  },
  {
    id: 3,
    date: "2026-11-14",
    className: "Class 9",
    section: "B",
    subject: "Science",
    teacher: "Riyaz Sheikh",
    students: [
      { id: 1, rollNo: 1, name: "Aarav Sharma", status: "Present" },
      { id: 2, rollNo: 2, name: "Ananya Patel", status: "Present" },
      { id: 3, rollNo: 3, name: "Arjun Verma", status: "Present" },
      { id: 4, rollNo: 4, name: "Diya Singh", status: "Late" },
      { id: 5, rollNo: 5, name: "Ishaan Gupta", status: "Absent" },
      { id: 6, rollNo: 6, name: "Kavya Joshi", status: "Present" },
    ],
  },
  {
    id: 4,
    date: "2026-11-13",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    teacher: "Riyaz Sheikh",
    students: [
      { id: 1, rollNo: 1, name: "Aarav Sharma", status: "Present" },
      { id: 2, rollNo: 2, name: "Ananya Patel", status: "Present" },
      { id: 3, rollNo: 3, name: "Arjun Verma", status: "Present" },
      { id: 4, rollNo: 4, name: "Diya Singh", status: "Absent" },
      { id: 5, rollNo: 5, name: "Ishaan Gupta", status: "Late" },
      { id: 6, rollNo: 6, name: "Kavya Joshi", status: "Present" },
      { id: 7, rollNo: 7, name: "Krish Mehta", status: "Present" },
      { id: 8, rollNo: 8, name: "Meera Shah", status: "Present" },
    ],
  },
  {
    id: 5,
    date: "2026-11-12",
    className: "Class 9",
    section: "B",
    subject: "English",
    teacher: "Riyaz Sheikh",
    students: [
      { id: 1, rollNo: 1, name: "Aarav Sharma", status: "Absent" },
      { id: 2, rollNo: 2, name: "Ananya Patel", status: "Present" },
      { id: 3, rollNo: 3, name: "Arjun Verma", status: "Present" },
      { id: 4, rollNo: 4, name: "Diya Singh", status: "Present" },
      { id: 5, rollNo: 5, name: "Ishaan Gupta", status: "Present" },
      { id: 6, rollNo: 6, name: "Kavya Joshi", status: "Late" },
    ],
  },
];

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function TeacherAttendanceHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);

  const filteredRecords = useMemo(() => {
    return attendanceHistory.filter((record) => {
      const matchesClass =
        selectedClass === "All Classes" ||
        record.className === selectedClass;

      const matchesSection =
        selectedSection === "All Sections" ||
        record.section === selectedSection;

      const matchesSubject =
        selectedSubject === "All Subjects" ||
        record.subject === selectedSubject;

      const matchesFromDate =
        !fromDate || record.date >= fromDate;

      const matchesToDate =
        !toDate || record.date <= toDate;

      const matchesStatus =
        selectedStatus === "All Status" ||
        record.students.some((student) =>
          student.status === selectedStatus
        );

      const matchesSearch =
        `${record.className} ${record.section} ${record.subject} ${record.teacher}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.students.some((student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return (
        matchesClass &&
        matchesSection &&
        matchesSubject &&
        matchesFromDate &&
        matchesToDate &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    searchTerm,
    selectedClass,
    selectedSection,
    selectedSubject,
    selectedStatus,
    fromDate,
    toDate,
  ]);

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (summary, record) => {
        record.students.forEach((student) => {
          summary.total += 1;
          if (student.status === "Present") summary.present += 1;
          if (student.status === "Absent") summary.absent += 1;
          if (student.status === "Late") summary.late += 1;
        });
        return summary;
      },
      { total: 0, present: 0, absent: 0, late: 0 }
    );
  }, [filteredRecords]);

  const attendancePercentage =
    totals.total > 0
      ? Math.round((totals.present / totals.total) * 100)
      : 0;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedClass("All Classes");
    setSelectedSection("All Sections");
    setSelectedSubject("All Subjects");
    setSelectedStatus("All Status");
    setFromDate("");
    setToDate("");
    setExpandedRecord(null);
  };

  const getStatusStyle = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Absent":
        return "border-red-200 bg-red-50 text-red-700";
      case "Late":
        return "border-amber-200 bg-amber-50 text-amber-700";
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
              <span className="text-[#5E6472]">Attendance History</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
              Attendance History
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              Review and track previously marked student attendance.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Attendance Records"
              value={filteredRecords.length}
              subtitle="Sessions matching filters"
              icon={<ClipboardList className="h-5 w-5" />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Present"
              value={totals.present}
              subtitle="Present student entries"
              icon={<UserCheck className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-700"
            />

            <SummaryCard
              title="Absent"
              value={totals.absent}
              subtitle="Absent student entries"
              icon={<UserX className="h-5 w-5" />}
              iconClass="bg-red-50 text-red-700"
            />

            <SummaryCard
              title="Attendance Rate"
              value={`${attendancePercentage}%`}
              subtitle={`${totals.late} late entries`}
              icon={<Users className="h-5 w-5" />}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FilterSelect
                label="Class"
                value={selectedClass}
                options={["All Classes", "Class 9", "Class 10"]}
                onChange={setSelectedClass}
              />

              <FilterSelect
                label="Section"
                value={selectedSection}
                options={["All Sections", "A", "B"]}
                onChange={setSelectedSection}
              />

              <FilterSelect
                label="Subject"
                value={selectedSubject}
                options={["All Subjects", "Mathematics", "Science", "English"]}
                onChange={setSelectedSubject}
              />

              <FilterSelect
                label="Student Status"
                value={selectedStatus}
                options={["All Status", "Present", "Absent", "Late"]}
                onChange={setSelectedStatus}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="w-full rounded-lg border border-[#DCD6C9] bg-white px-3 py-2.5 text-sm text-[#0F1B33] outline-none focus:border-[#0F1B33]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                  className="w-full rounded-lg border border-[#DCD6C9] bg-white px-3 py-2.5 text-sm text-[#0F1B33] outline-none focus:border-[#0F1B33]"
                />
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="overflow-hidden rounded-xl border border-[#E8E4D9] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E8E4D9] p-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#0F1B33]">
                  Attendance Records
                </h2>
                <p className="mt-1 text-sm text-[#8B867A]">
                  Showing {filteredRecords.length} attendance sessions
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B867A]" />
                <input
                  type="text"
                  placeholder="Search class, subject, student..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-[#DCD6C9] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0F1B33] sm:w-72"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F8F6F0]">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-[#8B867A]">
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Class / Section</th>
                    <th className="px-5 py-4">Subject</th>
                    <th className="px-5 py-4">Students</th>
                    <th className="px-5 py-4">Present</th>
                    <th className="px-5 py-4">Absent</th>
                    <th className="px-5 py-4">Late</th>
                    <th className="px-5 py-4 text-center">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F0EDE5]">
                  {filteredRecords.map((record) => {
                    const present = record.students.filter(
                      (student) => student.status === "Present"
                    ).length;

                    const absent = record.students.filter(
                      (student) => student.status === "Absent"
                    ).length;

                    const late = record.students.filter(
                      (student) => student.status === "Late"
                    ).length;

                    const isExpanded = expandedRecord === record.id;

                    return (
                   <Fragment key={record.id}>
                        <tr
                         
                          className="transition hover:bg-[#FCFBF8]"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-[#0F1B33]">
                            {formatDate(record.date)}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#0F1B33]">
                              {record.className}
                            </p>
                            <p className="mt-1 text-xs text-[#8B867A]">
                              Section {record.section}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-[#5E6472]">
                              <BookOpen className="h-4 w-4 text-[#8B867A]" />
                              {record.subject}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-[#5E6472]">
                            {record.students.length}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-emerald-700">
                            {present}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-red-700">
                            {absent}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-amber-700">
                            {late}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRecord(
                                  isExpanded ? null : record.id
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-[#DCD6C9] bg-white px-3 py-2 text-xs font-medium text-[#0F1B33] transition hover:bg-[#F5F2EA]"
                            >
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
                          <tr key={`${record.id}-details`}>
                            <td colSpan={8} className="bg-[#FCFBF8] px-5 py-5">
                              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                <div>
                                  <h3 className="font-semibold text-[#0F1B33]">
                                    Student-wise Attendance
                                  </h3>
                                  <p className="mt-1 text-xs text-[#8B867A]">
                                    {record.className} - Section {record.section}
                                    {" · "}
                                    {record.subject}
                                    {" · "}
                                    {formatDate(record.date)}
                                  </p>
                                </div>
                                <p className="text-xs text-[#8B867A]">
                                  Teacher: {record.teacher}
                                </p>
                              </div>

                              <div className="overflow-x-auto rounded-lg border border-[#E8E4D9] bg-white">
                                <table className="w-full min-w-[500px] text-left">
                                  <thead className="bg-[#F8F6F0]">
                                    <tr className="text-xs font-semibold uppercase text-[#8B867A]">
                                      <th className="px-4 py-3">Roll No.</th>
                                      <th className="px-4 py-3">Student Name</th>
                                      <th className="px-4 py-3">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#F0EDE5]">
                                    {record.students.map((student) => (
                                      <tr key={student.id}>
                                        <td className="px-4 py-3 text-sm text-[#6B7280]">
                                          {student.rollNo.toString().padStart(2, "0")}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-[#0F1B33]">
                                          {student.name}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(student.status)}`}
                                          >
                                            {student.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-sm text-[#8B867A]"
                      >
                        No attendance records found. Try changing your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
