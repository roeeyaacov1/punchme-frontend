import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import type { DesignDoc } from "../../api/designs";
import {
  buildTemplateInput,
  clearDraft,
  draftPreviewValue,
  emptyDraft,
  fingerprint,
  loadLogo,
  parseDraft,
  resolveDraft,
  saveArt,
  saveLogo,
  loadArt,
  type OnboardingDraft,
} from "./draft";

/** The card looks' fields in the draft (brief §7.5 and §11), beside the
 * draft's own tests, which a draft from before must keep passing. */

const t = ((key: string) => key) as unknown as TFunction;

function classicDraft(): OnboardingDraft {
  return {
    ...emptyDraft(),
    name: "Rothschild Coffee",
    niche: "cafe",
    background: "#4B2E1E",
    accent: "#C88A11",
    stamp: { kind: "glyph", glyph: "coffee" },
    stampsRequired: 8,
    reward: "Free coffee",
    updatedAt: 1,
  };
}

/** The barber's gold scissors, as the look screen writes it. */
function lookDraft(): OnboardingDraft {
  return {
    ...emptyDraft(),
    name: "Danny's",
    niche: "barber",
    background: "#0E1120",
    accent: "#C88A11",
    foreground: "#FFFFFF",
    stamp: { kind: "glyph", glyph: "scissors" },
    pattern: "none",
    stampsRequired: 10,
    reward: "A free cut",
    updatedAt: 1,
    look: "barber-gold-scissors",
    options: {
      style: "badge",
      sticker: "scissors",
      tint: false,
      wallpaper: "sparkles",
      stamps_place: "header",
      stamps_format: "fraction",
      logo_text: false,
    },
    panel: "#1A1F38",
    label: "#C88A11",
  };
}

const design = (draft: OnboardingDraft, lang = "en") =>
  buildTemplateInput(resolveDraft(draft, undefined, t), undefined, lang, t).design as DesignDoc;

describe("a draft from before the looks", () => {
  it("parses back to exactly what was stored, with none of the looks' fields", () => {
    const stored = JSON.parse(JSON.stringify(classicDraft()));
    const parsed = parseDraft(stored)!;
    expect(parsed).toEqual(classicDraft());
    for (const key of ["look", "options", "panel", "label", "logo"]) expect(parsed).not.toHaveProperty(key);
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(stored));
  });

  it("reads as a classic card: no look, no options, no ground", () => {
    const resolved = resolveDraft(classicDraft(), undefined, t);
    expect(resolved.look).toBeNull();
    expect(resolved.options).toBeNull();
    expect(resolved.panel).toBeNull();
  });

  it("writes the design doc it always wrote, so its save's fingerprint stays", () => {
    const doc = design(classicDraft());
    expect(Object.keys(doc)).toEqual(["default_language", "fields", "barcode", "stamp", "pattern"]);
    expect(doc.stamp).toEqual({ glyph: "coffee", color: "#C88A11" });
    expect(doc.fields?.[1].section).toBe("SECONDARY_FIELDS");
  });
});

describe("a draft from a look", () => {
  it("round-trips", () => {
    const draft = lookDraft();
    expect(parseDraft(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
  });

  it("keeps each option by its known values, and drops a bad one on its own", () => {
    const parsed = parseDraft({
      ...lookDraft(),
      options: {
        style: "round",
        sticker: "Croissant!",
        tint: "yes",
        wallpaper: "",
        stamps_place: "header",
        stamps_format: "percent",
        logo_text: true,
        mark: "check",
      },
      panel: "#12",
      label: "abc",
      logo: 7,
    })!;
    expect(parsed.options).toEqual({ wallpaper: "", stamps_place: "header", logo_text: true });
    expect(parsed.panel).toBeNull();
    expect(parsed.label).toBe("#AABBCC");
    expect(parsed.logo).toBeNull();
    expect(parsed.look).toBe("barber-gold-scissors");
  });

  it("reads options that aren't an object, and an empty look, as none", () => {
    const parsed = parseDraft({ ...classicDraft(), look: "", options: ["icon"] })!;
    expect(parsed).not.toHaveProperty("look");
    expect(parsed).not.toHaveProperty("options");
  });

  it("writes the look's options into the design, the count's field at the top with it", () => {
    const doc = design(lookDraft(), "he");
    expect(doc.stamp).toEqual({ glyph: "scissors", color: "#C88A11", style: "badge", sticker: "scissors", tint: false });
    expect(doc.panel_color).toBe("#1A1F38");
    expect(doc.wallpaper).toBe("sparkles");
    expect(doc.stamps_place).toBe("header");
    expect(doc.stamps_format).toBe("fraction");
    expect(doc.logo_text).toBe(false);
    expect(doc.fields?.find((f) => f.binding === "members.member.points")?.section).toBe("HEADER_FIELDS");
    // The wizard's own fields, in the card's language (Roee, 6 Nov).
    expect(doc.fields?.[0].label).toBe("onboarding.card.fields.name.barber");
    expect(doc.default_language).toBe("HE");
    // Every design keeps its stamps' alert message.
    expect(doc.fields?.[1].change_message).toBe("onboarding.card.fields.pointsChange");
  });

  it("fills an option the draft doesn't say at its default, and a missing ground as none", () => {
    const draft: OnboardingDraft = { ...lookDraft(), options: { sticker: "croissant" }, panel: null };
    const doc = design(draft);
    expect(doc.stamp?.style).toBe("badge");
    expect(doc.panel_color).toBe("");
    expect(doc.wallpaper).toBe("");
    expect(doc.stamps_place).toBe("secondary");
    expect(doc.fields?.[1].section).toBe("SECONDARY_FIELDS");
  });

  it("keeps the look's label colour, and takes the card's when it has none", () => {
    const input = buildTemplateInput(resolveDraft(lookDraft(), undefined, t), undefined, "en", t);
    expect(input.label_color).toBe("#C88A11");
    const derived = buildTemplateInput(resolveDraft({ ...lookDraft(), label: null }, undefined, t), undefined, "en", t);
    expect(derived.label_color).not.toBe("#C88A11");
  });

  it("changes the save's fingerprint when an option changes, so Back-and-change PATCHes", () => {
    const before = fingerprint(buildTemplateInput(resolveDraft(lookDraft(), undefined, t), undefined, "en", t));
    const changed = { ...lookDraft(), options: { ...lookDraft().options, sticker: "barber-pole" } };
    const after = fingerprint(buildTemplateInput(resolveDraft(changed, undefined, t), undefined, "en", t));
    expect(after).not.toBe(before);
  });
});

describe("the logo", () => {
  it("is kept under a key of its own, which clearing the draft clears with the picture", () => {
    saveArt({ hash: "stamp", dataUrl: "data:image/png;base64,AA" });
    saveLogo({ hash: "logo", dataUrl: "data:image/png;base64,BB" });
    expect(loadLogo()).toEqual({ hash: "logo", dataUrl: "data:image/png;base64,BB" });
    expect(loadArt()?.hash).toBe("stamp");
    clearDraft();
    expect(loadLogo()).toBeNull();
    expect(loadArt()).toBeNull();
  });

  it("shows on the card when the device has it, with the name beside it as the option says", () => {
    const resolved = resolveDraft({ ...lookDraft(), logo: "logo", options: { logo_text: true } }, undefined, t);
    const shown = draftPreviewValue(resolved, "en", t, undefined, "Card", "data:logo");
    expect(shown.logoUrl).toBe("data:logo");
    expect(shown.appleLogoUrl).toBe("data:logo");
    expect(shown.logoText).toBe(true);
    const none = draftPreviewValue(resolved, "en", t, undefined, "Card");
    expect(none).not.toHaveProperty("logoUrl");
    expect(none).not.toHaveProperty("logoText");
  });
});
