import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import type { Preset } from "../../api/presets";
import {
  buildTemplateInput,
  draftPreviewValue,
  emptyDraft,
  fingerprint,
  firstIncompleteStep,
  parseDraft,
  resolveDraft,
  sampleStamps,
  type OnboardingDraft,
} from "./draft";

/** A `t` that returns the key (or the defaultValue when one is given), so
 * the assertions below can see exactly which key each field was built from. */
const t = ((key: string, opts?: { defaultValue?: string }) =>
  opts?.defaultValue !== undefined && key.startsWith("onboarding.card.reward.")
    ? opts.defaultValue
    : key) as unknown as TFunction;

const PRESETS: Preset[] = [
  {
    id: "cafe-classic",
    niche: "cafe",
    name: "Coffee Loyalty Card",
    description: "",
    stamps_required: 8,
    reward_description: "Free coffee on your 8th visit",
    background_color: "#4B2E1E",
    foreground_color: "#FFFFFF",
    label_color: "#D2B48C",
    design: {},
  },
];

function fullDraft(): OnboardingDraft {
  return {
    ...emptyDraft(),
    name: "Rothschild Coffee",
    niche: "cafe",
    background: "#4B2E1E",
    accent: "#C88A11",
    stamp: { kind: "glyph", glyph: "coffee" },
    stampsRequired: 8,
    reward: "Free coffee on your 8th visit",
  };
}

describe("parseDraft", () => {
  it("rejects anything that is not a v1 draft", () => {
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft("nope")).toBeNull();
    expect(parseDraft({ v: 2 })).toBeNull();
  });
  it("round-trips a full draft", () => {
    const draft = fullDraft();
    expect(parseDraft(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
  });
  it("drops bad values field by field instead of the whole draft", () => {
    const parsed = parseDraft({
      v: 1,
      name: "X",
      niche: "florist",
      background: "#12",
      accent: "#C88A11",
      stamp: { kind: "glyph", glyph: "unicorn" },
      stampsRequired: 40,
      reward: 7,
    });
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("X");
    expect(parsed!.niche).toBeNull();
    expect(parsed!.background).toBeNull();
    expect(parsed!.accent).toBe("#C88A11");
    expect(parsed!.stamp).toBeNull();
    expect(parsed!.stampsRequired).toBeNull();
    expect(parsed!.reward).toBeNull();
  });
  it("normalises three-digit hex", () => {
    expect(parsed3().background).toBe("#AABBCC");
    function parsed3() {
      return parseDraft({ v: 1, background: "abc" })!;
    }
  });
});

describe("firstIncompleteStep", () => {
  it("walks the steps in order as the draft fills in", () => {
    const d = emptyDraft();
    expect(firstIncompleteStep(null)).toBe("business");
    expect(firstIncompleteStep(d)).toBe("business");
    d.name = "Danny's";
    expect(firstIncompleteStep(d)).toBe("business");
    d.niche = "barber";
    expect(firstIncompleteStep(d)).toBe("color");
    d.background = "#1F2937";
    expect(firstIncompleteStep(d)).toBe("accent");
    d.accent = "#C88A11";
    expect(firstIncompleteStep(d)).toBe("stamp");
    d.stamp = { kind: "glyph", glyph: "scissors" };
    expect(firstIncompleteStep(d)).toBe("reward");
    d.stampsRequired = 10;
    expect(firstIncompleteStep(d)).toBe("reward");
    d.reward = "10th haircut free";
    expect(firstIncompleteStep(d)).toBe("account");
  });
  it("sends the owner back to the stamp step when the picture is gone", () => {
    const d = fullDraft();
    d.stamp = { kind: "image", hash: "abc" };
    expect(firstIncompleteStep(d, () => true)).toBe("account");
    expect(firstIncompleteStep(d, () => false)).toBe("stamp");
  });
  it("treats an out-of-range stamp count as incomplete", () => {
    const d = fullDraft();
    d.stampsRequired = 1;
    expect(firstIncompleteStep(d)).toBe("reward");
    d.stampsRequired = 13;
    expect(firstIncompleteStep(d)).toBe("reward");
  });
});

describe("resolveDraft", () => {
  it("fills nulls from the trade's preset without touching chosen values", () => {
    const d = emptyDraft();
    d.name = "Rothschild Coffee";
    d.niche = "cafe";
    const r = resolveDraft(d, PRESETS, t);
    expect(r.background).toBe("#4B2E1E");
    expect(r.stampsRequired).toBe(8);
    expect(r.stamp).toEqual({ kind: "glyph", glyph: "coffee" });
    expect(r.foreground).toBe("#FFFFFF");
    expect(r.reward).toBe("Free coffee on your 8th visit");
    expect(r.accent).toMatch(/^#[0-9A-F]{6}$/);

    d.background = "#F5EFE6";
    d.accent = "#0E1120";
    const r2 = resolveDraft(d, PRESETS, t);
    expect(r2.background).toBe("#F5EFE6");
    expect(r2.accent).toBe("#0E1120");
    expect(r2.foreground).toBe("#000000");
  });
  it("stands on fallbacks while presets are still loading", () => {
    const d = emptyDraft();
    d.niche = "trainer";
    const r = resolveDraft(d, undefined, t);
    expect(r.background).toBe("#0E1120");
    expect(r.stampsRequired).toBe(10);
    expect(r.stamp).toEqual({ kind: "glyph", glyph: "dumbbell" });
  });
});

describe("buildTemplateInput", () => {
  it("produces a complete CardTemplateIn with a full design doc", () => {
    const input = buildTemplateInput(resolveDraft(fullDraft(), PRESETS, t), PRESETS, "he", t);
    expect(input).toMatchObject({
      name: "onboarding.card.templateName.cafe",
      stamps_required: 8,
      reward_description: "Free coffee on your 8th visit",
      background_color: "#4B2E1E",
      foreground_color: "#FFFFFF",
      logo_url: "",
    });
    expect(input.label_color).toMatch(/^#[0-9A-F]{6}$/);
    const design = input.design as {
      default_language: string;
      fields: Array<{ binding: string; label: string; default_value: string }>;
      barcode: { format: string; payload: string };
      stamp: { glyph: string; color: string };
      pattern: string;
    };
    expect(design.default_language).toBe("HE");
    expect(design.fields.map((f) => f.binding)).toEqual([
      "person.displayName",
      "members.member.points",
      "universal.info",
    ]);
    expect(design.fields[0].label).toBe("onboarding.card.fields.name.cafe");
    expect(design.fields[1].label).toBe("onboarding.card.fields.points.cafe");
    expect(design.fields[2].default_value).toBe("Free coffee on your 8th visit");
    expect(design.barcode).toEqual({ format: "QR", payload: "${pid}", alt_text: "" });
    expect(design.stamp).toEqual({ glyph: "coffee", color: "#C88A11" });
    expect(design.pattern).toBe("none");
  });
  it("carries the chosen texture as design.pattern, and drops an unknown one", () => {
    const d = fullDraft();
    d.pattern = "dots";
    const input = buildTemplateInput(resolveDraft(d, PRESETS, t), PRESETS, "he", t);
    expect((input.design as { pattern: string }).pattern).toBe("dots");
    expect(parseDraft({ v: 1, pattern: "plaid" })!.pattern).toBeNull();
    expect(parseDraft({ v: 1, pattern: "waves" })!.pattern).toBe("waves");
  });
  it("always sends a real glyph name even when the stamp is a picture", () => {
    const d = fullDraft();
    d.stamp = { kind: "image", hash: "h" };
    const input = buildTemplateInput(resolveDraft(d, PRESETS, t), PRESETS, "en", t);
    expect((input.design as { stamp: { glyph: string } }).stamp.glyph).toBe("check");
    expect((input.design as { default_language: string }).default_language).toBe("EN");
  });
  it("fingerprints equal inputs equally and different inputs differently", () => {
    const a = buildTemplateInput(resolveDraft(fullDraft(), PRESETS, t), PRESETS, "he", t);
    const b = buildTemplateInput(resolveDraft(fullDraft(), PRESETS, t), PRESETS, "he", t);
    expect(fingerprint(a)).toBe(fingerprint(b));
    const changed = fullDraft();
    changed.accent = "#FFFFFF";
    const c = buildTemplateInput(resolveDraft(changed, PRESETS, t), PRESETS, "he", t);
    expect(fingerprint(c)).not.toBe(fingerprint(a));
  });
});

describe("preview", () => {
  it("shows some stamps punched so the accent is visible, never a full card", () => {
    expect(sampleStamps(2)).toBe(1);
    expect(sampleStamps(8)).toBe(4);
    expect(sampleStamps(12)).toBe(5);
    for (let n = 2; n <= 12; n += 1) {
      expect(sampleStamps(n)).toBeGreaterThanOrEqual(1);
      expect(sampleStamps(n)).toBeLessThan(n);
    }
  });
  it("hands art to the preview only for picture stamps", () => {
    const glyph = draftPreviewValue(resolveDraft(fullDraft(), PRESETS, t), "en", t, "data:x");
    expect(glyph.stampArtUrl).toBeUndefined();
    expect(glyph.unsaved).toBe(true);
    const d = fullDraft();
    d.stamp = { kind: "image", hash: "h" };
    const art = draftPreviewValue(resolveDraft(d, PRESETS, t), "en", t, "data:x");
    expect(art.stampArtUrl).toBe("data:x");
  });
});
