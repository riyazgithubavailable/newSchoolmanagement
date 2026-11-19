// src/mock/db.ts
// ---------------------------------------------------------------------------
// In-memory mock database. ONLY the files in src/services/ should import this.
// When the backend is ready, replace the service functions with API calls and
// delete this folder — pages/components won't need to change.
// ---------------------------------------------------------------------------

import type {
  AuthUser,
  ClassRef,
  Conversation,
  LeaveBalance,
  LeaveRequest,
  Message,
  Notice,
  ParentBroadcast,
  PtmMeeting,
  StaffAttendanceRecord,
  Student,
  StudentRemark,
  SubjectTeacher,
  TeacherProfile,
} from "@/types/school";
import type { UserRole } from "@/config/roles";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Deterministic pseudo-random so the mock data is stable between reloads */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const minutesToTime = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

const daysFromToday = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const isoDaysAgo = (days: number, hour = 10, minute = 0) => {
  const d = daysFromToday(-days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

/* ------------------------------------------------------------------ */
/* Classes                                                             */
/* ------------------------------------------------------------------ */

export const CLASS_10A: ClassRef = { classId: "CLS-10A", className: "Class 10", section: "A" };
export const CLASS_10B: ClassRef = { classId: "CLS-10B", className: "Class 10", section: "B" };
export const CLASS_9B: ClassRef = { classId: "CLS-9B", className: "Class 9", section: "B" };

export const TEACHER_CLASSES: ClassRef[] = [CLASS_10A, CLASS_10B, CLASS_9B];

/* ------------------------------------------------------------------ */
/* Users (demo logins — any password works)                            */
/* ------------------------------------------------------------------ */

export const DEMO_SCHOOL_CODE = "DEMO01";

/** Sample users for unit tests only — real logins go through the backend. */
export const users: Record<Exclude<UserRole, "SUPER_ADMIN">, AuthUser> = {
  TEACHER: {
    id: "TCH-001",
    fullName: "Neha Verma",
    email: "teacher@demo.school",
    role: "TEACHER",
    schoolCode: DEMO_SCHOOL_CODE,
    isClassTeacher: true,
    classTeacherOf: CLASS_10A,
  },
  PRINCIPAL: {
    id: "PRN-001",
    fullName: "Dr. R. K. Mishra",
    email: "principal@demo.school",
    role: "PRINCIPAL",
    schoolCode: DEMO_SCHOOL_CODE,
  },
  ADMIN: {
    id: "ADM-001",
    fullName: "Sunil Pattnaik",
    email: "admin@demo.school",
    role: "ADMIN",
    schoolCode: DEMO_SCHOOL_CODE,
  },
  STUDENT: {
    id: "STU-10A-01",
    fullName: "Aarav Sharma",
    email: "student@demo.school",
    role: "STUDENT",
    schoolCode: DEMO_SCHOOL_CODE,
  },
  PARENT: {
    id: "PAR-10A-01",
    fullName: "Rakesh Sharma",
    email: "parent@demo.school",
    role: "PARENT",
    schoolCode: DEMO_SCHOOL_CODE,
  },
};

/* ------------------------------------------------------------------ */
/* Teacher profile                                                     */
/* ------------------------------------------------------------------ */

export const teacherProfile: TeacherProfile = {
  id: "TCH-001",
  employeeId: "EMP-2019-014",
  fullName: "Neha Verma",
  email: "teacher@demo.school",
  phone: "+91 98765 43210",
  gender: "Female",
  dateOfBirth: "1988-04-12",
  bloodGroup: "B+",
  address: "24, Shanti Nagar, Bhubaneswar, Odisha 751002",
  emergencyContactName: "Amit Verma",
  emergencyContactPhone: "+91 98111 22334",
  designation: "Senior Teacher (TGT)",
  department: "Mathematics",
  qualification: "M.Sc. Mathematics, B.Ed.",
  experienceYears: 11,
  joiningDate: "2019-06-03",
  subjects: ["Mathematics"],
  teaching: [
    { ...CLASS_10A, subject: "Mathematics", periodsPerWeek: 7 },
    { ...CLASS_10B, subject: "Mathematics", periodsPerWeek: 7 },
    { ...CLASS_9B, subject: "Mathematics", periodsPerWeek: 6 },
  ],
  classTeacherOf: CLASS_10A,
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    parentMessageAlerts: true,
    leaveStatusAlerts: true,
  },
};

/* ------------------------------------------------------------------ */
/* Students                                                            */
/* ------------------------------------------------------------------ */

const STUDENT_NAMES: [string, "Male" | "Female"][] = [
  ["Aarav Sharma", "Male"],
  ["Ananya Patel", "Female"],
  ["Arjun Verma", "Male"],
  ["Diya Singh", "Female"],
  ["Ishaan Gupta", "Male"],
  ["Kavya Joshi", "Female"],
  ["Krish Mehta", "Male"],
  ["Meera Shah", "Female"],
  ["Rahul Kumar", "Male"],
  ["Saanvi Rao", "Female"],
  ["Vihaan Nair", "Male"],
  ["Aditi Mishra", "Female"],
  ["Kabir Das", "Male"],
  ["Riya Mohanty", "Female"],
  ["Aditya Panda", "Male"],
  ["Sneha Behera", "Female"],
  ["Rohan Jena", "Male"],
  ["Pooja Sahu", "Female"],
  ["Yash Agarwal", "Male"],
  ["Tanvi Kulkarni", "Female"],
  ["Dev Malhotra", "Male"],
  ["Ishita Bose", "Female"],
  ["Om Prakash", "Male"],
  ["Nisha Reddy", "Female"],
  ["Siddharth Roy", "Male"],
  ["Zoya Khan", "Female"],
  ["Harsh Tiwari", "Male"],
  ["Prisha Iyer", "Female"],
];

const PARENT_FIRST = ["Rakesh", "Sunita", "Manoj", "Kiran", "Suresh", "Anita", "Vijay", "Rekha", "Ajay", "Pooja"];

function buildStudents(cls: ClassRef, names: typeof STUDENT_NAMES, seed: number): Student[] {
  const rnd = seeded(seed);
  return names.map(([name, gender], i) => {
    const surname = name.split(" ").slice(-1)[0];
    const parentName = `${PARENT_FIRST[Math.floor(rnd() * PARENT_FIRST.length)]} ${surname}`;
    const n = String(i + 1).padStart(2, "0");
    const code = `${cls.className.replace("Class ", "")}${cls.section}`;
    return {
      ...cls,
      id: `STU-${code}-${n}`,
      admissionNo: `ADM/${2016 + Math.floor(rnd() * 3)}/${code}${n}`,
      rollNo: i + 1,
      name,
      gender,
      dateOfBirth: `2010-${String(1 + Math.floor(rnd() * 12)).padStart(2, "0")}-${String(1 + Math.floor(rnd() * 28)).padStart(2, "0")}`,
      parentId: `PAR-${code}-${n}`,
      parentName,
      parentPhone: `+91 9${Math.floor(100000000 + rnd() * 899999999)}`,
      parentEmail: `${parentName.toLowerCase().replace(/\s+/g, ".")}@mail.com`,
      address: "Bhubaneswar, Odisha",
    };
  });
}

export const students: Student[] = [
  ...buildStudents(CLASS_10A, STUDENT_NAMES, 11),
  ...buildStudents(CLASS_10B, [...STUDENT_NAMES].reverse().slice(0, 24), 23),
  ...buildStudents(CLASS_9B, STUDENT_NAMES.slice(4, 26), 37),
];

/* ------------------------------------------------------------------ */
/* Class 10-A (class teacher section) details                          */
/* ------------------------------------------------------------------ */

export const classTeacherMeta = {
  roomNo: "B-204",
  academicYear: "2026-27",
  monitor: "STU-10A-03",
  viceMonitor: "STU-10A-02",
};

export const subjectTeachers10A: SubjectTeacher[] = [
  { subject: "Mathematics", teacherName: "Neha Verma (You)", periodsPerWeek: 7 },
  { subject: "Science", teacherName: "Sanjay Kumar", periodsPerWeek: 7 },
  { subject: "English", teacherName: "Ritu Malhotra", periodsPerWeek: 6 },
  { subject: "Hindi", teacherName: "Pankaj Tripathi", periodsPerWeek: 5 },
  { subject: "Social Science", teacherName: "Farah Ali", periodsPerWeek: 6 },
  { subject: "Computer Science", teacherName: "Deepak Rao", periodsPerWeek: 3 },
];

export const EXAMS = ["Unit Test 1", "Half Yearly", "Unit Test 2"];
export const SUBJECTS_10A = subjectTeachers10A.map((s) => s.subject);

/** Per-student metrics (attendance %, subject scores, assignments) */
export const studentMetrics = (() => {
  const rnd = seeded(101);
  const map: Record<
    string,
    { attendancePercent: number; assignmentCompletion: number; subjects: { subject: string; scores: { exam: string; percent: number }[] }[] }
  > = {};
  students
    .filter((s) => s.classId === CLASS_10A.classId)
    .forEach((s, idx) => {
      // a few deliberately weak students so the "needs attention" UI has data
      const weak = idx === 4 || idx === 12 || idx === 19;
      const base = weak ? 38 + rnd() * 12 : 58 + rnd() * 35;
      const drift = (rnd() - 0.45) * 12;
      map[s.id] = {
        attendancePercent: Math.round(weak ? 62 + rnd() * 10 : 80 + rnd() * 19),
        assignmentCompletion: Math.round(weak ? 45 + rnd() * 20 : 75 + rnd() * 25),
        subjects: SUBJECTS_10A.map((subject) => ({
          subject,
          scores: EXAMS.map((exam, ei) => ({
            exam,
            percent: Math.max(20, Math.min(99, Math.round(base + drift * ei + (rnd() - 0.5) * 14))),
          })),
        })),
      };
    });
  return map;
})();

export const remarks: StudentRemark[] = [
  {
    id: "RMK-1",
    studentId: "STU-10A-05",
    type: "Concern",
    text: "Frequently missing homework in Mathematics and Science. Spoke to the student; will follow up with parent.",
    visibleToParent: true,
    createdAt: isoDaysAgo(6),
  },
  {
    id: "RMK-2",
    studentId: "STU-10A-01",
    type: "Positive",
    text: "Won 2nd prize in the inter-school maths olympiad. Very consistent performance.",
    visibleToParent: true,
    createdAt: isoDaysAgo(12),
  },
  {
    id: "RMK-3",
    studentId: "STU-10A-13",
    type: "Concern",
    text: "Attendance has dropped below 75%. Needs counselling session.",
    visibleToParent: false,
    createdAt: isoDaysAgo(3),
  },
];

/* ------------------------------------------------------------------ */
/* Notices                                                             */
/* ------------------------------------------------------------------ */

export const notices: Notice[] = [
  {
    id: "NTC-101",
    title: "Half Yearly Examination Schedule Released",
    body:
      "The Half Yearly examinations for Classes 6 to 12 will begin from the first Monday of next month. All teachers are requested to submit question papers to the exam cell at least 10 days before the exam. Seating plan and invigilation duty chart will be shared separately.",
    category: "Exam",
    priority: "High",
    audience: "Teachers",
    postedBy: "Dr. R. K. Mishra",
    postedByRole: "PRINCIPAL",
    isMine: false,
    publishedAt: isoDaysAgo(0, 9, 15),
    attachmentName: "half-yearly-schedule.pdf",
    isRead: false,
  },
  {
    id: "NTC-102",
    title: "Staff Meeting on Saturday",
    body:
      "A mandatory staff meeting will be held on Saturday at 12:30 PM in the conference hall. Agenda: annual day preparations, syllabus completion status, and PTM planning.",
    category: "General",
    priority: "High",
    audience: "All Staff",
    postedBy: "Dr. R. K. Mishra",
    postedByRole: "PRINCIPAL",
    isMine: false,
    publishedAt: isoDaysAgo(1, 14, 0),
    isRead: false,
  },
  {
    id: "NTC-103",
    title: "Annual Day Celebration — Volunteers Needed",
    body:
      "The Annual Day will be celebrated next month. Class teachers are requested to nominate 4 students from their section for cultural events by Friday.",
    category: "Event",
    priority: "Normal",
    audience: "Teachers",
    postedBy: "Cultural Committee",
    postedByRole: "TEACHER",
    isMine: false,
    publishedAt: isoDaysAgo(3, 11, 30),
    isRead: true,
  },
  {
    id: "NTC-104",
    title: "Holiday on account of Guru Nanak Jayanti",
    body: "The school will remain closed on account of Guru Nanak Jayanti. Classes will resume as usual on the next working day.",
    category: "Holiday",
    priority: "Normal",
    audience: "All Staff",
    postedBy: "Administration Office",
    postedByRole: "PRINCIPAL",
    isMine: false,
    publishedAt: isoDaysAgo(5, 10, 0),
    isRead: true,
  },
  {
    id: "NTC-105",
    title: "Syllabus Completion Report Due",
    body:
      "All subject teachers must update the syllabus completion tracker for their classes by the end of this week. HODs will review the status in the next meeting.",
    category: "Academic",
    priority: "Normal",
    audience: "Teachers",
    postedBy: "Academic Coordinator",
    postedByRole: "PRINCIPAL",
    isMine: false,
    publishedAt: isoDaysAgo(8, 9, 45),
    isRead: true,
  },
  {
    id: "NTC-106",
    title: "Maths Practice Test on Friday",
    body:
      "There will be a 30-mark practice test on Chapter 4 (Quadratic Equations) this Friday. Students should bring geometry box and graph paper.",
    category: "Exam",
    priority: "Normal",
    audience: "Class",
    targetClasses: [CLASS_10A, CLASS_10B],
    postedBy: "Neha Verma",
    postedByRole: "TEACHER",
    isMine: true,
    publishedAt: isoDaysAgo(2, 16, 10),
    isRead: true,
  },
];

/* ------------------------------------------------------------------ */
/* Teacher's own attendance                                            */
/* ------------------------------------------------------------------ */

/** Fixed holidays (MM-DD) used to colour the calendar */
const HOLIDAYS: Record<string, string> = {
  "01-26": "Republic Day",
  "08-15": "Independence Day",
  "10-02": "Gandhi Jayanti",
  "11-05": "Guru Nanak Jayanti",
  "12-25": "Christmas",
};

export const staffAttendance: StaffAttendanceRecord[] = (() => {
  const rnd = seeded(7);
  const out: StaffAttendanceRecord[] = [];
  // last ~120 days up to yesterday; today is handled by check-in
  for (let i = 120; i >= 1; i--) {
    const d = daysFromToday(-i);
    const date = toISODate(d);
    const mmdd = date.slice(5);
    if (d.getDay() === 0) {
      out.push({ date, status: "Weekend" });
      continue;
    }
    if (HOLIDAYS[mmdd]) {
      out.push({ date, status: "Holiday", remark: HOLIDAYS[mmdd] });
      continue;
    }
    const r = rnd();
    if (r < 0.04) out.push({ date, status: "Absent" });
    else if (r < 0.08) out.push({ date, status: "On Leave", remark: "Casual Leave" });
    else if (r < 0.14) out.push({ date, status: "Late", checkIn: `08:${30 + Math.floor(rnd() * 25)}`, checkOut: "15:35" });
    else if (r < 0.17) out.push({ date, status: "Half Day", checkIn: "08:05", checkOut: "12:10" });
    else
      out.push({
        date,
        status: "Present",
        checkIn: minutesToTime(7 * 60 + 45 + Math.floor(rnd() * 40)), // 07:45 – 08:24
        checkOut: `15:${String(30 + Math.floor(rnd() * 29)).padStart(2, "0")}`,
      });
  }
  return out;
})();

export const SCHOOL_START_TIME = "08:30";

/* ------------------------------------------------------------------ */
/* Leave                                                               */
/* ------------------------------------------------------------------ */

export const leaveBalances: LeaveBalance[] = [
  { type: "Casual Leave", total: 12, used: 4 },
  { type: "Sick Leave", total: 10, used: 2 },
  { type: "Earned Leave", total: 15, used: 3 },
  { type: "Unpaid Leave", total: 0, used: 0 },
];

export const leaveRequests: LeaveRequest[] = [
  {
    id: "LV-1007",
    type: "Casual Leave",
    fromDate: toISODate(daysFromToday(6)),
    toDate: toISODate(daysFromToday(7)),
    halfDay: false,
    days: 2,
    reason: "Family function out of station.",
    status: "Pending",
    appliedOn: isoDaysAgo(1),
  },
  {
    id: "LV-1004",
    type: "Sick Leave",
    fromDate: toISODate(daysFromToday(-18)),
    toDate: toISODate(daysFromToday(-17)),
    halfDay: false,
    days: 2,
    reason: "Viral fever, doctor advised rest.",
    attachmentName: "medical-certificate.pdf",
    status: "Approved",
    appliedOn: isoDaysAgo(19),
    reviewedBy: "Dr. R. K. Mishra",
    reviewRemark: "Get well soon.",
  },
  {
    id: "LV-1002",
    type: "Earned Leave",
    fromDate: toISODate(daysFromToday(-45)),
    toDate: toISODate(daysFromToday(-43)),
    halfDay: false,
    days: 3,
    reason: "Personal work.",
    status: "Approved",
    appliedOn: isoDaysAgo(52),
    reviewedBy: "Dr. R. K. Mishra",
  },
  {
    id: "LV-1001",
    type: "Casual Leave",
    fromDate: toISODate(daysFromToday(-60)),
    toDate: toISODate(daysFromToday(-60)),
    halfDay: true,
    days: 0.5,
    reason: "Bank work.",
    status: "Rejected",
    appliedOn: isoDaysAgo(61),
    reviewedBy: "Dr. R. K. Mishra",
    reviewRemark: "Unit test invigilation scheduled that day.",
  },
];

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

const s10a = students.filter((s) => s.classId === CLASS_10A.classId);

export const conversations: Conversation[] = [
  {
    id: "CNV-1",
    contact: {
      id: s10a[4].parentId,
      name: s10a[4].parentName,
      type: "Parent",
      subtitle: `Parent of ${s10a[4].name} (10-A)`,
    },
    lastMessage: "Thank you ma'am, I will make sure he completes it.",
    lastMessageAt: isoDaysAgo(0, 8, 40),
    unreadCount: 2,
  },
  {
    id: "CNV-2",
    contact: { id: "PRN-001", name: "Dr. R. K. Mishra", type: "Principal", subtitle: "Principal" },
    lastMessage: "Please share the 10-A syllabus status by Friday.",
    lastMessageAt: isoDaysAgo(1, 17, 5),
    unreadCount: 1,
  },
  {
    id: "CNV-3",
    contact: {
      id: s10a[0].parentId,
      name: s10a[0].parentName,
      type: "Parent",
      subtitle: `Parent of ${s10a[0].name} (10-A)`,
    },
    lastMessage: "Congratulations to Aarav on the olympiad result!",
    lastMessageAt: isoDaysAgo(4, 12, 20),
    unreadCount: 0,
  },
  {
    id: "CNV-4",
    contact: { id: "TCH-002", name: "Sanjay Kumar", type: "Teacher", subtitle: "Science · 10-A" },
    lastMessage: "Can we swap the 5th period on Thursday?",
    lastMessageAt: isoDaysAgo(6, 11, 0),
    unreadCount: 0,
  },
];

export const messages: Message[] = [
  { id: "M1", conversationId: "CNV-1", fromMe: true, text: `Hello, ${s10a[4].name} has not submitted the last three maths assignments. Could you please check with him at home?`, sentAt: isoDaysAgo(1, 15, 30) },
  { id: "M2", conversationId: "CNV-1", fromMe: false, text: "Sorry ma'am, I was not aware. I will talk to him today.", sentAt: isoDaysAgo(1, 19, 10) },
  { id: "M3", conversationId: "CNV-1", fromMe: false, text: "Thank you ma'am, I will make sure he completes it.", sentAt: isoDaysAgo(0, 8, 40) },

  { id: "M4", conversationId: "CNV-2", fromMe: false, text: "Good evening Neha ji.", sentAt: isoDaysAgo(1, 17, 4) },
  { id: "M5", conversationId: "CNV-2", fromMe: false, text: "Please share the 10-A syllabus status by Friday.", sentAt: isoDaysAgo(1, 17, 5) },

  { id: "M6", conversationId: "CNV-3", fromMe: false, text: "Ma'am, Aarav got 2nd prize in the olympiad. Thank you for guiding him.", sentAt: isoDaysAgo(4, 11, 50) },
  { id: "M7", conversationId: "CNV-3", fromMe: true, text: "Congratulations to Aarav on the olympiad result!", sentAt: isoDaysAgo(4, 12, 20) },

  { id: "M8", conversationId: "CNV-4", fromMe: false, text: "Can we swap the 5th period on Thursday?", sentAt: isoDaysAgo(6, 11, 0) },
];

/* ------------------------------------------------------------------ */
/* Parent communication                                                */
/* ------------------------------------------------------------------ */

export const parentBroadcasts: ParentBroadcast[] = [
  {
    id: "BRD-3",
    subject: "Half Yearly exam preparation",
    body: "Dear parents, the Half Yearly exams start next month. Please ensure your ward follows a daily revision schedule. The detailed timetable is available in the app.",
    channels: ["App", "SMS"],
    studentIds: [],
    recipientCount: 28,
    sentAt: isoDaysAgo(2, 18, 0),
    readCount: 21,
  },
  {
    id: "BRD-2",
    subject: "Pending assignment submissions",
    body: "Your ward has pending assignments in Mathematics. Kindly ensure they are submitted by Monday.",
    channels: ["App"],
    studentIds: ["STU-10A-05", "STU-10A-13", "STU-10A-20"],
    recipientCount: 3,
    sentAt: isoDaysAgo(7, 16, 30),
    readCount: 3,
  },
  {
    id: "BRD-1",
    subject: "Welcome to Class 10-A",
    body: "Dear parents, welcome to the new academic session. I am Neha Verma, the class teacher of 10-A. Feel free to message me through the app for any concerns.",
    channels: ["App", "Email"],
    studentIds: [],
    recipientCount: 28,
    sentAt: isoDaysAgo(90, 10, 0),
    readCount: 27,
  },
];

export const ptmMeetings: PtmMeeting[] = [
  {
    id: "PTM-2",
    title: "Half Yearly Preparation PTM",
    date: toISODate(daysFromToday(9)),
    startTime: "10:00",
    endTime: "13:00",
    mode: "In Person",
    venue: "Room B-204",
    agenda: "Discuss unit test 2 results, half yearly preparation and attendance concerns.",
    status: "Scheduled",
    rsvps: s10a.map((s, i) => ({
      studentId: s.id,
      status: i % 5 === 0 ? "Awaiting" : i % 7 === 0 ? "Declined" : "Confirmed",
    })),
  },
  {
    id: "PTM-1",
    title: "First Term PTM",
    date: toISODate(daysFromToday(-70)),
    startTime: "10:00",
    endTime: "13:00",
    mode: "In Person",
    venue: "Room B-204",
    agenda: "Introduction, unit test 1 results, discipline and homework policy.",
    status: "Completed",
    rsvps: s10a.map((s, i) => ({ studentId: s.id, status: i % 6 === 0 ? "Declined" : "Confirmed" })),
  },
];
