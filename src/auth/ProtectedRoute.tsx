import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SessionUnreachable } from "./SessionUnreachable";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const { t } = useTranslation();
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate font-mono text-sm">
        {t("auth.loadingSession")}
      </div>
    );
  }

  // Still signed in as far as anyone can tell: the server just can't be
  // reached to say so. Sending the owner to /login would ask for a password
  // the session doesn't need.
  if (status === "unreachable") return <SessionUnreachable />;

  if (status === "signedOut") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
