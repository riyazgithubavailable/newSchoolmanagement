// src/routes/guards.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRoute, type UserRole } from "@/config/roles";

/** Must be logged in AND have one of the given roles. */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  if (!roles.includes(user.role)) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }
  return <Outlet />;
}

/** Teacher pages that only the class teacher of a section can open. */
export function RequireClassTeacher() {
  const { user } = useAuth();
  if (!user?.isClassTeacher) {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  return <Outlet />;
}

/** Login page: already-logged-in users go straight to their dashboard. */
export function PublicOnly() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }
  return <Outlet />;
}
