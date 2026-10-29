import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { AppleCardPreview } from "../card-studio/CardPreviews";
import { StandeeSheet } from "../dashboard/Standee";
import { LinkButton, LitPanel, SegmentedControl, linkText } from "../kit";
import { PUNCHME_MONTHLY_PRICE } from "./calculator";
import { column } from "./landingLayout";
import { SampleAnswer } from "./SampleAnswer";
import { TRADES, landedStamps, samplePass, sampleSign, tradeTemplate, type TradeKey } from "./samples";

/**
 * Each object on the counter wears its name, as a label stuck on its edge:
 * the top edge, or the foot for the sign, whose top band is its reward.
 */
function Tag({ children, foot = false }: { children: ReactNode; foot?: boolean }) {
  return (
    <span
      className={cn(
        "type-tag absolute start-3 z-10 inline-flex min-h-6 items-center whitespace-nowrap rounded-full border border-border-strong bg-surface px-2.5 text-ink",
        foot ? "-bottom-3" : "-top-3",
      )}
    >
      {children}
    </span>
  );
}

/**
 * The counter: the first screen is the mechanism itself, at the owner's own
 * till. The offer and the price above it; under them one panel in the
 * landing's field light holding the three real objects, each wearing the
 * product's word for it:
 *
 * - the sign, the standee's own sheet in its counter design;
 * - the card in the customer's wallet, the studio's `AppleCardPreview`,
 *   unchanged, in its 300px slot;
 * - the scan's answer on the owner's phone, as the Scan page draws it.
 *
 * On a phone the three overlap round the pass: the answer over its upper end
 * corner, where the pass's name row is empty, and the sign over its lower
 * start corner, beside the barcode, so the stamps stay clear and in the
 * first screen. From 1024px they stand apart, the pass raised between them.
 * The panel is a picture: a screen reader hears one sentence for it.
 *
 * The trade switch under it repaints all three, and the rest of the page
 * follows it.
 */
export function Hero({ trade, onTrade }: { trade: TradeKey; onTrade: (next: TradeKey) => void }) {
  const { t, i18n } = useTranslation();
  const template = tradeTemplate(trade);
  const stamps = landedStamps(template);
  const language = i18n.resolvedLanguage === "he" ? "he" : "en";

  return (
    <section aria-labelledby="hero-title" className="pt-6 sm:pt-10 lg:pt-14">
      <div className={column}>
        <h1 id="hero-title" className="type-display max-w-[16ch] text-balance text-ink">
          {t("landing.hero.headline")}
        </h1>
        <p className="type-lead mt-4 max-w-[34rem] text-pretty text-ink-muted">
          <Trans
            i18nKey="landing.hero.lead"
            values={{ price: PUNCHME_MONTHLY_PRICE }}
            components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
          />
        </p>
        <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
          <LinkButton to="/onboarding" size="lg" className="w-full sm:w-auto">
            {t("landing.hero.cta")}
          </LinkButton>
          <a
            href="#calculator"
            className={cn(linkText, "inline-flex min-h-11 items-center self-center font-heading font-medium sm:self-auto")}
          >
            {t("landing.hero.secondaryCta")}
          </a>
        </div>
      </div>

      <div className={cn(column, "mt-8 sm:mt-10 lg:mt-12")}>
        <figure>
          <LitPanel aria-hidden light="field" radius="hero" className="overflow-hidden">
            <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center pb-[6.75rem] pt-[5.25rem] lg:max-w-none lg:flex-row lg:items-end lg:justify-center lg:gap-14 lg:px-12 lg:pb-14 lg:pt-16">
              <div className="absolute bottom-6 start-1.5 z-10 w-[6.5rem] lg:relative lg:bottom-auto lg:start-auto lg:order-1 lg:w-[11.5rem]">
                <Tag foot>{t("landing.hero.counter.sign")}</Tag>
                <StandeeSheet
                  design="counter"
                  format="a5"
                  language={language}
                  single
                  art={sampleSign(template, t, true)}
                  className="rounded-md shadow-panel-lift ring-1 ring-rim/10"
                />
              </div>

              <div className="relative w-[300px] shrink-0 font-normal not-italic leading-normal tracking-normal lg:order-2 lg:mb-10">
                <Tag>{t("landing.hero.counter.card")}</Tag>
                <AppleCardPreview {...samplePass(template, t, stamps)} />
              </div>

              <div className="absolute end-1.5 top-5 z-10 w-[8.75rem] lg:relative lg:end-auto lg:top-auto lg:order-3 lg:w-[16.5rem]">
                <Tag>{t("landing.hero.counter.scan")}</Tag>
                <SampleAnswer template={template} kind="stamped" count={stamps} compact className="lg:hidden" />
                <SampleAnswer template={template} kind="stamped" count={stamps} className="hidden lg:flex" />
              </div>
            </div>
          </LitPanel>
          <figcaption className="sr-only">
            {t("landing.hero.counter.summary", {
              trade: t(`landing.templates.items.${trade}.trade`),
              filled: stamps,
              total: template.stampsRequired,
              answer: t("dashboard.scan.result.stamped"),
            })}
          </figcaption>
        </figure>

        <div className="mt-5 flex justify-center">
          <SegmentedControl
            label={t("landing.templates.ariaLabel")}
            hideLabel
            options={TRADES.map((key) => ({ value: key, label: t(`landing.templates.items.${key}.trade`) }))}
            value={trade}
            onChange={onTrade}
          />
        </div>
      </div>
    </section>
  );
}
