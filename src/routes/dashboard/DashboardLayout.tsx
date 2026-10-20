import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/useAuth";
import { useBusiness } from "../../business/useBusiness";
import { focusRing } from "../../components/kit";
import { SidebarNav } from "../../components/dashboard/DashboardNav";
import { inMore, moreGroups } from "../../components/dashboard/navigation";
import { DashboardTour } from "../../components/tour/DashboardTour";
import { AccountSheet } from "../../components/dashboard/shell/AccountSheet";
import { Identity } from "../../components/dashboard/shell/Identity";
import { Masthead } from "../../components/dashboard/shell/Masthead";
import { MoreSheet } from "../../components/dashboard/shell/MoreSheet";
import { PersonRow } from "../../components/dashboard/shell/Person";
import { PhoneBar } from "../../components/dashboard/shell/PhoneBar";
import { TabletRail } from "../../components/dashboard/shell/TabletRail";
import { hasSwitchedOn, rememberSwitchedOn } from "../../components/dashboard/shell/switchedOn";
import { useShellViewport } from "../../components/dashboard/shell/useShellViewport";
import { useDashboardTheme } from "../../theme/useDashboardTheme";
import { cn } from "../../lib/cn";
import logo from "../../assets/logo.png";

type OpenSheet = "more" | "account" | null;

/**
 * The shell: a rail on a desk, a bar on a phone.
 *
 * Two things it does that the old header did not. It groups the routes by
 * who opens them, because they are not equal things — see `navigation.ts`.
 * And it puts the owner's own card in the masthead, because the wizard
 * spends four steps making the product a concrete object with their name on
 * it and the dashboard used to hand them a generic white app the moment they
 * finished.
 *
 * Dark is decided here too — on <html> for the pages, so the ground survives
 * overscroll and the native controls agree with it, and as `frame` for the
 * frame's own elements, which wear Lightbox ahead of the pages. See
 * `useDashboardTheme`.
 */
export function DashboardLayout() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { business, isPro, role } = useBusiness();
  const { mode, setMode, frame } = useDashboardTheme();
  useShellViewport();
  const location = useLocation();
  const navigate = useNavigate();

  // One sheet at a time. The account sheet is reached from More's person
  // row too, and that row is gone by the time it closes, so focus goes back
  // to the bar's More slot instead.
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [accountFromMore, setAccountFromMore] = useState(false);
  // Set when a sheet closed because a row in it went somewhere: focus then
  // goes to the page, not back to what opened the sheet.
  const [leftForPage, setLeftForPage] = useState(false);
  const main = useRef<HTMLElement>(null);
  const fifthSlot = useRef<HTMLButtonElement>(null);

  // Bumped by the account sheet's "show the tour again". A counter rather
  // than a boolean, so asking twice in one session opens it twice.
  const [tourAsks, setTourAsks] = useState(0);

  const openSheet = (which: Exclude<OpenSheet, null>, fromMore = false) => {
    setLeftForPage(false);
    setAccountFromMore(fromMore);
    setSheet(which);
  };

  // Any navigation closes a sheet: a row in it, the back gesture, the tour.
  // Keyed on the location's key rather than its path, so a row for the page
  // already on screen closes it too.
  const lastKey = useRef(location.key);
  useEffect(() => {
    if (lastKey.current === location.key) return;
    lastKey.current = location.key;
    if (sheet) {
      setLeftForPage(true);
      setSheet(null);
    }
  }, [location.key, sheet]);

  // Synchronous on purpose, in this one handler. `logout()` clears the
  // session at once, and React applies its update in the same batch as the
  // router's (a navigation with no loaders commits at once), so the next
  // render is a signed-out visitor at /login with no `from`. ProtectedRoute
  // never gets to remember this page, and the next person to sign in on a
  // shared phone starts on the Overview rather than on the last person's
  // page. Awaiting anything between the two, or opting the router into
  // v7_startTransition, would bring the hand-off back.
  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // The day the sign switches on: /billing/success brings the owner here
  // with ?activated=1 once the plan has turned Pro. Decided once, as the
  // shell mounts, and remembered per business, because the Overview keeps
  // the parameter in the URL and a reload must not play the moment again.
  const [searchParams] = useSearchParams();
  const [switchOn] = useState(
    () => isPro && searchParams.get("activated") === "1" && !hasSwitchedOn(business?.id),
  );
  useEffect(() => {
    if (switchOn) rememberSwitchedOn(business?.id);
  }, [switchOn, business?.id]);

  const hasMore = moreGroups(role).length > 0;

  return (
    <div className="min-h-screen bg-background text-ink">
      <a
        href="#dashboard-main"
        className={cn(
          frame,
          "sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:border focus:border-border-strong focus:bg-surface focus:px-5 focus:font-heading focus:text-base focus:font-medium focus:text-ink focus:shadow-panel-lift",
          focusRing,
        )}
      >
        {t("landing.nav.skipToContent")}
      </a>

      {/* Three widths: the bar under 768px, the tablet's compact rail from
          768 to 1279, and the full rail from 1280. The rail's column is as
          wide as whichever rail is showing, its safe-area inset included. */}
      <div className="md:grid md:grid-cols-[auto_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-dvh md:block xl:hidden">
          <TabletRail
            frame={frame}
            accountOpen={sheet === "account"}
            onAccount={() => openSheet("account")}
          />
        </aside>
        <aside className="sticky top-0 hidden h-screen w-[17rem] xl:block">
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
                <div className={frame}>
                  <Identity layout="stack" switchOn={switchOn} />
                </div>
              </div>
            }
            footer={
              <div className={frame}>
                <PersonRow
                  onClick={() => openSheet("account")}
                  expanded={sheet === "account"}
                />
              </div>
            }
          />
        </aside>

        {/* In landscape the rail takes the start edge's safe-area inset and
            this column the end edge's, so neither runs under a notch. */}
        <div className="flex min-h-dvh min-w-0 flex-col pe-[env(safe-area-inset-right)] rtl:pe-[env(safe-area-inset-left)]">
          {/* Under 1280px: beside the tablet's rail, and over the phone's
              page. The full rail carries the shop's name itself. */}
          <Masthead frame={frame} switchOn={switchOn} className="xl:hidden" />

          {/* The page area takes focus itself (tabIndex -1) when a sheet
              closes because a row in it went somewhere. */}
          <main
            ref={main}
            id="dashboard-main"
            tabIndex={-1}
            className="flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 outline-none sm:px-6 md:pb-12 lg:px-8 lg:pt-8"
          >
            <div className="mx-auto w-full max-w-5xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Over everything, and only on a first arrival — see DashboardTour. */}
      <DashboardTour replay={tourAsks} />

      <PhoneBar
        frame={frame}
        fifth={hasMore ? "more" : "account"}
        fifthRef={fifthSlot}
        fifthOpen={sheet === (hasMore ? "more" : "account")}
        fifthLit={inMore(location.pathname, role)}
        onFifth={() => openSheet(hasMore ? "more" : "account")}
        className="md:hidden"
      />

      {/* The sheets render where they are written, so this keeps them in the
          frame's scope; `contents` gives the wrapper no box of its own. */}
      <div className={cn(frame, "contents")}>
        <MoreSheet
          open={sheet === "more"}
          onClose={() => setSheet(null)}
          onAccount={() => openSheet("account", true)}
          returnFocus={leftForPage ? main : undefined}
        />
        <AccountSheet
          open={sheet === "account"}
          onClose={() => setSheet(null)}
          returnFocus={leftForPage ? main : accountFromMore ? fifthSlot : undefined}
          mode={mode}
          onModeChange={setMode}
          onShowTour={() => {
            setSheet(null);
            setTourAsks((n) => n + 1);
          }}
          onSignOut={signOut}
        />
      </div>
    </div>
  );
}
