// src/routes/guards.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRoute, type UserRole } from "@/config/roles";

export const CHANGE_PASSWORD_PATH = "/change-password";

/** Must be logged in AND have one of the given roles. */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  // temporary password set by an admin → nothing else until it's changed
  if (user.mustChangePassword) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
  }
  if (!roles.includes(user.role)) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }
  return <Outlet />;
}

/** Any logged-in user (used by the change-password screen). */
export function RequireLogin() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
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
    return <Navigate to={user.mustChangePassword ? CHANGE_PASSWORD_PATH : getHomeRoute(user.role)} replace />;
  }
  return <Outlet />;
}
