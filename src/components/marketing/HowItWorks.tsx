import { useTranslation } from "react-i18next";
import { GoogleCardPreview } from "../card-studio/CardPreviews";
import { StandeeSheet } from "../dashboard/Standee";
import { Figure, LitPanel } from "../kit";
import { column, section } from "./landingLayout";
import { SampleAnswer } from "./SampleAnswer";
import { landedStamps, samplePass, sampleSign, tradeTemplate, type TradeKey } from "./samples";
import { SourceLabel, type ProofStat } from "./SourceLabel";
import { PROOF_SOURCE_URLS } from "./sources";

/**
 * How it works, in the order a customer meets the three objects on the
 * counter: the sign, the card, the scan. Three tall lit panels, each laid
 * out its own way so none is a row of equal cards: the sign beside its two
 * papers, the card above the pass and its evidence, the scan above its two
 * answers. Each shows the product's own piece, never the wizard's screens,
 * and all of them the card the visitor picked on the counter.
 */
export function HowItWorks({ trade }: { trade: TradeKey }) {
  const { t, i18n } = useTranslation();
  const template = tradeTemplate(trade);
  const stamps = landedStamps(template);
  const language = i18n.resolvedLanguage === "he" ? "he" : "en";
  const stats = t("landing.proof.stats", { returnObjects: true }) as ProofStat[];
  const harris = stats.find((stat) => stat.id === "harris");
  const art = sampleSign(template, t, true);

  return (
    <section id="how-it-works" tabIndex={-1} aria-labelledby="how-title" className={section}>
      <div className={column}>
        <h2 id="how-title" className="type-headline max-w-[20ch] text-balance text-ink">
          {t("landing.howItWorks.title")}
        </h2>

        <div className="mt-8 grid gap-5 sm:mt-10 lg:mt-14 lg:grid-cols-12 lg:gap-6">
          <LitPanel
            as="article"
            radius="card"
            aria-labelledby="how-sign"
            className="flex flex-col gap-8 p-5 sm:p-6 lg:col-span-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10"
          >
            <div className="flex max-w-[30rem] flex-col gap-3">
              <h3 id="how-sign" className="type-title text-ink">
                {t("landing.howItWorks.sign.title")}
              </h3>
              <p className="type-prose text-ink-muted">{t("landing.howItWorks.sign.body")}</p>
              <p className="type-prose text-ink-muted">{t("landing.howItWorks.sign.prints")}</p>
            </div>
            {/* The same sign at two sizes: the A4 for a window and the tent
                for a table, standing on one line as they would on a shelf. */}
            <div aria-hidden className="flex items-end justify-center gap-2.5 sm:gap-6 lg:shrink-0">
              <StandeeSheet
                design="counter"
                format="a4"
                language={language}
                single
                art={art}
                className="w-[7.375rem] rounded-md shadow-panel-lift ring-1 ring-rim/10 sm:w-40 lg:w-[13rem]"
              />
              <StandeeSheet
                design="counter"
                format="tent"
                language={language}
                single
                art={art}
                className="w-[10.875rem] rounded-md shadow-panel-lift ring-1 ring-rim/10 sm:w-60 lg:w-[19rem]"
              />
            </div>
          </LitPanel>

          <LitPanel
            as="article"
            radius="card"
            aria-labelledby="how-card"
            className="flex flex-col gap-6 p-5 sm:p-6 lg:col-span-7 lg:p-10"
          >
            <div className="flex flex-col gap-3">
              <h3 id="how-card" className="type-title text-ink">
                {t("landing.howItWorks.card.title")}
              </h3>
              <p className="type-prose text-ink-muted">{t("landing.howItWorks.card.body")}</p>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-8 sm:flex-row sm:gap-8">
              {/* The Android side, since the counter shows the iPhone one:
                  Google's own layout, unchanged, in its 300px slot. */}
              <div aria-hidden className="w-[300px] shrink-0 font-normal not-italic leading-normal tracking-normal">
                <GoogleCardPreview {...samplePass(template, t, stamps)} />
              </div>
              {harris && (
                <Figure
                  size="stat"
                  value={harris.value}
                  label={harris.claim}
                  caveat={harris.context}
                  source={{ label: <SourceLabel label={harris.source} />, href: PROOF_SOURCE_URLS.harris }}
                  // The number starts where the page's text starts, not
                  // where its own left-to-right run would put it.
                  className="min-w-0 self-stretch sm:self-auto [&>span]:self-start"
                />
              )}
            </div>
          </LitPanel>

          <LitPanel
            as="article"
            radius="card"
            aria-labelledby="how-scan"
            className="flex flex-col gap-6 p-5 sm:p-6 lg:col-span-5 lg:p-10"
          >
            <div className="flex flex-col gap-3">
              <h3 id="how-scan" className="type-title text-ink">
                {t("landing.howItWorks.scan.title")}
              </h3>
              <p className="type-prose text-ink-muted">{t("landing.howItWorks.scan.body")}</p>
            </div>
            <figure className="flex flex-col items-center">
              {/* The two lights a stamp and a reward answer in, a step apart
                  down the panel, the way they come a few visits apart. */}
              <div aria-hidden className="flex w-full max-w-[20rem] flex-col gap-3">
                <SampleAnswer template={template} kind="stamped" count={stamps} className="me-8" />
                <SampleAnswer template={template} kind="full" count={template.stampsRequired} className="ms-8" />
              </div>
              <figcaption className="sr-only">
                {t("landing.howItWorks.scan.summary", {
                  stamped: t("dashboard.scan.result.stamped"),
                  full: t("dashboard.scan.result.rewardReady"),
                  redeem: t("dashboard.scan.result.redeem"),
                })}
              </figcaption>
            </figure>
          </LitPanel>
        </div>
      </div>
    </section>
  );
}
