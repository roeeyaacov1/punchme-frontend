import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { focusRing } from "../../components/kit";
import { SiteHeader } from "../../components/marketing/SiteHeader";
import { Hero } from "../../components/marketing/Hero";
import { HowItWorks } from "../../components/marketing/HowItWorks";
import { AfterTheyLeave } from "../../components/marketing/AfterTheyLeave";
import { Pricing } from "../../components/marketing/Pricing";
import { Faq } from "../../components/marketing/Faq";
import { FinalCta } from "../../components/marketing/FinalCta";
import { SiteFooter } from "../../components/marketing/SiteFooter";
import type { TradeKey } from "../../components/marketing/samples";

/** The wall, as the phone's status bar: Lightbox's `--c-background` by day. */
const WALL = "#f6f2eb";

/**
 * While the landing page is up, `<html>` stands on Lightbox by day: the
 * overscroll shows the wall, and a phone in dark mode colours its status bar
 * with the wall rather than index.html's navy. Never night: the landing page
 * stays light (the guide's D8). Both go again when the page does, so the
 * next page finds `<html>` as index.html left it. Before paint, so the page
 * never shows on the old ground once React is running.
 */
function useLandingGround() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-lightbox");
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = WALL;
    document.head.insertBefore(meta, document.head.querySelector('meta[name="theme-color"]'));
    return () => {
      root.classList.remove("theme-lightbox");
      meta.remove();
    };
  }, []);
}

/** The tab's title in the page's language, for as long as the page is up. */
function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

/**
 * The public landing page, on Lightbox by day.
 *
 * The order is the argument: the counter itself first (the sign, the card,
 * the scan, and the price), then each of them in turn, what brings people
 * back, the price as the sign switching on, and the questions a sceptic
 * asks. One light theme to the footer: no bands.
 */
export function LandingPage() {
  const { t } = useTranslation();
  useLandingGround();
  useDocumentTitle(t("landing.meta.title"));

  // The trade the visitor picks on the counter, which the rest of the page
  // follows: one sample card, all the way down.
  const [trade, setTrade] = useState<TradeKey>("barber");

  // A link from another page to a section, such as `/#pricing`, arrives
  // before React has drawn the section, so the browser finds nothing to
  // scroll to and the page opens at the top. Once the page and its fonts
  // are in, it goes there itself, at once, since this is an arrival rather
  // than a glide down the page. Only as the page opens: the header's own
  // links already glide to their sections.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    // `relative` anchors the header's scroll sentinel; `overflow-x-clip` is
    // the backstop against a stray pixel from a stage wider than a phone.
    <div className="theme-lightbox relative overflow-x-clip bg-background text-ink">
      <a
        href="#main"
        className={cn(
          "type-label sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2.5 focus:shadow-panel-lift",
          focusRing,
        )}
      >
        {t("landing.nav.skipToContent")}
      </a>

      <SiteHeader />

      <main id="main" tabIndex={-1} className="outline-none">
        <Hero trade={trade} onTrade={setTrade} />
        <HowItWorks trade={trade} />
        <AfterTheyLeave trade={trade} />
        <Pricing trade={trade} />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}
