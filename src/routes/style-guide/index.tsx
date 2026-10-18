/**
 * /style-guide: the Lightbox foundation, every token and primitive, in Hebrew
 * and English, by day and at night. Internal (docs/dashboard-routes.md), and
 * loaded on its own so none of it ships to a visitor of the landing page.
 */
import { useTranslation } from "react-i18next";
import { ReducedMotionPreview } from "../../components/kit/motion";
import { focusRing } from "../../components/kit/classes";
import { cn } from "../../lib/cn";
import { ColourSection } from "./ColourSection";
import { ControlsSection } from "./ControlsSection";
import { ShapeSection } from "./ShapeSection";
import { Toolbar } from "./Toolbar";
import { TypeSection } from "./TypeSection";
import { useGuideView } from "./useGuideView";

export function StyleGuidePage() {
  const { t } = useTranslation();
  const view = useGuideView();
  return (
    <ReducedMotionPreview.Provider value={view.reduced}>
      <div className="min-h-dvh bg-background text-ink">
        <a
          href="#guide"
          className={cn(
            "sr-only rounded-full bg-ink font-heading font-medium text-surface focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:px-5",
            focusRing,
          )}
        >
          {t("landing.nav.skipToContent")}
        </a>
        <header className="z-30 border-b border-border bg-background sm:sticky sm:top-0">
          <Toolbar view={view} />
        </header>
        <main id="guide" tabIndex={-1} className="mx-auto max-w-5xl px-4 pb-24 outline-none sm:px-6">
          <div className="pb-14 pt-12 sm:pt-16">
            <h1 className="type-display text-ink">{t("styleGuide.title")}</h1>
            <p className="type-lead mt-5 max-w-2xl text-ink-muted">{t("styleGuide.lead")}</p>
          </div>
          <ColourSection version={view.version} />
          <TypeSection version={view.version} />
          <ShapeSection version={view.version} />
          <ControlsSection />
        </main>
      </div>
    </ReducedMotionPreview.Provider>
  );
}
