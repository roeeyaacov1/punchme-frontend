import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Container, ctaClasses } from "./primitives";

/**
 * The one place the brand navy lands full-bleed. `netMonthly` is passed in
 * only once the visitor has actually touched the calculator — an unearned
 * "based on your numbers" line would be a lie about numbers they never gave.
 */
export function PricingBand({ netMonthly }: { netMonthly: string | null }) {
  const { t } = useTranslation();
  const trustBullets = t("landing.hero.trustBullets", {
    returnObjects: true,
  }) as string[];

  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 overflow-hidden bg-navy-deep py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 start-[-10%] h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(200,138,17,0.30) 0%, rgba(200,138,17,0) 70%)",
        }}
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="t-h2 text-balance text-white">
            {t("landing.pricing.title")}
          </h2>

          <p className="t-lead mt-6 text-pretty text-white/70">
            {t("landing.pricing.body")}
          </p>

          <p className="mt-8 flex items-baseline justify-center gap-1">
            <span className="font-heading text-5xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">
              {t("landing.pricing.price")}
            </span>
            <span className="text-lg text-white/60">
              {t("landing.pricing.perMonth")}
            </span>
          </p>

          {netMonthly && (
            <p className="mt-4 text-pretty font-semibold text-primary">
              {t("landing.pricing.calcNote", { amount: netMonthly })}
            </p>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              to="/login"
              className={ctaClasses("onDark", "lg", "w-full sm:w-auto")}
            >
              {t("landing.pricing.cta")}
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-white/60">
            {trustBullets.map((bullet, i) => (
              <li key={bullet} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="text-white/30">
                    ·
                  </span>
                )}
                <Check size={16} aria-hidden="true" className="shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
