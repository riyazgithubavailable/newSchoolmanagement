import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  ChevronDown,
  HelpCircle,
  Home,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/nameUtils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/contexts/AuthContext";
import ConfirmDialog from "@/utils/ConfirmDialog";
import ProfileDialog from "@/utils/ProfileDialog";

type AuthUser = {
  name?: string;
  fullName?: string;
  roleName?: string;
  email?: string;
};

interface BreadcrumbNavbarProps {
  className?: string;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Headers({
  className,
  sidebarCollapsed = false,
  onToggleSidebar,
}: BreadcrumbNavbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth() as {
    user?: AuthUser;
    logout: () => void;
  };

  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  /*
   * Don't show navbar on login page
   */

  if (pathname === "/") {
    return null;
  }

  /*
   * Breadcrumbs
   */

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const to =
      "/" + segments.slice(0, index + 1).join("/");

    return {
      to,
      label: titleCase(segment),
    };
  });

  const isHome =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/teacher/dashboard";

  /*
   * User information
   */

  const displayName =
    user?.fullName ||
    user?.name ||
    "Teacher";

  const roleName =
    user?.roleName ||
    "Teacher";

  /*
   * Logout
   */

  const handleLogoutConfirmed = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-20 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-5">
          {/* ================= LEFT ================= */}

          <div className="flex min-w-0 flex-1 items-center gap-2">
            {/* Sidebar Toggle */}

            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Breadcrumb */}

            <div className="min-w-0 flex-1">
              <Breadcrumb className="overflow-hidden">
                <BreadcrumbList>
                  {/* Home */}

                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <button
                        type="button"
                        // onClick={() =>
                        //   navigate("/teacher/dashboard")
                        // }
                        className="flex items-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Home
                        </span>
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {/* Other routes */}

                  {!isHome &&
                    crumbs.map((crumb, index) => {
                      const isLast =
                        index === crumbs.length - 1;

                      return (
                        <React.Fragment key={crumb.to}>
                          <BreadcrumbSeparator />

                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>
                                {crumb.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <button
                                  type="button"
                                  className="cursor-text"
                                  // onClick={() =>
                                  //   navigate(crumb.to)
                                  // }
                                >
                                  {crumb.label}
                                </button>
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

          {/* ================= RIGHT ================= */}

          <div className="flex shrink-0 items-center gap-1.5">
            {/* Help */}

            <button
              type="button"
              aria-label="Help"
              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <HelpCircle size={17} />
            </button>

            {/* User Menu */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 hover:bg-slate-50"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {getInitials(displayName)}
                  </div>

                  <div className="hidden text-left leading-tight sm:block">
                    <p className="text-xs font-medium text-slate-800">
                      {displayName}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {roleName}
                    </p>
                  </div>

                  <ChevronDown
                    size={13}
                    className="hidden text-slate-400 sm:block"
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setProfileOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setLogoutOpen(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ================= PROFILE ================= */}

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        user={user}
      />

      {/* ================= LOGOUT CONFIRM ================= */}

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