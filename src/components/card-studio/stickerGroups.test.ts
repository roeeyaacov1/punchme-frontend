import { describe, expect, it } from "vitest";
import en from "../../i18n/locales/en/common.json";
import he from "../../i18n/locales/he/common.json";
import type { Sticker } from "./controls/controlRules";
import {
  PATTERN_MOTIFS,
  STICKER_GROUPS,
  STICKER_GROUP_KEYS,
  TRADE_STICKERS,
  searchStickers,
  searchText,
  stickerShelves,
  stickerTrade,
} from "./stickerGroups";

const NAMES = Object.keys(en.stickers);
const list: Sticker[] = NAMES.map((name) => ({ name, image: `data:${name}` }));
const namesOf = (name: string) => [
  (en.stickers as Record<string, string>)[name] ?? "",
  (he.stickers as Record<string, string>)[name] ?? "",
];

describe("the groups", () => {
  it("hold every one of the 65 stickers the app names, once", () => {
    const grouped = STICKER_GROUP_KEYS.flatMap((key) => STICKER_GROUPS[key]);
    expect(NAMES).toHaveLength(65);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect([...grouped].sort()).toEqual([...NAMES].sort());
  });

  it("lead each trade with stickers the app names", () => {
    for (const names of Object.values(TRADE_STICKERS)) {
      for (const name of names) expect(NAMES).toContain(name);
    }
    for (const name of PATTERN_MOTIFS) expect(NAMES).toContain(name);
  });
});

describe("the shelves", () => {
  it("put the trade's own first, in its order", () => {
    const shelves = stickerShelves(list, "cafe");
    expect(shelves.first.map((sticker) => sticker.name)).toEqual(TRADE_STICKERS.cafe);
  });

  it("leave the trade's own out of the groups, and drop a group left empty", () => {
    const shelves = stickerShelves(list, "cafe");
    const inGroups = shelves.groups.flatMap((group) => group.stickers.map((sticker) => sticker.name));
    for (const name of TRADE_STICKERS.cafe) expect(inGroups).not.toContain(name);
    expect(inGroups.length + shelves.first.length).toBe(65);
    expect(shelves.groups.every((group) => group.stickers.length > 0)).toBe(true);
  });

  it("leave out a name the list doesn't have", () => {
    const shelves = stickerShelves(
      list.filter((sticker) => sticker.name !== "croissant" && sticker.name !== "rose"),
      "cafe",
    );
    expect(shelves.first.map((sticker) => sticker.name)).not.toContain("croissant");
    expect(shelves.groups.flatMap((group) => group.stickers.map((sticker) => sticker.name))).not.toContain("rose");
  });

  it("put a newer server's sticker no group names under gifts", () => {
    const shelves = stickerShelves([...list, { name: "teapot", image: "data:teapot" }], "barber");
    const gifts = shelves.groups.find((group) => group.key === "gifts")!;
    expect(gifts.stickers[gifts.stickers.length - 1]?.name).toBe("teapot");
  });

  it("lead with any business's stickers for a trade it doesn't know", () => {
    expect(stickerTrade(undefined)).toBe("other");
    expect(stickerTrade("florist")).toBe("other");
    expect(stickerTrade("barber")).toBe("barber");
  });
});

describe("the search", () => {
  it("finds by the Hebrew name, the English one and the sticker's own", () => {
    expect(searchStickers(list, "קרואסון", namesOf).map((sticker) => sticker.name)).toEqual(["croissant"]);
    expect(searchStickers(list, "Croissant", namesOf).map((sticker) => sticker.name)).toEqual(["croissant"]);
    expect(searchStickers(list, "barber pole", namesOf).map((sticker) => sticker.name)).toEqual(["barber-pole"]);
  });

  it("finds as it's typed, by part of a word", () => {
    expect(searchStickers(list, "כוס", namesOf).length).toBeGreaterThan(1);
    expect(searchStickers(list, "cup", namesOf).map((sticker) => sticker.name)).toContain("cupcake");
  });

  it("finds nothing for an empty search, or one no name holds", () => {
    expect(searchStickers(list, "   ", namesOf)).toEqual([]);
    expect(searchStickers(list, "zzzz", namesOf)).toEqual([]);
  });

  it("reads past case, Hebrew points and dashes", () => {
    expect(searchText("  Glowing-STAR ")).toBe("glowing star");
    expect(searchText("קָפֶה")).toBe("קפה");
  });
});
