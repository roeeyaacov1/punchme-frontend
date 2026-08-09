import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { ctaClasses } from "../../components/marketing/primitives";
import { formatCurrency } from "../../components/marketing/calculator";
import { SiteHeader } from "../../components/marketing/SiteHeader";
import { Hero } from "../../components/marketing/Hero";
import { ProofBand } from "../../components/marketing/ProofBand";
import { RevenueCalculator } from "../../components/marketing/RevenueCalculator";
import { HowItWorks } from "../../components/marketing/HowItWorks";
import { ValueProps } from "../../components/marketing/ValueProps";
import { FeatureGrid } from "../../components/marketing/FeatureGrid";
import { Industries } from "../../components/marketing/Industries";
import { PricingBand } from "../../components/marketing/PricingBand";
import { Faq } from "../../components/marketing/Faq";
import { SiteFooter } from "../../components/marketing/SiteFooter";

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
    <div className="relative overflow-x-clip bg-background text-ink">
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
        <ProofBand />
        <RevenueCalculator onTouchedResult={handleCalculatorResult} />
        <HowItWorks />
        <ValueProps />
        <FeatureGrid />
        <Industries />
        <PricingBand
          netAnnual={
            netAnnual === null
              ? null
              : formatCurrency(netAnnual, i18n.resolvedLanguage ?? "en")
          }
        />
        <Faq />
      </main>

      <SiteFooter />
    </div>
  );
}
