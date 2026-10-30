import { describe, expect, it } from "vitest";
import type { Preset } from "../../api/presets";
import { accentFits } from "../../lib/accentPalette";
import { emptyDraft, type OnboardingDraft } from "./draft";
import { BUILTIN_LOOKS, lookPatch, withTradeLook } from "./looks";

const DEFAULTS = ["A free haircut", "A free coffee", "תספורת חינם", "קפה חינם"];

function draftOf(over: Partial<OnboardingDraft>): OnboardingDraft {
  return { ...emptyDraft(), name: "Danny's", updatedAt: 1, ...over };
}

const barberFirst = BUILTIN_LOOKS.barber[0];
const cafeFirst = BUILTIN_LOOKS.cafe[0];

describe("withTradeLook", () => {
  it("writes the trade's first look into a draft with nothing chosen", () => {
    const patch = withTradeLook(draftOf({ niche: "barber" }), undefined, DEFAULTS);
    expect(patch).toEqual(lookPatch(barberFirst));
  });

  it("starts from the catalog's first look when the catalog has one", () => {
    const presets = [
      {
        id: "cat-1",
        niche: "cafe",
        name: "Haircut Punch Card",
        background_color: "#123456",
        stamps_required: 9,
        design: { stamp: { glyph: "coffee", color: "#F0E6D2" }, pattern: "dots" },
      },
    ] as unknown as Preset[];
    const patch = withTradeLook(draftOf({ niche: "cafe" }), presets, DEFAULTS);
    expect(patch).toMatchObject({ background: "#123456", accent: "#F0E6D2", stampsRequired: 9, pattern: "dots" });
  });

  it("never overwrites what the owner chose, and fits the stamp colour to their card colour", () => {
    const chosen = draftOf({ niche: "barber", background: "#F5EFE6", stamp: { kind: "image", hash: "pic" } });
    const patch = withTradeLook(chosen, undefined, DEFAULTS);
    expect(patch.background).toBeUndefined();
    expect(patch.stamp).toBeUndefined();
    expect(accentFits(patch.accent ?? null, "#F5EFE6")).toBe(true);
    expect(patch.pattern).toBe(barberFirst.pattern);
    expect(patch.stampsRequired).toBe(barberFirst.stamps);
  });

  it("follows a change of trade while the card still wears the last trade's untouched look", () => {
    const wornBarber = draftOf({ niche: "cafe", ...lookPatch(barberFirst) });
    expect(withTradeLook(wornBarber, undefined, DEFAULTS)).toEqual(lookPatch(cafeFirst));
  });

  it("keeps a look the owner has changed, even by one stamp", () => {
    const changed = draftOf({ niche: "cafe", ...lookPatch(barberFirst), stampsRequired: barberFirst.stamps - 2 });
    expect(withTradeLook(changed, undefined, DEFAULTS)).toEqual({});
  });

  it("lets a trade's default reward follow the trade, and keeps the owner's own words", () => {
    const worn = draftOf({ niche: "cafe", ...lookPatch(barberFirst), reward: "תספורת חינם" });
    expect(withTradeLook(worn, undefined, DEFAULTS).reward).toBeNull();
    const own = draftOf({ niche: "cafe", ...lookPatch(barberFirst), reward: "Free beard trim" });
    expect(withTradeLook(own, undefined, DEFAULTS)).not.toHaveProperty("reward");
  });
});
