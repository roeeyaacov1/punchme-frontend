import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { focusRing } from "../../components/kit";
import { cn } from "../../lib/cn";
import { LanguageSwitch } from "./LanguageSwitch";
import { PublicTopBar } from "./PublicTopBar";

/** The wall, as the status bar's colour: Lightbox's `--c-background` by day. */
const WALL = "#f6f2eb";

/**
 * While a public page is up, `<html>` stands on Lightbox by day too: the
 * overscroll shows the wall, and a phone in dark mode colours its status
 * bar with the wall instead of `index.html`'s navy. Never night: these
 * pages are reached from a camera or a link, outside the dashboard, and
 * stay light (the guide's D8). `index.html`'s pre-paint script has done
 * the same before React mounts; this keeps it, and takes both away again
 * when the page goes, as `useDashboardTheme` does without its night.
 */
function usePublicGround() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-lightbox");
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-public]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.setAttribute("data-public", "");
      document.head.insertBefore(meta, document.head.querySelector('meta[name="theme-color"]'));
    }
    meta.content = WALL;
    return () => {
      root.classList.remove("theme-lightbox");
      meta?.remove();
    };
  }, []);
}

/** "{name} — PunchMe" for as long as the page is mounted. */
function useDocumentTitle(name: string) {
  const { t } = useTranslation();
  const title = `${name} — ${t("app.name")}`;
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

/**
 * The one frame for the five public pages (the brief's §7.2): the wall, a
 * skip link, one `<main>` with the 16px gutter, and the page's own title.
 *
 * - `customer` (`/join`, `/c`, `/p`'s customer views): a slim row holding
 *   the language switch at its end and nothing else, because the shop is
 *   the subject; PunchMe signs at the foot, as the standee does.
 * - `team` (`/login`, `/invite`): the mark home and the language switch.
 *
 * The frame is at least the small viewport's height, the screen with the
 * browser's bars showing, so a sign centred in it holds still while the
 * address bar slides away, and nothing is ever under the bars.
 *
 * On a phone, nothing here flashes grey under a finger: the tap highlight
 * is off for the whole frame (it inherits), and every control in it shows
 * its own press instead. A long press never selects a button's words; the
 * page's text stays selectable.
 */
export function PublicPage({
  variant,
  title,
  className,
  children,
}: {
  variant: "customer" | "team";
  /** The page's own name, before "— PunchMe". */
  title: string;
  /** For `<main>`: how the page lays out its column. */
  className?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  usePublicGround();
  useDocumentTitle(title);

  return (
    <div className="theme-lightbox flex min-h-svh flex-col bg-background text-ink [-webkit-tap-highlight-color:transparent] [&_button]:select-none">
      <a
        href="#public-main"
        className={cn(
          "type-label sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2.5",
          focusRing,
        )}
      >
        {t("landing.nav.skipToContent")}
      </a>
      {variant === "team" ? (
        <PublicTopBar />
      ) : (
        <header className="flex h-14 items-center justify-end px-1">
          <LanguageSwitch />
        </header>
      )}
      <main id="public-main" tabIndex={-1} className={cn("flex w-full flex-1 flex-col px-4 outline-none", className)}>
        {children}
      </main>
      {variant === "customer" && (
        <p className="type-tag px-4 pb-6 pt-8 text-center text-ink-muted">{t("standee.poweredBy")}</p>
      )}
    </div>
  );
}
