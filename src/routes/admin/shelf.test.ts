import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import type { CatalogTemplate } from "../../api/catalog";
import type { Preset } from "../../api/presets";
import { LOOK_PICTURES_WAIT_MS } from "../../components/card-studio/lookPictures";
import { BUILTIN_LOOKS, lookName } from "../onboarding/looks";
import { deleteFact, liveWizard, movedOrder, ranked, shelf, type ShelfInput } from "./shelf";

/** /admin's list as owners meet it (brief §7.6): the wizard's own rules,
 * read over the catalog staff edit. */

const t = ((key: string, options?: { name?: string; n?: number }) => {
  if (key === "onboarding.look.again") return `${options?.name} ${options?.n}`;
  if (key === "onboarding.looks.numbered") return `Look ${options?.n}`;
  return key;
}) as unknown as TFunction;

const NOW = Date.parse("2026-11-07T12:00:00Z");
const LONG_AGO = "2026-11-01T12:00:00Z";
const pictures = { strip: "/strip.png", hero: "/hero.png" };

/** A catalog row, as `GET /api/admin/catalog` gives it. */
function entry(over: Partial<CatalogTemplate> & { id: string }): CatalogTemplate {
  return {
    niche: "cafe",
    name: over.id,
    description: "",
    stamps_required: 8,
    reward_description: "",
    background_color: "#4B2E1E",
    foreground_color: "#FFFFFF",
    label_color: "#FFFFFF",
    design: {},
    is_published: true,
    sort_order: 0,
    art_uses: [],
    created_at: LONG_AGO,
    updated_at: LONG_AGO,
    ...over,
  } as CatalogTemplate;
}

/** The same row as `GET /api/presets` gives it: published only. */
function presetOf(row: CatalogTemplate, drawn = false): Preset {
  return {
    id: row.id!,
    niche: row.niche,
    name: row.name,
    description: row.description ?? "",
    stamps_required: row.stamps_required,
    reward_description: row.reward_description,
    background_color: row.background_color,
    foreground_color: row.foreground_color,
    label_color: row.label_color,
    design: row.design ?? {},
    pictures: drawn ? pictures : null,
  } as Preset;
}

const styled = (sticker: string) =>
  ({ stamp: { glyph: "check", color: "#B23A1E", style: "icon", sticker, tint: true } }) as never;

const croissants = entry({ id: "cafe-croissants", name: "Bakery Card", background_color: "#B23A1E", design: styled("croissant") });
const latte = entry({ id: "cafe-latte", name: "Latte", design: styled("coffee-cup") });
const latteAgain = entry({ id: "cafe-latte-2", name: "Latte again", design: styled("coffee-cup") });
const cafeClassic = entry({ id: "cafe-classic", name: "Coffee Punch Card", design: { stamp: { glyph: "coffee" } } as never });
const scissors = entry({ id: "barber-scissors", niche: "barber", name: "Gold Scissors", design: styled("scissors") });
const barberClassic = entry({ id: "barber-classic", niche: "barber", background_color: "#1F2937" });
const barberDraft = entry({ id: "barber-draft", niche: "barber", is_published: false, background_color: "#7A1F3D" });
const trainerClassic = entry({ id: "trainer-classic", niche: "trainer", background_color: "#065F46" });

/** The catalog in its one order, and what the public presets give for it. */
function input(rows: CatalogTemplate[], over: Partial<ShelfInput> = {}, drawn: string[] = []): ShelfInput {
  return {
    entries: rows,
    presets: rows.filter((r) => r.is_published).map((r) => presetOf(r, drawn.includes(r.id!))),
    available: true,
    now: NOW,
    t,
    ...over,
  };
}

const trade = (out: ReturnType<typeof shelf>, niche: string) => out.trades.find((x) => x.niche === niche)!;

describe("which wizard owners get", () => {
  it("is the looks screen when the wallet draws and a look is drawn", () => {
    const rows = [croissants, cafeClassic];
    expect(liveWizard(true, input(rows, {}, ["cafe-croissants"]).presets)).toBe("looks");
  });

  it("says the wallet draws but nothing is drawn yet, apart from saying it doesn't draw", () => {
    expect(liveWizard(true, input([croissants]).presets)).toBe("notDrawnYet");
    expect(liveWizard(false, input([croissants], {}, ["cafe-croissants"]).presets)).toBe("plain");
  });

  it("reads a sticker list that didn't answer as the wizard does: without the looks", () => {
    const out = shelf(input([croissants, cafeClassic], { available: null }, ["cafe-croissants"]));
    expect(out.live).toBe("unanswered");
    expect(trade(out, "cafe").shown.map((r) => r.id)).toEqual(["cafe-classic", null, null]);
  });
});

describe("a trade on the looks screen", () => {
  const rows = [latte, cafeClassic, croissants, latteAgain, scissors, barberClassic, barberDraft, trainerClassic];
  const out = shelf(input(rows, {}, ["cafe-latte", "cafe-croissants", "cafe-latte-2", "barber-scissors"]));

  it("offers its drawn looks in the catalog's order, numbered, the first chosen", () => {
    const cafe = trade(out, "cafe");
    expect(cafe.status).toEqual({ kind: "count", n: 3 });
    expect(cafe.shown.map((r) => [r.id, r.place])).toEqual([
      ["cafe-latte", 1],
      ["cafe-croissants", 2],
      ["cafe-latte-2", 3],
    ]);
    expect(cafe.shown[1].picture).toEqual({ kind: "strip", src: "/strip.png" });
  });

  it("names them as owners read them, the second of a name with its number", () => {
    const cafe = trade(out, "cafe");
    const drawn = input(rows, {}, ["cafe-latte", "cafe-croissants", "cafe-latte-2"]).presets.filter((p) => p.pictures);
    expect(cafe.shown.map((r) => r.ownersName)).toEqual(drawn.map((p) => lookName(p, drawn, t)));
    expect(cafe.shown[2].ownersName).toBe(`${cafe.shown[0].ownersName} 2`);
    expect(cafe.shown[1].staffName).toBe("Bakery Card");
  });

  it("sets a plain look apart in a trade with a drawn one: it shows only without the options", () => {
    expect(trade(out, "cafe").notShown).toEqual([
      expect.objectContaining({ id: "cafe-classic", reason: "classicOnly", place: null, ownersName: null }),
    ]);
    expect(trade(out, "barber").notShown.map((r) => [r.id, r.reason])).toEqual([
      ["barber-classic", "classicOnly"],
      ["barber-draft", "draft"],
    ]);
  });

  it("shows a trade with nothing drawn its classic look", () => {
    const trainer = trade(out, "trainer");
    expect(trainer.status).toEqual({ kind: "classic" });
    expect(trainer.shown).toEqual([
      expect.objectContaining({ id: "trainer-classic", place: 1, ownersName: "Look 1", picture: expect.objectContaining({ kind: "classic" }) }),
    ]);
  });

  it("hides a trade with nothing published, and says it", () => {
    const therapist = trade(out, "therapist");
    expect(therapist.status).toEqual({ kind: "hidden" });
    expect(therapist.shown).toEqual([]);
  });

  it("leaves out a drawing still running, then one that failed", () => {
    const fresh = { ...latteAgain, updated_at: new Date(NOW - 10_000).toISOString() };
    const waiting = shelf(input([croissants, fresh], {}, ["cafe-croissants"]));
    expect(trade(waiting, "cafe").notShown).toEqual([expect.objectContaining({ id: "cafe-latte-2", reason: "drawing" })]);
    expect(waiting.drawing).toBe(true);
    const later = shelf({ ...input([croissants, fresh], {}, ["cafe-croissants"]), now: NOW + LOOK_PICTURES_WAIT_MS });
    expect(trade(later, "cafe").notShown).toEqual([expect.objectContaining({ reason: "failed" })]);
    expect(later.drawing).toBe(false);
  });

  it("leaves out a plain look with no card colour, and one past the wizard's three", () => {
    const grey = entry({ id: "cafe-grey", background_color: "brown" });
    const plains = ["a", "b", "c", "d"].map((x) => entry({ id: `cafe-${x}`, background_color: `#00000${x === "a" ? 1 : x === "b" ? 2 : x === "c" ? 3 : 4}` }));
    const result = shelf(input([croissants, grey, ...plains], {}, ["cafe-croissants"]));
    expect(trade(result, "cafe").notShown.map((r) => [r.id, r.reason])).toEqual([
      ["cafe-grey", "noColour"],
      ["cafe-a", "classicOnly"],
      ["cafe-b", "classicOnly"],
      ["cafe-c", "classicOnly"],
      ["cafe-d", "beyondThree"],
    ]);
    expect(trade(result, "cafe").notShown[0].picture).toEqual({ kind: "none" });
  });

  it("shows a draft as its card colour, never a picture that could pass for the look", () => {
    expect(trade(out, "barber").notShown[1].picture).toEqual({ kind: "swatch", colour: "#7A1F3D" });
  });
});

describe("a trade in the wizard without the options", () => {
  it("offers its plain looks first, then built-ins, three in all, and leaves the drawn ones out", () => {
    const out = shelf(input([croissants, cafeClassic, barberClassic], { available: false }, ["cafe-croissants"]));
    const cafe = trade(out, "cafe");
    expect(cafe.status).toEqual({ kind: "count", n: 3 });
    expect(cafe.shown.map((r) => [r.id, r.place, r.ownersName])).toEqual([
      ["cafe-classic", 1, "Look 1"],
      [null, 2, `onboarding.looks.names.${BUILTIN_LOOKS.cafe[1].key}`],
      [null, 3, `onboarding.looks.names.${BUILTIN_LOOKS.cafe[2].key}`],
    ]);
    expect(cafe.shown[1].key).toBe(`builtin:cafe:${BUILTIN_LOOKS.cafe[1].key}`);
    expect(cafe.notShown).toEqual([expect.objectContaining({ id: "cafe-croissants", reason: "styledOnly", picture: { kind: "strip", src: "/strip.png" } })]);
  });

  it("drops a built-in that repeats a published card's colour", () => {
    const sameAsWarm = entry({ id: "cafe-warm-copy", background_color: BUILTIN_LOOKS.cafe[0].background });
    const cafe = trade(shelf(input([sameAsWarm], { available: false })), "cafe");
    expect(cafe.shown.map((r) => r.key)).toEqual([
      "cafe-warm-copy",
      `builtin:cafe:${BUILTIN_LOOKS.cafe[1].key}`,
      `builtin:cafe:${BUILTIN_LOOKS.cafe[2].key}`,
    ]);
  });

  it("shows every trade its built-ins while the catalog has nothing published", () => {
    const out = shelf(input([barberDraft], { available: false }));
    expect(out.trades.map((x) => x.status)).toEqual(Array(5).fill({ kind: "count", n: 3 }));
    expect(trade(out, "barber").notShown.map((r) => r.reason)).toEqual(["draft"]);
    expect(shelf(input([])).trades.every((x) => x.shown.length === 3)).toBe(true);
  });
});

describe("a move inside a trade", () => {
  const ids = ["cafe-latte", "barber-scissors", "cafe-classic", "cafe-croissants", "trainer-classic", "cafe-latte-2"];
  const cafe = ["cafe-latte", "cafe-croissants", "cafe-latte-2"];

  it("swaps the trade's looks among the places they hold, and moves nothing else", () => {
    expect(movedOrder(ids, cafe, 1, 0)).toEqual([
      "cafe-croissants",
      "barber-scissors",
      "cafe-classic",
      "cafe-latte",
      "trainer-classic",
      "cafe-latte-2",
    ]);
    expect(movedOrder(ids, cafe, 2, 0)).toEqual([
      "cafe-latte-2",
      "barber-scissors",
      "cafe-classic",
      "cafe-latte",
      "trainer-classic",
      "cafe-croissants",
    ]);
    expect(movedOrder(ids, cafe, 0, 1)).toEqual(movedOrder(ids, cafe, 1, 0));
  });

  it("changes nothing for a move that can't happen", () => {
    expect(movedOrder(ids, cafe, 0, -1)).toEqual(ids);
    expect(movedOrder(ids, cafe, 2, 3)).toEqual(ids);
    expect(movedOrder(ids, cafe, 1, 1)).toEqual(ids);
  });

  it("moves only catalog looks, never a built-in", () => {
    const out = shelf(input([cafeClassic], { available: false }));
    expect(ranked(trade(out, "cafe"))).toEqual(["cafe-classic"]);
  });
});

describe("what a delete says", () => {
  const out = shelf(input([croissants, cafeClassic, barberDraft], {}, ["cafe-croissants"]));

  it("gives an offered look's place, a draft as a draft, and the rest as not shown", () => {
    const cafe = trade(out, "cafe");
    expect(deleteFact(cafe.shown[0], cafe)).toEqual({ kind: "placed", n: 1, total: 1 });
    expect(deleteFact(cafe.notShown[0], cafe)).toEqual({ kind: "notShown" });
    const barber = trade(out, "barber");
    expect(deleteFact(barber.notShown[0], barber)).toEqual({ kind: "draft" });
  });
});
