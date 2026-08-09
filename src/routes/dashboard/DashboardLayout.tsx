import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "../../components/ui";
import { useAuth } from "../../auth/useAuth";
import { useBusiness } from "../../business/useBusiness";
import { cn } from "../../lib/cn";

const NAV_ITEMS = [
  { to: "/dashboard", end: true, key: "overview" },
  { to: "/dashboard/design", end: false, key: "design" },
  { to: "/dashboard/customers", end: false, key: "customers" },
  { to: "/dashboard/activity", end: false, key: "activity" },
  { to: "/dashboard/standee", end: false, key: "standee" },
  { to: "/dashboard/billing", end: false, key: "billing" },
] as const;

export function DashboardLayout() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { business, isPro } = useBusiness();

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg">{business?.name}</span>
          <Badge tone={isPro ? "gold" : "neutral"}>
            {isPro ? t("dashboard.plan.pro") : t("dashboard.plan.free")}
          </Badge>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-1.5 text-sm font-body transition-colors",
                  isActive ? "bg-navy text-white" : "text-navy hover:bg-navy/5",
                )
              }
            >
              {t(`dashboard.nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => i18n.changeLanguage(i18n.resolvedLanguage === "he" ? "en" : "he")}
            className="text-sm text-slate hover:text-navy"
          >
            {t("language.switch")}
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-slate hover:text-navy"
          >
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
