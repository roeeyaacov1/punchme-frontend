import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  hexToHsl,
  hexToRgb,
  hslToHex,
  mixHex,
  readableInk,
  relativeLuminance,
} from "./color";

describe("hexToRgb", () => {
  it("parses six- and three-digit hex", () => {
    expect(hexToRgb("#C88A11")).toEqual({ r: 200, g: 138, b: 17 });
    expect(hexToRgb("fff")).toEqual({ r: 255, g: 255, b: 255 });
  });
  it("returns null for a half-typed value", () => {
    expect(hexToRgb("#C88A")).toBeNull();
    expect(hexToRgb("")).toBeNull();
  });
});

describe("relativeLuminance / contrastRatio", () => {
  it("matches the WCAG reference points", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 3);
  });
  it("is order-free and agrees with the ratios measured in tailwind.config.js", () => {
    // Gold fill / navy text: the config comments say 6.30:1.
    expect(contrastRatio("#C88A11", "#0E1120")).toBeCloseTo(6.3, 1);
    expect(contrastRatio("#0E1120", "#C88A11")).toBeCloseTo(6.3, 1);
    // ink.muted on oat: 5.89:1.
    expect(contrastRatio("#5E5750", "#EFE9DC")).toBeCloseTo(5.89, 1);
  });
  it("treats a non-colour as black rather than as passing", () => {
    expect(contrastRatio("nope", "#FFFFFF")).toBeCloseTo(21, 3);
  });
});

describe("readableInk", () => {
  it("still picks black on light and white on dark", () => {
    expect(readableInk("#F5EFE6")).toBe("#000000");
    expect(readableInk("#0E1120")).toBe("#FFFFFF");
    expect(readableInk("#F0B429")).toBe("#000000");
  });
});

describe("hexToHsl / hslToHex", () => {
  it("round-trips a saturated colour", () => {
    const { h, s, l } = hexToHsl("#12455F");
    expect(h).toBeCloseTo(200, 0);
    expect(hslToHex(h, s, l)).toBe("#12455F");
  });
  it("reads greys as unsaturated", () => {
    expect(hexToHsl("#808080").s).toBe(0);
  });
  it("wraps negative and oversized hues", () => {
    expect(hslToHex(-60, 50, 50)).toBe(hslToHex(300, 50, 50));
    expect(hslToHex(420, 50, 50)).toBe(hslToHex(60, 50, 50));
  });
});

describe("mixHex", () => {
  it("interpolates and clamps t", () => {
    expect(mixHex("#000000", "#FFFFFF", 0.5)).toBe("#808080");
    expect(mixHex("#000000", "#FFFFFF", 2)).toBe("#FFFFFF");
    expect(mixHex("#000000", "#FFFFFF", -1)).toBe("#000000");
  });
});
