import type { Sticker } from "./controls/controlRules";

/**
 * The wallet's stickers, sorted for an owner (brief §6.3): the trade's own
 * first, then the rest in groups, with a search over their names. The list
 * itself always comes from the server (`GET .../stickers`), which only ever
 * adds names, so everything here filters what the list holds: a name the
 * list doesn't have is left out, and one no group names goes under gifts.
 * Pure, so it can be tested.
 */

export const STICKER_GROUP_KEYS = [
  "drinks",
  "bakery",
  "food",
  "beauty",
  "wellness",
  "fitness",
  "pets",
  "flowers",
  "gifts",
] as const;

export type StickerGroupKey = (typeof STICKER_GROUP_KEYS)[number];

/** The input's nine groups (`card-design-options.md` §7). Its three
 * wallpaper motifs, which are stamps too, join the group they belong with:
 * the beans with the coffee, the sheaf with the bread, the leaf with the
 * wellness stickers. */
export const STICKER_GROUPS: Record<StickerGroupKey, readonly string[]> = {
  drinks: [
    "hot-beverage",
    "teacup-without-handle",
    "bubble-tea",
    "cup-with-straw",
    "tropical-drink",
    "glass-of-milk",
    "wine-glass",
    "beer-mug",
    "beans",
  ],
  bakery: [
    "croissant",
    "bread",
    "baguette-bread",
    "pretzel",
    "bagel",
    "cupcake",
    "shortcake",
    "birthday-cake",
    "doughnut",
    "cookie",
    "pancakes",
    "sheaf-of-rice",
  ],
  food: [
    "pizza",
    "hamburger",
    "taco",
    "sushi",
    "steaming-bowl",
    "green-salad",
    "sandwich",
    "falafel",
    "stuffed-flatbread",
    "ice-cream",
    "soft-ice-cream",
  ],
  beauty: ["barber-pole", "scissors", "nail-polish", "lipstick", "lotion-bottle", "soap"],
  wellness: ["lotus", "herb", "candle", "potted-plant", "seedling", "leaf-fluttering-in-wind"],
  fitness: ["running-shoe", "boxing-glove", "soccer-ball", "trophy", "flexed-biceps"],
  pets: ["paw-prints", "dog-face", "bone"],
  flowers: ["tulip", "rose", "sunflower", "bouquet"],
  gifts: ["wrapped-gift", "party-popper", "star", "glowing-star", "red-heart", "gem-stone", "crown", "shopping-bags", "sparkles"],
};

/** Each trade's stickers first, in the order the brief gives them (§6.3). */
export const TRADE_STICKERS: Record<string, readonly string[]> = {
  cafe: ["hot-beverage", "teacup-without-handle", "bubble-tea", "cup-with-straw", "croissant", "bread", "cupcake", "cookie"],
  barber: ["scissors", "barber-pole", "nail-polish", "lipstick", "lotion-bottle", "soap", "sparkles", "crown"],
  trainer: ["running-shoe", "flexed-biceps", "boxing-glove", "soccer-ball", "trophy", "glowing-star"],
  therapist: ["lotus", "herb", "candle", "potted-plant", "seedling", "leaf-fluttering-in-wind"],
  other: ["star", "red-heart", "wrapped-gift", "party-popper", "gem-stone", "crown", "sparkles", "shopping-bags"],
};

/** The trade the stickers lead with: the business's own, or any business's. */
export function stickerTrade(niche: string | null | undefined): string {
  return niche && niche in TRADE_STICKERS ? niche : "other";
}

export interface StickerShelves {
  trade: string;
  /** The trade's own, in its order. */
  first: Sticker[];
  /** Every other sticker the list holds, under its group, empty groups left
   * out; one no group names goes under gifts. */
  groups: { key: StickerGroupKey; stickers: Sticker[] }[];
}

export function stickerShelves(list: readonly Sticker[], niche: string | null | undefined): StickerShelves {
  const trade = stickerTrade(niche);
  const byName = new Map(list.map((sticker) => [sticker.name, sticker]));
  const first = TRADE_STICKERS[trade].flatMap((name) => byName.get(name) ?? []);
  const taken = new Set(first.map((sticker) => sticker.name));
  const grouped = new Set(STICKER_GROUP_KEYS.flatMap((key) => STICKER_GROUPS[key]));
  const groups = STICKER_GROUP_KEYS.map((key) => {
    const named = STICKER_GROUPS[key].flatMap((name) => (taken.has(name) ? [] : (byName.get(name) ?? [])));
    const newer = key === "gifts" ? list.filter((sticker) => !grouped.has(sticker.name) && !taken.has(sticker.name)) : [];
    return { key, stickers: [...named, ...newer] };
  }).filter((group) => group.stickers.length > 0);
  return { trade, first, groups };
}

/** Whether a sticker is among the trade's own, so "עוד מדבקות" can open on a
 * card whose sticker is elsewhere. */
export function inTradeFirst(list: readonly Sticker[], niche: string | null | undefined, name: string): boolean {
  return stickerShelves(list, niche).first.some((sticker) => sticker.name === name);
}

/** A search as it is typed: no case, no Hebrew points, single spaces. */
export function searchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[֑-ׇ]/g, "")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The stickers whose names hold the search, in the list's order. `namesOf`
 * gives a sticker's names in every language the app has (Hebrew and English
 * alike, whatever the page is in); its own name, dashes as spaces, always
 * counts. An empty search finds nothing, so the groups show instead.
 */
export function searchStickers(
  list: readonly Sticker[],
  query: string,
  namesOf: (name: string) => readonly string[],
): Sticker[] {
  const wanted = searchText(query);
  if (!wanted) return [];
  return list.filter((sticker) =>
    [sticker.name, ...namesOf(sticker.name)].some((name) => searchText(name).includes(wanted)),
  );
}

/** The motifs a faint pattern offers after the four textures and "like the
 * stamp" (§6.4): wheat, leaves in the wind, sparkles. The rest are behind
 * "עוד". */
export const PATTERN_MOTIFS = ["sheaf-of-rice", "leaf-fluttering-in-wind", "sparkles"] as const;
