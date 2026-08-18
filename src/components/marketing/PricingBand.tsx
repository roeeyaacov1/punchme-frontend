import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { Container, ctaClasses } from "./primitives";

/**
 * Two plans on the royal band — the one place a saturated ground carries the
 * whole width of the page.
 *
 * The money is the same money it always was: designing the card, previewing
 * it on your own phone and using the dashboard cost nothing for as long as
 * you like, and the subscription starts when the card goes live for real
 * customers. The comp drew that as a 50-customer cap on the free tier, which
 * is a different product; what it is really describing is before-and-after
 * activation, so that is what the two cards say.
 *
 * `netAnnual` arrives only once the visitor has actually moved something in
 * the calculator — an unearned "based on your numbers" would be a lie about
 * numbers they never gave.
 */
export function PricingBand({ netAnnual }: { netAnnual: string | null }) {
  const { t } = useTranslation();
  const freeFeatures = t("landing.pricing.free.features", {
    returnObjects: true,
  }) as string[];
  const proFeatures = t("landing.pricing.pro.features", {
    returnObjects: true,
  }) as string[];

  return (
    <section id="pricing" className="grad-band scroll-mt-24 py-16 sm:py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="t-h2 text-balance text-white">
            {t("landing.pricing.title")}
          </h2>
          <div
            aria-hidden="true"
            className="mx-auto mt-5 h-1 w-10 rounded-full bg-white/70"
          />
          <p className="t-lead mt-6 text-pretty text-brand-on-band">
            {t("landing.pricing.body")}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2 md:items-start">
          <PlanCard
            price={t("landing.pricing.free.price")}
            name={t("landing.pricing.free.name")}
            features={freeFeatures}
            cta={t("landing.pricing.free.cta")}
          />

          <PlanCard
            price={t("landing.pricing.pro.price")}
            per={t("landing.pricing.pro.per")}
            name={t("landing.pricing.pro.badge")}
            highlighted
            features={proFeatures}
            cta={t("landing.pricing.pro.cta")}
            note={
              netAnnual
                ? t("landing.pricing.calcNote", { amount: netAnnual })
                : undefined
            }
          />
        </div>
      </Container>
    </section>
  );
}

function PlanCard({
  price,
  per,
  name,
  features,
  cta,
  highlighted = false,
  note,
}: {
  price: string;
  per?: string;
  name: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  note?: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-brand-wash p-6 shadow-[0_24px_48px_-24px_rgb(15_15_35/0.5)] sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-baseline gap-1">
          <span
            className={cn(
              "font-heading text-4xl font-bold tracking-tight",
              highlighted ? "text-primary-text" : "text-ink",
            )}
          >
            {price}
          </span>
          {per && <span className="text-sm text-ink-subtle">{per}</span>}
        </p>

        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-bold",
            highlighted
              ? "grad-warm text-white"
              : "bg-brand-tint text-ink-muted",
          )}
        >
          {name}
        </span>
      </div>

      <hr className="my-6 border-border" />

      <ul className="flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              size={16}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-primary-text"
            />
            <span className="text-pretty text-sm text-ink-muted">{feature}</span>
          </li>
        ))}
      </ul>

      {note && (
        <p className="mt-6 text-pretty text-sm font-bold text-primary-text">
          {note}
        </p>
      )}

      <Link
        to="/onboarding"
        className={ctaClasses("warm", "lg", "mt-6 w-full")}
      >
        {cta}
        <ArrowRight size={18} aria-hidden="true" className="rtl:-scale-x-100" />
      </Link>
    </div>
  );
}
