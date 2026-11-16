// src/config/navItems.ts
import {
  LayoutDashboard,
  CalendarClock,
  GraduationCap,
  Users,
  ClipboardCheck,
  BookOpen,
  NotebookPen,
  FileText,
  FolderOpen,
  FileSpreadsheet,
  ClipboardList,
  Award,
  CalendarOff,
  Megaphone,
  MessagesSquare,
  Bell,
  Settings,
  LogOut,
  Wallet,
  BarChart3,
  School,
  UserCog,
  BadgeCheck,
  LucideIcon,
} from "lucide-react";
import { ROLES, type RoleName } from "@/config/roles";

export interface NavItem {
  to?: string;
  label: string;
  icon: LucideIcon;
  roles?: RoleName[];
  children?: NavItem[];
}

/** Shown in the sidebar header under the InstituteOS logo, per role. */
export const ROLE_LABELS: Record<RoleName, string> = {
  [ROLES.TEACHER]: "Teacher Workspace",
  [ROLES.PARENT]: "Parent Portal",
  [ROLES.ADMIN]: "Admin Console",
};

export const NAV_ITEMS: NavItem[] = [
  /* --------------------------------- DASHBOARDS ------------------------------ */
  {
    to: "/teacher/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.TEACHER],
  },
  {
    to: "/parent/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.PARENT],
  },
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN],
  },

  /* ---------------------------------- TEACHER --------------------------------- */
  {
    to: "/teacher/timetable",
    label: "My Timetable",
    icon: CalendarClock,
    roles: [ROLES.TEACHER],
  },
  {
    label: "My Classes",
    icon: GraduationCap,
    roles: [ROLES.TEACHER],
    children: [
      {
        to: "/teacher/classes",
        label: "All Classes",
        icon: GraduationCap,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/classes/students",
        label: "Students",
        icon: Users,
        roles: [ROLES.TEACHER],
      },
    ],
  },
  {
    label: "Attendance",
    icon: ClipboardCheck,
    roles: [ROLES.TEACHER],
    children: [
      {
        to: "/teacher/attendance/today",
        label: "Today's Attendance",
        icon: ClipboardCheck,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/attendance/history",
        label: "Attendance History",
        icon: ClipboardCheck,
        roles: [ROLES.TEACHER],
      },
    ],
  },
  {
    label: "Academics",
    icon: BookOpen,
    roles: [ROLES.TEACHER],
    children: [
      {
        to: "/teacher/academics/lessons",
        label: "Lessons",
        icon: NotebookPen,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/academics/homework",
        label: "Homework",
        icon: FileText,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/academics/assignments",
        label: "Assignments",
        icon: ClipboardList,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/academics/materials",
        label: "Study Materials",
        icon: FolderOpen,
        roles: [ROLES.TEACHER],
      },
    ],
  },
  {
    label: "Exams",
    icon: FileSpreadsheet,
    roles: [ROLES.TEACHER],
    children: [
      {
        to: "/teacher/exams/schedule",
        label: "Exam Schedule",
        icon: FileSpreadsheet,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/exams/marks-entry",
        label: "Marks Entry",
        icon: ClipboardList,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/exams/results",
        label: "Results",
        icon: Award,
        roles: [ROLES.TEACHER],
      },
    ],
  },
  {
    to: "/teacher/leave",
    label: "Leave",
    icon: CalendarOff,
    roles: [ROLES.TEACHER],
  },
  {
    label: "Communication",
    icon: MessagesSquare,
    roles: [ROLES.TEACHER],
    children: [
      {
        to: "/teacher/communication/announcements",
        label: "Announcements",
        icon: Megaphone,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/communication/parents",
        label: "Parent Communication",
        icon: MessagesSquare,
        roles: [ROLES.TEACHER],
      },
    ],
  },
  {
    to: "/teacher/notifications",
    label: "Notifications",
    icon: Bell,
    roles: [ROLES.TEACHER],
  },
  {
    to: "/teacher/profile",
    label: "Profile & Settings",
    icon: Settings,
    roles: [ROLES.TEACHER],
  },

  /* ---------------------------------- PARENT ---------------------------------- */
  {
    to: "/parent/children",
    label: "My Children",
    icon: Users,
    roles: [ROLES.PARENT],
  },
  {
    to: "/parent/attendance",
    label: "Attendance",
    icon: ClipboardCheck,
    roles: [ROLES.PARENT],
  },
  {
    label: "Academics",
    icon: BookOpen,
    roles: [ROLES.PARENT],
    children: [
      {
        to: "/parent/academics/homework",
        label: "Homework",
        icon: FileText,
        roles: [ROLES.PARENT],
      },
      {
        to: "/parent/academics/assignments",
        label: "Assignments",
        icon: ClipboardList,
        roles: [ROLES.PARENT],
      },
      {
        to: "/parent/academics/materials",
        label: "Study Materials",
        icon: FolderOpen,
        roles: [ROLES.PARENT],
      },
    ],
  },
  {
    label: "Exams",
    icon: FileSpreadsheet,
    roles: [ROLES.PARENT],
    children: [
      {
        to: "/parent/exams/schedule",
        label: "Exam Schedule",
        icon: FileSpreadsheet,
        roles: [ROLES.PARENT],
      },
      {
        to: "/parent/exams/results",
        label: "Results",
        icon: Award,
        roles: [ROLES.PARENT],
      },
      {
        to: "/parent/exams/report-cards",
        label: "Report Cards",
        icon: BadgeCheck,
        roles: [ROLES.PARENT],
      },
    ],
  },
  {
    to: "/parent/fees",
    label: "Fees",
    icon: Wallet,
    roles: [ROLES.PARENT],
  },
  {
    label: "Communication",
    icon: MessagesSquare,
    roles: [ROLES.PARENT],
    children: [
      {
        to: "/parent/communication/announcements",
        label: "Announcements",
        icon: Megaphone,
        roles: [ROLES.PARENT],
      },
      {
        to: "/parent/communication/teachers",
        label: "Teacher Communication",
        icon: MessagesSquare,
        roles: [ROLES.PARENT],
      },
    ],
  },
  {
    to: "/parent/notifications",
    label: "Notifications",
    icon: Bell,
    roles: [ROLES.PARENT],
  },
  {
    to: "/parent/profile",
    label: "Profile & Settings",
    icon: Settings,
    roles: [ROLES.PARENT],
  },

  /* ------------------------------ ADMIN / PRINCIPAL ---------------------------- */
  {
    to: "/admin/students",
    label: "Students",
    icon: GraduationCap,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/admin/staff",
    label: "Teachers & Staff",
    icon: UserCog,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Classes & Sections",
    icon: School,
    roles: [ROLES.ADMIN],
    children: [
      {
        to: "/admin/classes",
        label: "Classes & Sections",
        icon: School,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/admin/subjects",
        label: "Subjects",
        icon: BookOpen,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/admin/timetable",
        label: "Timetable",
        icon: CalendarClock,
        roles: [ROLES.ADMIN],
      },
    ],
  },
  {
    to: "/admin/attendance",
    label: "Attendance",
    icon: ClipboardCheck,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Exams",
    icon: FileSpreadsheet,
    roles: [ROLES.ADMIN],
    children: [
      {
        to: "/admin/exams/schedule",
        label: "Exam Schedule",
        icon: FileSpreadsheet,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/admin/exams/results",
        label: "Marks & Results",
        icon: Award,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/admin/exams/report-cards",
        label: "Report Cards",
        icon: BadgeCheck,
        roles: [ROLES.ADMIN],
      },
    ],
  },
  {
    to: "/admin/leave",
    label: "Leave Management",
    icon: CalendarOff,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/admin/fees",
    label: "Fees",
    icon: Wallet,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Communication",
    icon: MessagesSquare,
    roles: [ROLES.ADMIN],
    children: [
      {
        to: "/admin/communication/announcements",
        label: "Announcements",
        icon: Megaphone,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/admin/communication/parents",
        label: "Parent Communication",
        icon: MessagesSquare,
        roles: [ROLES.ADMIN],
      },
    ],
  },
  {
    to: "/admin/reports",
    label: "Reports & Analytics",
    icon: BarChart3,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/admin/notifications",
    label: "Notifications",
    icon: Bell,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/admin/profile",
    label: "Profile & Settings",
    icon: Settings,
    roles: [ROLES.ADMIN],
  },
];

export const LOGOUT_ITEM: { label: string; icon: LucideIcon } = {
  label: "Logout",
  icon: LogOut,
};

/**
 * Filters NAV_ITEMS down to the items visible for a given role, recursing
 * into children. An item with no `roles` is always visible. A parent with
 * no directly-allowed role but at least one allowed child stays visible
 * (with only the allowed children).
 */
export function filterNavItemsByRole(roleName?: string | null): NavItem[] {
  const role = (roleName || "").trim().toLowerCase();

  if (!role) return [];

  const allowed = (item: NavItem) =>
    !item.roles ||
    item.roles.some((r) => String(r).trim().toLowerCase() === role);

  const filterItems = (items: NavItem[]): NavItem[] => {
    return items
      .map((item) => {
        const filteredChildren = item.children
          ? filterItems(item.children)
          : [];

        if (allowed(item) || filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren.length ? filteredChildren : undefined,
          };
        }

        return null;
      })
      .filter(Boolean) as NavItem[];
  };

  return filterItems(NAV_ITEMS);
}