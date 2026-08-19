import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import { useBusiness } from "../../business/useBusiness";
import { listTemplates } from "../../api/businesses";
import { focusRing } from "../../components/marketing/primitives";
import { AccountControls } from "../../components/dashboard/AccountControls";
import { CardChip } from "../../components/dashboard/CardChip";
import {
  BottomBar,
  MoreSheet,
  isMorePath,
  SidebarNav,
  SetupRows,
} from "../../components/dashboard/DashboardNav";
import { Tag } from "../../components/dashboard/primitives";
import { useDashboardTheme } from "../../theme/useDashboardTheme";
import { cn } from "../../lib/cn";
import logo from "../../assets/logo.png";

/**
 * The shell: a rail on a desk, a bar on a phone.
 *
 * Two things it does that the old header did not. It groups the six routes
 * into the counter and setup, because they are not six equal things — see
 * `DashboardNav`. And it puts the owner's own card in the masthead, because
 * the wizard spends four steps making the product a concrete object with
 * their name on it and the dashboard used to hand them a generic white app
 * the moment they finished.
 *
 * Dark is decided here too — on <html>, so the ground survives overscroll
 * and the native controls agree with it. See `useDashboardTheme`.
 */
export function DashboardLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { business, isPro } = useBusiness();
  const { mode, setMode } = useDashboardTheme();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  // The card's real colours for the chip. Same query and same key as the
  // overview, the studio and the standee, so this is a cache read on every
  // page but the first.
  const { data: templates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];

  // A route change from inside the sheet has to close it; so does the back
  // button, which would otherwise leave a modal over the new page.
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const onSetupRoute = isMorePath(location.pathname);
  const name = business?.name ?? "";

  const identity = (
    <div className="flex min-w-0 items-center gap-2.5">
      <CardChip
        name={name}
        backgroundColor={template?.background_color}
        foregroundColor={template?.foreground_color}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-sm font-bold text-ink">
          {name}
        </span>
        <span className="block text-xs text-ink-subtle">
          {isPro ? t("dashboard.plan.pro") : t("dashboard.plan.free")}
        </span>
      </span>
    </div>
  );

  const account = (
    <AccountControls
      mode={mode}
      onModeChange={setMode}
      isStaff={!!user?.is_staff}
      onSignOut={logout}
      onNavigate={() => setMoreOpen(false)}
    />
  );

  return (
    <div className="min-h-screen bg-background text-ink">
      <a
        href="#dashboard-main"
        className={cn(
          "sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold",
          focusRing,
        )}
      >
        {t("landing.nav.skipToContent")}
      </a>

      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen lg:block">
          <SidebarNav
            header={
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  className={cn(
                    "inline-flex min-h-[44px] w-fit items-center rounded-lg",
                    focusRing,
                  )}
                >
                  <img src={logo} alt={t("app.name")} className="logo-mark h-7 w-auto" />
                </Link>
                {identity}
              </div>
            }
            footer={account}
          />
        </aside>

        <div className="flex min-h-screen flex-col">
          {/* The phone's masthead is identity only — every page carries its
              own <h1> a few pixels below it, and repeating the title here
              would just cost a line of a small screen. */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
            {identity}
            {isPro && (
              <Tag tone="accent" className="ms-auto">
                {t("dashboard.plan.pro")}
              </Tag>
            )}
          </header>

          <main
            id="dashboard-main"
            className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8"
          >
            <div className="mx-auto w-full max-w-5xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <BottomBar onMore={() => setMoreOpen(true)} moreActive={onSetupRoute} />

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)}>
        <div className="flex flex-col gap-5">
          <SetupRows onNavigate={() => setMoreOpen(false)} />
          {account}
        </div>
      </MoreSheet>
    </div>
  );
}
