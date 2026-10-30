import { memo, useEffect, useState, type ReactNode, type Ref } from "react";
import { Trans, useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { AppleCardPreview } from "../card-studio/CardPreviews";
import { StandeeSheet } from "../dashboard/Standee";
import { LinkButton, LitPanel, SegmentedControl, useReducedMotion } from "../kit";
import { PUNCHME_MONTHLY_PRICE } from "./calculator";
import { column } from "./landingLayout";
import { SampleAnswer } from "./SampleAnswer";
import { TRADES, landedStamps, samplePass, sampleSign, tradeTemplate, type TradeKey } from "./samples";
import { useFirstSight } from "./useFirstSight";

/**
 * Once the fonts are in, how long the counter holds still before the scan,
 * so the card is seen a stamp short first.
 */
const SCAN_BEAT_MS = 800;

/** The snap's 300ms, and a frame or two: by then the stamp has landed. */
const SCAN_MS = 400;

/** --duration-crossfade, and a frame or two: by then the new trade is up. */
const CROSSFADE_MS = 350;

/**
 * The counter's layers at most: the one standing and two fading in over it.
 * A held arrow key changes the trade 30 times a second, and each layer is a
 * pass, a sign and an answer.
 */
const MAX_LAYERS = 3;

/** The counter before the scan, as it happens, and after. */
type Scan = "waiting" | "now" | "done";

/** The counter in one trade: the first, or one the switch brought. */
interface Layer {
  id: number;
  trade: TradeKey;
  /** Chosen once the scan had begun, so it shows the scan done rather than playing it again. */
  afterScan: boolean;
}

/**
 * Each object on the counter wears its name, as a label stuck on its edge:
 * the top edge, or the foot for the sign, whose top band is its reward.
 */
function Tag({ children, foot = false, className }: { children: ReactNode; foot?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "type-tag absolute start-3 z-10 inline-flex min-h-6 items-center whitespace-nowrap rounded-full border border-border-strong bg-surface px-2.5 text-ink",
        foot ? "-bottom-3" : "-top-3",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * The three objects on the counter, in one trade. On a phone they overlap
 * round the pass: the answer over its upper end corner, where the pass's
 * name row is empty, and the sign over its lower start corner, beside the
 * barcode, so the stamps stay clear and in the first screen. From 1024px
 * they stand apart, the pass raised between them.
 *
 * Until the scan the pass is a stamp short and the owner's phone shows
 * nothing, its place kept. The scan brings the answer in with the stamp it
 * adds, and the pass takes that stamp in the same frame, at once, as Wallet
 * does: the frozen pass can't animate, so the landing is staged in the
 * answer.
 *
 * Memoised: a layer only draws again when its own trade or scan changes,
 * not each time another is laid over it.
 */
const Counter = memo(function Counter({
  trade,
  scan,
  answerRef,
  className,
}: {
  trade: TradeKey;
  scan: Scan;
  /** The owner's phone, which has to be in view for the scan to happen. */
  answerRef?: Ref<HTMLDivElement>;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const template = tradeTemplate(trade);
  const landed = landedStamps(template);
  const language = i18n.resolvedLanguage === "he" ? "he" : "en";
  const snap = scan === "now";

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[26rem] flex-col items-center pb-[6.75rem] pt-[5.25rem] lg:max-w-none lg:flex-row lg:items-end lg:justify-center lg:gap-14 lg:px-12 lg:pb-14 lg:pt-16",
        className,
      )}
    >
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
        <AppleCardPreview {...samplePass(template, t, scan === "waiting" ? template.currentStamps : landed)} />
      </div>

      <div
        ref={answerRef}
        className={cn(
          "absolute end-1.5 top-5 z-10 w-[8.75rem] lg:relative lg:end-auto lg:top-auto lg:order-3 lg:w-[16.5rem]",
          scan === "waiting" && "invisible",
        )}
      >
        {/* The answer itself comes in under the flash; its label, outside
            the flash, lights up in the gentle fade. */}
        <Tag className={snap ? "animate-gentle-in" : undefined}>{t("landing.hero.counter.scan")}</Tag>
        <SampleAnswer template={template} kind="stamped" count={landed} compact snap={snap} className="lg:hidden" />
        <SampleAnswer template={template} kind="stamped" count={landed} snap={snap} className="hidden lg:flex" />
      </div>
    </div>
  );
});

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
 * Once per visit, when the owner's phone is in view, the scan happens: the
 * page's one orchestrated moment. The panel is a picture: a screen reader
 * hears one sentence for it, of the card as the scan leaves it.
 *
 * The trade switch under it repaints all three, crossing over in place, and
 * the rest of the page follows it. The switch and the counter answer the
 * choice themselves, at once; `onTrade` tells the page, which follows in its
 * own time, off screen.
 */
export function Hero({ trade, onTrade }: { trade: TradeKey; onTrade: (next: TradeKey) => void }) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();

  // The scan waits for most of the owner's phone to be in view, and for the
  // card to have been seen as it was before, a beat after the fonts are in.
  const [answerRef, answerSeen] = useFirstSight<HTMLDivElement>({ share: 0.6 });
  const [beat, setBeat] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    void document.fonts.ready.then(() => {
      if (!cancelled) timer = window.setTimeout(() => setBeat(true), SCAN_BEAT_MS);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);
  const scanned = answerSeen && beat;
  // Once the stamp is down the answer simply stands, so nothing that draws
  // the counter again can play the scan twice.
  const [scanOver, setScanOver] = useState(false);
  useEffect(() => {
    if (!scanned) return;
    const timer = window.setTimeout(() => setScanOver(true), SCAN_MS);
    return () => window.clearTimeout(timer);
  }, [scanned]);
  const scanOf = (layer: Layer): Scan => (!scanned ? "waiting" : scanOver || layer.afterScan ? "done" : "now");

  // Each trade chosen is a new layer over the last, fading in over it, so
  // the objects cross over where they stand with no dip to the bare light
  // between them; the layers beneath go once it is up. A quick second
  // choice simply fades in over the first, mid-fade or not; past
  // MAX_LAYERS, the newest choice takes over the layer still fading in.
  const [layers, setLayers] = useState<Layer[]>(() => [{ id: 0, trade, afterScan: false }]);
  const top = layers[layers.length - 1];
  const template = tradeTemplate(top.trade);
  const stamps = landedStamps(template);
  const stacked = layers.length > 1;
  useEffect(() => {
    if (!stacked) return;
    const timer = window.setTimeout(() => setLayers((current) => current.slice(-1)), CROSSFADE_MS);
    return () => window.clearTimeout(timer);
  }, [stacked, top.id]);
  const choose = (next: TradeKey) => {
    setLayers((current) => {
      const last = current[current.length - 1];
      if (current.length < MAX_LAYERS) return [...current, { id: last.id + 1, trade: next, afterScan: scanned }];
      return [...current.slice(0, -1), { ...last, trade: next, afterScan: last.afterScan || scanned }];
    });
    onTrade(next);
  };

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
        <LinkButton to="/onboarding" size="lg" className="mt-6 w-full sm:w-auto">
          {t("landing.hero.cta")}
        </LinkButton>
      </div>

      <div className={cn(column, "mt-8 sm:mt-10 lg:mt-12")}>
        <figure>
          <LitPanel aria-hidden light="field" radius="hero" className="grid overflow-hidden">
            {layers.map((layer) => (
              <Counter
                key={layer.id}
                trade={layer.trade}
                scan={scanOf(layer)}
                answerRef={layer.id === top.id ? answerRef : undefined}
                // Stacked in one cell, each its own stacking context, so a
                // layer's raised sign and answer stay under the one above.
                className={cn(
                  "isolate [grid-area:1/1]",
                  layer.id > 0 && (reduced ? "animate-gentle-in" : "animate-crossfade-in"),
                )}
              />
            ))}
          </LitPanel>
          <figcaption className="sr-only">
            {t("landing.hero.counter.summary", {
              trade: t(`landing.templates.items.${top.trade}.trade`),
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
            value={top.trade}
            onChange={choose}
          />
        </div>
      </div>
    </section>
  );
}
