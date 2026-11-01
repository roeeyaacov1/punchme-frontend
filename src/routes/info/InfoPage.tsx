import { useLayoutEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { focusRing } from "../../components/kit";
import { noTapFlash } from "../../components/kit/classes";
import { column } from "../../components/marketing/landingLayout";
import { LOGO_HEIGHT, LOGO_WIDTH } from "../../components/marketing/SiteHeader";
import { SiteFooter } from "../../components/marketing/SiteFooter";
import { cn } from "../../lib/cn";
import { usePublicGround } from "../../theme/usePublicGround";
import { LanguageSwitch } from "../public/LanguageSwitch";
import { useDocumentTitle } from "../public/useDocumentTitle";
import logo from "../../assets/logo.png";

/**
 * A link from another page leaves the window where that page was scrolled,
 * since nothing here restores scrolling (only the dashboard does): from the
 * landing page's footer, a reading page would open at its foot. So the page
 * opens at its top, or at the section a link names (`/privacy#rights`),
 * and leaves the top to the page after it, which the landing page then
 * moves from itself when its link names a section. At once both ways: an
 * arrival, not a glide. A section is found again once the fonts are in,
 * as the landing page does, since the text above it may have moved; a
 * hash that isn't a section, or isn't even well formed (`#100%`), opens
 * the top.
 */
function sectionFromHash(): HTMLElement | null {
  try {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return id ? document.getElementById(id) : null;
  } catch {
    return null;
  }
}

function useArrival() {
  useLayoutEffect(() => {
    let cancelled = false;
    const target = sectionFromHash();
    if (target) {
      target.scrollIntoView({ behavior: "instant", block: "start" });
      void document.fonts.ready.then(() => {
        if (!cancelled) target.scrollIntoView({ behavior: "instant", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    return () => {
      cancelled = true;
      window.scrollTo({ top: 0, behavior: "instant" });
    };
  }, []);
}

/**
 * The frame for the site's reading pages, `/contact`, `/privacy` and
 * `/terms`: the wall, a skip link, the wordmark home and the language on
 * the landing page's column, the page, and the landing page's footer.
 *
 * A card holder arrives here from the back of a pass and an owner from the
 * landing page, so the bar carries neither "Sign in" nor "Start free": the
 * footer has both for whoever wants them. Light, like every public page.
 */
export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useTranslation();
  usePublicGround();
  useDocumentTitle(title);
  useArrival();

  return (
    <div className="theme-lightbox flex min-h-svh flex-col bg-background text-ink">
      <a
        href="#info-main"
        className={cn(
          "type-label sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2.5 focus:shadow-panel-lift",
          focusRing,
        )}
      >
        {t("landing.nav.skipToContent")}
      </a>

      <header className={cn(column, "flex min-h-16 items-center justify-between gap-2 lg:min-h-[4.5rem]")}>
        {/* It dims under a finger, with no tap flash over it. */}
        <Link
          to="/"
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center rounded-full transition-opacity duration-press ease-out-strong active:opacity-70",
            noTapFlash,
            focusRing,
          )}
        >
          <img src={logo} alt={t("app.name")} width={LOGO_WIDTH} height={LOGO_HEIGHT} className="h-7 w-auto" />
        </Link>
        <LanguageSwitch className="-me-3 px-3" />
      </header>

      <main id="info-main" tabIndex={-1} className={cn(column, "flex-1 pt-8 outline-none sm:pt-12 lg:pt-16")}>
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
