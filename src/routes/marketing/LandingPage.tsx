import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { ctaClasses } from "../../components/marketing/primitives";
import { formatCurrency } from "../../components/marketing/calculator";
import { SiteHeader } from "../../components/marketing/SiteHeader";
import { Hero } from "../../components/marketing/Hero";
import { PaperCards } from "../../components/marketing/PaperCards";
import { ProofBand } from "../../components/marketing/ProofBand";
import { PushBand } from "../../components/marketing/PushBand";
import { HowItWorks } from "../../components/marketing/HowItWorks";
import { AppShowcase } from "../../components/marketing/AppShowcase";
import { RevenueCalculator } from "../../components/marketing/RevenueCalculator";
import { Testimonials } from "../../components/marketing/Testimonials";
import { AutomationRows } from "../../components/marketing/AutomationRows";
import { StatsBand } from "../../components/marketing/StatsBand";
import { PricingBand } from "../../components/marketing/PricingBand";
import { Faq } from "../../components/marketing/Faq";
import { FinalCta } from "../../components/marketing/FinalCta";
import { SiteFooter } from "../../components/marketing/SiteFooter";

/**
 * The public landing page.
 *
 * `theme-purple` is the whole of the repaint's plumbing: the shared
 * marketing tokens resolve through CSS variables (see src/index.css), so
 * scoping the class here re-colours every section, the calculator and the
 * footer at once, and leaves the onboarding wizard on the original oat card
 * stock until its own phase lands.
 *
 * The order is the argument. The paper card is dead → here is the evidence
 * that regulars are worth chasing → this is what brings them back → this is
 * how you set it up → this is what you get → and here is your own
 * arithmetic, which is the one section allowed to talk you out of it.
 */
export function LandingPage() {
  const { t, i18n } = useTranslation();

  // Held here so the pricing band can echo the calculator's result. Stays
  // null until the visitor moves something and the result is actually
  // positive — we don't claim "based on your numbers" for numbers they
  // never entered, or advertise a loss.
  const [netAnnual, setNetAnnual] = useState<number | null>(null);

  const handleCalculatorResult = useCallback((value: number) => {
    setNetAnnual(value > 0 ? value : null);
  }, []);

  return (
    // `relative` anchors the header's scroll sentinel; `overflow-x-clip`
    // is the backstop against a stray pixel from a glow or gradient.
    <div className="theme-purple relative overflow-x-clip bg-background text-ink">
      <a
        href="#main"
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50",
          ctaClasses("primary", "sm", "min-h-[44px]"),
        )}
      >
        {t("landing.nav.skipToContent")}
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />
        <PaperCards />
        <ProofBand />
        <PushBand />
        <HowItWorks />
        <AppShowcase />
        <RevenueCalculator onTouchedResult={handleCalculatorResult} />
        <Testimonials />
        <AutomationRows />
        <StatsBand />
        <PricingBand
          netAnnual={
            netAnnual === null
              ? null
              : formatCurrency(netAnnual, i18n.resolvedLanguage ?? "en")
          }
        />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}
