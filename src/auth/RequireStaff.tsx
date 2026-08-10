import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { buttonClasses } from "../components/ui/Button";
import { useAuth } from "./useAuth";

/** UI gate for the /admin area — convenience only; the real boundary is the
 * API's require_staff check (403 for non-staff on every endpoint).
 *
 * Says "no" out loud rather than redirecting: a silent bounce back to the
 * dashboard is indistinguishable from the admin area not existing, which is
 * exactly how it got reported as missing. */
export function RequireStaff() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate font-mono text-sm">
        {t("auth.loadingSession")}
      </div>
    );
  }

  if (!user?.is_staff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center text-navy">
        <h1 className="text-2xl font-heading">{t("admin.staffOnly")}</h1>
        <p className="text-slate font-body max-w-sm">
          {t("admin.staffOnlyBody", { email: user?.email ?? "" })}
        </p>
        <Link to="/dashboard" className={buttonClasses("secondary", "md")}>
          {t("admin.backToApp")}
        </Link>
      </div>
    );
  }

  return <Outlet />;
}
