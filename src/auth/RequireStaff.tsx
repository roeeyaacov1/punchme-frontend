import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

/** UI gate for the /admin area — convenience only; the real boundary is
 * the API's require_staff check (403 for non-staff on every endpoint). */
export function RequireStaff() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user?.is_staff) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
