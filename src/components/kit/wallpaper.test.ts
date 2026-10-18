import { describe, expect, it } from "vitest";
import { mixHex } from "../../lib/color";
import {
  BLUR_FALLOFF,
  HINT_TOWARD_STAMP,
  TONE_TOWARD_WHITE,
  blurredDisc,
  wallpaperFor,
} from "./wallpaper";

/** Abramowitz and Stegun 7.1.26, good to about 1.5e-7. */
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

describe("BLUR_FALLOFF", () => {
  it("is the edge of a 44px Gaussian blur, to three decimals", () => {
    for (const [offset, coverage] of BLUR_FALLOFF) {
      const expected = 0.5 * (1 - erf(offset / (44 * Math.SQRT2)));
      expect(Math.abs(coverage - expected)).toBeLessThan(0.0015);
    }
  });

  it("runs from solid inside the shape to nothing outside it", () => {
    const coverages = BLUR_FALLOFF.map(([, c]) => c);
    expect(coverages[0]).toBeGreaterThan(0.99);
    expect(coverages[coverages.length - 1]).toBe(0);
    expect([...coverages].sort((a, b) => b - a)).toEqual(coverages);
  });
});

describe("wallpaperFor", () => {
  it("follows the brief's recipe: 30% toward white, 28% toward the stamp", () => {
    expect(TONE_TOWARD_WHITE).toBe(0.3);
    expect(HINT_TOWARD_STAMP).toBe(0.28);
    const paper = wallpaperFor("#4B2E1E", "#C88A11");
    expect(paper.backgroundColor).toBe("#4B2E1E");
    const tone = mixHex("#4B2E1E", "#ffffff", 0.3);
    const hint = mixHex("#4B2E1E", "#C88A11", 0.28);
    const rgb = (hex: string) =>
      [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
    expect(paper.backgroundImage).toContain(`rgb(${rgb(tone)} / 0.5)`);
    expect(paper.backgroundImage).toContain(`rgb(${rgb(hint)} / 0.5)`);
  });

  it("is two radial gradients over the card colour, with no filter", () => {
    const paper = wallpaperFor("#1F2937", "#F0B429");
    expect(paper.backgroundImage.match(/radial-gradient\(/g)).toHaveLength(2);
    expect(paper.backgroundImage).not.toMatch(/blur|filter|url\(/);
  });

  it("drops a shape whose colour can't be read, rather than drawing black", () => {
    expect(blurredDisc("not a colour", "50% 50%", 100)).toBeNull();
  });
});

describe("blurredDisc", () => {
  it("puts the half-coverage stop on the disc's own edge", () => {
    expect(blurredDisc("#000000", "50% 50%", 160)).toContain("rgb(0 0 0 / 0.5) 160px");
  });

  it("never asks for a stop before the centre", () => {
    expect(blurredDisc("#000000", "50% 50%", 100)).toContain("rgb(0 0 0 / 0.999) 0px");
  });
});
