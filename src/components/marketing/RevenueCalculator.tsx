import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronDown, Coffee, Dumbbell, Gift, Info, Scissors } from "lucide-react";
import { cn } from "../../lib/cn";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { Section, SectionHeader, ctaClasses, focusRing } from "./primitives";
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
 * The card the owner is designing, drawn live from the stamps slider.
 * It makes the abstract number concrete — you're not setting a variable,
 * you're deciding how long your card is.
 */
function PunchCardStrip({ stamps }: { stamps: number }) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-hidden="true"
    >
      {Array.from({ length: stamps - 1 }).map((_, i) => (
        <span
          key={i}
          className="h-5 w-5 rounded-full border-2 border-primary/40 bg-primary/10"
        />
      ))}
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-navy-deep">
        <Gift size={12} />
      </span>
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
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-ink">
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
            "min-h-[44px] w-24 rounded-lg border border-border bg-surface px-3 py-2 text-end text-sm font-semibold tabular-nums text-ink",
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
      {name === "stamps" && <PunchCardStrip stamps={value} />}
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
  const money = (v: number) => formatCurrency(v, locale);

  return (
    <Section id="calculator">
      <SectionHeader
        eyebrow={t("landing.calculator.eyebrow")}
        title={t("landing.calculator.title")}
        lead={t("landing.calculator.lead")}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        {/* ── Inputs ─────────────────────────────────────────────────── */}
        <div
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).tagName === "INPUT") setDragging(true);
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-muted">
              {t("landing.calculator.presetsLabel")}
            </span>
            {(Object.keys(CALCULATOR_PRESETS) as CalculatorPresetKey[]).map((key) => {
              const Icon = PRESET_ICONS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className={cn(
                    "inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary-text motion-reduce:hover:translate-y-0",
                    focusRing,
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  {t(`landing.calculator.presets.${key}`)}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-8">
            {PRIMARY_KEYS.map((key) => (
              <SliderField
                key={key}
                name={key}
                label={t(`landing.calculator.inputs.${key}`)}
                value={inputs[key]}
                onChange={setField(key)}
              />
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

        {/* ── Results ────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lift">
            {/* The hero: assumption-free, and almost always a tiny number. */}
            <div className="border-b border-border bg-primary/[0.07] p-8">
              <p className="t-stat text-ink">
                {t("landing.calculator.result.regularsNeeded", {
                  count: regularsShown,
                })}
              </p>
              <p className="t-lead mt-2 text-pretty text-ink">
                {t("landing.calculator.result.regularsClaim")}
              </p>
              <p className="mt-3 text-pretty text-sm text-ink-muted">
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

            <div className="p-8">
              <p className="t-eyebrow text-ink-subtle">
                {t("landing.calculator.result.cardTitle")}
              </p>
              <dl className="mt-3 flex flex-col gap-1 text-sm tabular-nums">
                <dt className="font-semibold text-ink">
                  {t("landing.calculator.result.cardRevenue", {
                    amount: money(animatedCardRevenue),
                  })}
                </dt>
                <dd className="text-ink-muted">
                  {t("landing.calculator.result.cardNet", {
                    amount: money(animatedCardNet),
                  })}
                </dd>
              </dl>

              <hr className="my-6 border-border" />

              <p className="text-sm text-ink-subtle">
                {t("landing.calculator.result.projectionLabel", {
                  count: inputs.regulars,
                })}
              </p>

              <dl className="mt-4 flex flex-col gap-2.5 text-sm tabular-nums">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-muted">
                    {t("landing.calculator.result.totalRevenue", {
                      amount: money(animatedTotalRevenue),
                    })}
                  </dt>
                  <dd className="font-semibold text-ink">
                    {t("landing.calculator.result.totalGross", {
                      amount: money(animatedTotalGross),
                    })}
                  </dd>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    {t("landing.calculator.result.rewardCost", {
                      amount: money(animatedRewardCost),
                    })}
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
                  </dt>
                  <dd className="sr-only">
                    {t("landing.calculator.result.rewardCostWhy")}
                  </dd>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-muted">
                    {t("landing.calculator.result.subscription", {
                      amount: PUNCHME_ANNUAL_PRICE,
                    })}
                  </dt>
                  <dd />
                </div>
              </dl>

              <hr className="my-6 border-border" />

              <p
                className={cn(
                  "font-heading text-4xl font-semibold tabular-nums tracking-[-0.03em] sm:text-5xl",
                  isNegative ? "text-red-700" : "text-primary-text",
                )}
              >
                {t("landing.calculator.result.net", {
                  amount: formatSignedCurrency(animatedNet, locale),
                })}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {t("landing.calculator.result.netSub")}
              </p>

              {isNegative && (
                <p className="mt-4 rounded-xl bg-red-50 p-4 text-pretty text-sm text-red-800">
                  {t("landing.calculator.result.negative", {
                    count: result.regularsToBreakEven,
                  })}
                </p>
              )}

              <Link to="/login" className={ctaClasses("primary", "lg", "mt-7 w-full")}>
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
        <div className="fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border-t border-border bg-white px-4 py-3 shadow-[0_-8px_24px_rgb(14_17_32/0.12)] lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-ink">
              {t("landing.calculator.result.regularsNeeded", {
                count: result.regularsToBreakEven,
              })}
            </span>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                isNegative ? "text-red-700" : "text-primary-text",
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
