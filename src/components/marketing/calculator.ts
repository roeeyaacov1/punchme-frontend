/**
 * Revenue calculator — pure arithmetic, no React, no I/O.
 *
 * Split out from the component so the model can be unit-tested and so the
 * numbers on the page are auditable in one place. Nothing here touches the
 * network: the whole calculation runs in the visitor's browser.
 */

/** The subscription price, in shekels per month.
 *
 * Single source of truth for the maths. The price also appears as a literal
 * inside the `landing.pricing.body` translation (both languages) because it
 * sits mid-sentence there; if this constant changes, those two strings have
 * to change with it. */
export const PUNCHME_MONTHLY_PRICE = 59;

export interface CalculatorInputs {
  /** Different customers served in a month. */
  customers: number;
  /** Average spend per visit, in shekels. */
  ticket: number;
  /** Times an average customer comes back per month today. */
  visits: number;
  /** Gross margin, as a percentage (0–100). */
  margin: number;
  /** Stamps needed to earn the reward. */
  stamps: number;
  /** Share of customers who join the card, as a percentage. */
  adoption: number;
  /** How much more often joiners visit, as a percentage. */
  lift: number;
}

export interface CalculatorBound {
  min: number;
  max: number;
  step: number;
}

export const CALCULATOR_BOUNDS: Record<keyof CalculatorInputs, CalculatorBound> =
  {
    customers: { min: 20, max: 1000, step: 10 },
    ticket: { min: 20, max: 500, step: 5 },
    visits: { min: 0.5, max: 8, step: 0.5 },
    margin: { min: 30, max: 90, step: 5 },
    stamps: { min: 5, max: 12, step: 1 },
    adoption: { min: 10, max: 90, step: 5 },
    lift: { min: 5, max: 50, step: 5 },
  };

export const CALCULATOR_DEFAULTS: CalculatorInputs = {
  customers: 150,
  ticket: 60,
  visits: 1.5,
  margin: 65,
  stamps: 10,
  adoption: 40,
  lift: 20,
};

/** Sensible starting points per trade, so nobody meets a cold form.
 *
 * A café is a low ticket at high frequency and high margin; a barbershop a
 * mid ticket at roughly monthly frequency; a studio a high ticket at low
 * frequency. Adoption and lift are left at the defaults for all three —
 * they're the honest unknowns and shouldn't vary by preset. */
export const CALCULATOR_PRESETS = {
  cafe: { customers: 300, ticket: 28, visits: 4, margin: 75, stamps: 10 },
  barbershop: { customers: 150, ticket: 70, visits: 1, margin: 70, stamps: 8 },
  studio: { customers: 60, ticket: 180, visits: 0.5, margin: 60, stamps: 6 },
} as const satisfies Record<string, Omit<CalculatorInputs, "adoption" | "lift">>;

export type CalculatorPresetKey = keyof typeof CALCULATOR_PRESETS;

/**
 * Force any value — a dragged slider, a typed field, a query-string
 * parameter, `NaN` from an empty input — into the valid range for its input.
 *
 * Everything downstream assumes this has run, which is what keeps `NaN`,
 * `Infinity` and division by zero off the page.
 */
export function clampInput(key: keyof CalculatorInputs, raw: number): number {
  const { min, max } = CALCULATOR_BOUNDS[key];
  // An emptied number input parses to NaN — there's no sensible bound to
  // pick, so fall back to the default. ±Infinity does have a sensible
  // bound, and the comparisons below clamp it like any other extreme value.
  if (Number.isNaN(raw)) return CALCULATOR_DEFAULTS[key];
  if (raw < min) return min;
  if (raw > max) return max;
  // `visits` is the only half-step input; rounding it to one decimal keeps a
  // typed 1.4999 from rendering as "1.5" while calculating as something else.
  return key === "visits" ? Math.round(raw * 10) / 10 : raw;
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
  /** Visits a month across all customers, before the card changes anything. */
  baselineVisits: number;
  baselineRevenue: number;
  /** Gross profit contributed by one average visit. */
  grossPerVisit: number;
  /** Extra visits needed this month to cover the subscription. No growth
   * assumption involved — this is the headline number. */
  breakEvenVisits: number;
  joiners: number;
  extraVisits: number;
  extraRevenue: number;
  extraGross: number;
  rewardsRedeemed: number;
  rewardCost: number;
  netMonthly: number;
  netAnnual: number;
}

/**
 * The model.
 *
 * Two deliberate choices, both of which cost us a bigger headline number:
 *
 * 1. The headline is break-even, not the projection. It needs no assumption
 *    about adoption or lift — it's just `price ÷ gross profit per visit`.
 * 2. The reward cost is charged at the full gross profit of an average
 *    ticket (see `rewardCost` below), which overstates it.
 */
export function calculate(rawInputs: CalculatorInputs): CalculatorResult {
  const { customers, ticket, visits, margin, stamps, adoption, lift } =
    clampInputs(rawInputs);

  // Where the business is today, with no card at all.
  const baselineVisits = customers * visits;
  const baselineRevenue = baselineVisits * ticket;

  // Gross profit from one average visit — revenue less the cost of serving it.
  const grossPerVisit = ticket * (margin / 100);

  // ── The headline: break-even, assumption-free ──
  // How many extra visits this month it takes to cover the subscription.
  // grossPerVisit can't reach 0 after clamping (min ticket 20 × min margin
  // 30% = ₪6), but the guard keeps a future bounds change from printing ∞.
  const breakEvenVisits =
    grossPerVisit > 0 ? Math.ceil(PUNCHME_MONTHLY_PRICE / grossPerVisit) : 0;

  // ── The projection: depends on the two assumptions the user controls ──
  const joiners = customers * (adoption / 100);
  const extraVisits = joiners * visits * (lift / 100);
  const extraRevenue = extraVisits * ticket;
  const extraGross = extraVisits * grossPerVisit;

  // Reward cost. Conservative on purpose: assume a redeemed reward displaces
  // a sale the customer would otherwise have paid for, so the cost is the
  // full gross profit of one average ticket, not just COGS. In reality the
  // reward is usually a single item, and some redeemers only came back
  // because of it — so the true cost is lower than this line claims.
  const joinerVisits = joiners * visits * (1 + lift / 100);
  const rewardsRedeemed = joinerVisits / stamps;
  const rewardCost = rewardsRedeemed * grossPerVisit;

  // Not clamped at zero. Thin margins, a low ticket or a short stamp count
  // genuinely can put this underwater, and hiding that would make every
  // positive result less believable.
  const netMonthly = extraGross - rewardCost - PUNCHME_MONTHLY_PRICE;
  const netAnnual = netMonthly * 12;

  return {
    baselineVisits,
    baselineRevenue,
    grossPerVisit,
    breakEvenVisits,
    joiners,
    extraVisits,
    extraRevenue,
    extraGross,
    rewardsRedeemed,
    rewardCost,
    netMonthly,
    netAnnual,
  };
}

/** Whole shekels with thousands separators. Locale follows the active
 * language so Hebrew gets he-IL grouping. */
export function formatCurrency(value: number, locale: string): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
    maximumFractionDigits: 0,
  }).format(safe);
}

/** Currency with its sign in front of the shekel symbol.
 *
 * `₪-60` is what you get from interpolating a negative number into a
 * "₪{{amount}}" template, and it reads as a typo. The sign belongs outside
 * the symbol, and it uses U+2212 to match the "−₪59" rows above it. */
export function formatSignedCurrency(value: number, locale: string): string {
  const rounded = Number.isFinite(value) ? Math.round(value) : 0;
  const magnitude = formatCurrency(Math.abs(rounded), locale);
  return rounded < 0 ? `−₪${magnitude}` : `₪${magnitude}`;
}

/** Visit counts to one decimal, trailing `.0` dropped. */
export function formatVisits(value: number, locale: string): string {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
    maximumFractionDigits: 1,
  }).format(Math.round(safe * 10) / 10);
}
