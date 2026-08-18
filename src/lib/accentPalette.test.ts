import { describe, expect, it } from "vitest";
import {
  accentFits,
  BRAND_GOLD,
  CARD_BACKGROUNDS,
  derivedLabelColor,
  relatedAccents,
} from "./accentPalette";
import { contrastRatio, HEX_RE, readableInk } from "./color";

describe("CARD_BACKGROUNDS", () => {
  it("are ten distinct full hex colours", () => {
    expect(CARD_BACKGROUNDS).toHaveLength(10);
    const hexes = CARD_BACKGROUNDS.map((b) => b.hex);
    expect(new Set(hexes).size).toBe(10);
    for (const hex of hexes) expect(hex).toMatch(HEX_RE);
  });
  it("carry ink the way the comments say: white on the first eight, navy on the last two", () => {
    CARD_BACKGROUNDS.slice(0, 8).forEach((b) => expect(readableInk(b.hex)).toBe("#FFFFFF"));
    CARD_BACKGROUNDS.slice(8).forEach((b) => expect(readableInk(b.hex)).toBe("#000000"));
  });
  it("every background gives its ink at least AA (4.5:1)", () => {
    for (const { hex } of CARD_BACKGROUNDS) {
      expect(contrastRatio(hex, readableInk(hex))).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("relatedAccents", () => {
  it.each(CARD_BACKGROUNDS.map((b) => [b.key, b.hex] as const))(
    "%s: at least six accents, all legible, none duplicated",
    (_key, hex) => {
      const accents = relatedAccents(hex);
      expect(accents.length).toBeGreaterThanOrEqual(6);
      expect(accents.length).toBeLessThanOrEqual(8);
      expect(new Set(accents).size).toBe(accents.length);
      for (const accent of accents) {
        expect(accent).toMatch(HEX_RE);
        expect(contrastRatio(accent, hex)).toBeGreaterThanOrEqual(3);
      }
    },
  );

  it("offers the brand gold wherever it clears 3:1, and never where it doesn't", () => {
    let offered = 0;
    for (const { hex } of CARD_BACKGROUNDS) {
      const passes = contrastRatio(BRAND_GOLD, hex) >= 3;
      expect(relatedAccents(hex).includes(BRAND_GOLD)).toBe(passes);
      if (passes) offered += 1;
    }
    // Six of the ten curated backgrounds take gold — the landing's stamp colour
    // should be the default on most cards, not an exotic option.
    expect(offered).toBeGreaterThanOrEqual(6);
  });

  it("does not offer gold on a light background where it would not read", () => {
    // Gold on cream is well under 3:1.
    expect(contrastRatio(BRAND_GOLD, "#F5EFE6")).toBeLessThan(3);
    expect(relatedAccents("#F5EFE6")).not.toContain(BRAND_GOLD);
  });

  it("is deterministic and depends on the background", () => {
    expect(relatedAccents("#4B2E1E")).toEqual(relatedAccents("#4B2E1E"));
    expect(relatedAccents("#4B2E1E")).not.toEqual(relatedAccents("#065F46"));
  });

  it("copes with a custom colour outside the curated set, and with garbage", () => {
    expect(relatedAccents("#7C5CBF").length).toBeGreaterThanOrEqual(6);
    expect(relatedAccents("not a colour").length).toBeGreaterThanOrEqual(6);
  });
});

describe("derivedLabelColor", () => {
  it("is a light tint on dark cards and a shade on light ones, and always readable", () => {
    for (const { hex } of CARD_BACKGROUNDS) {
      const label = derivedLabelColor(hex);
      expect(label).toMatch(HEX_RE);
      expect(contrastRatio(label, hex)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("accentFits", () => {
  it("drops an accent that stops reading after the background changes", () => {
    expect(accentFits("#FFFFFF", "#0E1120")).toBe(true);
    expect(accentFits("#FFFFFF", "#F5EFE6")).toBe(false);
    expect(accentFits(null, "#0E1120")).toBe(false);
  });
});
