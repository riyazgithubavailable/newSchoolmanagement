// src/config/menu.ts
// Sidebar menu per role. Only list routes that exist in App.tsx.

import {
  Bell,
  BookMarked,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  School,
  Settings2,
  TrendingUp,
  UserCheck,
  UserCircle,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { getHomeRoute, type UserRole } from "@/config/roles";

export type BadgeKey = "notices" | "messages";

export interface MenuItem {
  label: string;
  to?: string;
  icon: LucideIcon;
  /** live counter shown next to the item (resolved in the Sidebar) */
  badgeKey?: BadgeKey;
  /** only visible when the teacher is a class teacher */
  classTeacherOnly?: boolean;
  children?: MenuItem[];
}

const TEACHER_MENU: MenuItem[] = [
  { label: "Dashboard", to: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "My Classes", to: "/teacher/classes", icon: GraduationCap },
  { label: "My Timetable", to: "/teacher/timetable", icon: CalendarDays },
  {
    label: "Class Teacher",
    icon: School,
    classTeacherOnly: true,
    children: [
      { label: "My Class", to: "/teacher/class-teacher/overview", icon: School },
      { label: "Student Progress", to: "/teacher/class-teacher/progress", icon: TrendingUp },
      { label: "Parent Communication", to: "/teacher/class-teacher/parents", icon: UsersRound },
    ],
  },
  {
    label: "Attendance",
    icon: ClipboardCheck,
    children: [
      { label: "Mark Attendance", to: "/teacher/attendance/mark", icon: ClipboardCheck },
      { label: "Attendance History", to: "/teacher/attendance/history", icon: CalendarCheck },
    ],
  },
  {
    label: "Assignments",
    icon: ClipboardList,
    children: [
      { label: "All Assignments", to: "/teacher/assignments", icon: ClipboardList },
      { label: "Create Assignment", to: "/teacher/assignments/create", icon: ClipboardList },
      { label: "Submissions", to: "/teacher/assignments/submissions", icon: ClipboardCheck },
    ],
  },
  {
    label: "Exams & Results",
    icon: FileBarChart,
    children: [
      { label: "Exam Schedule", to: "/teacher/exams/schedule", icon: CalendarDays },
      { label: "Enter Marks", to: "/teacher/exams/marks", icon: ClipboardList },
      { label: "Student Results", to: "/teacher/exams/results", icon: FileBarChart },
    ],
  },
  { label: "Students", to: "/teacher/students", icon: Users },
  { label: "Study Materials", to: "/teacher/study-materials", icon: BookMarked },
  { label: "Notices", to: "/teacher/notices", icon: Bell, badgeKey: "notices" },
  { label: "Messages", to: "/teacher/messages", icon: MessageSquare, badgeKey: "messages" },
  { label: "My Attendance", to: "/teacher/my-attendance", icon: CalendarCheck },
  { label: "Leave", to: "/teacher/leave", icon: CalendarOff },
  { label: "My Profile", to: "/teacher/profile", icon: UserCircle },
];

/** Other roles are built later — dashboard only for now. */
const dashboardOnly = (role: UserRole): MenuItem[] => [
  { label: "Dashboard", to: getHomeRoute(role), icon: LayoutDashboard },
];

/** Principal and office admin share the school management pages. */
const schoolMenu = (role: UserRole): MenuItem[] => {
  const base = getHomeRoute(role).replace("/dashboard", "");
  return [
    { label: "Dashboard", to: `${base}/dashboard`, icon: LayoutDashboard },
    { label: "School Setup", to: `${base}/setup`, icon: Settings2 },
    { label: "Staff", to: `${base}/staff`, icon: Users },
    { label: "Class & Subject Teachers", to: `${base}/assignments`, icon: UserCheck },
  ];
};

export function getMenuItems(role: UserRole, isClassTeacher: boolean): MenuItem[] {
  const items =
    role === "TEACHER"
      ? TEACHER_MENU
      : role === "PRINCIPAL" || role === "ADMIN"
        ? schoolMenu(role)
        : dashboardOnly(role);
  return items.filter((item) => !item.classTeacherOnly || isClassTeacher);
}
