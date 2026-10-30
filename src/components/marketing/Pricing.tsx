import { Trans, useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { StandeeSheet } from "../dashboard/Standee";
import { Badge, LinkButton, LitPanel } from "../kit";
import { column, section } from "./landingLayout";
import { sampleSign, tradeTemplate, type TradeKey } from "./samples";

/**
 * The sign at the size each panel holds it: the counter design on A5. The
 * width is the wrapper's, since `.standee-sheet` fills its parent and is
 * written after Tailwind's plain width classes, which it would beat.
 */
const SIGN = "w-[8.5rem] shrink-0 self-center sm:w-36 lg:w-[9.5rem]";
const PAPER = "rounded-md shadow-panel-lift ring-1 ring-rim/10";

/**
 * The price as the sign switching on. Two panels, not tiers: Free is the
 * sign designed but unlit, its code slot empty and saying so, which is the
 * standee's own state before activation; Pro is the same sign lit, at ₪99 a
 * month including VAT, with what activating opens. Under them, how to stop
 * and what stopping does, in Billing's own words, and the one action.
 *
 * `netAnnual` arrives only once the visitor has moved something in the
 * calculator and the year comes out ahead: no "based on your numbers" for
 * numbers they never gave, and no advertising a loss.
 */
export function Pricing({ trade, netAnnual }: { trade: TradeKey; netAnnual: string | null }) {
  const { t, i18n } = useTranslation();
  const template = tradeTemplate(trade);
  const language = i18n.resolvedLanguage === "he" ? "he" : "en";
  const opens = t("landing.pricing.pro.opens", { returnObjects: true }) as string[];

  return (
    <section id="pricing" tabIndex={-1} aria-labelledby="pricing-title" className={section}>
      <div className={column}>
        <h2 id="pricing-title" className="type-headline max-w-[20ch] text-balance text-ink">
          {t("landing.pricing.title")}
        </h2>
        <p className="type-lead mt-4 max-w-[40rem] text-pretty text-ink-muted">{t("landing.pricing.body")}</p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 lg:mt-12 lg:grid-cols-12 lg:gap-6">
          {/* Unlit: the wall itself behind a hairline, no light and no drop. */}
          <article
            aria-labelledby="price-free"
            className="flex flex-col gap-6 rounded-card border border-border-strong p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:col-span-5 lg:p-8"
          >
            <div className="flex flex-col gap-3">
              <h3 id="price-free" className="font-heading text-[2.75rem] font-medium leading-none text-ink">
                {t("landing.pricing.free.price")}
              </h3>
              <p className="type-prose text-ink-muted">{t("landing.pricing.free.body")}</p>
            </div>
            <div aria-hidden className={SIGN}>
              <StandeeSheet
                design="counter"
                format="a5"
                language={language}
                single
                art={sampleSign(template, t, false)}
                className={PAPER}
              />
            </div>
          </article>

          <LitPanel
            as="article"
            light="field"
            radius="card"
            aria-labelledby="price-pro"
            className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:col-span-7 lg:p-8"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start gap-3">
                <Badge>{t("landing.pricing.pro.name")}</Badge>
                <h3 id="price-pro" className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-ink">
                  <span dir="ltr" className="type-figure text-[2.75rem] leading-none">
                    {t("landing.pricing.pro.price")}
                  </span>
                  <span className="type-body text-ink-muted">{t("landing.pricing.pro.per")}</span>
                </h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {opens.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <Check aria-hidden strokeWidth={2.5} className="mt-1 size-4 shrink-0 text-ink" />
                    <span className="type-body text-ink">{line}</span>
                  </li>
                ))}
              </ul>
              {netAnnual && (
                <p className="type-body font-semibold text-ink">
                  <Trans
                    i18nKey="landing.pricing.calcNote"
                    values={{ amount: netAnnual }}
                    components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
                  />
                </p>
              )}
            </div>
            <div aria-hidden className={SIGN}>
              <StandeeSheet
                design="counter"
                format="a5"
                language={language}
                single
                art={sampleSign(template, t, true)}
                className={PAPER}
              />
            </div>
          </LitPanel>
        </div>

        <div className="mt-8 flex flex-col gap-6 sm:mt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex max-w-[42rem] flex-col gap-2">
            <h3 className="type-card-title text-ink">{t("billing.pro.ifCancelTitle")}</h3>
            <p className="type-prose text-ink-muted">
              {t("landing.pricing.stop")} {t("billing.pro.ifCancel")}
            </p>
          </div>
          <LinkButton to="/onboarding" size="lg" className="w-full shrink-0 sm:w-auto">
            {t("landing.hero.cta")}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
