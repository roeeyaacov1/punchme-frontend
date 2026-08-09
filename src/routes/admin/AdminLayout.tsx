import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "../../components/ui";
import { useAuth } from "../../auth/useAuth";

/** Minimal chrome for the staff area — deliberately not DashboardLayout:
 * staff accounts don't necessarily own a Business. */
export function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg">{t("admin.title")}</span>
          <Badge tone="gold">{t("admin.badge")}</Badge>
          <span className="text-sm text-slate font-mono">{user?.email}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-slate hover:text-navy">
            {t("admin.backToApp")}
          </Link>
          <button
            type="button"
            onClick={() => i18n.changeLanguage(i18n.resolvedLanguage === "he" ? "en" : "he")}
            className="text-sm text-slate hover:text-navy"
          >
            {t("language.switch")}
          </button>
          <button type="button" onClick={logout} className="text-sm text-slate hover:text-navy">
            {t("dashboard.nav.signOut")}
          </button>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
