import { describe, expect, it } from "vitest";
import {
  CALCULATOR_BOUNDS,
  CALCULATOR_DEFAULTS,
  CALCULATOR_PRESETS,
  PUNCHME_MONTHLY_PRICE,
  calculate,
  clampInput,
  clampInputs,
  formatSignedCurrency,
  formatVisits,
  type CalculatorInputs,
} from "./calculator";

const withDefaults = (over: Partial<CalculatorInputs> = {}): CalculatorInputs => ({
  ...CALCULATOR_DEFAULTS,
  ...over,
});

describe("the documented default case", () => {
  const r = calculate(CALCULATOR_DEFAULTS);

  it("matches the worked example in the spec", () => {
    // 150 customers × 1.5 visits = 225 visits, at ₪60 = ₪13,500 today.
    expect(r.baselineVisits).toBe(225);
    expect(r.baselineRevenue).toBe(13_500);
    // ₪60 × 65% = ₪39 of gross profit per visit.
    expect(r.grossPerVisit).toBeCloseTo(39, 6);
    // ₪59 ÷ ₪39 = 1.51, so 2 extra visits clears the subscription.
    expect(r.breakEvenVisits).toBe(2);
  });

  it("projects the headline figures the results card renders", () => {
    expect(r.joiners).toBeCloseTo(60, 6);
    expect(r.extraVisits).toBeCloseTo(18, 6);
    expect(r.extraRevenue).toBeCloseTo(1_080, 6);
    expect(r.extraGross).toBeCloseTo(702, 6);
    expect(r.rewardsRedeemed).toBeCloseTo(10.8, 6);
    expect(r.rewardCost).toBeCloseTo(421.2, 6);
    expect(r.netMonthly).toBeCloseTo(221.8, 6);
    expect(r.netAnnual).toBeCloseTo(2_661.6, 6);
  });
});

describe("break-even is assumption-free", () => {
  it("ignores adoption and lift entirely", () => {
    const pessimistic = calculate(withDefaults({ adoption: 10, lift: 5 }));
    const optimistic = calculate(withDefaults({ adoption: 90, lift: 50 }));
    expect(pessimistic.breakEvenVisits).toBe(optimistic.breakEvenVisits);
  });

  it("needs 5 visits at a ₪20 ticket and 1 at a ₪500 ticket", () => {
    // ₪20 × 65% = ₪13 per visit → ceil(59/13) = 5.
    expect(calculate(withDefaults({ ticket: 20 })).breakEvenVisits).toBe(5);
    // ₪500 × 65% = ₪325 per visit → a single visit covers the month.
    expect(calculate(withDefaults({ ticket: 500 })).breakEvenVisits).toBe(1);
  });

  it("always covers the subscription at the break-even count", () => {
    // The point of the claim: break-even visits × gross per visit ≥ ₪59.
    for (let ticket = 20; ticket <= 500; ticket += 5) {
      for (let margin = 30; margin <= 90; margin += 5) {
        const r = calculate(withDefaults({ ticket, margin }));
        expect(r.breakEvenVisits * r.grossPerVisit).toBeGreaterThanOrEqual(
          PUNCHME_MONTHLY_PRICE,
        );
      }
    }
  });
});

describe("margin at both bounds", () => {
  it("takes 4 visits at 30% margin and 2 at 90%", () => {
    // ₪60 × 30% = ₪18 → ceil(59/18) = 4.
    expect(calculate(withDefaults({ margin: 30 })).breakEvenVisits).toBe(4);
    // ₪60 × 90% = ₪54 → ceil(59/54) = 2.
    expect(calculate(withDefaults({ margin: 90 })).breakEvenVisits).toBe(2);
  });

  it("gives a thin-margin shop a worse net than a fat-margin one", () => {
    const thin = calculate(withDefaults({ margin: 30 }));
    const fat = calculate(withDefaults({ margin: 90 }));
    expect(thin.netMonthly).toBeLessThan(fat.netMonthly);
  });
});

describe("stamps at both bounds", () => {
  it("goes negative at 5 stamps and positive at 12", () => {
    // A 5-stamp card gives a reward away every 5 visits; at a 20% lift the
    // rewards cost more gross profit than the extra visits bring in.
    const short = calculate(withDefaults({ stamps: 5 }));
    expect(short.rewardCost).toBeCloseTo(842.4, 6);
    expect(short.netMonthly).toBeCloseTo(-199.4, 6);
    expect(short.netMonthly).toBeLessThan(0);

    const long = calculate(withDefaults({ stamps: 12 }));
    expect(long.rewardCost).toBeCloseTo(351, 6);
    expect(long.netMonthly).toBeCloseTo(292, 6);
    expect(long.netMonthly).toBeGreaterThan(0);
  });

  it("makes stamp count the biggest single lever, as the negative-case copy claims", () => {
    // The failure-state message tells the owner to raise their stamp count.
    // If that were ever untrue the copy would be lying, so assert it.
    const base = withDefaults({ stamps: 5 });
    for (let stamps = 6; stamps <= 12; stamps += 1) {
      expect(calculate({ ...base, stamps }).netMonthly).toBeGreaterThan(
        calculate({ ...base, stamps: stamps - 1 }).netMonthly,
      );
    }
  });
});

describe("negative results are reported, not hidden", () => {
  it("returns a genuinely negative net rather than clamping to zero", () => {
    const r = calculate(withDefaults({ ticket: 20, margin: 30, stamps: 5 }));
    expect(r.netMonthly).toBeLessThan(0);
    expect(r.netAnnual).toBeCloseTo(r.netMonthly * 12, 6);
  });
});

describe("typed input above and below range", () => {
  it("clamps a typed value to its bound in both directions", () => {
    expect(clampInput("ticket", 9_999)).toBe(500);
    expect(clampInput("ticket", 1)).toBe(20);
    expect(clampInput("customers", 0)).toBe(20);
    expect(clampInput("customers", 100_000)).toBe(1_000);
    expect(clampInput("stamps", 99)).toBe(12);
    expect(clampInput("margin", -40)).toBe(30);
    expect(clampInput("visits", 12)).toBe(8);
    expect(clampInput("visits", 0)).toBe(0.5);
  });

  it("falls back to the default for a non-numeric or empty field", () => {
    // An emptied number input parses to NaN; a runaway expression to ±∞.
    expect(clampInput("ticket", Number.NaN)).toBe(CALCULATOR_DEFAULTS.ticket);
    expect(clampInput("visits", Number.POSITIVE_INFINITY)).toBe(8);
    expect(clampInput("visits", Number.NEGATIVE_INFINITY)).toBe(0.5);
    expect(clampInput("margin", Number.NaN)).toBe(CALCULATOR_DEFAULTS.margin);
  });

  it("rounds visits to one decimal so the label matches the maths", () => {
    expect(clampInput("visits", 1.4999)).toBe(1.5);
    expect(clampInput("visits", 2.34)).toBe(2.3);
  });

  it("ignores unknown or missing keys when restoring from a query string", () => {
    expect(clampInputs({})).toEqual(CALCULATOR_DEFAULTS);
    expect(clampInputs({ ticket: 80 })).toEqual(withDefaults({ ticket: 80 }));
  });
});

describe("no NaN, Infinity or negative visit counts anywhere", () => {
  it("survives every input at both extremes", () => {
    const keys = Object.keys(CALCULATOR_BOUNDS) as (keyof CalculatorInputs)[];
    // Each input pushed to each bound in turn, plus the all-min and all-max
    // corners — 16 cases covering every edge the sliders can reach.
    const cases: CalculatorInputs[] = [
      withDefaults(),
      withDefaults(
        Object.fromEntries(keys.map((k) => [k, CALCULATOR_BOUNDS[k].min])),
      ),
      withDefaults(
        Object.fromEntries(keys.map((k) => [k, CALCULATOR_BOUNDS[k].max])),
      ),
      ...keys.flatMap((k) => [
        withDefaults({ [k]: CALCULATOR_BOUNDS[k].min }),
        withDefaults({ [k]: CALCULATOR_BOUNDS[k].max }),
      ]),
    ];

    for (const input of cases) {
      const r = calculate(input);
      for (const [field, value] of Object.entries(r)) {
        expect(Number.isFinite(value), `${field} on ${JSON.stringify(input)}`).toBe(
          true,
        );
      }
      // Visit counts are physical quantities — they can never go below zero,
      // whatever the net result does.
      expect(r.baselineVisits).toBeGreaterThanOrEqual(0);
      expect(r.extraVisits).toBeGreaterThanOrEqual(0);
      expect(r.joiners).toBeGreaterThanOrEqual(0);
      expect(r.rewardsRedeemed).toBeGreaterThanOrEqual(0);
      expect(r.breakEvenVisits).toBeGreaterThanOrEqual(1);
    }
  });

  it("puts the minus sign outside the shekel symbol, never inside", () => {
    // "₪-60" reads as a typo; "−₪60" reads as money.
    expect(formatSignedCurrency(-60, "en")).toBe("−₪60");
    expect(formatSignedCurrency(221.8, "en")).toBe("₪222");
    expect(formatSignedCurrency(0, "en")).toBe("₪0");
    expect(formatSignedCurrency(Number.NaN, "he")).toBe("₪0");
    // Thousands separators survive the sign handling.
    expect(formatSignedCurrency(-2661.6, "en")).toBe("−₪2,662");
  });

  it("never formats a garbage value into the DOM", () => {
    expect(formatVisits(Number.NaN, "en")).toBe("0");
    expect(formatVisits(-5, "en")).toBe("0");
    expect(formatVisits(Number.POSITIVE_INFINITY, "he")).toBe("0");
  });
});

describe("presets", () => {
  it("every preset lands inside its slider bounds", () => {
    for (const [name, preset] of Object.entries(CALCULATOR_PRESETS)) {
      for (const [key, value] of Object.entries(preset)) {
        const { min, max } = CALCULATOR_BOUNDS[key as keyof CalculatorInputs];
        expect(value, `${name}.${key}`).toBeGreaterThanOrEqual(min);
        expect(value, `${name}.${key}`).toBeLessThanOrEqual(max);
      }
    }
  });

  it("every preset breaks even inside a single month of normal trade", () => {
    // If a preset needed more extra visits than the shop gets in a month,
    // the headline claim would read as absurd for that trade.
    for (const [name, preset] of Object.entries(CALCULATOR_PRESETS)) {
      const r = calculate(withDefaults(preset));
      expect(r.breakEvenVisits, name).toBeLessThan(r.baselineVisits);
    }
  });
});
