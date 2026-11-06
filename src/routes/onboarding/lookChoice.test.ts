import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import type { Preset } from "../../api/presets";
import { emptyDraft, parseDraft, resolveDraft, type OnboardingDraft } from "./draft";
import {
  BUILTIN_LOOKS,
  classicChoicePatch,
  drawnLook,
  drawnLooks,
  listedTrades,
  lookChoicePatch,
  lookName,
  looksOffered,
  pictureStamps,
  withoutLook,
} from "./looks";

/** The looks screen's rules (card looks, brief §7.3, with Roee's answers of
 * 6 Nov), beside `looks.test.ts`. */

const t = ((key: string, options?: { name?: string; n?: number }) =>
  key === "onboarding.look.again" ? `${options?.name} ${options?.n}` : key) as unknown as TFunction;

const DEFAULTS = ["A free coffee", "קפה חינם"];

function preset(over: Partial<Preset> & { id: string }): Preset {
  return {
    niche: "cafe",
    name: "A look",
    description: "",
    stamps_required: 8,
    reward_description: "",
    background_color: "#B23A1E",
    foreground_color: "#FFFFFF",
    label_color: "#FFFFFF",
    design: {},
    ...over,
  };
}

const pictures = { strip: "/api/presets/x/picture/strip?v=1", hero: "/api/presets/x/picture/hero?v=1" };

const croissants = preset({
  id: "cafe-bakery-croissants",
  stamps_required: 8,
  background_color: "#B23A1E",
  foreground_color: "#FFFFFF",
  label_color: "#F6E7CB",
  design: {
    stamp: { glyph: "check", color: "#B23A1E", style: "icon", sticker: "croissant", tint: true, mark: "check" },
    pattern: "none",
    panel_color: "#F6E7CB",
    wallpaper: "sheaf-of-rice",
    stamps_place: "header",
    stamps_format: "fraction",
  },
  pictures,
});

const countOnTop = preset({
  id: "cafe-count-on-top",
  stamps_required: 10,
  background_color: "#0E1120",
  design: { stamp: { glyph: "coffee", color: "#C88A11", style: "icon" }, stamps_place: "header" },
  pictures,
});

const classic = preset({ id: "cafe-classic", background_color: "#4B2E1E", design: { stamp: { glyph: "coffee" } } });
const undrawn = preset({ id: "cafe-undrawn", design: { stamp: { sticker: "bubble-tea" } } });

function draftOf(over: Partial<OnboardingDraft>): OnboardingDraft {
  return { ...emptyDraft(), name: "Rothschild", niche: "cafe", updatedAt: 1, ...over };
}

describe("which looks the wizard shows", () => {
  it("shows a look built from the options only once both its pictures are drawn", () => {
    expect(drawnLook(croissants)).toBe(true);
    expect(drawnLook(undrawn)).toBe(false);
    expect(drawnLook(classic)).toBe(false);
    expect(drawnLook({ ...croissants, pictures: { strip: "x", hero: "" } })).toBe(false);
  });

  it("opens on the looks only when the wallet draws them and one is published", () => {
    expect(looksOffered(true, [classic, croissants])).toBe(true);
    expect(looksOffered(false, [classic, croissants])).toBe(false);
    expect(looksOffered(undefined, [croissants])).toBe(false);
    expect(looksOffered(true, [classic, undrawn])).toBe(false);
    expect(looksOffered(true, undefined)).toBe(false);
  });

  it("lists a trade's drawn looks in the catalog's order", () => {
    expect(drawnLooks("cafe", [countOnTop, classic, undrawn, croissants]).map((p) => p.id)).toEqual([
      "cafe-count-on-top",
      "cafe-bakery-croissants",
    ]);
    expect(drawnLooks("barber", [croissants])).toEqual([]);
  });

  it("offers the trades the catalog has a look for, all five before it says, and always the one chosen", () => {
    expect(listedTrades(undefined, null)).toEqual(["barber", "cafe", "trainer", "therapist", "other"]);
    expect(listedTrades([], null)).toEqual(["barber", "cafe", "trainer", "therapist", "other"]);
    expect(listedTrades([croissants], null)).toEqual(["cafe"]);
    expect(listedTrades([croissants], "trainer")).toEqual(["cafe", "trainer"]);
  });
});

describe("a look's name", () => {
  it("is what is on its stamps: its sticker, or its glyph without one", () => {
    expect(lookName(croissants, [croissants, countOnTop], t)).toBe("stickers.croissant");
    expect(lookName(countOnTop, [croissants, countOnTop], t)).toBe("onboarding.stamp.glyphs.coffee");
  });

  it("tells two looks with the same stamps apart by their place, the first keeping it", () => {
    const again = { ...croissants, id: "cafe-croissants-2" };
    const looks = [croissants, countOnTop, again];
    expect(lookName(croissants, looks, t)).toBe("stickers.croissant");
    expect(lookName(again, looks, t)).toBe("stickers.croissant 2");
  });

  it("draws its picture halfway full, at least one", () => {
    expect(pictureStamps(8)).toBe(4);
    expect(pictureStamps(9)).toBe(4);
    expect(pictureStamps(2)).toBe(1);
  });
});

describe("what picking a look writes", () => {
  it("writes everything a look sets into a first draft, without the check", () => {
    const patch = lookChoicePatch(croissants, draftOf({}), [croissants], DEFAULTS);
    expect(patch).toEqual({
      look: "cafe-bakery-croissants",
      background: "#B23A1E",
      accent: "#B23A1E",
      foreground: "#FFFFFF",
      label: "#F6E7CB",
      pattern: "none",
      panel: "#F6E7CB",
      options: {
        style: "icon",
        sticker: "croissant",
        tint: true,
        wallpaper: "sheaf-of-rice",
        stamps_place: "header",
        stamps_format: "fraction",
        logo_text: false,
      },
      stamp: { kind: "glyph", glyph: "check" },
      stampsRequired: 8,
    });
  });

  it("changes nothing on the same look again, but a reward still a default goes", () => {
    expect(lookChoicePatch(croissants, draftOf({ look: croissants.id }), [croissants], DEFAULTS)).toEqual({});
    expect(
      lookChoicePatch(croissants, draftOf({ look: croissants.id, reward: "A free coffee" }), [croissants], DEFAULTS),
    ).toEqual({ reward: null });
  });

  it("never takes what is the owner's: a picture, a count they set, a reward they wrote, the logo's name", () => {
    const draft = draftOf({
      look: croissants.id,
      stamp: { kind: "image", hash: "pic" },
      stampsRequired: 6,
      reward: "Our own cake",
      options: { logo_text: true },
    });
    const patch = lookChoicePatch(countOnTop, draft, [croissants, countOnTop], DEFAULTS);
    expect(patch.look).toBe("cafe-count-on-top");
    expect(patch).not.toHaveProperty("stamp");
    expect(patch).not.toHaveProperty("stampsRequired");
    expect(patch).not.toHaveProperty("reward");
    expect(patch.options?.logo_text).toBe(true);
  });

  it("follows the new look's count when the count is still the last look's", () => {
    const draft = draftOf({ look: croissants.id, stampsRequired: 8 });
    expect(lookChoicePatch(countOnTop, draft, [croissants, countOnTop], DEFAULTS).stampsRequired).toBe(10);
  });

  it("starts a trade with no drawn look from its classic look, with none of the options on", () => {
    const look = BUILTIN_LOOKS.cafe[0];
    const patch = classicChoicePatch(look, draftOf({}), undefined, DEFAULTS);
    expect(patch).toEqual({
      look: look.key,
      background: look.background,
      accent: look.accent,
      pattern: look.pattern,
      foreground: null,
      label: null,
      panel: null,
      options: { logo_text: false },
      stamp: { kind: "glyph", glyph: look.glyph },
      stampsRequired: look.stamps,
    });
  });
});

describe("taking the options off, where the wallet draws none", () => {
  it("makes the card one from before the looks, and keeps everything that isn't an option", () => {
    const look = { ...draftOf({}), ...lookChoicePatch(croissants, draftOf({}), [croissants], DEFAULTS) };
    const draft: OnboardingDraft = { ...look, name: "Café", reward: "A pastry", logo: "logo-hash", stamp: { kind: "image", hash: "art" } };
    // Stored and read back, as the draft is: the keys are gone.
    const off = parseDraft(JSON.parse(JSON.stringify({ ...draft, ...withoutLook() })))!;
    for (const key of ["look", "options", "panel", "label"]) expect(off).not.toHaveProperty(key);
    expect(off).toMatchObject({
      name: "Café",
      niche: draft.niche,
      background: draft.background,
      accent: draft.accent,
      foreground: draft.foreground,
      pattern: draft.pattern,
      stampsRequired: draft.stampsRequired,
      reward: "A pastry",
      logo: "logo-hash",
      stamp: { kind: "image", hash: "art" },
    });
    expect(resolveDraft(off, undefined, t).options).toBeNull();
  });
});
