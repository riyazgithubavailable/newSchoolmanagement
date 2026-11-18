// src/types/school.ts
// Domain types shared by the mock layer and (later) the real API.
// Keep these in sync with backend DTOs when the API is built.

import type { UserRole } from "@/config/roles";

/* ------------------------------------------------------------------ */
/* Auth / users                                                        */
/* ------------------------------------------------------------------ */

export interface ClassRef {
  classId: string;
  className: string; // "Class 10"
  section: string; // "A"
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  schoolCode: string;
  schoolName?: string;
  /** Teacher only: true if this teacher is class teacher of a section */
  isClassTeacher?: boolean;
  /** Teacher only: the section this teacher is class teacher of */
  classTeacherOf?: ClassRef | null;
}


/* ------------------------------------------------------------------ */
/* Teacher profile                                                     */
/* ------------------------------------------------------------------ */

export interface TeachingAssignment extends ClassRef {
  subject: string;
  periodsPerWeek: number;
}

export interface TeacherProfile {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  designation: string;
  department: string;
  qualification: string;
  experienceYears: number;
  joiningDate: string;
  subjects: string[];
  teaching: TeachingAssignment[];
  classTeacherOf: ClassRef | null;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    parentMessageAlerts: boolean;
    leaveStatusAlerts: boolean;
  };
}

export type TeacherProfileUpdate = Pick<
  TeacherProfile,
  | "phone"
  | "address"
  | "bloodGroup"
  | "emergencyContactName"
  | "emergencyContactPhone"
>;

/* ------------------------------------------------------------------ */
/* Students                                                            */
/* ------------------------------------------------------------------ */

export interface Student extends ClassRef {
  id: string;
  admissionNo: string;
  rollNo: number;
  name: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
}

/* ------------------------------------------------------------------ */
/* Notices                                                             */
/* ------------------------------------------------------------------ */

export type NoticeCategory = "Academic" | "Exam" | "Event" | "Holiday" | "General";
export type NoticePriority = "High" | "Normal";
export type NoticeAudience = "All Staff" | "Teachers" | "Parents" | "Students" | "Class";

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  priority: NoticePriority;
  audience: NoticeAudience;
  /** Set when audience = "Class" */
  targetClasses?: ClassRef[];
  postedBy: string;
  postedByRole: UserRole;
  /** true when the logged-in teacher authored it */
  isMine: boolean;
  publishedAt: string; // ISO
  attachmentName?: string;
  isRead: boolean;
}

export interface CreateNoticePayload {
  title: string;
  body: string;
  category: NoticeCategory;
  priority: NoticePriority;
  targetClasses: ClassRef[];
}

/* ------------------------------------------------------------------ */
/* Teacher's own attendance                                            */
/* ------------------------------------------------------------------ */

export type StaffAttendanceStatus =
  | "Present"
  | "Absent"
  | "Late"
  | "Half Day"
  | "On Leave"
  | "Holiday"
  | "Weekend";

export interface StaffAttendanceRecord {
  date: string; // YYYY-MM-DD
  status: StaffAttendanceStatus;
  checkIn?: string; // "08:12"
  checkOut?: string; // "15:40"
  remark?: string;
}

/* ------------------------------------------------------------------ */
/* Leave                                                               */
/* ------------------------------------------------------------------ */

export type LeaveType = "Casual Leave" | "Sick Leave" | "Earned Leave" | "Unpaid Leave";
export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface LeaveBalance {
  type: LeaveType;
  total: number;
  used: number;
}

export interface LeaveRequest {
  id: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  halfDay: boolean;
  days: number;
  reason: string;
  attachmentName?: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewRemark?: string;
}

export interface ApplyLeavePayload {
  type: LeaveType;
  fromDate: string;
  toDate: string;
  halfDay: boolean;
  reason: string;
  attachmentName?: string;
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export type ContactType = "Parent" | "Principal" | "Teacher";

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  /** e.g. "Parent of Aarav Sharma (10-A)" or "Mathematics" */
  subtitle: string;
}

export interface Message {
  id: string;
  conversationId: string;
  fromMe: boolean;
  text: string;
  sentAt: string; // ISO
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

/* ------------------------------------------------------------------ */
/* Class teacher                                                       */
/* ------------------------------------------------------------------ */

export interface SubjectTeacher {
  subject: string;
  teacherName: string;
  periodsPerWeek: number;
}

export interface ClassOverview extends ClassRef {
  roomNo: string;
  academicYear: string;
  totalStudents: number;
  boys: number;
  girls: number;
  monitor: string;
  viceMonitor: string;
  subjectTeachers: SubjectTeacher[];
  todayAttendance: {
    marked: boolean;
    present: number;
    absent: number;
    late: number;
  };
  /** last 7 school days, % present */
  weeklyAttendance: { day: string; percent: number }[];
  upcoming: { id: string; title: string; date: string; type: "Exam" | "Event" | "PTM" | "Holiday" }[];
}

export type RemarkType = "Positive" | "Concern" | "General";

export interface StudentRemark {
  id: string;
  studentId: string;
  type: RemarkType;
  text: string;
  visibleToParent: boolean;
  createdAt: string;
}

export interface SubjectScore {
  subject: string;
  /** percentage scores per exam, in exam order */
  scores: { exam: string; percent: number }[];
}

export interface StudentProgress {
  student: Student;
  attendancePercent: number;
  averagePercent: number;
  assignmentCompletion: number; // %
  grade: string;
  trend: "up" | "down" | "steady";
  subjects: SubjectScore[];
  remarks: StudentRemark[];
}

export interface AddRemarkPayload {
  studentId: string;
  type: RemarkType;
  text: string;
  visibleToParent: boolean;
}

/* ------------------------------------------------------------------ */
/* Parent communication (class teacher)                                */
/* ------------------------------------------------------------------ */

export type BroadcastChannel = "App" | "SMS" | "Email";

export interface ParentBroadcast {
  id: string;
  subject: string;
  body: string;
  channels: BroadcastChannel[];
  /** empty = all parents of the class */
  studentIds: string[];
  recipientCount: number;
  sentAt: string;
  readCount: number;
}

export interface SendBroadcastPayload {
  subject: string;
  body: string;
  channels: BroadcastChannel[];
  studentIds: string[];
}

export type PtmStatus = "Scheduled" | "Completed" | "Cancelled";
export type RsvpStatus = "Confirmed" | "Declined" | "Awaiting";

export interface PtmMeeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: "In Person" | "Online";
  venue: string;
  agenda: string;
  status: PtmStatus;
  rsvps: { studentId: string; status: RsvpStatus }[];
}

export interface SchedulePtmPayload {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: "In Person" | "Online";
  venue: string;
  agenda: string;
}
