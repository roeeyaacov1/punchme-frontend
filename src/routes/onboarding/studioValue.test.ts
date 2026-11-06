import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import { withBusinessColour, withTint } from "../../components/card-studio/brandColours";
import { withOption, withStamp, withStampsPlace } from "../../components/card-studio/designOptions";
import { emptyDraft, resolveDraft, type OnboardingDraft } from "./draft";
import { draftPatchOf, studioValueOf } from "./studioValue";

const t = ((key: string) => key) as unknown as TFunction;

/** The croissants, as the look screen writes them. */
function lookDraft(over: Partial<OnboardingDraft> = {}): OnboardingDraft {
  return {
    ...emptyDraft(),
    name: "Rothschild",
    niche: "cafe",
    background: "#B23A1E",
    accent: "#B23A1E",
    foreground: "#FFFFFF",
    label: "#F6E7CB",
    stamp: { kind: "glyph", glyph: "check" },
    pattern: "none",
    stampsRequired: 8,
    reward: "A cake",
    updatedAt: 1,
    look: "cafe-bakery-croissants",
    options: { style: "icon", sticker: "croissant", tint: true, wallpaper: "sheaf-of-rice" },
    panel: "#F6E7CB",
    ...over,
  };
}

const shownOf = (draft: OnboardingDraft) => studioValueOf(resolveDraft(draft, undefined, t), "he", t, "Card");

describe("the map's card in the studio's trays", () => {
  it("is the draft as the save would write it", () => {
    const value = shownOf(lookDraft());
    expect(value.background_color).toBe("#B23A1E");
    expect(value.label_color).toBe("#F6E7CB");
    expect(value.design.stamp).toMatchObject({ sticker: "croissant", tint: true, style: "icon" });
    expect(value.design.panel_color).toBe("#F6E7CB");
  });

  it("writes nothing back for a change that changed nothing", () => {
    const shown = shownOf(lookDraft());
    expect(draftPatchOf(shown, shown)).toEqual({});
  });

  it("writes a new sticker as the options, whole", () => {
    const shown = shownOf(lookDraft());
    const patch = draftPatchOf(withStamp(shown, { sticker: "cookie" }), shown);
    expect(patch).toEqual({
      options: {
        style: "icon",
        sticker: "cookie",
        tint: true,
        wallpaper: "sheaf-of-rice",
        stamps_place: "secondary",
        stamps_format: "count",
        logo_text: false,
      },
    });
  });

  it("writes a ground taken away as none", () => {
    const shown = shownOf(lookDraft());
    expect(draftPatchOf(withOption(shown, { panel_color: "" }), shown)).toEqual({ panel: null });
  });

  it("writes a new business colour and what follows it, and leaves an automatic colour automatic", () => {
    const draft = lookDraft({ foreground: null, label: null });
    const shown = shownOf(draft);
    const patch = draftPatchOf(withBusinessColour(shown, "#0E1120"), shown);
    expect(patch.background).toBe("#0E1120");
    expect(patch).not.toHaveProperty("label");
  });

  it("writes a glyph tapped as the stamp, and nothing about the stamp otherwise", () => {
    const shown = shownOf(lookDraft());
    expect(draftPatchOf(withStamp(shown, { glyph: "coffee", sticker: "" }), shown).stamp).toEqual({
      kind: "glyph",
      glyph: "coffee",
    });
    expect(draftPatchOf(withTint(shown, false), shown)).not.toHaveProperty("stamp");
  });

  it("writes the count's place with its field", () => {
    const shown = shownOf(lookDraft());
    const patch = draftPatchOf(withStampsPlace(shown, "header"), shown);
    expect(patch.options?.stamps_place).toBe("header");
    const again = resolveDraft({ ...lookDraft(), ...patch }, undefined, t);
    expect(studioValueOf(again, "he", t, "Card").design.fields?.[1].section).toBe("HEADER_FIELDS");
  });
});
