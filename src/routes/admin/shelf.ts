import type { TFunction } from "i18next";
import type { CatalogTemplate } from "../../api/catalog";
import type { DesignDoc } from "../../api/designs";
import type { Preset } from "../../api/presets";
import { isStyled } from "../../components/card-studio/designOptions";
import { lookPicturesState } from "../../components/card-studio/lookPictures";
import { normalizeHex } from "../../lib/color";
import { NICHES, type Niche } from "../onboarding/draft";
import {
  BUILTIN_LOOKS,
  drawnLooks,
  listedTrades,
  lookName,
  looksFor,
  looksOffered,
  presetLook,
  readyLooks,
  type CardLook,
} from "../onboarding/looks";

/**
 * The catalog as owners meet it (the brief's §7.6): for each trade, the
 * looks the wizard offers, in its order and under the names it gives them,
 * then the trade's other looks with why the wizard leaves each out.
 *
 * Worked out from three reads, `GET /api/admin/catalog` (every entry, drafts
 * too), `GET /api/presets` (the published ones, with their pictures) and
 * the sticker list (whether the wallet draws the design options), and only
 * through the wizard's own rules in `looks.ts`. Nothing here decides what
 * the wizard shows: a second copy of its rules is how the old list's "5/3"
 * came to describe a wizard that no longer ran. Pure, so it can be tested.
 */

/** Which wizard owners get right now. */
export type Live =
  /** The looks screen: the wallet draws the options and a look is drawn. */
  | "looks"
  /** The wallet says it draws none of the options. */
  | "plain"
  /** It draws them, but no published look has its pictures yet. */
  | "notDrawnYet"
  /** The sticker list didn't answer, which the wizard reads as no. */
  | "unanswered";

/** What stands for a look on its row. */
export type Picture =
  /** Apple's strip, as the looks screen shows it. */
  | { kind: "strip"; src: string }
  /** A plain look, as the frozen `StampGrid` draws it in its colours. */
  | { kind: "classic"; look: CardLook }
  /** No picture exists: a draft, or one not drawn. Its card colour. */
  | { kind: "swatch"; colour: string }
  /** Not even a colour to show. */
  | { kind: "none" };

/** Why the wizard leaves a look out. */
export type Reason =
  | "draft"
  | "noColour"
  /** A plain look, shown only in the wizard without the options. */
  | "classicOnly"
  /** A plain look past the three the wizard without the options offers. */
  | "beyondThree"
  /** A look built from the options, while the wizard is without them. */
  | "styledOnly"
  | "drawing"
  | "failed";

export interface ShelfRow {
  /** The catalog id, or `builtin:<trade>:<key>` for a built-in look. */
  key: string;
  /** The catalog id; none for a built-in look, which has no actions. */
  id: string | null;
  published: boolean;
  /** Its place among the looks the wizard offers, from 1; none when it isn't offered. */
  place: number | null;
  /** The name owners read, where they meet the look. */
  ownersName: string | null;
  /** The name staff typed; none for a built-in. */
  staffName: string | null;
  picture: Picture;
  /** Why it isn't offered; none when it is. */
  reason: Reason | null;
}

export type TradeStatus =
  /** How many looks the wizard offers for the trade. */
  | { kind: "count"; n: number }
  /** None drawn: the wizard shows the trade its classic look. */
  | { kind: "classic" }
  /** Nothing published: the wizard doesn't list the trade at all. */
  | { kind: "hidden" };

export interface TradeShelf {
  niche: Niche;
  status: TradeStatus;
  /** What the wizard offers, in its order. */
  shown: ShelfRow[];
  /** The trade's other looks, each with its reason, in the catalog's order. */
  notShown: ShelfRow[];
}

export interface Shelf {
  live: Live;
  trades: TradeShelf[];
  /** A look is being drawn, so its pictures are worth asking for again. */
  drawing: boolean;
}

export interface ShelfInput {
  entries: readonly CatalogTemplate[];
  presets: Preset[];
  /** The sticker list's `available`, or null where it didn't answer. */
  available: boolean | null;
  now: number;
  t: TFunction;
}

/** Which wizard owners get, as the wizard decides it (`looksOffered`). */
export function liveWizard(available: boolean | null, presets: Preset[]): Live {
  if (available === null) return "unanswered";
  if (!available) return "plain";
  return looksOffered(available, presets) ? "looks" : "notDrawnYet";
}

function swatch(colour: string | null | undefined): Picture {
  const hex = normalizeHex(colour ?? "");
  return hex ? { kind: "swatch", colour: hex } : { kind: "none" };
}

function isBuiltIn(niche: Niche, look: CardLook): boolean {
  return (BUILTIN_LOOKS[niche] ?? []).includes(look);
}

/** The rows of the looks a wizard offers as tiles of colour: the classic
 * look, or the wizard without the options' three. */
function classicRows(niche: Niche, looks: CardLook[], entries: Map<string, CatalogTemplate>, t: TFunction): ShelfRow[] {
  const names = readyLooks(looks, t);
  return looks.map((look, index) => {
    const builtIn = isBuiltIn(niche, look);
    const entry = builtIn ? undefined : entries.get(look.key);
    return {
      key: builtIn ? `builtin:${niche}:${look.key}` : look.key,
      id: builtIn ? null : look.key,
      published: !builtIn,
      place: index + 1,
      ownersName: names[index].name,
      staffName: builtIn ? null : (entry?.name ?? look.name ?? null),
      picture: { kind: "classic", look },
      reason: null,
    };
  });
}

/** Why a look the wizard leaves out is left out, and what stands for it. */
function leftOut(
  entry: CatalogTemplate,
  niche: Niche,
  looksMode: boolean,
  presets: Preset[],
  now: number,
): Pick<ShelfRow, "reason" | "picture"> {
  if (!entry.is_published) return { reason: "draft", picture: swatch(entry.background_color) };
  const preset = presets.find((p) => p.id === entry.id);
  if (isStyled((entry.design ?? {}) as DesignDoc)) {
    const strip = preset?.pictures?.strip;
    if (!looksMode) return { reason: "styledOnly", picture: strip ? { kind: "strip", src: strip } : swatch(entry.background_color) };
    const state = lookPicturesState({
      published: true,
      styled: true,
      pictures: preset?.pictures,
      savedAt: Date.parse(entry.updated_at),
      now,
    });
    return { reason: state.kind === "drawing" ? "drawing" : "failed", picture: swatch(entry.background_color) };
  }
  const look = presetLook(entry, niche);
  if (!look) return { reason: "noColour", picture: { kind: "none" } };
  const offeredPlain = looksFor(niche, presets).some((l) => l.key === entry.id);
  return { reason: looksMode && offeredPlain ? "classicOnly" : "beyondThree", picture: { kind: "classic", look } };
}

/** Each trade as owners meet it, in `NICHES`' order. */
export function shelf({ entries, presets, available, now, t }: ShelfInput): Shelf {
  const live = liveWizard(available, presets);
  const looksMode = live === "looks";
  const byId = new Map(entries.filter((e) => e.id).map((e) => [e.id as string, e]));
  const listed = listedTrades(presets, null);

  const trades = NICHES.map((niche): TradeShelf => {
    let status: TradeStatus;
    let shown: ShelfRow[] = [];
    if (!listed.includes(niche)) {
      status = { kind: "hidden" };
    } else if (looksMode) {
      const drawn = drawnLooks(niche, presets);
      if (drawn.length) {
        status = { kind: "count", n: drawn.length };
        shown = drawn.map((preset, index) => ({
          key: preset.id,
          id: preset.id,
          published: true,
          place: index + 1,
          ownersName: lookName(preset, drawn, t),
          staffName: byId.get(preset.id)?.name ?? preset.name,
          picture: { kind: "strip", src: preset.pictures!.strip },
          reason: null,
        }));
      } else {
        status = { kind: "classic" };
        shown = classicRows(niche, looksFor(niche, presets).slice(0, 1), byId, t);
      }
    } else {
      shown = classicRows(niche, looksFor(niche, presets), byId, t);
      status = { kind: "count", n: shown.length };
    }

    const offered = new Set(shown.map((row) => row.id).filter(Boolean));
    const notShown = entries
      .filter((entry) => entry.niche === niche && entry.id && !offered.has(entry.id))
      .map(
        (entry): ShelfRow => ({
          key: entry.id as string,
          id: entry.id as string,
          published: entry.is_published,
          place: null,
          ownersName: null,
          staffName: entry.name,
          ...leftOut(entry, niche, looksMode, presets, now),
        }),
      );
    return { niche, status, shown, notShown };
  });

  return { live, trades, drawing: trades.some((trade) => trade.notShown.some((row) => row.reason === "drawing")) };
}

/** The catalog's ids in the order they should take for a look to move from
 * one place in its trade to another: the trade's offered looks change
 * places among the slots they already hold in the catalog's one order, and
 * every other look stays where it is, so no other trade's order moves. */
export function movedOrder(ids: readonly string[], ranked: readonly string[], from: number, to: number): string[] {
  const own = ranked.filter((id) => ids.includes(id));
  if (from < 0 || from >= own.length || to < 0 || to >= own.length || from === to) return [...ids];
  const slots = own.map((id) => ids.indexOf(id)).sort((a, b) => a - b);
  const next = [...own];
  const [moving] = next.splice(from, 1);
  next.splice(to, 0, moving);
  const out = [...ids];
  slots.forEach((slot, index) => {
    out[slot] = next[index];
  });
  return out;
}

/** The catalog looks of a trade that can move: the ones it offers, in order. */
export function ranked(trade: TradeShelf): string[] {
  return trade.shown.map((row) => row.id).filter((id): id is string => id !== null);
}

/** What a delete's second fact says about the look. */
export type DeleteFact =
  | { kind: "placed"; n: number; total: number }
  | { kind: "draft" }
  | { kind: "notShown" };

export function deleteFact(row: ShelfRow, trade: TradeShelf): DeleteFact {
  if (row.place !== null) return { kind: "placed", n: row.place, total: trade.shown.length };
  return row.published ? { kind: "notShown" } : { kind: "draft" };
}
