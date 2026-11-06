import { describe, expect, it } from "vitest";
import { contrastRatio } from "../../lib/color";
import {
  CREAM,
  DARK_LUMINANCE,
  NEAR_BLACK,
  brandColours,
  following,
  groundFor,
  isDarkCard,
  stampsFor,
  stampsInCardColour,
  textFor,
  tintBringsGround,
  withBusinessColour,
  withRuleColour,
  withTint,
} from "./brandColours";
import type { CardStudioValue } from "./studioDraft";

function card(background: string, patch: Partial<CardStudioValue> = {}): CardStudioValue {
  const rule = brandColours(background, { ground: false, tinted: false });
  return {
    name: "Card",
    stamps_required: 8,
    reward_description: "",
    background_color: background,
    foreground_color: rule.text,
    label_color: rule.label,
    design: { stamp: { glyph: "coffee", color: rule.stamps } },
    ...patch,
  };
}

describe("the text", () => {
  it("is the card's near-black where it clears 4.5:1", () => {
    expect(textFor("#FFFFFF")).toBe(NEAR_BLACK);
    expect(textFor("#FFF3B0")).toBe(NEAR_BLACK);
  });

  it("gives the gold card near-black, where passbox found white at 2.94:1", () => {
    expect(textFor("#C98A1B")).toBe(NEAR_BLACK);
  });

  it("goes to black on mid-tones the near-black can't clear", () => {
    for (const hex of ["#7F7F7F", "#7A6FF0", "#D35400"]) {
      expect(contrastRatio(NEAR_BLACK, hex)).toBeLessThan(4.5);
      expect(textFor(hex)).toBe("#000000");
    }
  });

  it("is white on a dark card", () => {
    expect(textFor("#000000")).toBe("#FFFFFF");
    expect(textFor("#B23A1E")).toBe("#FFFFFF");
    expect(textFor("#1A1F38")).toBe("#FFFFFF");
  });

  it("never falls under 4.5:1", () => {
    for (let grey = 0; grey <= 255; grey += 5) {
      const hex = `#${grey.toString(16).padStart(2, "0").repeat(3)}`;
      expect(contrastRatio(textFor(hex), hex)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("a dark card", () => {
  it("is one under the luminance where black text falls under 4.5:1", () => {
    expect(DARK_LUMINANCE).toBeCloseTo(0.175, 3);
    expect(isDarkCard("#000000")).toBe(true);
    expect(isDarkCard("#B23A1E")).toBe(true);
    expect(isDarkCard("#7F7F7F")).toBe(false);
    expect(isDarkCard("#FFF3B0")).toBe(false);
    expect(isDarkCard("#FFFFFF")).toBe(false);
  });

  it("takes white text exactly when it is dark", () => {
    for (let grey = 0; grey <= 255; grey += 3) {
      const hex = `#${grey.toString(16).padStart(2, "0").repeat(3)}`;
      expect(textFor(hex) === "#FFFFFF").toBe(isDarkCard(hex));
    }
  });
});

describe("the ground", () => {
  it("is cream on a dark card", () => {
    expect(groundFor("#000000")).toBe(CREAM);
    expect(groundFor("#B23A1E")).toBe(CREAM);
    expect(groundFor("#1A1F38")).toBe(CREAM);
  });

  it("is white on a light card it shows on", () => {
    expect(groundFor("#7F7F7F")).toBe("#FFFFFF");
    expect(groundFor("#FFF3B0")).toBe("#FFFFFF");
  });

  it("is the card a shade darker where white wouldn't show", () => {
    expect(groundFor("#FFFFFF")).toBe("#E0E0E0");
    expect(contrastRatio(groundFor("#FFFFFF"), "#FFFFFF")).toBeGreaterThanOrEqual(1.1);
  });

  it("always shows against the card", () => {
    for (const hex of ["#000000", "#FFFFFF", "#7F7F7F", "#FFF3B0", "#B23A1E", "#C98A1B", "#2F6B4F", "#F5EFE6"]) {
      expect(contrastRatio(groundFor(hex), hex)).toBeGreaterThanOrEqual(1.1);
    }
  });
});

describe("the stamps", () => {
  it("take the business colour on a ground they clear by 3:1", () => {
    expect(stampsFor("#B23A1E", CREAM, false)).toBe("#B23A1E");
    expect(stampsFor("#000000", CREAM, false)).toBe("#000000");
    expect(stampsFor("#7F7F7F", "#FFFFFF", false)).toBe("#7F7F7F");
  });

  it("take an accent that clears 3:1 where the business colour wouldn't show", () => {
    const onCard = stampsFor("#B23A1E", null, false);
    expect(onCard).not.toBe("#B23A1E");
    expect(contrastRatio(onCard, "#B23A1E")).toBeGreaterThanOrEqual(3);
    const onWhite = stampsFor("#FFF3B0", "#FFFFFF", false);
    expect(contrastRatio(onWhite, "#FFFFFF")).toBeGreaterThanOrEqual(3);
  });

  it("take the business colour when they are tinted, whatever they stand on", () => {
    expect(stampsFor("#FFF3B0", "#FFFFFF", true)).toBe("#FFF3B0");
    expect(stampsFor("#b23a1e", null, true)).toBe("#B23A1E");
  });
});

describe("following the business colour", () => {
  it("moves every colour that still follows", () => {
    const value = card("#B23A1E");
    const next = withBusinessColour(value, "#FFF3B0");
    expect(next.background_color).toBe("#FFF3B0");
    expect(next.foreground_color).toBe(NEAR_BLACK);
    expect(next.label_color).toBe(NEAR_BLACK);
    expect(next.design.stamp?.color).toBe(stampsFor("#FFF3B0", null, false));
  });

  it("leaves a colour changed by hand where it is", () => {
    const value = card("#B23A1E", { foreground_color: "#F6E7CB", label_color: "#123456" });
    const stamped = { ...value, design: { stamp: { glyph: "coffee", color: "#00FF00" } } };
    const next = withBusinessColour(stamped, "#1A1F38");
    expect(next.foreground_color).toBe("#F6E7CB");
    expect(next.label_color).toBe("#123456");
    expect(next.design.stamp?.color).toBe("#00FF00");
  });

  it("reads black or white text from before the rule as following", () => {
    const value = card("#FFFFFF", { foreground_color: "#000000", label_color: "#000000" });
    expect(following(value).text).toBe(true);
    expect(withBusinessColour(value, "#000000").foreground_color).toBe("#FFFFFF");
  });

  it("moves the ground first, and judges the stamps on the ground the card will have", () => {
    const value = card("#000000", {
      design: { panel_color: CREAM, stamp: { glyph: "coffee", color: "#000000" } },
    });
    expect(following(value)).toMatchObject({ ground: true, stamps: true });
    const next = withBusinessColour(value, "#B23A1E");
    expect(next.design.panel_color).toBe(CREAM);
    expect(next.design.stamp?.color).toBe("#B23A1E");
  });

  it("keeps a ground set by hand, and judges the stamps on it", () => {
    const value = card("#000000", {
      design: { panel_color: "#1A1F38", stamp: { glyph: "coffee", color: "#FFFFFF" } },
    });
    expect(following(value).ground).toBe(false);
    const next = withBusinessColour(value, "#FFFFFF");
    expect(next.design.panel_color).toBe("#1A1F38");
  });

  it("gives a card with no ground none", () => {
    const next = withBusinessColour(card("#B23A1E"), "#000000");
    expect(next.design.panel_color).toBeUndefined();
    expect(following(card("#B23A1E")).ground).toBe(false);
  });

  it("puts one colour back on the rule, the label going with the text", () => {
    const value = card("#B23A1E", { foreground_color: "#F6E7CB", label_color: "#F6E7CB" });
    const back = withRuleColour(value, "text");
    expect(back.foreground_color).toBe("#FFFFFF");
    expect(back.label_color).toBe("#FFFFFF");
    expect(following(back).text).toBe(true);
  });
});

describe("the tint", () => {
  it("brings the rule's ground to a card with none, and the business colour to the stamps", () => {
    const value = card("#B23A1E");
    expect(tintBringsGround(value)).toBe(true);
    const next = withTint(value, true);
    expect(next.design.stamp?.tint).toBe(true);
    expect(next.design.panel_color).toBe(CREAM);
    expect(next.design.stamp?.color).toBe("#B23A1E");
    expect(stampsInCardColour(next)).toBe(true);
  });

  it("stands the stamps on their own, the only stamps the wallet tints", () => {
    const next = withTint(card("#B23A1E"), true);
    expect(next.design.stamp?.style).toBe("icon");
  });

  it("brings a ground again to a tint kept from before on stamps in a circle", () => {
    const kept = card("#B23A1E", { design: { stamp: { glyph: "coffee", tint: true, style: "badge" } } });
    expect(tintBringsGround(kept)).toBe(true);
  });

  it("keeps a ground the card already has", () => {
    const value = card("#B23A1E", { design: { panel_color: "#FFFFFF", stamp: { glyph: "coffee" } } });
    expect(tintBringsGround(value)).toBe(false);
    expect(withTint(value, true).design.panel_color).toBe("#FFFFFF");
  });

  it("goes off leaving the ground and the stamp colour", () => {
    const on = withTint(card("#B23A1E"), true);
    const off = withTint(on, false);
    expect(off.design.stamp?.tint).toBe(false);
    expect(off.design.panel_color).toBe(CREAM);
    expect(off.design.stamp?.color).toBe("#B23A1E");
  });
});
