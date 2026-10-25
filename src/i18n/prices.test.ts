import { describe, expect, it } from "vitest";
import { PUNCHME_MONTHLY_PRICE } from "../components/marketing/calculator";
import en from "./locales/en/common.json";
import he from "./locales/he/common.json";

/**
 * What an owner is charged is said in one place, `PUNCHME_MONTHLY_PRICE`,
 * and most of the copy interpolates it ("₪{{price}}"). The few strings that
 * write the price out (the landing's pricing band and FAQ, onboarding's
 * Activate) are checked against it here, in both languages, so a change to
 * the price can't leave a page that names the old one.
 */

/** Every shekel amount written out in a tree of copy, either side of the
 * sign, lists of bullets included. */
function literalPrices(tree: unknown, prefix = ""): { key: string; price: number }[] {
  if (!tree || typeof tree !== "object") return [];
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value !== "string") return literalPrices(value, path);
    return [...value.matchAll(/₪\s?(\d[\d,]*)|(\d[\d,]*)\s?₪/g)].map((match) => ({
      key: path,
      price: Number((match[1] ?? match[2]).replace(/,/g, "")),
    }));
  });
}

describe("literalPrices", () => {
  it("finds a price written out, and leaves an interpolated one alone", () => {
    expect(
      literalPrices({
        cta: "Activate for ₪59/month",
        price: "<ltr>₪{{price}}</ltr> a month",
        nested: { he: "הפעלה ב-1,188 ₪ לשנה" },
      }),
    ).toEqual([
      { key: "cta", price: 59 },
      { key: "nested.he", price: 1188 },
    ]);
  });
});

describe.each([
  ["English", en],
  ["Hebrew", he],
] as const)("the %s copy", (_language, copy) => {
  it("writes out no price but PUNCHME_MONTHLY_PRICE", () => {
    const found = literalPrices(copy);
    expect(found.length).toBeGreaterThan(0);
    for (const { key, price } of found) expect(price, key).toBe(PUNCHME_MONTHLY_PRICE);
  });
});
