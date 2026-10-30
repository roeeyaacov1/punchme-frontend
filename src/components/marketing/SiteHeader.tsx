import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Languages, LogIn, LogOut, Menu } from "lucide-react";
import { getRefreshToken } from "../../auth/tokenStore";
import { useAuth } from "../../auth/useAuth";
import { cn } from "../../lib/cn";
import { Button, LinkButton, List, ListRow, Sheet, focusRing, focusRingInset } from "../kit";
import { noTapFlash } from "../kit/classes";
import { AccountMenu } from "./AccountMenu";
import { column } from "./landingLayout";
import logo from "../../assets/logo.png";

/** The page's sections, in the order the page reads them. */
export const NAV_ANCHORS = [
  { href: "#how-it-works", key: "landing.nav.howItWorks" },
  { href: "#pricing", key: "landing.nav.pricing" },
  { href: "#faq", key: "landing.nav.faq" },
] as const;

/** A row of the phone menu: the kit's 56px list row, as a link to a section. */
const MENU_ROW = cn(
  "type-body flex min-h-14 w-full touch-manipulation select-none items-center px-6 font-semibold text-ink transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5",
  noTapFlash,
  focusRingInset,
);

/**
 * The sticky header: the wall, with a hairline once the page has scrolled.
 * No frost and no shadow: Lightbox has no glass, and the wall under a page of
 * lit panels is already a plain enough ground for the bar to sit on.
 *
 * Its end depends on the session: "Sign in" and "Start free" for a visitor,
 * "Dashboard" and the account menu for an owner who has one. Neither shows
 * until the session is known, so an owner never sees "Sign in" flicker.
 * "Start free" is the secondary pill here, not coral: every section below
 * carries its own coral button, and a coral one in the bar would put two on
 * every screen, where Lightbox allows one.
 *
 * The three anchors fit the bar from 1024px; below that they move into the
 * menu, which is the kit's sheet: it rises from the bottom on a phone and
 * comes in from the end edge from 768px, holds focus while it is open, and
 * gives it back to the menu button when it closes.
 */
export function SiteHeader() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  // The same rule /login follows: wait for the session only when there is a
  // refresh token that could produce one. A first-time visitor shouldn't
  // wait on a request that can't succeed, with the page's buttons behind it.
  const resolvingSession = isLoading && getRefreshToken() !== null;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  // Where focus lands when the menu closes because a section was chosen in
  // it; the menu button otherwise.
  const navTarget = useRef<HTMLElement | null>(null);
  const other = i18n.resolvedLanguage === "he" ? "en" : "he";

  // The browser reports the crossing off the main thread, so dragging a
  // slider or scrolling fast never queues layout work per frame.
  useEffect(() => {
    const element = sentinel.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const toggleLanguage = () => void i18n.changeLanguage(other);

  const openMenu = () => {
    navTarget.current = null;
    setMenuOpen(true);
  };

  // A section chosen in the menu: the page scrolls to it behind the sheet
  // as the sheet goes (the sheet only stops a hand scrolling, not the page),
  // and focus lands on the section rather than back on the menu button.
  const goTo = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    if (target.tabIndex === -1) navTarget.current = target;
    window.history.pushState(null, "", href);
    target.scrollIntoView({ block: "start" });
    setMenuOpen(false);
  };

  const primary =
    !resolvingSession &&
    (isAuthenticated ? (
      <LinkButton to="/dashboard" variant="primary" size="lg" className="w-full">
        {t("landing.nav.dashboard")}
      </LinkButton>
    ) : (
      <LinkButton to="/onboarding" variant="primary" size="lg" className="w-full">
        {t("landing.hero.cta")}
      </LinkButton>
    ));

  return (
    <>
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" />

      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-background transition-colors duration-gentle ease-out",
          scrolled ? "border-border" : "border-transparent",
        )}
      >
        <div className={cn(column, "flex h-16 items-center gap-2 lg:h-[4.5rem]")}>
          <Link to="/" className={cn("inline-flex min-h-11 shrink-0 items-center rounded-full", focusRing)}>
            <img src={logo} alt={t("app.name")} className="h-7 w-auto" />
          </Link>

          <nav aria-label={t("landing.nav.label")} className="ms-4 hidden flex-1 items-center gap-1 lg:flex">
            {NAV_ANCHORS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 font-heading text-[0.9375rem] font-medium text-ink-muted transition-colors duration-gentle ease-out hover-fine:text-ink",
                  noTapFlash,
                  focusRing,
                )}
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-1 self-stretch sm:gap-2">
            <Button variant="quiet" lang={other} onClick={toggleLanguage} className="px-3">
              {t("language.switch")}
            </Button>

            {!resolvingSession &&
              (isAuthenticated ? (
                <>
                  <LinkButton to="/dashboard" variant="secondary" className="hidden sm:inline-flex">
                    {t("landing.nav.dashboard")}
                  </LinkButton>
                  <AccountMenu className="hidden sm:flex" />
                </>
              ) : (
                <>
                  <LinkButton to="/login" variant="quiet" className="hidden px-3 sm:inline-flex">
                    {t("landing.nav.signIn")}
                  </LinkButton>
                  <LinkButton to="/onboarding" variant="secondary" className="hidden sm:inline-flex">
                    {t("landing.hero.cta")}
                  </LinkButton>
                </>
              ))}

            <Button
              variant="quiet"
              size="icon"
              aria-label={t("landing.nav.openMenu")}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              icon={<Menu aria-hidden />}
              onClick={openMenu}
              className="-me-2.5 lg:hidden"
            />
          </div>
        </div>
      </header>

      <Sheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={t("landing.nav.menu")}
        returnFocus={navTarget}
        footer={primary || undefined}
      >
        <nav aria-label={t("landing.nav.label")}>
          <ul className="-mx-6 divide-y divide-border border-y border-border">
            {NAV_ANCHORS.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={(event) => goTo(event, item.href)} className={MENU_ROW}>
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <List className="-mx-6 mt-6 border-y border-border">
          {!resolvingSession &&
            (isAuthenticated ? (
              <ListRow
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                leading={<LogOut aria-hidden className="size-5 text-ink-muted rtl:-scale-x-100" />}
                title={t("dashboard.nav.signOut")}
                meta={user ? t("onboarding.account.signedInAs", { email: user.email }) : undefined}
              />
            ) : (
              <ListRow
                to="/login"
                leading={<LogIn aria-hidden className="size-5 text-ink-muted rtl:-scale-x-100" />}
                title={t("landing.nav.signIn")}
              />
            ))}
          <ListRow
            onClick={toggleLanguage}
            leading={<Languages aria-hidden className="size-5 text-ink-muted" />}
            // The other language's own name, in its own language.
            title={<span lang={other}>{t("language.switch")}</span>}
          />
        </List>
      </Sheet>
    </>
  );
}
