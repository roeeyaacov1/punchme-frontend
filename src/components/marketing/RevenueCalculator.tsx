import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "../../lib/cn";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { Section, SectionHeader, ctaClasses, focusRing } from "./primitives";
import {
  CALCULATOR_BOUNDS,
  CALCULATOR_DEFAULTS,
  CALCULATOR_PRESETS,
  PUNCHME_MONTHLY_PRICE,
  calculate,
  clampInput,
  clampInputs,
  formatCurrency,
  formatSignedCurrency,
  formatVisits,
  type CalculatorInputs,
  type CalculatorPresetKey,
} from "./calculator";

const INPUT_KEYS = [
  "customers",
  "ticket",
  "visits",
  "margin",
  "stamps",
] as const;

/** Which a11y phrasing each input's `aria-valuetext` uses. */
const UNIT: Record<keyof CalculatorInputs, string> = {
  customers: "customers",
  ticket: "shekels",
  visits: "visits",
  margin: "percent",
  stamps: "stamps",
  adoption: "percent",
  lift: "percent",
};

/** Reads `?ticket=60&visits=1.5&…` so an owner can send themselves a result.
 * Read-only, and there's no personal data in it to leak. */
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

/** Eases a number to its new value over ~400ms. Interrupting mid-flight
 * resumes from whatever is currently painted rather than snapping back. */
function useAnimatedNumber(target: number, duration = 400) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    // Jump straight to the value when animating is either unwanted or
    // impossible: rAF is paused in a hidden tab, so easing there would leave
    // a stale number on screen until the tab is looked at again.
    if (
      reduced ||
      document.hidden ||
      Math.abs(currentRef.current - target) < 0.005
    ) {
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

  // The text field keeps its own draft so a half-typed "1" on the way to
  // "150" isn't clamped to the minimum mid-keystroke. It commits whenever
  // the draft is a valid in-range number, and normalises on blur.
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const valueText = t(`landing.calculator.a11y.${UNIT[name]}`, { value });
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <input
          type="number"
          inputMode="decimal"
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
        aria-valuetext={valueText}
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
  /** Fires only once the visitor has actually moved something, so the
   * pricing band can't claim to be "based on your numbers" otherwise. */
  onTouchedResult: (netMonthly: number) => void;
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
    setInputs((prev) => clampInputs({ ...prev, ...CALCULATOR_PRESETS[key] }));
  };

  // Mirror state into the query string, but only after a real interaction —
  // otherwise every visitor's URL grows a tail they never asked for.
  useEffect(() => {
    if (!touched) return;
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(inputs)) {
      params.set(key, String(value));
    }
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params}${window.location.hash}`,
    );
  }, [inputs, touched]);

  useEffect(() => {
    if (touched) onTouchedResult(result.netMonthly);
  }, [touched, result.netMonthly, onTouchedResult]);

  // Screen readers get the totals, but only once the numbers settle —
  // announcing every frame of a drag would be unusable.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncement(
        t("landing.calculator.a11y.summary", {
          breakEven: result.breakEvenVisits,
          net: formatCurrency(result.netMonthly, locale),
        }),
      );
    }, 500);
    return () => window.clearTimeout(timer);
  }, [result.breakEvenVisits, result.netMonthly, locale, t]);

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

  const animatedBreakEven = useAnimatedNumber(result.breakEvenVisits);
  const animatedExtraVisits = useAnimatedNumber(result.extraVisits);
  const animatedExtraRevenue = useAnimatedNumber(result.extraRevenue);
  const animatedRewardCost = useAnimatedNumber(result.rewardCost);
  const animatedNetMonthly = useAnimatedNumber(result.netMonthly);
  const animatedNetAnnual = useAnimatedNumber(result.netAnnual);

  const breakEvenRounded = Math.max(1, Math.round(animatedBreakEven));
  const isNegative = result.netMonthly < 0;
  const money = (value: number) => formatCurrency(value, locale);
  // Net can be negative, so its sign goes outside the shekel symbol.
  const signedMoney = (value: number) => formatSignedCurrency(value, locale);

  return (
    <Section id="calculator">
      <SectionHeader
        eyebrow={t("landing.calculator.eyebrow")}
        title={t("landing.calculator.title")}
        lead={t("landing.calculator.lead")}
      />

      <div className="grid gap-12 lg:grid-cols-2">
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
            {(Object.keys(CALCULATOR_PRESETS) as CalculatorPresetKey[]).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className={cn(
                    "inline-flex min-h-[44px] items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary-text",
                    focusRing,
                  )}
                >
                  {t(`landing.calculator.presets.${key}`)}
                </button>
              ),
            )}
          </div>

          <div className="mt-8 flex flex-col gap-7">
            {INPUT_KEYS.map((key) => (
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
                {t("landing.calculator.assumptions.title")}
              </span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className="shrink-0 text-ink-subtle transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="flex flex-col gap-7 px-5 pb-6">
              <p className="text-sm text-pretty text-ink-subtle">
                {t("landing.calculator.assumptions.note")}
              </p>
              <SliderField
                name="adoption"
                label={t("landing.calculator.inputs.adoption")}
                value={inputs.adoption}
                onChange={setField("adoption")}
              />
              <SliderField
                name="lift"
                label={t("landing.calculator.inputs.lift")}
                value={inputs.lift}
                onChange={setField("lift")}
              />
            </div>
          </details>
        </div>

        {/* ── Results ────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-lift">
            {/* 1 — the hero claim, and the only one that needs no assumption. */}
            <p className="t-stat text-ink">
              {t("landing.calculator.result.breakEvenVisits", {
                count: breakEvenRounded,
              })}
            </p>
            <p className="t-lead mt-2 text-pretty text-ink">
              {t("landing.calculator.result.breakEvenClaim")}
            </p>
            <p className="mt-3 text-sm text-pretty text-ink-muted">
              {t("landing.calculator.result.breakEvenDetail", {
                ticket: money(inputs.ticket),
                margin: inputs.margin,
                gross: money(result.grossPerVisit),
                price: PUNCHME_MONTHLY_PRICE,
              })}
            </p>

            <hr className="my-7 border-border" />

            {/* 2 — everything below here depends on the two assumptions. */}
            <p className="text-sm text-ink-subtle">
              {t("landing.calculator.result.ifLabel", { lift: inputs.lift })}
            </p>

            <dl className="mt-4 flex flex-col gap-2.5 text-sm tabular-nums">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-muted">
                  {t("landing.calculator.result.extraVisits", {
                    visits: formatVisits(animatedExtraVisits, locale),
                  })}
                </dt>
                <dd className="font-semibold text-ink">
                  {t("landing.calculator.result.extraRevenue", {
                    amount: money(animatedExtraRevenue),
                  })}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-ink-muted">
                  {t("landing.calculator.result.rewardCost", {
                    amount: money(animatedRewardCost),
                  })}
                  {/* Native title tooltip: no dependency, and it reaches
                      keyboard users via the button's accessible name. */}
                  <button
                    type="button"
                    title={t("landing.calculator.result.rewardCostTooltip")}
                    aria-label={t("landing.calculator.result.rewardCostTooltip")}
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
                    amount: PUNCHME_MONTHLY_PRICE,
                  })}
                </dt>
                <dd />
              </div>
            </dl>

            <hr className="my-7 border-border" />

            <p
              className={cn(
                "font-heading text-3xl font-semibold tracking-[-0.025em] tabular-nums sm:text-4xl",
                isNegative ? "text-red-700" : "text-primary-text",
              )}
            >
              {t("landing.calculator.result.net", {
                amount: signedMoney(animatedNetMonthly),
              })}
            </p>
            <p className="mt-1 text-sm tabular-nums text-ink-muted">
              {t("landing.calculator.result.netAnnual", {
                amount: signedMoney(animatedNetAnnual),
              })}
            </p>

            {isNegative && (
              <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-pretty text-red-800">
                {t("landing.calculator.result.negative")}
              </p>
            )}

            <Link
              to="/login"
              className={ctaClasses("primary", "lg", "mt-7 w-full")}
            >
              {t("landing.hero.cta")}
            </Link>

            <p className="mt-4 text-xs text-pretty text-ink-subtle">
              {t("landing.calculator.result.footnote")}
            </p>
          </div>
        </div>
      </div>

      {/* Debounced, so dragging a slider doesn't produce a torrent. */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {dragging && (
        <div className="fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border-t border-border bg-white px-4 py-3 shadow-[0_-8px_24px_rgb(14_17_32/0.12)] lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-ink">
              {t("landing.calculator.result.breakEvenVisits", {
                count: breakEvenRounded,
              })}
            </span>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                isNegative ? "text-red-700" : "text-primary-text",
              )}
            >
              {t("landing.calculator.result.net", {
                amount: signedMoney(result.netMonthly),
              })}
            </span>
          </div>
        </div>
      )}
    </Section>
  );
}
