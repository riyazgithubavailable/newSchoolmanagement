// src/services/teacherService.ts
// ---------------------------------------------------------------------------
// All data access for the Teacher section goes through this file.
// Every function has a TODO(API) note with the endpoint it should call once
// the backend exists. Pages use these via the hooks in hooks/useTeacherQueries.
// ---------------------------------------------------------------------------

import * as db from "@/mock/db";
import type {
  AddRemarkPayload,
  ApplyLeavePayload,
  ClassOverview,
  Contact,
  Conversation,
  CreateNoticePayload,
  LeaveRequest,
  Message,
  Notice,
  ParentBroadcast,
  PtmMeeting,
  SchedulePtmPayload,
  SendBroadcastPayload,
  StaffAttendanceRecord,
  Student,
  StudentProgress,
  StudentRemark,
  TeacherProfile,
  TeacherProfileUpdate,
} from "@/types/school";
import { mockError, mockResponse, nextId } from "./mockClient";

/* ------------------------------------------------------------------ */
/* Shared helpers (also used by UI)                                    */
/* ------------------------------------------------------------------ */

export const classLabel = (c: { className: string; section: string }) =>
  `${c.className.replace("Class ", "")}-${c.section}`;

/** CBSE style grade from a percentage */
export function gradeFromPercent(p: number) {
  if (p >= 91) return "A1";
  if (p >= 81) return "A2";
  if (p >= 71) return "B1";
  if (p >= 61) return "B2";
  if (p >= 51) return "C1";
  if (p >= 41) return "C2";
  if (p >= 33) return "D";
  return "E";
}

/** Working days between two dates, Sundays excluded */
export function countLeaveDays(from: string, to: string, halfDay: boolean) {
  if (!from || !to) return 0;
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (end < start) return 0;
  if (halfDay) return 0.5;
  let days = 0;
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0) days += 1;
  }
  return days;
}

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const requireClassTeacher = () => {
  if (!db.teacherProfile.classTeacherOf) {
    throw new Error("You are not assigned as a class teacher.");
  }
  return db.teacherProfile.classTeacherOf;
};

const myClassStudents = (): Student[] => {
  const cls = requireClassTeacher();
  return db.students.filter((s) => s.classId === cls.classId);
};

/** today's attendance lives outside the generated history */
let todayAttendance: StaffAttendanceRecord | null = null;

/* ------------------------------------------------------------------ */
/* Service                                                             */
/* ------------------------------------------------------------------ */

export const teacherService = {
  /* ---------------------------- Profile ---------------------------- */

  // TODO(API): GET /teacher/profile
  getProfile: (): Promise<TeacherProfile> => mockResponse(db.teacherProfile),

  // TODO(API): PUT /teacher/profile
  updateProfile(update: TeacherProfileUpdate): Promise<TeacherProfile> {
    Object.assign(db.teacherProfile, update);
    return mockResponse(db.teacherProfile);
  },

  // TODO(API): PUT /teacher/profile/preferences
  updatePreferences(prefs: TeacherProfile["preferences"]): Promise<TeacherProfile> {
    db.teacherProfile.preferences = { ...prefs };
    return mockResponse(db.teacherProfile);
  },

  // TODO(API): POST /auth/change-password
  changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ ok: true }> {
    if (payload.currentPassword === payload.newPassword) {
      return mockError("New password must be different from the current password.");
    }
    return mockResponse({ ok: true as const });
  },

  /* ---------------------------- Classes ---------------------------- */

  // TODO(API): GET /teacher/classes
  getMyClasses: () => mockResponse(db.TEACHER_CLASSES),

  // TODO(API): GET /teacher/students?classId=
  getStudents: (classId?: string): Promise<Student[]> =>
    mockResponse(classId ? db.students.filter((s) => s.classId === classId) : db.students),

  /* ---------------------------- Notices ---------------------------- */

  // TODO(API): GET /teacher/notices
  getNotices: (): Promise<Notice[]> =>
    mockResponse([...db.notices].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))),

  // TODO(API): POST /teacher/notices/:id/read
  markNoticeRead(id: string) {
    const n = db.notices.find((x) => x.id === id);
    if (n) n.isRead = true;
    return mockResponse({ ok: true }, 100);
  },

  // TODO(API): POST /teacher/notices/read-all
  markAllNoticesRead() {
    db.notices.forEach((n) => (n.isRead = true));
    return mockResponse({ ok: true }, 150);
  },

  // TODO(API): POST /teacher/notices
  createNotice(payload: CreateNoticePayload): Promise<Notice> {
    const notice: Notice = {
      id: nextId("NTC"),
      ...payload,
      audience: "Class",
      postedBy: db.teacherProfile.fullName,
      postedByRole: "TEACHER",
      isMine: true,
      publishedAt: new Date().toISOString(),
      isRead: true,
    };
    db.notices.unshift(notice);
    return mockResponse(notice);
  },

  // TODO(API): DELETE /teacher/notices/:id
  deleteNotice(id: string) {
    const idx = db.notices.findIndex((n) => n.id === id && n.isMine);
    if (idx === -1) return mockError("You can only delete notices you posted.");
    db.notices.splice(idx, 1);
    return mockResponse({ ok: true });
  },

  /* ---------------------- My (staff) attendance --------------------- */

  // TODO(API): GET /teacher/my-attendance?from=&to=
  getMyAttendance(): Promise<{ records: StaffAttendanceRecord[]; today: StaffAttendanceRecord | null; schoolStartTime: string }> {
    const isSunday = new Date().getDay() === 0;
    const today = isSunday ? { date: db.toISODate(new Date()), status: "Weekend" as const } : todayAttendance;
    return mockResponse({ records: db.staffAttendance, today, schoolStartTime: db.SCHOOL_START_TIME });
  },

  // TODO(API): POST /teacher/my-attendance/check-in
  checkIn(): Promise<StaffAttendanceRecord> {
    if (todayAttendance) return mockError("You have already checked in today.");
    const time = nowTime();
    todayAttendance = {
      date: db.toISODate(new Date()),
      status: time > db.SCHOOL_START_TIME ? "Late" : "Present",
      checkIn: time,
    };
    return mockResponse(todayAttendance);
  },

  // TODO(API): POST /teacher/my-attendance/check-out
  checkOut(): Promise<StaffAttendanceRecord> {
    if (!todayAttendance) return mockError("Please check in first.");
    if (todayAttendance.checkOut) return mockError("You have already checked out today.");
    todayAttendance = { ...todayAttendance, checkOut: nowTime() };
    return mockResponse(todayAttendance);
  },

  /* ------------------------------ Leave ----------------------------- */

  // TODO(API): GET /teacher/leave/balances
  getLeaveBalances: () => mockResponse(db.leaveBalances),

  // TODO(API): GET /teacher/leave
  getLeaveRequests: (): Promise<LeaveRequest[]> =>
    mockResponse([...db.leaveRequests].sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))),

  // TODO(API): POST /teacher/leave
  applyLeave(payload: ApplyLeavePayload): Promise<LeaveRequest> {
    const days = countLeaveDays(payload.fromDate, payload.toDate, payload.halfDay);
    if (days <= 0) return mockError("Selected dates contain no working days.");

    const overlaps = db.leaveRequests.some(
      (l) =>
        (l.status === "Pending" || l.status === "Approved") &&
        payload.fromDate <= l.toDate &&
        payload.toDate >= l.fromDate,
    );
    if (overlaps) return mockError("You already have a leave request for these dates.");

    const balance = db.leaveBalances.find((b) => b.type === payload.type);
    if (balance && payload.type !== "Unpaid Leave") {
      const pending = db.leaveRequests
        .filter((l) => l.type === payload.type && l.status === "Pending")
        .reduce((sum, l) => sum + l.days, 0);
      if (balance.total - balance.used - pending < days) {
        return mockError(`Not enough ${payload.type} balance. Apply as Unpaid Leave instead.`);
      }
    }

    const request: LeaveRequest = {
      id: nextId("LV"),
      ...payload,
      days,
      status: "Pending",
      appliedOn: new Date().toISOString(),
    };
    db.leaveRequests.unshift(request);
    return mockResponse(request);
  },

  // TODO(API): POST /teacher/leave/:id/cancel
  cancelLeave(id: string) {
    const req = db.leaveRequests.find((l) => l.id === id);
    if (!req || req.status !== "Pending") return mockError("Only pending requests can be cancelled.");
    req.status = "Cancelled";
    return mockResponse(req);
  },

  /* ---------------------------- Messages ---------------------------- */

  // TODO(API): GET /teacher/conversations
  getConversations: (): Promise<Conversation[]> =>
    mockResponse([...db.conversations].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))),

  // TODO(API): GET /teacher/conversations/:id/messages  (server marks as read)
  getMessages(conversationId: string): Promise<Message[]> {
    const conv = db.conversations.find((c) => c.id === conversationId);
    if (conv) conv.unreadCount = 0;
    return mockResponse(db.messages.filter((m) => m.conversationId === conversationId), 200);
  },

  // TODO(API): POST /teacher/conversations/:id/messages
  sendMessage(conversationId: string, text: string): Promise<Message> {
    const msg: Message = {
      id: nextId("M"),
      conversationId,
      fromMe: true,
      text,
      sentAt: new Date().toISOString(),
    };
    db.messages.push(msg);
    const conv = db.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageAt = msg.sentAt;
    }
    return mockResponse(msg, 150);
  },

  // TODO(API): GET /teacher/contacts
  getContacts(): Promise<Contact[]> {
    const taughtClassIds = new Set(db.teacherProfile.teaching.map((t) => t.classId));
    const parents: Contact[] = db.students
      .filter((s) => taughtClassIds.has(s.classId))
      .map((s) => ({
        id: s.parentId,
        name: s.parentName,
        type: "Parent",
        subtitle: `Parent of ${s.name} (${classLabel(s)})`,
      }));
    const staff: Contact[] = [
      { id: "PRN-001", name: "Dr. R. K. Mishra", type: "Principal", subtitle: "Principal" },
      ...db.subjectTeachers10A
        .filter((t) => !t.teacherName.includes("(You)"))
        .map((t, i) => ({ id: `TCH-00${i + 2}`, name: t.teacherName, type: "Teacher" as const, subtitle: t.subject })),
    ];
    return mockResponse([...staff, ...parents]);
  },

  // TODO(API): POST /teacher/conversations  { contactId }
  startConversation(contact: Contact): Promise<Conversation> {
    const existing = db.conversations.find((c) => c.contact.id === contact.id);
    if (existing) return mockResponse(existing, 100);
    const conv: Conversation = {
      id: nextId("CNV"),
      contact,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
    db.conversations.unshift(conv);
    return mockResponse(conv, 100);
  },

  /* ------------------------- Class teacher -------------------------- */

  // TODO(API): GET /teacher/class-teacher/overview
  getClassOverview(): Promise<ClassOverview> {
    let cls;
    try {
      cls = requireClassTeacher();
    } catch (e) {
      return mockError((e as Error).message);
    }
    const list = myClassStudents();
    const absent = 2;
    const late = 1;
    const weekly = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => ({
      day,
      percent: [96, 93, 89, 97, 92, 86][i],
    }));
    const inDays = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() + n);
      return db.toISODate(d);
    };
    const nextPtm = db.ptmMeetings.find((p) => p.status === "Scheduled");

    return mockResponse({
      ...cls,
      roomNo: db.classTeacherMeta.roomNo,
      academicYear: db.classTeacherMeta.academicYear,
      totalStudents: list.length,
      boys: list.filter((s) => s.gender === "Male").length,
      girls: list.filter((s) => s.gender === "Female").length,
      monitor: list.find((s) => s.id === db.classTeacherMeta.monitor)?.name ?? "—",
      viceMonitor: list.find((s) => s.id === db.classTeacherMeta.viceMonitor)?.name ?? "—",
      subjectTeachers: db.subjectTeachers10A,
      todayAttendance: { marked: true, present: list.length - absent - late, absent, late },
      weeklyAttendance: weekly,
      upcoming: [
        { id: "U1", title: "Maths Practice Test", date: inDays(3), type: "Exam" as const },
        ...(nextPtm ? [{ id: nextPtm.id, title: nextPtm.title, date: nextPtm.date, type: "PTM" as const }] : []),
        { id: "U3", title: "Annual Day Rehearsal", date: inDays(14), type: "Event" as const },
        { id: "U4", title: "Half Yearly Exams Begin", date: inDays(21), type: "Exam" as const },
      ],
    });
  },

  // TODO(API): GET /teacher/class-teacher/students
  getClassStudents(): Promise<Student[]> {
    try {
      return mockResponse(myClassStudents());
    } catch (e) {
      return mockError((e as Error).message);
    }
  },

  // TODO(API): GET /teacher/class-teacher/progress
  getStudentProgress(): Promise<StudentProgress[]> {
    let list: Student[];
    try {
      list = myClassStudents();
    } catch (e) {
      return mockError((e as Error).message);
    }
    const result = list.map<StudentProgress>((student) => {
      const m = db.studentMetrics[student.id];
      const all = m.subjects.flatMap((s) => s.scores.map((x) => x.percent));
      const averagePercent = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
      const examAvg = (i: number) => m.subjects.reduce((sum, s) => sum + s.scores[i].percent, 0) / m.subjects.length;
      const diff = examAvg(db.EXAMS.length - 1) - examAvg(0);
      return {
        student,
        attendancePercent: m.attendancePercent,
        averagePercent,
        assignmentCompletion: m.assignmentCompletion,
        grade: gradeFromPercent(averagePercent),
        trend: diff > 3 ? "up" : diff < -3 ? "down" : "steady",
        subjects: m.subjects,
        remarks: db.remarks
          .filter((r) => r.studentId === student.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      };
    });
    return mockResponse(result);
  },

  // TODO(API): POST /teacher/class-teacher/remarks
  addRemark(payload: AddRemarkPayload): Promise<StudentRemark> {
    const remark: StudentRemark = { id: nextId("RMK"), ...payload, createdAt: new Date().toISOString() };
    db.remarks.unshift(remark);
    return mockResponse(remark);
  },

  // TODO(API): DELETE /teacher/class-teacher/remarks/:id
  deleteRemark(id: string) {
    const idx = db.remarks.findIndex((r) => r.id === id);
    if (idx !== -1) db.remarks.splice(idx, 1);
    return mockResponse({ ok: true });
  },

  // TODO(API): GET /teacher/class-teacher/broadcasts
  getBroadcasts: (): Promise<ParentBroadcast[]> =>
    mockResponse([...db.parentBroadcasts].sort((a, b) => b.sentAt.localeCompare(a.sentAt))),

  // TODO(API): POST /teacher/class-teacher/broadcasts
  sendBroadcast(payload: SendBroadcastPayload): Promise<ParentBroadcast> {
    const total = myClassStudents().length;
    const b: ParentBroadcast = {
      id: nextId("BRD"),
      ...payload,
      recipientCount: payload.studentIds.length || total,
      sentAt: new Date().toISOString(),
      readCount: 0,
    };
    db.parentBroadcasts.unshift(b);
    return mockResponse(b);
  },

  // TODO(API): GET /teacher/class-teacher/ptm
  getPtms: (): Promise<PtmMeeting[]> => mockResponse([...db.ptmMeetings].sort((a, b) => b.date.localeCompare(a.date))),

  // TODO(API): POST /teacher/class-teacher/ptm
  schedulePtm(payload: SchedulePtmPayload): Promise<PtmMeeting> {
    const ptm: PtmMeeting = {
      id: nextId("PTM"),
      ...payload,
      status: "Scheduled",
      rsvps: myClassStudents().map((s) => ({ studentId: s.id, status: "Awaiting" })),
    };
    db.ptmMeetings.unshift(ptm);
    return mockResponse(ptm);
  },

  // TODO(API): PATCH /teacher/class-teacher/ptm/:id  { status }
  updatePtmStatus(id: string, status: PtmMeeting["status"]) {
    const ptm = db.ptmMeetings.find((p) => p.id === id);
    if (!ptm) return mockError("Meeting not found.");
    ptm.status = status;
    return mockResponse(ptm);
  },
};
