import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Container, ctaClasses } from "./primitives";
import { PunchMark } from "./PunchMark";

/**
 * The one place the brand navy lands full-bleed. `netAnnual` is passed in
 * only once the visitor has actually touched the calculator — an unearned
 * "based on your numbers" line would be a lie about numbers they never gave.
 *
 * No glow behind it any more. The depth here comes from the band itself and
 * from the price being set as an object, which is what the section is for.
 */
export function PricingBand({ netAnnual }: { netAnnual: string | null }) {
  const { t } = useTranslation();
  const trustBullets = t("landing.hero.trustBullets", {
    returnObjects: true,
  }) as string[];

  return (
    <section
      id="pricing"
      className="scroll-mt-24 bg-navy-deep py-20 sm:py-28"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="t-h2 text-balance text-white">
            {t("landing.pricing.title")}
          </h2>

          <p className="t-lead mt-5 text-pretty text-white/70">
            {t("landing.pricing.body")}
          </p>

          {/* The price, ruled off top and bottom — a figure on a board rather
              than a number in a sentence. */}
          <div className="my-10 border-y border-white/15 py-8">
            <p className="flex items-baseline justify-center gap-1">
              <span className="font-heading text-6xl font-bold tracking-tight text-white sm:text-7xl">
                {t("landing.pricing.price")}
              </span>
              <span className="text-lg text-white/60">
                {t("landing.pricing.perMonth")}
              </span>
            </p>

            {netAnnual && (
              <p className="mt-4 text-pretty font-semibold text-primary">
                {t("landing.pricing.calcNote", { amount: netAnnual })}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <Link
              to="/login"
              className={ctaClasses("onDark", "lg", "w-full sm:w-auto")}
            >
              {t("landing.pricing.cta")}
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/60">
            {trustBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2">
                <PunchMark state="stamped" size={14} />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
