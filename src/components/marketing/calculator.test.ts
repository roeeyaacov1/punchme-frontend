import { describe, expect, it } from "vitest";
import {
  CALCULATOR_BOUNDS,
  CALCULATOR_DEFAULTS,
  CALCULATOR_PRESETS,
  PUNCHME_ANNUAL_PRICE,
  PUNCHME_MONTHLY_PRICE,
  calculate,
  clampInput,
  clampInputs,
  formatSignedCurrency,
  type CalculatorInputs,
} from "./calculator";

const withDefaults = (over: Partial<CalculatorInputs> = {}): CalculatorInputs => ({
  ...CALCULATOR_DEFAULTS,
  ...over,
});

describe("the documented default case", () => {
  const r = calculate(CALCULATOR_DEFAULTS);

  it("values one filled card correctly", () => {
    // 10 stamps × ₪60 = ₪600 spent filling the card.
    expect(r.cardRevenue).toBe(600);
    // At 65% margin that's ₪390 of gross profit.
    expect(r.cardGross).toBeCloseTo(390, 6);
    // The free item costs what it costs to provide: ₪60 × 35% = ₪21.
    expect(r.rewardCost).toBeCloseTo(21, 6);
    expect(r.cardNet).toBeCloseTo(369, 6);
  });

  it("needs 4 regulars to cover a year", () => {
    // ₪1,188 a year ÷ ₪369 per regular = 3.2, so 4 clears it.
    expect(PUNCHME_ANNUAL_PRICE).toBe(1_188);
    expect(r.regularsToBreakEven).toBe(4);
  });

  it("projects a clearly positive year at the default 10 regulars", () => {
    expect(r.totalRevenue).toBe(6_000);
    expect(r.totalGross).toBeCloseTo(3_900, 6);
    expect(r.totalRewardCost).toBeCloseTo(210, 6);
    expect(r.netAnnual).toBeCloseTo(2_502, 6);
    expect(r.netAnnual).toBeGreaterThan(0);
  });

  it("still supports the monthly framing", () => {
    // ₪60 × 65% = ₪39 per visit; ₪99 ÷ ₪39 = 2.5, so 3 visits.
    expect(r.grossPerVisit).toBeCloseTo(39, 6);
    expect(r.breakEvenVisits).toBe(3);
  });
});

describe("the regression that prompted the rebuild", () => {
  it("shows the Studio preset as clearly profitable, not a loss", () => {
    // The previous model returned exactly −₪59/month here, because its
    // reward cost cancelled its incremental gain whenever stamps equalled
    // (1 + lift) / lift. A 6-stamp card was guaranteed to look like a loss.
    const r = calculate(CALCULATOR_PRESETS.studio);
    expect(r.netAnnual).toBeGreaterThan(0);
    expect(r.regularsToBreakEven).toBeLessThanOrEqual(3);
  });

  it("never punishes a shorter card with a worse break-even", () => {
    // Fewer stamps means a smaller card, so it should take *more* regulars
    // to cover the year — monotonic, never a cliff.
    for (let stamps = 6; stamps <= 12; stamps += 1) {
      const shorter = calculate(withDefaults({ stamps: stamps - 1 }));
      const longer = calculate(withDefaults({ stamps }));
      expect(longer.cardNet).toBeGreaterThan(shorter.cardNet);
      expect(longer.regularsToBreakEven).toBeLessThanOrEqual(
        shorter.regularsToBreakEven,
      );
    }
  });

  it("costs a reward at cost of goods, never at full gross profit", () => {
    const r = calculate(CALCULATOR_DEFAULTS);
    // The old model charged grossPerVisit (₪39) per reward. Cost of goods
    // is ₪21. If these ever swap the whole page turns pessimistic again.
    expect(r.rewardCost).toBeLessThan(r.grossPerVisit);
    expect(r.rewardCost).toBeCloseTo(
      CALCULATOR_DEFAULTS.ticket * (1 - CALCULATOR_DEFAULTS.margin / 100),
      6,
    );
  });
});

describe("every preset is attractive", () => {
  it("lands inside its slider bounds", () => {
    for (const [name, preset] of Object.entries(CALCULATOR_PRESETS)) {
      for (const [key, value] of Object.entries(preset)) {
        const { min, max } = CALCULATOR_BOUNDS[key as keyof CalculatorInputs];
        expect(value, `${name}.${key}`).toBeGreaterThanOrEqual(min);
        expect(value, `${name}.${key}`).toBeLessThanOrEqual(max);
      }
    }
  });

  it("shows a positive year and a low bar for every trade", () => {
    // A preset that opens on a loss is worse than no preset at all — it's
    // the first thing an owner clicks.
    for (const [name, preset] of Object.entries(CALCULATOR_PRESETS)) {
      const r = calculate(preset);
      expect(r.netAnnual, `${name} netAnnual`).toBeGreaterThan(0);
      // Was 5 at ₪59. The café preset — the thinnest ticket of the four —
      // now needs 6, which is the honest cost of the price going up.
      expect(r.regularsToBreakEven, `${name} regulars`).toBeLessThanOrEqual(6);
      expect(r.breakEvenVisits, `${name} visits`).toBeLessThanOrEqual(5);
    }
  });
});

describe("break-even is assumption-free", () => {
  it("ignores how many regulars the visitor projects", () => {
    const few = calculate(withDefaults({ regulars: 1 }));
    const many = calculate(withDefaults({ regulars: 100 }));
    expect(few.regularsToBreakEven).toBe(many.regularsToBreakEven);
    expect(few.cardNet).toBeCloseTo(many.cardNet, 6);
  });

  it("always genuinely covers the year at the stated count", () => {
    for (let ticket = 20; ticket <= 500; ticket += 5) {
      for (let margin = 30; margin <= 90; margin += 5) {
        for (let stamps = 5; stamps <= 12; stamps += 1) {
          const r = calculate(withDefaults({ ticket, margin, stamps }));
          expect(r.regularsToBreakEven * r.cardNet).toBeGreaterThanOrEqual(
            PUNCHME_ANNUAL_PRICE,
          );
        }
      }
    }
  });

  it("stays inside two new regulars a week, even in the worst corner", () => {
    // Worst case is the ₪20 ticket / 30% margin / 5-stamp corner, which at
    // ₪99 needs 75 regulars a year — up from 45, and no longer inside one a
    // week. It renders fine, and it is exactly why no copy on the page
    // promises "just two" as a universal claim: the count is always
    // interpolated from the visitor's own numbers, never hard-coded.
    let worst = 0;
    for (let ticket = 20; ticket <= 500; ticket += 5) {
      for (let margin = 30; margin <= 90; margin += 5) {
        for (let stamps = 5; stamps <= 12; stamps += 1) {
          worst = Math.max(
            worst,
            calculate(withDefaults({ ticket, margin, stamps }))
              .regularsToBreakEven,
          );
        }
      }
    }
    expect(worst).toBeLessThanOrEqual(104);
  });
});

describe("bounds", () => {
  it("handles ticket at both ends", () => {
    // ₪20 × 65% = ₪13/visit → ceil(99/13) = 8 visits.
    expect(calculate(withDefaults({ ticket: 20 })).breakEvenVisits).toBe(8);
    expect(calculate(withDefaults({ ticket: 500 })).breakEvenVisits).toBe(1);
  });

  it("handles margin at both ends", () => {
    expect(calculate(withDefaults({ margin: 30 })).breakEvenVisits).toBe(6);
    expect(calculate(withDefaults({ margin: 90 })).breakEvenVisits).toBe(2);
    // A thin margin must never beat a fat one.
    expect(calculate(withDefaults({ margin: 30 })).netAnnual).toBeLessThan(
      calculate(withDefaults({ margin: 90 })).netAnnual,
    );
  });

  it("handles stamps at both ends", () => {
    expect(calculate(withDefaults({ stamps: 5 })).cardRevenue).toBe(300);
    expect(calculate(withDefaults({ stamps: 12 })).cardRevenue).toBe(720);
  });

  it("reports a genuine loss at one regular rather than hiding it", () => {
    const r = calculate(withDefaults({ ticket: 20, margin: 30, stamps: 5, regulars: 1 }));
    expect(r.netAnnual).toBeLessThan(0);
    // …and tells the owner exactly how many they'd need instead.
    expect(r.regularsToBreakEven).toBeGreaterThan(1);
  });
});

describe("typed input above and below range", () => {
  it("clamps in both directions", () => {
    expect(clampInput("ticket", 9_999)).toBe(500);
    expect(clampInput("ticket", 1)).toBe(20);
    expect(clampInput("stamps", 99)).toBe(12);
    expect(clampInput("stamps", 0)).toBe(5);
    expect(clampInput("regulars", 0)).toBe(1);
    expect(clampInput("regulars", 5_000)).toBe(100);
    expect(clampInput("margin", -40)).toBe(30);
    expect(clampInput("margin", 1_000)).toBe(90);
  });

  it("falls back to the default for an empty field, clamps infinities", () => {
    expect(clampInput("ticket", Number.NaN)).toBe(CALCULATOR_DEFAULTS.ticket);
    expect(clampInput("margin", Number.NaN)).toBe(CALCULATOR_DEFAULTS.margin);
    expect(clampInput("ticket", Number.POSITIVE_INFINITY)).toBe(500);
    expect(clampInput("ticket", Number.NEGATIVE_INFINITY)).toBe(20);
  });

  it("keeps every input a whole number", () => {
    // Half a stamp and 2.7 regulars are both nonsense on the page.
    expect(clampInput("regulars", 2.7)).toBe(3);
    expect(clampInput("stamps", 7.4)).toBe(7);
    expect(clampInput("ticket", 61.5)).toBe(62);
  });

  it("ignores missing keys when restoring from a query string", () => {
    expect(clampInputs({})).toEqual(CALCULATOR_DEFAULTS);
    expect(clampInputs({ ticket: 80 })).toEqual(withDefaults({ ticket: 80 }));
  });
});

describe("no NaN, Infinity or nonsense anywhere", () => {
  it("survives every input at both extremes", () => {
    const keys = Object.keys(CALCULATOR_BOUNDS) as (keyof CalculatorInputs)[];
    const cases: CalculatorInputs[] = [
      withDefaults(),
      withDefaults(Object.fromEntries(keys.map((k) => [k, CALCULATOR_BOUNDS[k].min]))),
      withDefaults(Object.fromEntries(keys.map((k) => [k, CALCULATOR_BOUNDS[k].max]))),
      ...keys.flatMap((k) => [
        withDefaults({ [k]: CALCULATOR_BOUNDS[k].min }),
        withDefaults({ [k]: CALCULATOR_BOUNDS[k].max }),
      ]),
    ];

    for (const input of cases) {
      const r = calculate(input);
      for (const [field, value] of Object.entries(r)) {
        expect(Number.isFinite(value), `${field} on ${JSON.stringify(input)}`).toBe(true);
      }
      // Physical quantities can never go negative, whatever net does.
      expect(r.cardRevenue).toBeGreaterThan(0);
      expect(r.cardNet).toBeGreaterThan(0);
      expect(r.rewardCost).toBeGreaterThan(0);
      expect(r.regularsToBreakEven).toBeGreaterThanOrEqual(1);
      expect(r.breakEvenVisits).toBeGreaterThanOrEqual(1);
    }
  });

  it("puts the minus sign outside the shekel symbol", () => {
    expect(formatSignedCurrency(-1_188, "en")).toBe("−₪1,188");
    expect(formatSignedCurrency(2_502, "en")).toBe("₪2,502");
    expect(formatSignedCurrency(Number.NaN, "he")).toBe("₪0");
  });

  it("keeps the monthly price and annual price in step", () => {
    expect(PUNCHME_ANNUAL_PRICE).toBe(PUNCHME_MONTHLY_PRICE * 12);
  });
});
