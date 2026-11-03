import { describe, expect, it } from "vitest";
import type { DesignField } from "../../api/designs";
import {
  alreadyAsked,
  COUNT_BINDING,
  countSection,
  designOptions,
  drawKey,
  iconOnlyOptionsShow,
  isStyled,
  picturesAt,
  readPicture,
  serverAsk,
  stagePictures,
  stampsText,
  studioStickers,
  withFields,
  withOption,
  withStamp,
  withStampsPlace,
  type DrawnCard,
} from "./designOptions";
import type { CardStudioValue } from "./studioDraft";

const PLAIN: CardStudioValue = {
  name: "כרטיסיית קפה",
  stamps_required: 8,
  reward_description: "קפה חינם",
  background_color: "#4B2E1E",
  foreground_color: "#FFFFFF",
  label_color: "#D2B48C",
  design: { stamp: { glyph: "coffee", color: "#C88A11" }, pattern: "dots" },
};

const BAKERY: CardStudioValue = {
  ...PLAIN,
  background_color: "#C65D3B",
  design: {
    stamp: { glyph: "check", color: "#C65D3B", style: "icon", sticker: "croissant", tint: true, mark: "check" },
    panel_color: "#F6E7CB",
    wallpaper: "sheaf-of-rice",
    stamps_place: "header",
    stamps_format: "fraction",
  },
};

describe("designOptions", () => {
  it("reads a design that says nothing as the card before the options", () => {
    expect(designOptions({})).toEqual({
      style: "badge",
      mark: "none",
      sticker: "",
      tint: false,
      panelColor: "",
      wallpaper: "",
      stampsPlace: "secondary",
      stampsFormat: "count",
      logoText: false,
    });
  });

  it("reads every option a design sets", () => {
    expect(designOptions({ ...BAKERY.design, logo_text: true })).toEqual({
      style: "icon",
      mark: "check",
      sticker: "croissant",
      tint: true,
      panelColor: "#F6E7CB",
      wallpaper: "sheaf-of-rice",
      stampsPlace: "header",
      stampsFormat: "fraction",
      logoText: true,
    });
  });

  it("reads a value it doesn't know as the default, never as a guess", () => {
    const odd = { stamp: { style: "round", mark: "x", sticker: 3, tint: "yes" }, stamps_place: "footer" };
    expect(designOptions(odd as never)).toMatchObject({
      style: "badge",
      mark: "none",
      sticker: "",
      tint: false,
      stampsPlace: "secondary",
    });
  });
});

describe("isStyled", () => {
  it("is false for a v0.1 card, whatever its glyph, colours and pattern", () => {
    expect(isStyled(PLAIN.design)).toBe(false);
  });

  it.each([
    ["a stamp on its own", { stamp: { style: "icon" as const } }],
    ["a sticker", { stamp: { sticker: "croissant" } }],
    ["a panel", { panel_color: "#FFFFFF" }],
    ["a wallpaper", { wallpaper: "sparkles" }],
  ])("is true with %s", (_, design) => {
    expect(isStyled(design)).toBe(true);
  });

  it.each([
    ["a check on a badge", { stamp: { mark: "check" as const } }],
    ["a tint on a badge", { stamp: { tint: true } }],
    ["the count at the top", { stamps_place: "header" as const }],
    ["the count as a fraction", { stamps_format: "fraction" as const }],
    ["the name beside the logo", { logo_text: true }],
  ])("is false with only %s: the strip draws as before", (_, design) => {
    expect(isStyled(design)).toBe(false);
  });
});

describe("the check and the tint", () => {
  it("show only on a stamp on its own", () => {
    expect(iconOnlyOptionsShow({ stamp: { style: "icon" } })).toBe(true);
    expect(iconOnlyOptionsShow({ stamp: { style: "badge", mark: "check" } })).toBe(false);
  });
});

describe("stampsText", () => {
  it("is the count, or the count out of the card", () => {
    expect(stampsText(PLAIN.design, 6, 8)).toBe("6");
    expect(stampsText(BAKERY.design, 6, 8)).toBe("6/8");
  });

  it("keeps a gift past a full card as the pass does", () => {
    expect(stampsText(BAKERY.design, 9, 8)).toBe("9/8");
  });
});

describe("withStamp and withOption", () => {
  it("set one option and keep the rest of the stamp", () => {
    const next = withStamp(PLAIN, { sticker: "croissant" });
    expect(next.design.stamp).toEqual({ glyph: "coffee", color: "#C88A11", sticker: "croissant" });
    expect(next.design.pattern).toBe("dots");
    expect(PLAIN.design.stamp).toEqual({ glyph: "coffee", color: "#C88A11" });
  });

  it("set a design option beside the stamp", () => {
    expect(withOption(PLAIN, { panel_color: "#FFFFFF" }).design).toEqual({ ...PLAIN.design, panel_color: "#FFFFFF" });
  });
});

describe("drawKey", () => {
  it("is the same for one card whatever its keys' order", () => {
    const reordered: CardStudioValue = {
      ...BAKERY,
      design: {
        stamps_format: "fraction",
        stamps_place: "header",
        wallpaper: "sheaf-of-rice",
        panel_color: "#F6E7CB",
        stamp: { mark: "check", tint: true, sticker: "croissant", style: "icon", color: "#C65D3B", glyph: "check" },
      },
    };
    expect(drawKey(reordered, 6)).toBe(drawKey(BAKERY, 6));
  });

  it("differs by the count and by anything the strip is drawn from", () => {
    expect(drawKey(BAKERY, 6)).not.toBe(drawKey(BAKERY, 5));
    expect(drawKey(withStamp(BAKERY, { tint: false }), 6)).not.toBe(drawKey(BAKERY, 6));
    expect(drawKey(withOption(BAKERY, { panel_color: "#FFFFFF" }), 6)).not.toBe(drawKey(BAKERY, 6));
    expect(drawKey({ ...BAKERY, stamps_required: 10 }, 6)).not.toBe(drawKey(BAKERY, 6));
    expect(drawKey({ ...BAKERY, background_color: "#000000" }, 6)).not.toBe(drawKey(BAKERY, 6));
  });

  it.each([
    ["the sticker", withStamp(BAKERY, { sticker: "bagel" })],
    ["the wallpaper", withOption(BAKERY, { wallpaper: "sparkles" })],
    ["the check", withStamp(BAKERY, { mark: "none" })],
    ["the style", withStamp(BAKERY, { style: "badge" })],
    ["the glyph", withStamp(BAKERY, { glyph: "star" })],
    ["the texture", withOption(BAKERY, { pattern: "dots" })],
    ["the stamp colour", withStamp(BAKERY, { color: "#000000" })],
  ])("changes with %s, so the old picture never stands for the new strip", (_, edited) => {
    expect(drawKey(edited, 6)).not.toBe(drawKey(BAKERY, 6));
  });

  it("is the same through an edit the strip doesn't show, so it asks for no new picture", () => {
    const relabelled: CardStudioValue = {
      ...BAKERY,
      name: "שם אחר",
      reward_description: "הטבה אחרת",
      label_color: "#000000",
      design: { ...BAKERY.design, stamps_format: "count", fields: [{ binding: "universal.info", label: "x" }] },
    };
    expect(drawKey(relabelled, 6)).toBe(drawKey(BAKERY, 6));
  });

  it("reads a key left out as its default, as the server does", () => {
    const plainWithDefaults = withStamp(PLAIN, { style: "badge", mark: "none", sticker: "", tint: false });
    expect(drawKey(withOption(plainWithDefaults, { panel_color: "", wallpaper: "" }), 4)).toBe(drawKey(PLAIN, 4));
  });

  it("follows the text colour while the stamp has no colour of its own", () => {
    const unset = withStamp(PLAIN, { color: "" });
    expect(drawKey({ ...unset, foreground_color: "#000000" }, 4)).not.toBe(drawKey(unset, 4));
    expect(drawKey({ ...PLAIN, foreground_color: "#000000" }, 4)).toBe(drawKey(PLAIN, 4));
  });
});

describe("readPicture", () => {
  it("keys the design read's picture by the card it read and the count it drew", () => {
    const images = { strip_states: { "4": "data:strip" }, hero_states: { "4": "data:hero" } };
    expect(readPicture(BAKERY, images)).toEqual({ key: drawKey(BAKERY, 4), strip: "data:strip", hero: "data:hero" });
  });

  it("has none where the read drew nothing", () => {
    expect(readPicture(BAKERY, {})).toBeNull();
    expect(readPicture(BAKERY, undefined)).toBeNull();
  });
});

describe("studioStickers", () => {
  const sticker = { name: "croissant", image: "data:x" };

  it("offers the options only when the wallet says it draws them", () => {
    expect(studioStickers({ data: { stickers: [sticker], available: true }, isError: false })).toEqual({
      list: [sticker],
      status: "ready",
      available: true,
    });
    expect(studioStickers({ data: { stickers: [], available: false }, isError: false }).available).toBe(false);
  });

  it("offers none while the list is on its way, or when it couldn't be read", () => {
    expect(studioStickers({ isError: false })).toEqual({ list: [], status: "loading", available: false });
    expect(studioStickers({ isError: true })).toEqual({ list: [], status: "unavailable", available: false });
  });
});

describe("picturesAt", () => {
  it("takes the strip and the hero at the count", () => {
    const images = { strip_states: { "6": "data:strip" }, hero_states: { "6": "data:hero" }, logo: "data:logo" };
    expect(picturesAt(images, 6)).toEqual({ strip: "data:strip", hero: "data:hero" });
  });

  it("has nothing for a count it wasn't drawn at, or for no images", () => {
    expect(picturesAt({ strip_states: { "4": "data:strip" } }, 6)).toEqual({ strip: undefined, hero: undefined });
    expect(picturesAt(undefined, 6)).toEqual({ strip: undefined, hero: undefined });
  });
});

describe("serverAsk", () => {
  const drawnAt = (value: CardStudioValue, state: number): DrawnCard => ({ key: drawKey(value, state), strip: "s" });

  it("asks for the check alone after an edit to a plain card", () => {
    expect(serverAsk({ value: PLAIN, sample: 4, changed: true, pictures: [] })).toEqual({ value: PLAIN, images: false });
  });

  it("asks nothing of a plain card that hasn't changed, whatever the sample", () => {
    expect(serverAsk({ value: PLAIN, sample: 4, changed: false, pictures: [] })).toBeNull();
    expect(serverAsk({ value: PLAIN, sample: 1, changed: false, pictures: [] })).toBeNull();
  });

  it("asks for a drawn card's picture at the count shown", () => {
    expect(serverAsk({ value: BAKERY, sample: 6, changed: true, pictures: [null] })).toEqual({
      value: BAKERY,
      state: 6,
      images: true,
    });
  });

  it("asks for a saved drawn card at a count its read didn't draw", () => {
    const read = drawnAt(BAKERY, 4);
    expect(serverAsk({ value: BAKERY, sample: 2, changed: false, pictures: [null, read] })?.state).toBe(2);
  });

  it("asks nothing while the read's own picture is of this strip at this count", () => {
    expect(serverAsk({ value: BAKERY, sample: 4, changed: false, pictures: [null, drawnAt(BAKERY, 4)] })).toBeNull();
  });

  it("asks for the check alone after an edit the strip doesn't show", () => {
    const relabelled = { ...BAKERY, reward_description: "הטבה אחרת" };
    expect(serverAsk({ value: relabelled, sample: 4, changed: true, pictures: [drawnAt(BAKERY, 4)] })).toEqual({
      value: relabelled,
      images: false,
    });
  });

  it("doesn't ask again for a strip the server answered without a picture", () => {
    const failed: DrawnCard = { key: drawKey(BAKERY, 6) };
    expect(serverAsk({ value: BAKERY, sample: 6, changed: false, pictures: [failed] })).toBeNull();
  });
});

describe("stagePictures", () => {
  const key = drawKey(BAKERY, 6);
  const published = { stripStates: { "6": "published-strip" }, heroStates: { "6": "published-hero" } };
  const fresh: DrawnCard = { key, strip: "drawn-strip", hero: "drawn-hero" };
  const stale: DrawnCard = { key: drawKey(BAKERY, 5), strip: "old-strip", hero: "old-hero" };

  it("leaves a plain card to the stand-in and the published pictures, as before", () => {
    expect(stagePictures({ styled: false, unsaved: true, sample: 6, ...published, pictures: [fresh], key })).toEqual({
      ...published,
      unsaved: true,
      drawing: false,
      failed: false,
    });
  });

  it("shows the server's picture of this strip at this count, the read's or a fresh one", () => {
    const shown = { stripStates: { "6": "drawn-strip" }, heroStates: { "6": "drawn-hero" } };
    const expected = { ...shown, unsaved: false, drawing: false, failed: false };
    expect(stagePictures({ styled: true, unsaved: true, sample: 6, ...published, pictures: [fresh, null], key })).toEqual(
      expected,
    );
    expect(stagePictures({ styled: true, unsaved: true, sample: 6, pictures: [null, fresh], key })).toEqual(expected);
  });

  it("takes the first picture that matches: the read's, drawn with the pictures the card has now", () => {
    const read: DrawnCard = { key, strip: "read-strip", hero: "read-hero" };
    const before: DrawnCard = { key, strip: "before-save-strip", hero: "before-save-hero" };
    expect(stagePictures({ styled: true, unsaved: false, sample: 6, pictures: [read, before], key }).stripStates).toEqual({
      "6": "read-strip",
    });
  });

  it("says a picture that hasn't loaded yet is on its way, never that it failed", () => {
    const shown = stagePictures({
      styled: true,
      unsaved: true,
      sample: 6,
      pictures: [fresh, stale],
      key,
      loaded: (url) => url !== "drawn-strip" && url !== "drawn-hero",
    });
    expect(shown).toEqual({
      stripStates: { "6": "old-strip" },
      heroStates: { "6": "old-hero" },
      unsaved: false,
      drawing: true,
      failed: false,
    });
  });

  it("never shows a styled card's published pictures for another strip", () => {
    const shown = stagePictures({ styled: true, unsaved: false, sample: 6, ...published, pictures: [], key });
    expect(shown.stripStates).toBeUndefined();
    expect(shown.unsaved).toBe(true);
  });

  it("keeps the last picture up, said to be updating, until the fresh one comes", () => {
    expect(stagePictures({ styled: true, unsaved: true, sample: 6, pictures: [stale], key })).toEqual({
      stripStates: { "6": "old-strip" },
      heroStates: { "6": "old-hero" },
      unsaved: false,
      drawing: true,
      failed: false,
    });
  });

  it("falls back to the stand-in only before the server has drawn anything", () => {
    expect(stagePictures({ styled: true, unsaved: true, sample: 6, pictures: [null, null], key })).toEqual({
      stripStates: undefined,
      heroStates: undefined,
      unsaved: true,
      drawing: true,
      failed: false,
    });
  });

  it("says when the server answered for this strip and drew nothing", () => {
    const answered: DrawnCard = { key };
    expect(stagePictures({ styled: true, unsaved: true, sample: 6, pictures: [answered, stale], key })).toEqual({
      stripStates: { "6": "old-strip" },
      heroStates: { "6": "old-hero" },
      unsaved: false,
      drawing: false,
      failed: true,
    });
  });
});

describe("alreadyAsked", () => {
  const check = { value: BAKERY, images: false };
  const picture = { value: BAKERY, state: 6, images: true };

  it("is the same draft asked the same", () => {
    expect(alreadyAsked(picture, picture)).toBe(true);
    expect(alreadyAsked(check, { ...check })).toBe(true);
  });

  it("takes a picture's answer for the check of that draft, not the other way round", () => {
    expect(alreadyAsked(picture, check)).toBe(true);
    expect(alreadyAsked(check, picture)).toBe(false);
  });

  it("asks again for another count, another draft, or after nothing", () => {
    expect(alreadyAsked(picture, { ...picture, state: 5 })).toBe(false);
    expect(alreadyAsked(picture, { ...picture, value: { ...BAKERY } })).toBe(false);
    expect(alreadyAsked(null, picture)).toBe(false);
  });
});

describe("the count's place", () => {
  const withCount = (section: DesignField["section"]): CardStudioValue => ({
    ...PLAIN,
    design: { ...PLAIN.design, fields: [{ binding: COUNT_BINDING, label: "כוסות", section }] },
  });

  it("moves the count's field to the top with it, and back to the face's row", () => {
    const top = withStampsPlace(withCount("AUXILIARY_FIELDS"), "header");
    expect(top.design.stamps_place).toBe("header");
    expect(countSection(top.design.fields)).toBe("HEADER_FIELDS");
    const back = withStampsPlace(top, "secondary");
    expect(back.design.stamps_place).toBe("secondary");
    expect(countSection(back.design.fields)).toBe("SECONDARY_FIELDS");
  });

  it("goes back where the saved card had it, so there and back is no change", () => {
    const saved = withCount("AUXILIARY_FIELDS");
    const back = withStampsPlace(withStampsPlace(saved, "header"), "secondary", saved.design.fields);
    expect(countSection(back.design.fields)).toBe("AUXILIARY_FIELDS");
  });

  it("leaves a count already on the face where it is when it stays under the strip", () => {
    expect(countSection(withStampsPlace(withCount("AUXILIARY_FIELDS"), "secondary").design.fields)).toBe(
      "AUXILIARY_FIELDS",
    );
  });

  it("follows the count's field when Wallet details moves it to the top or away", () => {
    const card = withCount("SECONDARY_FIELDS");
    const moved = (section: DesignField["section"]) => [{ binding: COUNT_BINDING, label: "כוסות", section }];
    expect(withFields(card, moved("HEADER_FIELDS")).design.stamps_place).toBe("header");
    const top = withStampsPlace(card, "header");
    expect(withFields(top, moved("BACK_FIELDS")).design.stamps_place).toBe("secondary");
    // A move that doesn't touch the top leaves the place alone.
    expect(withFields(card, moved("AUXILIARY_FIELDS")).design.stamps_place).toBeUndefined();
  });
});
