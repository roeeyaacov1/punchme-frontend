/**
 * Revenue calculator — pure arithmetic, no React, no I/O.
 *
 * The question this answers is "how many regulars does PunchMe need before
 * it pays for itself?", and the answer is almost always two or three. That
 * framing is deliberate: it needs no guess about adoption rates or visit
 * uplift, so there's nothing here an owner has to take on trust.
 *
 * An earlier version modelled incremental visits against a reward cost
 * charged at the full gross profit of an average ticket. It was structurally
 * unfair — it counted the whole cost of the scheme against only the
 * incremental benefit — and it returned a loss for any card with a short
 * stamp count regardless of how good the business was. See `rewardCost`.
 */

/** Subscription price, shekels per month. Also appears as a literal inside
 * `landing.pricing.body` in both locales; change them together. */
export const PUNCHME_MONTHLY_PRICE = 99;

/** A year of PunchMe — what the headline number has to clear. */
export const PUNCHME_ANNUAL_PRICE = PUNCHME_MONTHLY_PRICE * 12;

export interface CalculatorInputs {
  /** Average spend per visit, in shekels. */
  ticket: number;
  /** Stamps needed to earn the reward. */
  stamps: number;
  /** Customers expected to become regulars — to fill a card — this year. */
  regulars: number;
  /** Gross margin, as a percentage (0–100). */
  margin: number;
}

export interface CalculatorBound {
  min: number;
  max: number;
  step: number;
}

export const CALCULATOR_BOUNDS: Record<keyof CalculatorInputs, CalculatorBound> =
  {
    ticket: { min: 20, max: 500, step: 5 },
    stamps: { min: 5, max: 12, step: 1 },
    regulars: { min: 1, max: 100, step: 1 },
    margin: { min: 30, max: 90, step: 5 },
  };

export const CALCULATOR_DEFAULTS: CalculatorInputs = {
  ticket: 60,
  stamps: 10,
  regulars: 10,
  margin: 65,
};

/** Starting points per trade, so nobody meets a cold form. A café is a low
 * ticket at high frequency and high margin; a barbershop a mid ticket on a
 * roughly monthly cycle; a studio a high ticket at low frequency. */
export const CALCULATOR_PRESETS = {
  cafe: { ticket: 28, stamps: 10, regulars: 25, margin: 75 },
  barbershop: { ticket: 70, stamps: 8, regulars: 12, margin: 70 },
  studio: { ticket: 180, stamps: 6, regulars: 6, margin: 60 },
} as const satisfies Record<string, CalculatorInputs>;

export type CalculatorPresetKey = keyof typeof CALCULATOR_PRESETS;

/**
 * Force any value — a dragged slider, a typed field, a query-string
 * parameter, `NaN` from an emptied input — into range.
 *
 * Everything downstream assumes this has run; it's what keeps `NaN`,
 * `Infinity` and division by zero off the page.
 */
export function clampInput(key: keyof CalculatorInputs, raw: number): number {
  const { min, max } = CALCULATOR_BOUNDS[key];
  // An emptied number input parses to NaN and has no sensible bound, so it
  // falls back to the default. ±Infinity does have one, and clamps below.
  if (Number.isNaN(raw)) return CALCULATOR_DEFAULTS[key];
  if (raw < min) return min;
  if (raw > max) return max;
  return Math.round(raw);
}

/** Clamp a whole input set at once. */
export function clampInputs(raw: Partial<CalculatorInputs>): CalculatorInputs {
  const out = { ...CALCULATOR_DEFAULTS };
  for (const key of Object.keys(CALCULATOR_DEFAULTS) as (keyof CalculatorInputs)[]) {
    const value = raw[key];
    if (value !== undefined) out[key] = clampInput(key, value);
  }
  return out;
}

export interface CalculatorResult {
  /** Gross profit from one average visit. */
  grossPerVisit: number;
  /** Extra visits this month to cover one month's subscription. */
  breakEvenVisits: number;

  /** What one customer spends filling a whole card. */
  cardRevenue: number;
  /** Gross profit on that spend. */
  cardGross: number;
  /** What the free item costs you to provide. */
  rewardCost: number;
  /** Gross profit left from one regular, after their reward. */
  cardNet: number;

  /** THE HEADLINE: regulars needed to cover a year of PunchMe. */
  regularsToBreakEven: number;

  totalRevenue: number;
  totalGross: number;
  totalRewardCost: number;
  netAnnual: number;
}

export function calculate(rawInputs: CalculatorInputs): CalculatorResult {
  const { ticket, stamps, regulars, margin } = clampInputs(rawInputs);

  // Gross profit on one visit — revenue less what it cost to serve.
  const grossPerVisit = ticket * (margin / 100);

  // The monthly framing, kept as a supporting line.
  const breakEvenVisits =
    grossPerVisit > 0 ? Math.ceil(PUNCHME_MONTHLY_PRICE / grossPerVisit) : 1;

  // ── One filled card: what a single regular is actually worth ──
  // A customer pays for `stamps` visits and then receives the reward.
  const cardRevenue = stamps * ticket;
  const cardGross = cardRevenue * (margin / 100);

  // The reward costs you what the free item costs you to provide — its cost
  // of goods — not its shelf price and not its full gross profit. Charging
  // the latter assumes every redeemed reward replaced a sale the customer
  // would otherwise have paid for in full, which is exactly backwards: a
  // reward is claimed by someone who has already bought `stamps` times, and
  // for many of them the reward is why they came back at all.
  const rewardCost = ticket * (1 - margin / 100);

  const cardNet = cardGross - rewardCost;

  // How many regulars it takes to cover a year of subscription. cardNet is
  // always positive after clamping (min ticket 20 × min margin 30% over 5
  // stamps is ₪30 gross against a ₪14 reward), but the guard keeps a future
  // bounds change from printing Infinity.
  const regularsToBreakEven =
    cardNet > 0 ? Math.ceil(PUNCHME_ANNUAL_PRICE / cardNet) : 0;

  // ── The projection: one honest multiplication ──
  const totalRevenue = regulars * cardRevenue;
  const totalGross = regulars * cardGross;
  const totalRewardCost = regulars * rewardCost;

  // Not clamped at zero. Too few regulars genuinely doesn't cover the
  // subscription, and saying so is what makes the positive cases credible.
  const netAnnual = totalGross - totalRewardCost - PUNCHME_ANNUAL_PRICE;

  return {
    grossPerVisit,
    breakEvenVisits,
    cardRevenue,
    cardGross,
    rewardCost,
    cardNet,
    regularsToBreakEven,
    totalRevenue,
    totalGross,
    totalRewardCost,
    netAnnual,
  };
}

/** Whole shekels with thousands separators, in the active locale. */
export function formatCurrency(value: number, locale: string): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
    maximumFractionDigits: 0,
  }).format(safe);
}

/** Currency with its sign outside the shekel symbol.
 *
 * "₪-60" is what interpolating a negative into "₪{{amount}}" produces, and
 * it reads as a typo. Uses U+2212 to match the "−₪708" rows. */
export function formatSignedCurrency(value: number, locale: string): string {
  const rounded = Number.isFinite(value) ? Math.round(value) : 0;
  const magnitude = formatCurrency(Math.abs(rounded), locale);
  return rounded < 0 ? `−₪${magnitude}` : `₪${magnitude}`;
}
