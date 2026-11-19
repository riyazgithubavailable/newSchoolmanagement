import { QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Building2, LogOut, ScrollText, ShieldCheck } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { PlatformAuthProvider, PublicOnly, RequireOwner, RequireSetup, usePlatformAuth } from "@/auth/PlatformAuth";
import PlatformLogin from "./pages/PlatformLogin";
import SetupTwoFactor from "./pages/SetupTwoFactor";
import SchoolsPage from "./pages/SchoolsPage";
import AuditLogPage from "./pages/AuditLogPage";

function Shell() {
  const { user, logout } = usePlatformAuth();
  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
      isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
    );
  return (
    <div className="min-h-screen bg-[#FBF9F3]">
      <header className="sticky top-0 z-30 bg-[#0B1426] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#E5BE6A]" />
            <span className="font-semibold">InstituteOS Platform</span>
          </div>
          <nav className="flex gap-1">
            <NavLink to="/schools" className={link}>
              <Building2 size={16} /> Schools
            </NavLink>
            <NavLink to="/audit" className={link}>
              <ScrollText size={16} /> Audit log
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-white/70 sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" />
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PlatformAuthProvider>
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/" element={<PlatformLogin />} />
            </Route>
            <Route element={<RequireSetup />}>
              <Route path="/setup-2fa" element={<SetupTwoFactor />} />
            </Route>
            <Route element={<RequireOwner />}>
              <Route element={<Shell />}>
                <Route path="/schools" element={<SchoolsPage />} />
                <Route path="/audit" element={<AuditLogPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PlatformAuthProvider>
      </HashRouter>
    </QueryClientProvider>
  );
}
