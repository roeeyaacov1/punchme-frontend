import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import type { Preset } from "../../api/presets";
import { accentFits, derivedLabelColor } from "../../lib/accentPalette";
import { readableInk } from "../../lib/color";
import { emptyDraft, type OnboardingDraft } from "./draft";
import { BUILTIN_LOOKS, defaultRewards, lookPatch, looksFor, readyLooks, withTradeLook } from "./looks";

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

describe("defaultRewards", () => {
  const t = ((key: string, options?: { lng?: string }) => `${key}@${options?.lng}`) as unknown as TFunction;

  it("names every trade's default reward in every language", () => {
    const all = defaultRewards(t);
    expect(all).toContain("onboarding.card.reward.barber@he");
    expect(all).toContain("onboarding.card.reward.other@en");
  });

  it("counts the numbered defaults a draft saved before they lost their numbers still says", () => {
    const all = defaultRewards(t);
    expect(all).toHaveLength(20);
    expect(all).toContain("התספורת העשירית חינם");
    expect(all).toContain("Free coffee on your 8th visit");
    // So a card of 8 stamps doesn't keep promising the tenth.
    const old = draftOf({ niche: "barber", ...lookPatch(BUILTIN_LOOKS.barber[2]), reward: "התספורת העשירית חינם" });
    expect(withTradeLook(old, undefined, all).reward).toBeNull();
  });
});

describe("readyLooks", () => {
  const t = ((key: string, options?: { n?: number }) =>
    options?.n !== undefined ? `${key}:${options.n}` : key) as unknown as TFunction;

  it("names a catalog look by its place, and a built-in by its own name in the page's language", () => {
    const presets = [
      { id: "cat-1", niche: "barber", name: "Haircut Punch Card", background_color: "#123456", stamps_required: 10, design: {} },
    ] as unknown as Preset[];
    const looks = looksFor("barber", presets);
    const ready = readyLooks(looks, t);
    expect(ready[0]).toMatchObject({ key: "cat-1", name: "onboarding.looks.numbered:1" });
    expect(ready[1].name).toBe(`onboarding.looks.names.${looks[1].key}`);
  });

  it("paints a look's words in the automatic colour and its labels as the card derives them", () => {
    const light = BUILTIN_LOOKS.cafe[1];
    expect(readyLooks([light], t)[0]).toEqual({
      key: light.key,
      name: `onboarding.looks.names.${light.key}`,
      background: light.background,
      stamp: light.accent,
      text: readableInk(light.background),
      label: derivedLabelColor(light.background),
    });
  });
});
