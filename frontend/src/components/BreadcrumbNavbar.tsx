import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Home,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Moon,
  Sun,
} from "lucide-react";

import { NAV_ITEMS, type NavItem } from "@/config/navItems";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileData } from "@/lib/auth";
import { clearAuthStorage } from "@/utils/logout";
import ConfirmDialog from "@/utils/ConfirmDialog";
import { getInitials } from "@/lib/nameUtils";
import ProfileDialog from "@/components/ProfileDialog";
import { useEmployeePhoto } from "@/hooks/useEmployeePhoto";
import { useToast } from "@/hooks/use-toast";

type AuthUser = {
  name?: string;
  roleName?: string;
};

function titleCase(s: string) {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BreadcrumbNavbar({
  className,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  className?: string;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth() as {
    user?: AuthUser;
    logout: () => void;
  };

  const profile = getProfileData<any>() ?? {};

  const displayName = (profile?.fullName ?? user?.name ?? "")
    .toString()
    .trim();

  const roleName = (profile?.roleName ?? user?.roleName ?? "")
    .toString()
    .trim();

  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const { toast } = useToast();
  // ✅ PHOTO HOOK
  const { photo, loading, fetchEmployeePhoto } = useEmployeePhoto();

  // ✅ FETCH PHOTO
  React.useEffect(() => {
    const employeeId = JSON.parse(sessionStorage.getItem("profileData"))

    if (employeeId?.plantEmployeeId.toString()) {
      fetchEmployeePhoto(employeeId.plantEmployeeId.toString());
    }
  }, []);

  // ✅ THEME SETUP
  // React.useEffect(() => {
  //   const root = document.documentElement;
  //   const savedTheme = localStorage.getItem("theme");

  //   if (savedTheme === "dark") {
  //     root.classList.add("dark");
  //     setIsDarkMode(true);
  //     return;
  //   }

  //   if (savedTheme === "light") {
  //     root.classList.remove("dark");
  //     setIsDarkMode(false);
  //     return;
  //   }

  //   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   root.classList.toggle("dark", prefersDark);
  //   setIsDarkMode(prefersDark);
  // }, []);

  // const toggleTheme = () => {
  //   const root = document.documentElement;
  //   const next = !root.classList.contains("dark");

  //   root.classList.toggle("dark", next);
  //   localStorage.setItem("theme", next ? "dark" : "light");
  //   setIsDarkMode(next);
  // };

  // ✅ ROUTE LABEL MAP
  const routeLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();

    const addItem = (it: NavItem) => {
      if (it.to) map.set(it.to, it.label);
      it.children?.forEach(addItem);
    };

    NAV_ITEMS.forEach(addItem);
    return map;
  }, []);

  if (pathname === "/login") return null;

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, idx) => {
    const to = "/" + segments.slice(0, idx + 1).join("/");
    const label = routeLabelMap.get(to) ?? titleCase(seg);
    return { to, label };
  });

  const isHome = pathname === "/" || pathname === "/dashboard";

  // const handleLogoutConfirmed = () => {
  //   clearAuthStorage();
  //   logout();
  //   navigate("/login", { replace: true });
  // };

  const handleLogoutConfirmed = () => {
    clearAuthStorage();
    logout();

    // ✅ REDIRECT TO APPROPRIATE LOGIN
    // const role = profile?.roleName?.toLowerCase() || "";

    // if (role.includes("admin") || role.includes("superadmin")) {
    //   navigate("/admin-login", { replace: true });
    // } else {
    //   navigate("/login", { replace: true });
    // }
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-20 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70",
          className
        )}
      >
        <div className="flex items-center justify-between px-5 py-3">

          {/* LEFT */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
            )}

            <div className="min-w-0 flex-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <p className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Home
                      </p>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {!isHome &&
                    crumbs.map((c, i) => {
                      const isLast = i === crumbs.length - 1;
                      return (
                        <React.Fragment key={c.to}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{c.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <p>{c.label}</p>
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

          {/* RIGHT */}
          <div className="flex items-center gap-2">

           
            {/* PROFILE */}
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-full border bg-background px-3 py-1.5"
            >
              <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
                {roleName || "Unknown Role"}
              </Badge>

              {/* ✅ IMAGE OR INITIAL */}
              <div className="h-8 w-8">
                {loading ? (
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                ) : photo?.employeePhotoBase64 &&
                  photo.employeePhotoBase64.trim() !== "" ? (
                  <img
                    src={`data:image/jpeg;base64,${photo.employeePhotoBase64}`}
                    alt="profile"
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-900">
                    {displayName ? getInitials(displayName) : "U"}
                  </div>
                )}
              </div>
            </button>

            {/* MOBILE PROFILE */}
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden"
              onClick={() => setProfileOpen(true)}
            >
              <User className="h-4 w-4" />
            </Button>

            {/* THEME */}
            {/* <Button onClick={toggleTheme} size="icon">
              {isDarkMode ? <Sun /> : <Moon />}
            </Button> */}

            {/* LOGOUT */}
          
            <Button
              variant="destructive"
              onClick={() => {
                setLogoutOpen(true);
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* PROFILE DIALOG */}
      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profile}
        displayName={displayName}
        roleName={roleName}
        photo={photo}
      />

      {/* LOGOUT */}
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Sign Out?"
        description="Are You Sure You Want To Sign Out?"
        confirmText="Yes"
        cancelText="Cancel"
        onConfirm={handleLogoutConfirmed}
      />
    </>
  );
}