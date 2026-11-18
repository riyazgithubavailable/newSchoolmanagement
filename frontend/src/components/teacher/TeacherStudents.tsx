
"use client";

import { useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
} from "lucide-react";

import AdvancedTable, { ColumnType } from "@/utils/AdvancedTable"

interface Student {
  id: string;
  admissionNumber: string;
  rollNumber: number;
  name: string;
  className: string;
  section: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  parentName: string;
  email: string;
  phone: string;
  address: string;
  attendance: number;
  status: "Active" | "Inactive";
}

const initialStudents: Student[] = [
  {
    id: "STU001",
    admissionNumber: "ADM2026001",
    rollNumber: 1,
    name: "Aarav Sharma",
    className: "Class 10",
    section: "A",
    gender: "Male",
    dateOfBirth: "2009-04-12",
    parentName: "Rajesh Sharma",
    email: "aarav@example.com",
    phone: "9876543210",
    address: "Nagpur, Maharashtra",
    attendance: 96,
    status: "Active",
  },
  {
    id: "STU002",
    admissionNumber: "ADM2026002",
    rollNumber: 2,
    name: "Ananya Patel",
    className: "Class 10",
    section: "A",
    gender: "Female",
    dateOfBirth: "2009-07-18",
    parentName: "Amit Patel",
    email: "ananya@example.com",
    phone: "9876543211",
    address: "Nagpur, Maharashtra",
    attendance: 92,
    status: "Active",
  },
  {
    id: "STU003",
    admissionNumber: "ADM2026003",
    rollNumber: 3,
    name: "Vihaan Verma",
    className: "Class 10",
    section: "A",
    gender: "Male",
    dateOfBirth: "2009-02-22",
    parentName: "Suresh Verma",
    email: "vihaan@example.com",
    phone: "9876543212",
    address: "Wardha, Maharashtra",
    attendance: 88,
    status: "Active",
  },
  {
    id: "STU004",
    admissionNumber: "ADM2026004",
    rollNumber: 4,
    name: "Ishita Deshmukh",
    className: "Class 10",
    section: "A",
    gender: "Female",
    dateOfBirth: "2009-11-05",
    parentName: "Prakash Deshmukh",
    email: "ishita@example.com",
    phone: "9876543213",
    address: "Nagpur, Maharashtra",
    attendance: 98,
    status: "Active",
  },
  {
    id: "STU005",
    admissionNumber: "ADM2026005",
    rollNumber: 5,
    name: "Aditya Joshi",
    className: "Class 10",
    section: "A",
    gender: "Male",
    dateOfBirth: "2009-06-14",
    parentName: "Manoj Joshi",
    email: "aditya@example.com",
    phone: "9876543214",
    address: "Amravati, Maharashtra",
    attendance: 72,
    status: "Active",
  },
  {
    id: "STU006",
    admissionNumber: "ADM2026006",
    rollNumber: 6,
    name: "Sara Khan",
    className: "Class 10",
    section: "A",
    gender: "Female",
    dateOfBirth: "2009-09-20",
    parentName: "Imran Khan",
    email: "sara@example.com",
    phone: "9876543215",
    address: "Nagpur, Maharashtra",
    attendance: 85,
    status: "Inactive",
  },
  {
    id: "STU007",
    admissionNumber: "ADM2026007",
    rollNumber: 1,
    name: "Rohan Patil",
    className: "Class 9",
    section: "B",
    gender: "Male",
    dateOfBirth: "2010-03-10",
    parentName: "Sunil Patil",
    email: "rohan@example.com",
    phone: "9876543216",
    address: "Yavatmal, Maharashtra",
    attendance: 94,
    status: "Active",
  },
  {
    id: "STU008",
    admissionNumber: "ADM2026008",
    rollNumber: 2,
    name: "Myra Kulkarni",
    className: "Class 9",
    section: "B",
    gender: "Female",
    dateOfBirth: "2010-08-25",
    parentName: "Nitin Kulkarni",
    email: "myra@example.com",
    phone: "9876543217",
    address: "Nagpur, Maharashtra",
    attendance: 91,
    status: "Active",
  },
  {
    id: "STU009",
    admissionNumber: "ADM2026009",
    rollNumber: 3,
    name: "Kabir Singh",
    className: "Class 9",
    section: "B",
    gender: "Male",
    dateOfBirth: "2010-01-17",
    parentName: "Rakesh Singh",
    email: "kabir@example.com",
    phone: "9876543218",
    address: "Nagpur, Maharashtra",
    attendance: 78,
    status: "Active",
  },
  {
    id: "STU010",
    admissionNumber: "ADM2026010",
    rollNumber: 4,
    name: "Diya Gupta",
    className: "Class 9",
    section: "B",
    gender: "Female",
    dateOfBirth: "2010-12-03",
    parentName: "Anil Gupta",
    email: "diya@example.com",
    phone: "9876543219",
    address: "Wardha, Maharashtra",
    attendance: 96,
    status: "Active",
  },
];

export default function TeacherStudents() {
  const [students] = useState<Student[]>(initialStudents);
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass =
        selectedClass === "All" ||
        student.className === selectedClass;

      const matchesSection =
        selectedSection === "All" ||
        student.section === selectedSection;

      const matchesStatus =
        selectedStatus === "All" ||
        student.status === selectedStatus;

      return (
        matchesClass &&
        matchesSection &&
        matchesStatus
      );
    });
  }, [students, selectedClass, selectedSection, selectedStatus]);

  const activeCount = filteredStudents.filter(
    (student) => student.status === "Active"
  ).length;

  const inactiveCount = filteredStudents.filter(
    (student) => student.status === "Inactive"
  ).length;

  const averageAttendance =
    filteredStudents.length > 0
      ? Math.round(
          filteredStudents.reduce(
            (total, student) => total + student.attendance,
            0
          ) / filteredStudents.length
        )
      : 0;

  const columns = useMemo<ColumnType<Student>[]>(
    () => [
      {
        key: "admissionNumber",
        header: "Admission No.",
        defaultVisible: true,
      },
      {
        key: "rollNumber",
        header: "Roll No.",
        align: "center",
        sortValue: (student) => student.rollNumber,
      },
      {
        key: "name",
        header: "Student Name",
        cell: (student) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8EEF9] text-sm font-semibold text-[#1E40AF]">
              {student.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="font-medium text-[#0F1B33]">
                {student.name}
              </p>
              <p className="text-xs text-gray-500">
                {student.gender}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "className",
        header: "Class",
        cell: (student) => (
          <span>
            {student.className} - {student.section}
          </span>
        ),
        sortValue: (student) =>
          `${student.className} ${student.section}`,
      },
      {
        key: "parentName",
        header: "Parent / Guardian",
      },
      {
        key: "phone",
        header: "Contact",
      },
      {
        key: "attendance",
        header: "Attendance",
        align: "center",
        cell: (student) => (
          <span
            className={`font-semibold ${
              student.attendance >= 85
                ? "text-green-700"
                : student.attendance >= 75
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {student.attendance}%
          </span>
        ),
        sortValue: (student) => student.attendance,
      },
      {
        key: "status",
        header: "Status",
        cell: (student) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              student.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {student.status}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        exportable: false,
        sortable: false,
        cell: (student) => (
          <button
            type="button"
            onClick={() => setSelectedStudent(student)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE3EF] px-3 py-1.5 text-xs font-medium text-[#1E40AF] transition hover:bg-[#EEF3FC]"
          >
            <Eye size={14} />
            View
          </button>
        ),
      },
    ],
    []
  );

  const summaryCards = [
    {
      label: "Total Students",
      value: filteredStudents.length,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Active Students",
      value: activeCount,
      icon: UserCheck,
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Inactive Students",
      value: inactiveCount,
      icon: UserX,
      color: "bg-orange-50 text-orange-700",
    },
    {
      label: "Average Attendance",
      value: `${averageAttendance}%`,
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#FBF9F3] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] space-y-6">

          {/* PAGE HEADER */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
              <span>Teacher Portal</span>
              <span>/</span>
              <span className="font-medium text-[#0F1B33]">
                Students
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#0F1B33]">
                  Student Directory
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage students assigned to your classes.
                </p>
              </div>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-[#E8E4D9] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {card.label}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-[#0F1B33]">
                        {card.value}
                      </h2>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FILTERS */}
          <div className="rounded-xl border border-[#E8E4D9] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[#0F1B33]">
                Filter Students
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSelectedClass("All");
                  setSelectedSection("All");
                  setSelectedStatus("All");
                }}
                className="text-xs font-medium text-[#1E40AF] hover:underline"
              >
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2.5 text-sm text-[#0F1B33] outline-none focus:border-[#2463D4]"
                >
                  <option value="All">All Classes</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2.5 text-sm text-[#0F1B33] outline-none focus:border-[#2463D4]"
                >
                  <option value="All">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Student Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2.5 text-sm text-[#0F1B33] outline-none focus:border-[#2463D4]"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* STUDENT TABLE */}
          <div className="rounded-xl border border-[#E8E4D9] bg-white p-4 shadow-sm sm:p-5">
            <AdvancedTable<Student>
              title="Students"
              description="Students belonging to your assigned classes."
              data={filteredStudents}
              columns={columns}
              enableSearch
              searchPlaceholder="Search by student name, roll number or admission number..."
              searchKeys={[
                "name",
                "admissionNumber",
                "parentName",
                "phone",
              ]}
              enablePagination
              initialPageSize={10}
              pageSizeOptions={[10, 25, 50]}
              enableColumnToggle
              enableColumnResize
              stickyHeader
              enableExport
              enablePDFExport
              exportFileName="teacher-students"
              exportSheetName="Students"
          rowKey={(row, idx) => row.id || idx}
              emptyText="No students found for the selected filters."
            />
          </div>
        </div>
      </div>

      {/* STUDENT DETAILS MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-[#E8E4D9] p-5">
              <div>
                <h2 className="text-lg font-bold text-[#0F1B33]">
                  Student Details
                </h2>
                <p className="text-xs text-gray-500">
                  Student profile information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">

              {/* PROFILE */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8EEF9] text-xl font-bold text-[#1E40AF]">
                  {selectedStudent.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#0F1B33]">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedStudent.className} - {selectedStudent.section}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      selectedStudent.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedStudent.status}
                  </span>
                </div>
              </div>

              {/* ACADEMIC INFORMATION */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-[#0F1B33]">
                  Academic Information
                </h4>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#FBF9F3] p-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Admission Number
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0F1B33]">
                      {selectedStudent.admissionNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Roll Number
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0F1B33]">
                      {selectedStudent.rollNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Attendance
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#0F1B33]">
                      {selectedStudent.attendance}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Gender
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0F1B33]">
                      {selectedStudent.gender}
                    </p>
                  </div>
                </div>
              </div>

              {/* PERSONAL INFORMATION */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-[#0F1B33]">
                  Personal & Guardian Information
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users size={17} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">
                        Parent / Guardian
                      </p>
                      <p className="text-sm font-medium text-[#0F1B33]">
                        {selectedStudent.parentName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail size={17} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-[#0F1B33]">
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone size={17} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="text-sm font-medium text-[#0F1B33]">
                        {selectedStudent.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CalendarDays size={17} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-sm font-medium text-[#0F1B33]">
                        {selectedStudent.dateOfBirth}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin size={17} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-[#0F1B33]">
                        {selectedStudent.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#E8E4D9] p-4">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg bg-[#0F1B33] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1B3155]"
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
