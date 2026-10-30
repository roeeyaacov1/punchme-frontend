import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { LinkButton, LitPanel, Notice, SegmentedControl, StampRow, focusRing, useReducedMotion } from "../kit";
import { fieldBox, noTapFlash } from "../kit/classes";
import {
  CALCULATOR_BOUNDS,
  CALCULATOR_DEFAULTS,
  CALCULATOR_PRESETS,
  PUNCHME_ANNUAL_PRICE,
  calculate,
  clampInput,
  clampInputs,
  formatCurrency,
  formatSignedCurrency,
  type CalculatorInputs,
  type CalculatorPresetKey,
} from "./calculator";
import { column, section } from "./landingLayout";

/** The three sliders that carry the whole story. `margin` sits in
 * fine-tune: most owners don't know theirs, and the headline works
 * perfectly well on the 65% default. */
const PRIMARY_KEYS = ["ticket", "stamps", "regulars"] as const;

/** The presets in the order the counter's trades run. */
const PRESETS: readonly CalculatorPresetKey[] = ["barbershop", "cafe", "studio"];

/** Which a11y phrasing each input's `aria-valuetext` uses. */
const UNIT: Record<keyof CalculatorInputs, string> = {
  ticket: "shekels",
  stamps: "stamps",
  regulars: "regulars",
  margin: "percent",
};

/** A figure is Rubik's tabular numbers in its own left-to-right run, so a
 * loss reads "−₪819" in Hebrew too, never "₪819−". */
const FIGURE = { ltr: <bdi dir="ltr" className="type-figure" /> };

/** Reads `?ticket=60&stamps=10&…` so an owner can send themselves a result.
 * There's no personal data in it to leak. */
function readQueryString(): Partial<CalculatorInputs> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Partial<CalculatorInputs> = {};
  for (const key of Object.keys(CALCULATOR_DEFAULTS) as (keyof CalculatorInputs)[]) {
    const raw = params.get(key);
    if (raw !== null) out[key] = Number(raw);
  }
  return out;
}

/** The preset the inputs stand on, if any: a slider moved off it chooses none. */
function presetOf(inputs: CalculatorInputs): CalculatorPresetKey | "" {
  const keys = Object.keys(CALCULATOR_DEFAULTS) as (keyof CalculatorInputs)[];
  return PRESETS.find((preset) => keys.every((key) => CALCULATOR_PRESETS[preset][key] === inputs[key])) ?? "";
}

/** Eases a number to its new value over 400ms, and jumps under reduced motion. */
function useAnimatedNumber(target: number, duration = 400) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    // Jump straight there when easing is unwanted or impossible: rAF is
    // paused in a hidden tab, and a frozen number is worse than no easing.
    if (reduced || document.hidden || Math.abs(currentRef.current - target) < 0.005) {
      currentRef.current = target;
      setDisplay(target);
      return;
    }
    const from = currentRef.current;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (target - from) * eased;
      currentRef.current = value;
      setDisplay(value);
      if (progress < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);

  return display;
}

/** A figure on its own: tabular, and its own left-to-right run. */
function Money({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <bdi dir="ltr" className={cn("type-figure", className)}>
      {children}
    </bdi>
  );
}

/**
 * One line of the tally: the label, a leader rule and the figure, the way
 * an end-of-day till receipt reads, in either direction.
 */
function ReceiptRow({ label, amount, emphasis = false }: { label: string; amount: string; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className={cn("type-body shrink-0", emphasis ? "font-semibold text-ink" : "text-ink-muted")}>{label}</dt>
      <span aria-hidden className="receipt-leader" />
      <dd className={cn("shrink-0", emphasis ? "text-ink" : "text-ink-muted")}>
        <Money>{amount}</Money>
      </dd>
    </div>
  );
}

function SliderField({
  name,
  label,
  value,
  onChange,
}: {
  name: keyof CalculatorInputs;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const { min, max, step } = CALCULATOR_BOUNDS[name];

  // A local draft so a half-typed "1" on the way to "150" isn't clamped to
  // the minimum mid-keystroke. Commits when valid, normalises on blur.
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="type-label text-ink">
          {label}
        </label>
        <div className="w-24 shrink-0">
          <input
            type="number"
            inputMode="numeric"
            dir="ltr"
            min={min}
            max={max}
            step={step}
            value={draft}
            aria-label={label}
            onChange={(e) => {
              setDraft(e.target.value);
              const parsed = Number(e.target.value);
              if (e.target.value !== "" && Number.isFinite(parsed) && parsed >= min && parsed <= max) {
                onChange(clampInput(name, parsed));
              }
            }}
            onBlur={() => {
              const clamped = clampInput(name, Number(draft));
              onChange(clamped);
              setDraft(String(clamped));
            }}
            className={cn(fieldBox, "type-figure h-12 text-center")}
          />
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={t(`landing.calculator.a11y.${UNIT[name]}`, { value })}
        // `input`, not `change`, so dragging updates the results live.
        onChange={(e) => onChange(clampInput(name, Number(e.target.value)))}
        className={cn("kit-range", noTapFlash)}
        style={{ "--kit-range-progress": `${progress}%` } as CSSProperties}
      />
    </div>
  );
}

/**
 * The owner's own arithmetic, and the one section allowed to talk them out
 * of it. The model is `calculator.ts`'s: a reward costed at what it costs to
 * give, a net never clamped at zero. The answer is how many new regulars
 * cover a year of PunchMe; when the year comes out behind, it says so in
 * plain words, and says not to activate it.
 *
 * The URL holds the inputs only after a real interaction, so a result can
 * be sent; the screen reader hears one sentence once the numbers settle; on
 * a phone a bar holds the answer in view while a slider is held.
 */
export function RevenueCalculator({
  onTouchedResult,
}: {
  /** Fires only once the visitor has moved something, so the price can't
   * claim to be "based on your numbers" otherwise. */
  onTouchedResult: (netAnnual: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const reduced = useReducedMotion();

  const [inputs, setInputs] = useState<CalculatorInputs>(() =>
    clampInputs({ ...CALCULATOR_DEFAULTS, ...readQueryString() }),
  );
  const [touched, setTouched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const result = useMemo(() => calculate(inputs), [inputs]);
  const preset = presetOf(inputs);

  const setField = useCallback(
    (name: keyof CalculatorInputs) => (value: number) => {
      setTouched(true);
      setInputs((prev) => ({ ...prev, [name]: clampInput(name, value) }));
    },
    [],
  );

  const applyPreset = (key: CalculatorPresetKey | "") => {
    if (!key) return;
    setTouched(true);
    setInputs(clampInputs(CALCULATOR_PRESETS[key]));
  };

  // Mirror state into the query string, but only after a real interaction.
  useEffect(() => {
    if (!touched) return;
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(inputs)) params.set(key, String(value));
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }, [inputs, touched]);

  useEffect(() => {
    if (touched) onTouchedResult(result.netAnnual);
  }, [touched, result.netAnnual, onTouchedResult]);

  const isNegative = result.netAnnual < 0;

  // Screen readers get the totals once the numbers settle: announcing every
  // frame of a drag would be unusable. A year that comes out behind says so.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const summary = t("landing.calculator.a11y.summary", {
        count: result.regularsToBreakEven,
        net: formatSignedCurrency(result.netAnnual, locale),
      });
      setAnnouncement(isNegative ? `${summary} ${t("landing.calculator.a11y.loss")}` : summary);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [result.regularsToBreakEven, result.netAnnual, isNegative, locale, t]);

  // While a slider is held on a phone the results are off-screen, so a
  // compact bar pins them to the bottom until the drag ends.
  useEffect(() => {
    if (!dragging) return;
    const end = () => setDragging(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging]);

  const animatedRegulars = useAnimatedNumber(result.regularsToBreakEven);
  const animatedCardRevenue = useAnimatedNumber(result.cardRevenue);
  const animatedCardNet = useAnimatedNumber(result.cardNet);
  const animatedTotalRevenue = useAnimatedNumber(result.totalRevenue);
  const animatedTotalGross = useAnimatedNumber(result.totalGross);
  const animatedRewardCost = useAnimatedNumber(result.totalRewardCost);
  const animatedNet = useAnimatedNumber(result.netAnnual);

  const regularsShown = Math.max(1, Math.round(animatedRegulars));
  const money = (v: number) => formatCurrency(v, locale);
  const fig = (v: number) => `₪${formatCurrency(v, locale)}`;
  const owed = (v: number) => `−₪${formatCurrency(v, locale)}`;

  return (
    <section id="calculator" tabIndex={-1} aria-labelledby="calculator-title" className={section}>
      <div className={column}>
        <h2 id="calculator-title" className="type-headline max-w-[22ch] text-balance text-ink">
          {t("landing.calculator.title")}
        </h2>
        <p className="type-lead mt-4 max-w-[40rem] text-pretty text-ink-muted">{t("landing.calculator.lead")}</p>

        <div className="mt-8 grid grid-cols-1 gap-10 sm:mt-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16">
          {/* ── The workbench ── */}
          <div
            className="flex flex-col gap-8"
            onPointerDown={(e) => {
              // Only a slider opens the bar: a typed number brings up the
              // keyboard, and the bar would ride up on it.
              if ((e.target as HTMLInputElement).type === "range") setDragging(true);
            }}
          >
            <SegmentedControl
              label={t("landing.calculator.presetsLabel")}
              options={PRESETS.map((key) => ({ value: key, label: t(`landing.calculator.presets.${key}`) }))}
              value={preset}
              onChange={applyPreset}
            />

            {PRIMARY_KEYS.map((key) => (
              <div key={key} className="flex flex-col gap-4">
                <SliderField
                  name={key}
                  label={t(`landing.calculator.inputs.${key}`)}
                  value={inputs[key]}
                  onChange={setField(key)}
                />
                {/* The stamps slider isn't setting a variable: it's deciding
                    how long the card is. So it draws the card, one row that
                    never wraps. */}
                {key === "stamps" && (
                  <div className="flex flex-col gap-3 rounded-panel border border-border p-4 sm:p-5">
                    <p className="type-label text-ink-muted">{t("landing.calculator.yourCard")}</p>
                    <StampRow total={inputs.stamps} filled={0} className="max-w-[26rem] justify-start" />
                  </div>
                )}
              </div>
            ))}

            <details className="group rounded-panel border border-border">
              <summary
                className={cn(
                  "flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-panel px-4 sm:px-5 [&::-webkit-details-marker]:hidden",
                  noTapFlash,
                  focusRing,
                )}
              >
                <span className="type-label text-ink">{t("landing.calculator.fineTune.title")}</span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-5 shrink-0 text-ink-muted group-open:rotate-180",
                    // Under reduced motion it flips without turning.
                    !reduced && "transition-transform duration-move ease-in-out-strong",
                  )}
                />
              </summary>
              <div className="flex flex-col gap-6 px-4 pb-5 sm:px-5">
                <p className="type-body text-pretty text-ink-muted">{t("landing.calculator.fineTune.note")}</p>
                <SliderField
                  name="margin"
                  label={t("landing.calculator.inputs.margin")}
                  value={inputs.margin}
                  onChange={setField("margin")}
                />
              </div>
            </details>
          </div>

          {/* ── The tally ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <LitPanel light="lit" radius="card" className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-border px-5 py-6 sm:px-7 sm:py-7">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Money className="type-count">{regularsShown}</Money>
                  <span className="type-card-title text-pretty text-ink">
                    {t("landing.calculator.result.headline", { count: regularsShown })}
                  </span>
                </p>
                <p className="type-body text-pretty text-ink-muted">
                  <Trans
                    i18nKey="landing.calculator.result.regularsDetail"
                    values={{
                      stamps: inputs.stamps,
                      ticket: money(inputs.ticket),
                      cardNet: money(animatedCardNet),
                      annual: money(PUNCHME_ANNUAL_PRICE),
                    }}
                    components={FIGURE}
                  />
                </p>
                <p className="type-body font-semibold text-ink">
                  {t("landing.calculator.result.orMonthly", { count: result.breakEvenVisits })}
                </p>
              </div>

              <div className="flex flex-col gap-4 px-5 py-6 sm:px-7 sm:py-7">
                <p className="type-label text-ink">{t("landing.calculator.result.cardTitle")}</p>
                <dl className="flex flex-col gap-2">
                  <ReceiptRow label={t("landing.calculator.result.cardRevenue")} amount={fig(animatedCardRevenue)} />
                  <ReceiptRow label={t("landing.calculator.result.cardNet")} amount={fig(animatedCardNet)} emphasis />
                </dl>

                <hr className="my-2 border-border" />

                <p className="type-label text-ink">
                  {t("landing.calculator.result.projectionLabel", { count: inputs.regulars })}
                </p>
                <dl className="flex flex-col gap-2">
                  <ReceiptRow label={t("landing.calculator.result.totalRevenue")} amount={fig(animatedTotalRevenue)} />
                  <ReceiptRow label={t("landing.calculator.result.totalGross")} amount={fig(animatedTotalGross)} emphasis />
                  <ReceiptRow label={t("landing.calculator.result.rewardCost")} amount={owed(animatedRewardCost)} />
                  <ReceiptRow label={t("landing.calculator.result.subscription")} amount={owed(PUNCHME_ANNUAL_PRICE)} />
                </dl>

                {/* Why a reward costs so little, open to a tap and a key, not
                    a hover: the sentence that makes the arithmetic honest. */}
                <details className="group -mt-1">
                  <summary
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-full text-sm font-semibold text-ink underline decoration-1 underline-offset-[3px] [&::-webkit-details-marker]:hidden",
                      noTapFlash,
                      focusRing,
                    )}
                  >
                    {t("landing.calculator.result.rewardCostWhy")}
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-4 shrink-0 group-open:rotate-180",
                        !reduced && "transition-transform duration-move ease-in-out-strong",
                      )}
                    />
                  </summary>
                  <p className="type-body pb-1 text-pretty text-ink-muted">
                    <Trans
                      i18nKey="landing.calculator.result.rewardCostReason"
                      values={{ amount: money(result.rewardCost), stamps: inputs.stamps }}
                      components={FIGURE}
                    />
                  </p>
                </details>

                {/* A double rule before the total, the way a printed tally closes. */}
                <div className="mt-1 border-t-4 border-double border-border-strong pt-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="type-label text-ink">{t("landing.calculator.result.net")}</p>
                    <Money className="text-3xl text-ink sm:text-4xl">
                      {formatSignedCurrency(animatedNet, locale)}
                    </Money>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{t("landing.calculator.result.netSub")}</p>
                </div>

                {isNegative && (
                  <Notice tone="warn" lit>
                    {t("landing.calculator.result.negative", {
                      count: result.regularsToBreakEven,
                      regulars: inputs.regulars,
                    })}
                  </Notice>
                )}

                {/* Designing stays free either way; after a loss it is the
                    quieter button, under a verdict that says not to buy. */}
                <LinkButton
                  to="/onboarding"
                  size="lg"
                  variant={isNegative ? "secondary" : "primary"}
                  className="mt-2 w-full"
                >
                  {t("landing.hero.cta")}
                </LinkButton>

                <p className="text-pretty text-sm text-ink-muted">{t("landing.calculator.result.footnote")}</p>
              </div>
            </LitPanel>
          </div>
        </div>
      </div>

      {/* Debounced, so dragging doesn't produce a torrent. */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {dragging && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-panel-lift lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <span className="type-body font-semibold text-ink">
              {t("landing.calculator.result.regularsNeeded", { count: regularsShown })}
            </span>
            <Money className="type-body font-semibold text-ink">{formatSignedCurrency(animatedNet, locale)}</Money>
          </div>
        </div>
      )}
    </section>
  );
}
