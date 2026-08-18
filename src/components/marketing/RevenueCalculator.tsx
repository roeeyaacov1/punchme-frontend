import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronDown, Coffee, Dumbbell, Info, Scissors } from "lucide-react";
import { cn } from "../../lib/cn";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { Section, SectionHeader, ctaClasses, focusRing } from "./primitives";
import { PunchRow } from "./PunchMark";
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

/** The three sliders that carry the whole story. `margin` sits in
 * fine-tune — most owners don't know theirs, and the headline works
 * perfectly well on the 65% default. */
const PRIMARY_KEYS = ["ticket", "stamps", "regulars"] as const;

const PRESET_ICONS: Record<CalculatorPresetKey, typeof Coffee> = {
  cafe: Coffee,
  barbershop: Scissors,
  studio: Dumbbell,
};

/** Which a11y phrasing each input's `aria-valuetext` uses. */
const UNIT: Record<keyof CalculatorInputs, string> = {
  ticket: "shekels",
  stamps: "stamps",
  regulars: "regulars",
  margin: "percent",
};

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

/** Eases a number to its new value over ~400ms. */
function useAnimatedNumber(target: number, duration = 400) {
  const reduced = usePrefersReducedMotion();
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

/**
 * One line of the tally: label, a leader rule, and the figure.
 *
 * The leader is what makes a column of numbers read as an end-of-day receipt
 * rather than a pricing table, and it does the work in both directions —
 * flex order handles RTL, and `.t-figure` isolates the figure so "₪600"
 * cannot reorder against a Hebrew label.
 */
function ReceiptRow({
  label,
  amount,
  emphasis = false,
  negative = false,
  children,
}: {
  label: string;
  amount: string;
  /** The line an owner is meant to read: heavier, in ink rather than grey. */
  emphasis?: boolean;
  negative?: boolean;
  /** Anything that hangs off the label — the reward-cost explainer. */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <dt
        className={cn(
          "flex shrink-0 items-baseline gap-1",
          emphasis ? "font-semibold text-ink" : "text-ink-muted",
        )}
      >
        {label}
        {children}
      </dt>
      <span aria-hidden="true" className="receipt-leader" />
      <dd
        className={cn(
          "t-figure shrink-0",
          negative ? "text-ink-subtle" : emphasis ? "text-ink" : "text-ink-muted",
        )}
      >
        {amount}
      </dd>
    </div>
  );
}

interface FieldProps {
  name: keyof CalculatorInputs;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function SliderField({ name, label, value, onChange }: FieldProps) {
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
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={draft}
          aria-label={label}
          onChange={(e) => {
            setDraft(e.target.value);
            const parsed = Number(e.target.value);
            if (
              e.target.value !== "" &&
              Number.isFinite(parsed) &&
              parsed >= min &&
              parsed <= max
            ) {
              onChange(clampInput(name, parsed));
            }
          }}
          onBlur={() => {
            const clamped = clampInput(name, Number(draft));
            onChange(clamped);
            setDraft(String(clamped));
          }}
          className={cn(
            "t-figure min-h-[44px] w-24 rounded-lg border border-border-strong bg-surface px-3 py-2 text-end text-sm text-ink",
            focusRing,
          )}
        />
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
        className="range-gold"
        style={{ "--range-progress": `${progress}%` } as React.CSSProperties}
      />
    </div>
  );
}

export function RevenueCalculator({
  onTouchedResult,
}: {
  /** Fires only once the visitor has moved something, so the pricing band
   * can't claim to be "based on your numbers" otherwise. */
  onTouchedResult: (netAnnual: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";

  const [inputs, setInputs] = useState<CalculatorInputs>(() =>
    clampInputs({ ...CALCULATOR_DEFAULTS, ...readQueryString() }),
  );
  const [touched, setTouched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const result = useMemo(() => calculate(inputs), [inputs]);

  const setField = useCallback(
    (name: keyof CalculatorInputs) => (value: number) => {
      setTouched(true);
      setInputs((prev) => ({ ...prev, [name]: clampInput(name, value) }));
    },
    [],
  );

  const applyPreset = (key: CalculatorPresetKey) => {
    setTouched(true);
    setInputs(clampInputs(CALCULATOR_PRESETS[key]));
  };

  // Mirror state into the query string, but only after a real interaction.
  useEffect(() => {
    if (!touched) return;
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(inputs)) params.set(key, String(value));
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params}${window.location.hash}`,
    );
  }, [inputs, touched]);

  useEffect(() => {
    if (touched) onTouchedResult(result.netAnnual);
  }, [touched, result.netAnnual, onTouchedResult]);

  // Screen readers get the totals once the numbers settle — announcing
  // every frame of a drag would be unusable.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncement(
        t("landing.calculator.a11y.summary", {
          count: result.regularsToBreakEven,
          net: formatSignedCurrency(result.netAnnual, locale),
        }),
      );
    }, 500);
    return () => window.clearTimeout(timer);
  }, [result.regularsToBreakEven, result.netAnnual, locale, t]);

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
  const isNegative = result.netAnnual < 0;
  // Two forms, because they land in two different places. `money` is the
  // bare number, for the sentences whose copy already carries the ₪ inside
  // it; `fig`/`owed` are standalone figures for the tally column.
  const money = (v: number) => formatCurrency(v, locale);
  const fig = (v: number) => `₪${formatCurrency(v, locale)}`;
  const owed = (v: number) => `−₪${formatCurrency(v, locale)}`;

  return (
    <Section id="calculator">
      <SectionHeader
        eyebrow={t("landing.calculator.eyebrow")}
        title={t("landing.calculator.title")}
        lead={t("landing.calculator.lead")}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        {/* ── The workbench ──────────────────────────────────────────── */}
        <div
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).tagName === "INPUT") setDragging(true);
          }}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="t-eyebrow text-ink-subtle">
              {t("landing.calculator.presetsLabel")}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(CALCULATOR_PRESETS) as CalculatorPresetKey[]).map((key) => {
                const Icon = PRESET_ICONS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    className={cn(
                      "inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary-text",
                      focusRing,
                    )}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {t(`landing.calculator.presets.${key}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-9">
            {PRIMARY_KEYS.map((key) => (
              <div key={key}>
                <SliderField
                  name={key}
                  label={t(`landing.calculator.inputs.${key}`)}
                  value={inputs[key]}
                  onChange={setField(key)}
                />
                {/* The stamps slider isn't setting a variable — it's deciding
                    how long the card is. So it draws the card. */}
                {key === "stamps" && (
                  <div className="mt-4 rounded-xl border border-border bg-surface p-5">
                    <p className="t-eyebrow text-ink-subtle">
                      {t("landing.calculator.yourCard")}
                    </p>
                    <PunchRow
                      total={inputs.stamps}
                      filled={0}
                      size={30}
                      className="mt-3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <details className="faq-item group mt-8 rounded-xl border border-border bg-surface">
            <summary
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 rounded-xl px-5 py-4",
                focusRing,
              )}
            >
              <span className="text-sm font-semibold text-ink">
                {t("landing.calculator.fineTune.title")}
              </span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className="shrink-0 text-ink-subtle transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="flex flex-col gap-6 px-5 pb-6">
              <p className="text-pretty text-sm text-ink-subtle">
                {t("landing.calculator.fineTune.note")}
              </p>
              <SliderField
                name="margin"
                label={t("landing.calculator.inputs.margin")}
                value={inputs.margin}
                onChange={setField("margin")}
              />
            </div>
          </details>
        </div>

        {/* ── The tally ──────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-border-strong bg-surface shadow-lift">
            {/* The answer, and it is assumption-free: no adoption rate, no
                uplift, nothing to take on trust. Almost always a tiny number,
                which is the entire argument. */}
            <div className="border-b border-border-strong bg-background px-7 py-8">
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-6xl font-bold leading-none tracking-tight text-ink tabular-nums sm:text-7xl">
                  {regularsShown}
                </span>
                <p className="t-card-title text-pretty text-ink">
                  {t("landing.calculator.result.headline", {
                    count: regularsShown,
                  })}
                </p>
              </div>

              <p className="mt-4 text-pretty text-sm text-ink-muted">
                {t("landing.calculator.result.regularsDetail", {
                  stamps: inputs.stamps,
                  ticket: money(inputs.ticket),
                  cardNet: money(animatedCardNet),
                  annual: PUNCHME_ANNUAL_PRICE,
                })}
              </p>
              <p className="mt-3 text-sm font-semibold text-primary-text">
                {t("landing.calculator.result.orMonthly", {
                  count: result.breakEvenVisits,
                })}
              </p>
            </div>

            <div className="px-7 py-7">
              <p className="t-eyebrow text-ink-subtle">
                {t("landing.calculator.result.cardTitle")}
              </p>
              <dl className="mt-4 flex flex-col gap-2">
                <ReceiptRow
                  label={t("landing.calculator.result.cardRevenue")}
                  amount={fig(animatedCardRevenue)}
                />
                <ReceiptRow
                  label={t("landing.calculator.result.cardNet")}
                  amount={fig(animatedCardNet)}
                  emphasis
                />
              </dl>

              <hr className="my-7 border-border" />

              <p className="t-eyebrow text-ink-subtle">
                {t("landing.calculator.result.projectionLabel", {
                  count: inputs.regulars,
                })}
              </p>

              <dl className="mt-4 flex flex-col gap-2">
                <ReceiptRow
                  label={t("landing.calculator.result.totalRevenue")}
                  amount={fig(animatedTotalRevenue)}
                />
                <ReceiptRow
                  label={t("landing.calculator.result.totalGross")}
                  amount={fig(animatedTotalGross)}
                  emphasis
                />
                <ReceiptRow
                  label={t("landing.calculator.result.rewardCost")}
                  amount={owed(animatedRewardCost)}
                  negative
                >
                  <button
                    type="button"
                    title={t("landing.calculator.result.rewardCostTooltip", {
                      amount: money(result.rewardCost),
                      stamps: inputs.stamps,
                    })}
                    aria-label={t("landing.calculator.result.rewardCostTooltip", {
                      amount: money(result.rewardCost),
                      stamps: inputs.stamps,
                    })}
                    className={cn(
                      // -my-3 keeps the 44px hit area from stretching the row.
                      "-my-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-ink-subtle transition-colors hover:text-ink",
                      focusRing,
                    )}
                  >
                    <Info size={14} aria-hidden="true" />
                  </button>
                </ReceiptRow>
                <ReceiptRow
                  label={t("landing.calculator.result.subscription")}
                  amount={owed(PUNCHME_ANNUAL_PRICE)}
                  negative
                />
              </dl>

              {/* A double rule before the total, the way a printed tally
                  closes. It is the one place on the page a border is doing
                  more than separating two things. */}
              <div className="mt-7 border-t-4 border-double border-border-strong pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="t-eyebrow text-ink">
                    {t("landing.calculator.result.net")}
                  </p>
                  <p
                    className={cn(
                      "t-figure text-3xl font-medium sm:text-4xl",
                      isNegative ? "text-red-800" : "text-primary-text",
                    )}
                  >
                    {formatSignedCurrency(animatedNet, locale)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {t("landing.calculator.result.netSub")}
                </p>
              </div>

              {isNegative && (
                <p className="mt-5 border-s-4 border-red-800 bg-red-50 p-4 text-pretty text-sm text-red-900">
                  {t("landing.calculator.result.negative", {
                    count: result.regularsToBreakEven,
                  })}
                </p>
              )}

              <Link to="/onboarding" className={ctaClasses("primary", "lg", "mt-7 w-full")}>
                {t("landing.hero.cta")}
              </Link>

              <p className="mt-4 text-pretty text-xs text-ink-subtle">
                {t("landing.calculator.result.footnote")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Debounced, so dragging doesn't produce a torrent. */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {dragging && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-strong bg-surface px-4 py-3 shadow-[0_-8px_24px_rgb(14_17_32/0.12)] lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-ink">
              {t("landing.calculator.result.regularsNeeded", {
                count: result.regularsToBreakEven,
              })}
            </span>
            <span
              className={cn(
                "t-figure text-sm font-semibold",
                isNegative ? "text-red-800" : "text-primary-text",
              )}
            >
              {formatSignedCurrency(result.netAnnual, locale)}
            </span>
          </div>
        </div>
      )}
    </Section>
  );
}
