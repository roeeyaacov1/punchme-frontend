import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, ScrollRestoration, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/useAuth";
import { useBusiness } from "../../business/useBusiness";
import { focusRing } from "../../components/kit";
import { inMore, moreGroups, pageFor } from "../../components/dashboard/navigation";
import { DashboardTour } from "../../components/tour/DashboardTour";
import { AccountSheet } from "../../components/dashboard/shell/AccountSheet";
import { DesktopRail } from "../../components/dashboard/shell/DesktopRail";
import { Masthead } from "../../components/dashboard/shell/Masthead";
import { MoreSheet } from "../../components/dashboard/shell/MoreSheet";
import { PageTitleOverride } from "../../components/dashboard/shell/pageTitle";
import { PhoneBar } from "../../components/dashboard/shell/PhoneBar";
import { TabletRail } from "../../components/dashboard/shell/TabletRail";
import { hasSwitchedOn, rememberSwitchedOn } from "../../components/dashboard/shell/switchedOn";
import { useShellViewport } from "../../components/dashboard/shell/useShellViewport";
import { whenNothingModal } from "../../components/dashboard/shell/whenNothingModal";
import { LightboxClaim } from "../../theme/lightboxPage";
import { useDashboardTheme } from "../../theme/useDashboardTheme";
import { cn } from "../../lib/cn";

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
  // Pages that have moved to Lightbox claim <html> for it while they are
  // mounted (lightboxPage.ts); the count is how many are holding a claim.
  const [claims, setClaims] = useState(0);
  const claim = useCallback(() => {
    setClaims((n) => n + 1);
    return () => setClaims((n) => n - 1);
  }, []);
  const { mode, setMode, frame } = useDashboardTheme({ lightbox: claims > 0 });
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

  // ---- titles, announcements and focus ------------------------------------
  // Every page is titled by its navigation label and the app's name, as
  // onboarding titles its steps; a nested page takes its parent's, and the
  // shell's own pages name themselves (`usePageTitle`). The title the page
  // had before comes back when the dashboard goes, or /login would keep
  // "Scan — PunchMe".
  const [override, setOverride] = useState<string | null>(null);
  const page = pageFor(location.pathname);
  const pageName = override ?? (page ? t(`dashboard.nav.${page.key}`) : null);
  useEffect(() => {
    const before = document.title;
    return () => {
      document.title = before;
    };
  }, []);
  useEffect(() => {
    document.title = pageName ? `${pageName} — ${t("app.name")}` : t("app.name");
  }, [pageName, t]);

  // After the first load, a new page is read out in a polite live region and
  // focus moves to the page area, so the next Tab starts in the page. Keyed
  // on the path: a page that only replaces its own state, as Messages does
  // with its confirmation, is not a new page. Neither happens while the tour
  // is walking, since it speaks and holds focus for itself, and both wait for
  // a closing sheet, which keeps the page inert until its exit ends.
  const tourOpen = useRef(false);
  const onTourOpenChange = useCallback((open: boolean) => {
    tourOpen.current = open;
  }, []);
  const latestName = useRef(pageName);
  useEffect(() => {
    latestName.current = pageName;
  });
  const [announcement, setAnnouncement] = useState("");
  const firstPath = useRef(location.pathname);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current && location.pathname === firstPath.current) return;
    moved.current = true;
    if (tourOpen.current) return;
    let cancelled = false;
    void whenNothingModal().then(() => {
      if (cancelled) return;
      setAnnouncement(latestName.current ?? t("app.name"));
      main.current?.focus({ preventScroll: true });
    });
    return () => {
      cancelled = true;
    };
  }, [location.pathname, t]);

  return (
    <LightboxClaim.Provider value={claim}>
      <PageTitleOverride.Provider value={setOverride}>
        <div className="min-h-dvh bg-background text-ink">
          {/* It focuses the page itself: a bare #fragment is a history step to
              the router, which would put the old scroll position back and undo
              the jump. */}
          <a
            href="#dashboard-main"
            onClick={(event) => {
              event.preventDefault();
              main.current?.focus();
            }}
            className={cn(
              frame,
              "sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:border focus:border-border-strong focus:bg-surface focus:px-5 focus:font-heading focus:text-base focus:font-medium focus:text-ink focus:shadow-panel-lift",
              focusRing,
            )}
          >
            {t("landing.nav.skipToContent")}
          </a>

          {/* Back and forward return to where the page was; anything new opens
              at its top. */}
          <ScrollRestoration />
          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>

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
            <aside className="sticky top-0 hidden h-dvh xl:block">
              <DesktopRail
                frame={frame}
                switchOn={switchOn}
                accountOpen={sheet === "account"}
                onAccount={() => openSheet("account")}
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
          <DashboardTour replay={tourAsks} frame={frame} onOpenChange={onTourOpenChange} />

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
      </PageTitleOverride.Provider>
    </LightboxClaim.Provider>
  );
}
