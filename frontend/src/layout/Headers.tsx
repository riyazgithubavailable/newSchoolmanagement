import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Home, KeyRound, LogOut, PanelLeftClose, PanelLeftOpen, User } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/nameUtils";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRoute, ROLE_LABELS } from "@/config/roles";
import { getMenuItems, type MenuItem } from "@/config/menu";
import { useUnreadNoticeCount } from "@/hooks/useTeacherQueries";
import ConfirmDialog from "@/utils/ConfirmDialog";
import ProfileDialog from "@/utils/ProfileDialog";

interface HeaderProps {
  className?: string;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const titleCase = (value: string) => value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** path → label map built from the menu, so breadcrumbs show real names */
function buildLabelMap(items: MenuItem[], map: Record<string, string> = {}) {
  for (const i of items) {
    if (i.to) map[i.to] = i.label;
    if (i.children) buildLabelMap(i.children, map);
  }
  return map;
}

function NoticeBell() {
  const unread = useUnreadNoticeCount();
  return (
    <Link
      to="/teacher/notices"
      aria-label={`Notices${unread ? `, ${unread} unread` : ""}`}
      className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
    >
      <Bell size={17} />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
          {unread}
        </span>
      )}
    </Link>
  );
}

export default function Headers({ className, sidebarCollapsed = false, onToggleSidebar }: HeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const role = user?.role ?? "TEACHER";
  const homeRoute = getHomeRoute(role);
  const labels = React.useMemo(() => buildLabelMap(getMenuItems(role, true)), [role]);

  // "/teacher/class-teacher/progress" → [class-teacher, progress] (role prefix dropped)
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.slice(1).map((segment, index) => {
    const to = "/" + segments.slice(0, index + 2).join("/");
    return { to, label: labels[to] ?? titleCase(segment) };
  });
  const isHome = pathname === homeRoute;

  const handleLogoutConfirmed = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-20 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-5">
          {/* Left */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {onToggleSidebar && (
              <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
                {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </Button>
            )}

            <div className="min-w-0 flex-1">
              <Breadcrumb className="overflow-hidden">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={homeRoute} className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">Home</span>
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {!isHome &&
                    crumbs.map((crumb, index) => {
                      const isLast = index === crumbs.length - 1;
                      const isRoute = !!labels[crumb.to];
                      return (
                        <React.Fragment key={crumb.to}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            {isLast || !isRoute ? (
                              <BreadcrumbPage className={cn(!isLast && "text-muted-foreground")}>
                                {crumb.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link to={crumb.to}>{crumb.label}</Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      );
                    })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center gap-1.5">
            {role === "TEACHER" && <NoticeBell />}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 hover:bg-slate-50">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {getInitials(user?.fullName ?? "")}
                  </div>
                  <div className="hidden text-left leading-tight sm:block">
                    <p className="text-xs font-medium text-slate-800">{user?.fullName}</p>
                    <p className="text-[10px] text-slate-400">
                      {ROLE_LABELS[role]}
                      {user?.isClassTeacher ? " · Class Teacher" : ""}
                    </p>
                  </div>
                  <ChevronDown size={13} className="hidden text-slate-400 sm:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => (role === "TEACHER" ? navigate("/teacher/profile") : setProfileOpen(true))}
                >
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/change-password")}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLogoutOpen(true)} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} user={user} />

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Sign Out?"
        description="Are you sure you want to sign out?"
        confirmText="Yes"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleLogoutConfirmed}
      />
    </>
  );
}
