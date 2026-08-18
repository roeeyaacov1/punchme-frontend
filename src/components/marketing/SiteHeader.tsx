import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Container, ctaClasses, focusRing } from "./primitives";
import logo from "../../assets/logo.png";

export const NAV_ANCHORS = [
  { href: "#how-it-works", key: "landing.nav.howItWorks" },
  { href: "#calculator", key: "landing.nav.worth" },
  { href: "#pricing", key: "landing.nav.pricing" },
  { href: "#faq", key: "landing.nav.faq" },
] as const;

/**
 * Sticky header: transparent over the hero, solid once the page scrolls.
 *
 * Renders a fragment — an out-of-flow sentinel plus the header itself — so
 * both land as direct children of the (relative, full-height) page root.
 * That's what lets `sticky` span the whole document while the sentinel sits
 * pinned at the top without taking up layout space.
 */
export function SiteHeader() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver rather than a scroll listener: the browser reports
  // the crossing off the main thread, so dragging a slider or scrolling fast
  // never queues layout work per frame.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Lock the page behind the full-screen mobile panel.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Escape closes the panel, matching every other overlay on the web.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.resolvedLanguage === "he" ? "en" : "he");

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-6"
      />

      <header
        className={cn(
          "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-200",
          scrolled
            ? "border-b border-border-strong bg-background/92 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <Container>
          <div className="flex h-20 items-center justify-between gap-4">
            <Link
              to="/"
              className={cn(
                "inline-flex min-h-[44px] shrink-0 items-center rounded-lg",
                focusRing,
              )}
              aria-label={t("app.name")}
            >
              <img src={logo} alt={t("app.name")} className="h-7 w-auto" />
            </Link>

            <nav
              aria-label={t("landing.nav.howItWorks")}
              className="hidden items-center gap-1 md:flex"
            >
              {NAV_ANCHORS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    // min-h rather than padding: the 44px target belongs to
                    // the link, not to the gap between the links.
                    "inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-ink-muted transition-colors hover:text-ink",
                    focusRing,
                  )}
                >
                  {t(item.key)}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                // min-h/min-w give the 44px tap target the visual size doesn't.
                className={cn(
                  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink",
                  focusRing,
                )}
              >
                {t("language.switch")}
              </button>

              <Link
                to="/login"
                className={cn(
                  "hidden min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:inline-flex",
                  focusRing,
                )}
              >
                {t("landing.nav.signIn")}
              </Link>

              <Link
                to="/login"
                className={ctaClasses(
                  "primary",
                  "sm",
                  "hidden min-h-[44px] sm:inline-flex",
                )}
              >
                {t("landing.nav.designCta")}
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={t("landing.nav.openMenu")}
                aria-expanded={menuOpen}
                className={cn(
                  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink md:hidden",
                  focusRing,
                )}
              >
                <Menu size={22} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-50 flex flex-col bg-background md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-20 items-center justify-between px-4 sm:px-6">
            <img src={logo} alt={t("app.name")} className="h-7 w-auto" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t("landing.nav.closeMenu")}
              autoFocus
              className={cn(
                "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink",
                focusRing,
              )}
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-8 sm:px-6">
            {NAV_ANCHORS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-4 text-lg font-semibold text-ink hover:bg-surface",
                  focusRing,
                )}
              >
                {t(item.key)}
              </a>
            ))}
            <Link
              to="/login"
              className={cn(
                "rounded-lg px-4 py-4 text-lg font-semibold text-ink hover:bg-surface",
                focusRing,
              )}
            >
              {t("landing.nav.signIn")}
            </Link>
            <Link
              to="/login"
              className={ctaClasses("primary", "lg", "mt-4 w-full")}
            >
              {t("landing.hero.cta")}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
