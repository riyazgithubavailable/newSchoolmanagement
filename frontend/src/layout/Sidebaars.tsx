import {
  ClipboardCheck,
  ClipboardList,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  PenLine,
  UserCircle,
  Users,
  BookMarked,
  Shield,
  type LucideIcon,
  MessageSquare,
  BookOpen,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  role: UserRole;
  isClassTeacher?: boolean;
}

interface MenuItem {
  label: string;
  to?: string;
  icon: LucideIcon;
  badge?: number;
  children?: MenuItem[];
}

/*
|--------------------------------------------------------------------------
| Temporary Teacher Sidebar Menu
|--------------------------------------------------------------------------
| Backend banne tak static menu use kar rahe hain.
| Baad mein isi menu ko API permissions ke according dynamic kar sakte hain.
|--------------------------------------------------------------------------
*/

type UserRole = "TEACHER" | "PRINCIPAL" | "ADMIN" | "STUDENT";

interface MenuItem {
  label: string;
  to?: string;
  icon: LucideIcon;
  badge?: number;
  roles?: UserRole[];
  children?: MenuItem[];
}

const getMenuItems = (
  role: UserRole,
  isClassTeacher = false
): MenuItem[] => {
  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      to: `/${role.toLowerCase()}/dashboard`,
      icon: LayoutDashboard,
    },

    // TEACHER MENU
    {
      label: "My Classes",
      to: "/teacher/classes",
      icon: Users,
      roles: ["TEACHER"],
    },

    {
      label: "My Timetable",
      to: "/teacher/timetable",
      icon: CalendarDays,
      roles: ["TEACHER"],
    },

    {
      label: "Attendance",
      icon: ClipboardCheck,
      roles: ["TEACHER"],
      children: [
        {
          label: "Mark Attendance",
          to: "/teacher/attendance/mark",
          icon: CalendarCheck,
        },
        {
          label: "Attendance History",
          to: "/teacher/attendance/history",
          icon: ClipboardList,
        },
      ],
    },

    {
      label: "Assignments",
      icon: FileText,
      roles: ["TEACHER"],
      children: [
        {
          label: "All Assignments",
          to: "/teacher/assignments",
          icon: FileText,
        },
        {
          label: "Create Assignment",
          to: "/teacher/assignments/create",
          icon: PenLine,
        },
        {
          label: "Submissions",
          to: "/teacher/assignments/submissions",
          icon: ClipboardList,
        },
      ],
    },

    {
      label: "Exams & Results",
      icon: FileBarChart,
      roles: ["TEACHER", "PRINCIPAL", "ADMIN"],
      children: [
        {
          label: "Exam Schedule",
          to: `/${role.toLowerCase()}/exams/schedule`,
          icon: CalendarDays,
        },
        {
          label: "Enter Marks",
          to: "/teacher/exams/marks",
          icon: PenLine,
          roles: ["TEACHER"],
        },
        {
          label: "Student Results",
          to: "/teacher/exams/results",
          icon: FileBarChart,
          roles: ["TEACHER"],
        },
      ],
    },

    {
      label: "Students",
      to: `/${role.toLowerCase()}/students`,
      icon: Users,
      roles: ["TEACHER", "PRINCIPAL", "ADMIN"],
    },

    {
      label: "Study Materials",
      to: "/teacher/study-materials",
      icon: BookMarked,
      roles: ["TEACHER"],
    },

    {
      label: "Notices",
      to: `/${role.toLowerCase()}/notices`,
      icon: Bell,
      roles: ["TEACHER", "PRINCIPAL", "ADMIN", "STUDENT"],
    },

    {
      label: "My Attendance",
      to: "/teacher/my-attendance",
      icon: CalendarCheck,
      roles: ["TEACHER"],
    },

    {
      label: "Leave Management",
      to: "/teacher/leave",
      icon: CalendarDays,
      roles: ["TEACHER"],
    },

    {
      label: "Messages",
      to: "/teacher/messages",
      icon: MessageSquare,
      roles: ["TEACHER"],
    },

    {
      label: "Class Teacher",
      icon: GraduationCap,
      roles: ["TEACHER"],
      children: [
        {
          label: "My Class",
          to: "/teacher/class-teacher/overview",
          icon: Users,
        },
        {
          label: "Student Progress",
          to: "/teacher/class-teacher/progress",
          icon: FileBarChart,
        },
        {
          label: "Parent Communication",
          to: "/teacher/class-teacher/parents",
          icon: MessageSquare,
        },
      ],
    },

    // PRINCIPAL / ADMIN MENU
    {
      label: "Teachers",
      to: "/admin/teachers",
      icon: Users,
      roles: ["PRINCIPAL", "ADMIN"],
    },

    {
      label: "Teacher Leave Requests",
      to: "/admin/teacher-leaves",
      icon: CalendarDays,
      roles: ["PRINCIPAL", "ADMIN"],
    },

    {
      label: "School Management",
      icon: Shield,
      roles: ["PRINCIPAL", "ADMIN"],
      children: [
        {
          label: "Classes & Sections",
          to: "/admin/classes",
          icon: BookOpen,
        },
        {
          label: "Subjects",
          to: "/admin/subjects",
          icon: BookMarked,
        },
        {
          label: "Timetable Management",
          to: "/admin/timetable",
          icon: CalendarDays,
        },
      ],
    },

    // STUDENT MENU
    {
      label: "My Assignments",
      to: "/student/assignments",
      icon: FileText,
      roles: ["STUDENT"],
    },

    {
      label: "My Results",
      to: "/student/results",
      icon: FileBarChart,
      roles: ["STUDENT"],
    },

    {
      label: "My Profile",
      to: `/${role.toLowerCase()}/profile`,
      icon: UserCircle,
    },
  ];

  const filterMenu = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => !item.roles || item.roles.includes(role))
      .map((item) => ({
        ...item,
        children: item.children
          ? filterMenu(item.children)
          : undefined,
      }))
      .filter((item) => {
        if (item.children) {
          return item.children.length > 0;
        }
        return true;
      });
  };

  const filteredItems = filterMenu(menuItems);

  if (role === "TEACHER" && !isClassTeacher) {
    return filteredItems.filter(
      (item) => item.label !== "Class Teacher"
    );
  }

  return filteredItems;
};

/*
|--------------------------------------------------------------------------
| Check whether menu item is active
|--------------------------------------------------------------------------
*/

const isMenuActive = (
  item: MenuItem,
  pathname: string
): boolean => {
  if (item.to && pathname === item.to) {
    return true;
  }

  if (item.children?.length) {
    return item.children.some((child) => {
      if (!child.to) return false;

      return (
        pathname === child.to ||
        pathname.startsWith(`${child.to}/`)
      );
    });
  }

  return false;
};

/*
|--------------------------------------------------------------------------
| Sidebar Component
|--------------------------------------------------------------------------
*/

export const Sidebaars = ({
  collapsed = false,
  onToggle,
  role,
  isClassTeacher = false,
}: SidebarProps) => {
  const location = useLocation();
const menuItems = getMenuItems(role, isClassTeacher);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(
    null
  );

  return (
    <aside
      className={`
        flex h-full w-full flex-col
        bg-[#061c41] text-white
        transition-all duration-300
        ${collapsed ? "w-[76px]" : "w-[235px]"}
      `}
    >
      {/* =====================================================
          LOGO
      ====================================================== */}

      <div
        className={`
          flex h-[76px] shrink-0 items-center
          border-b border-white/10
          ${collapsed ? "justify-center px-3" : "px-5"}
        `}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/80">
          <Shield size={25} strokeWidth={1.7} />
        </div>

        {!collapsed && (
          <div className="ml-3">
            <h1 className="text-[20px] text-white font-semibold tracking-tight">
              InstituteOS
            </h1>

            <p className="text-[12px] text-white/80">
              Teacher Workspace
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          MENU
      ====================================================== */}

      <nav className="scrollbar-none flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren =
              Boolean(item.children?.length);

            const active = isMenuActive(
              item,
              location.pathname
            );

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => {
                  if (hasChildren) {
                    setHoveredMenu(item.label);
                  }
                }}
                onMouseLeave={() => {
                  if (hasChildren) {
                    setHoveredMenu(null);
                  }
                }}
              >
                {/* =================================================
                    MAIN MENU ITEM
                ================================================== */}

                {item.to ? (
                  <NavLink
                    to={item.to}
                    end
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) => `
                      group flex w-full items-center rounded-lg
                      px-3 py-2.5 text-left
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-[#2463d4] text-white shadow-sm"
                          : "text-white/90 hover:bg-white/10"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1 text-[13px] font-medium">
                          {item.label}
                        </span>

                        {item.badge !== undefined && (
                          <span className="mr-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    title={collapsed ? item.label : undefined}
                    className={`
                      group flex w-full items-center rounded-lg
                      px-3 py-2.5 text-left
                      transition-all duration-200
                      ${
                        active
                          ? "bg-[#2463d4] text-white shadow-sm"
                          : "text-white/90 hover:bg-white/10"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1 text-[13px] font-medium">
                          {item.label}
                        </span>

                        <ChevronDown
                          size={15}
                          className={`
                            transition-transform duration-200
                            ${
                              hoveredMenu === item.label
                                ? "rotate-180"
                                : ""
                            }
                          `}
                        />
                      </>
                    )}
                  </button>
                )}

                {/* =================================================
                    COLLAPSED SIDEBAR - HOVER SUBMENU
                ================================================== */}

                {collapsed &&
                  hasChildren &&
                  hoveredMenu === item.label && (
                    <div className="absolute left-[calc(100%+8px)] top-0 z-[100] min-w-[205px] rounded-lg border border-white/10 bg-[#061c41] p-2 shadow-xl">
                      <div className="border-b border-white/10 px-3 py-2">
                        <p className="text-xs font-semibold text-white/70">
                          {item.label}
                        </p>
                      </div>

                      <div className="mt-1 space-y-1">
                        {item.children?.map((child) => {
                          if (!child.to) return null;

                          const ChildIcon = child.icon;

                          return (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              className={({ isActive }) => `
                                flex items-center gap-2 rounded-md
                                px-3 py-2 text-[12px]
                                transition-colors
                                ${
                                  isActive
                                    ? "bg-[#2463d4] text-white"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                }
                              `}
                            >
                              <ChildIcon
                                size={15}
                                strokeWidth={1.8}
                              />

                              <span>{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* =================================================
                    EXPANDED SIDEBAR - HOVER SUBMENU
                ================================================== */}

                {!collapsed &&
                  hasChildren &&
                  hoveredMenu === item.label && (
                    <div className="absolute left-0 right-0 top-full z-[100] mt-1 rounded-lg border border-white/10 bg-[#082650] p-1 shadow-lg">
                      {item.children?.map((child) => {
                        if (!child.to) return null;

                        const ChildIcon = child.icon;

                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={({ isActive }) => `
                              flex items-center gap-2 rounded-md
                              px-4 py-2 text-[12px]
                              transition-colors
                              ${
                                isActive
                                  ? "bg-[#2463d4] text-white"
                                  : "text-white/75 hover:bg-white/10 hover:text-white"
                              }
                            `}
                          >
                            <ChildIcon
                              size={15}
                              strokeWidth={1.8}
                            />

                            <span>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* =====================================================
          COLLAPSE BUTTON
      ====================================================== */}

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onToggle}
          className={`
            flex w-full items-center rounded-lg
            px-3 py-2 text-white/90
            transition-colors hover:bg-white/10
            ${collapsed ? "justify-center" : "gap-3"}
          `}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}

          {!collapsed && (
            <span className="text-[12px]">
              Collapse
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebaars;