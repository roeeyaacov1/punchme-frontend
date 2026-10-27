import { describe, expect, it } from "vitest";
import { CARD_PALETTES } from "../../../lib/cardPalettes";
import { STAMP_GLYPH_NAMES } from "../../../lib/stampGlyphs";
import {
  automaticText,
  charactersLeft,
  glyphsForTrade,
  isFaint,
  matchingLook,
  swatchIndex,
  textModeOf,
  type ReadyLook,
} from "./controlRules";

const LOOKS: ReadyLook[] = CARD_PALETTES.map((palette) => ({ ...palette, name: palette.key }));
const espresso = CARD_PALETTES.find((palette) => palette.key === "espresso")!;

describe("matchingLook", () => {
  it("names the look while all four colours still match, in any case", () => {
    const colours = {
      background: espresso.background.toLowerCase(),
      stamp: espresso.stamp,
      text: espresso.text,
      label: espresso.label,
    };
    expect(matchingLook(colours, LOOKS)).toBe("espresso");
  });

  it("lets go of the look once one colour moves", () => {
    const colours = { ...espresso, label: "#123456" };
    expect(matchingLook(colours, LOOKS)).toBeNull();
  });

  it("has nothing to match without looks", () => {
    expect(matchingLook(espresso, [])).toBeNull();
  });
});

describe("isFaint", () => {
  it("is true under 3:1 on the card", () => {
    expect(isFaint("#4B2E1E", "#3A2418")).toBe(true);
  });

  it("is false for a stamp that reads", () => {
    expect(isFaint("#FFFFFF", "#4B2E1E")).toBe(false);
  });

  it("says nothing about a colour that isn't one yet", () => {
    expect(isFaint("#12", "#4B2E1E")).toBe(false);
  });
});

describe("swatchIndex", () => {
  it("finds an offered swatch whatever its case", () => {
    expect(swatchIndex("#4b2e1e", ["#0E1120", "#4B2E1E"])).toBe(1);
  });

  it("is -1 for a colour of one's own, or none", () => {
    expect(swatchIndex("#ABCDEF", ["#0E1120"])).toBe(-1);
    expect(swatchIndex(null, ["#0E1120"])).toBe(-1);
  });
});

describe("textModeOf", () => {
  it("reads null as automatic, as onboarding keeps it", () => {
    expect(textModeOf(null)).toBe("auto");
  });

  it("names white and black, and anything else as one's own", () => {
    expect(textModeOf("#ffffff")).toBe("white");
    expect(textModeOf("#000000")).toBe("black");
    expect(textModeOf("#D2B48C")).toBe("custom");
  });
});

describe("automaticText", () => {
  it("is white on a dark card and black on a light one", () => {
    expect(automaticText("#4B2E1E")).toBe("#FFFFFF");
    expect(automaticText("#F5EFE6")).toBe("#000000");
  });
});

describe("glyphsForTrade", () => {
  it("puts the trade's own glyph first and keeps the rest in order", () => {
    const glyphs = glyphsForTrade("barber");
    expect(glyphs[0]).toBe("scissors");
    expect(glyphs).toHaveLength(STAMP_GLYPH_NAMES.length);
    expect(glyphs.slice(1)).toEqual(STAMP_GLYPH_NAMES.filter((name) => name !== "scissors"));
  });

  it("keeps the usual order with no trade, or one it doesn't know", () => {
    expect(glyphsForTrade(null)).toEqual(STAMP_GLYPH_NAMES);
    expect(glyphsForTrade("florist")).toEqual(STAMP_GLYPH_NAMES);
  });
});

describe("charactersLeft", () => {
  it("says nothing until the field nears its limit", () => {
    expect(charactersLeft("x".repeat(159), 200, 160)).toBeNull();
  });

  it("counts down from there, to zero at the limit", () => {
    expect(charactersLeft("x".repeat(160), 200, 160)).toBe(40);
    expect(charactersLeft("x".repeat(200), 200, 160)).toBe(0);
  });
});
