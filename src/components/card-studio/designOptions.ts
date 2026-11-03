import type { DesignDoc, DesignField } from "../../api/designs";
import type { Sticker } from "./controls/controlRules";
import type { StickersStatus } from "./controls/StickerPicker";
import type { CardStudioValue } from "./studioDraft";

/**
 * The card design options passbox-api added in v0.1.1 (its GUIDE §8.2), as
 * PunchMe's design doc keeps them, pure so they can be tested:
 *
 * - how a stamp is drawn: `stamp.style` (in a circle, or on its own),
 *   `stamp.mark` (a check on each stamp), `stamp.sticker` (a built-in sticker
 *   in place of the glyph) and `stamp.tint` (the sticker or picture in the
 *   stamp colour);
 * - what stands behind the stamps: `panel_color` and `wallpaper`;
 * - where Apple Wallet shows the count and how: `stamps_place`,
 *   `stamps_format`;
 * - the business's name beside an uploaded logo: `logo_text`.
 *
 * A key that isn't there is at its default, which is the card as it was
 * before them. The studio's own drawing (`StampGrid`) knows only v0.1's badge
 * grid, so a card that uses the strip's new parts is drawn by the server.
 */

export type StampsPlace = "secondary" | "header";
export type StampsFormat = "count" | "fraction";

export interface DesignOptions {
  style: "badge" | "icon";
  mark: "none" | "check";
  /** "" is none: the glyph. */
  sticker: string;
  tint: boolean;
  /** "" is no panel. */
  panelColor: string;
  /** "" is no wallpaper. */
  wallpaper: string;
  stampsPlace: StampsPlace;
  stampsFormat: StampsFormat;
  logoText: boolean;
}

const text = (value: unknown): string => (typeof value === "string" ? value : "");

/** The options a design has, each at its default where it says nothing. */
export function designOptions(design: DesignDoc): DesignOptions {
  const stamp = design.stamp ?? {};
  return {
    style: stamp.style === "icon" ? "icon" : "badge",
    mark: stamp.mark === "check" ? "check" : "none",
    sticker: text(stamp.sticker),
    tint: stamp.tint === true,
    panelColor: text(design.panel_color),
    wallpaper: text(design.wallpaper),
    stampsPlace: design.stamps_place === "header" ? "header" : "secondary",
    stampsFormat: design.stamps_format === "fraction" ? "fraction" : "count",
    logoText: design.logo_text === true,
  };
}

/** True when the strip uses a part the studio's own drawing can't draw (a
 * stamp on its own, a sticker, a panel, a wallpaper): then the server's
 * picture is the card. A check or a tint draws only on a stamp on its own. */
export function isStyled(design: DesignDoc): boolean {
  const options = designOptions(design);
  return options.style === "icon" || !!options.sticker || !!options.panelColor || !!options.wallpaper;
}

/** The check and the tint draw only on a stamp on its own: on a badge they
 * are kept, for a switch back, and do nothing. */
export function iconOnlyOptionsShow(design: DesignDoc): boolean {
  return designOptions(design).style === "icon";
}

/** What Apple Wallet's stamp count says: "6", or "6/8". No spaces, as the
 * pass writes it, so a right-to-left card reads it as one number. */
export function stampsText(design: DesignDoc, count: number, total: number): string {
  return designOptions(design).stampsFormat === "fraction" ? `${count}/${total}` : String(count);
}

/** A design with one stamp option set, the rest of the stamp as it was. */
export function withStamp(value: CardStudioValue, patch: Partial<NonNullable<DesignDoc["stamp"]>>): CardStudioValue {
  return { ...value, design: { ...value.design, stamp: { ...value.design.stamp, ...patch } } };
}

/** A design with one of its own options set. */
export function withOption(value: CardStudioValue, patch: Partial<DesignDoc>): CardStudioValue {
  return { ...value, design: { ...value.design, ...patch } };
}

/** The binding of the stamp count's field. */
export const COUNT_BINDING = "members.member.points";

/** Where the stamp count's field sits, or "" when the card has none. */
export function countSection(fields: readonly DesignField[] | undefined): string {
  return fields?.find((field) => field.binding === COUNT_BINDING)?.section ?? "";
}

/**
 * The count at the top or under the strip. passbox-api reads `stamps_place`;
 * the count's field moves with it, so Wallet details, which places every
 * field, says the same. Under the strip it goes back where the saved card
 * has it (`savedFields`), so a move there and back is no change, or else to
 * the face's own row; a count already on the face elsewhere stays.
 */
export function withStampsPlace(
  value: CardStudioValue,
  place: StampsPlace,
  savedFields?: readonly DesignField[],
): CardStudioValue {
  const saved = countSection(savedFields);
  const below = (saved && saved !== "HEADER_FIELDS" ? saved : "SECONDARY_FIELDS") as DesignField["section"];
  const fields = value.design.fields?.map((field) => {
    if (field.binding !== COUNT_BINDING) return field;
    if (place === "header") return { ...field, section: "HEADER_FIELDS" as const };
    return field.section === "HEADER_FIELDS" ? { ...field, section: below } : field;
  });
  return { ...value, design: { ...value.design, stamps_place: place, ...(fields ? { fields } : {}) } };
}

/** New fields for the card, from Wallet details. A count moved to the top,
 * or away from it, moves the count's place with it (`withStampsPlace`'s
 * other half): the two are one setting. */
export function withFields(value: CardStudioValue, fields: DesignField[]): CardStudioValue {
  const was = countSection(value.design.fields);
  const now = countSection(fields);
  const design: DesignDoc = { ...value.design, fields };
  if (was !== now && (was === "HEADER_FIELDS" || now === "HEADER_FIELDS")) {
    design.stamps_place = now === "HEADER_FIELDS" ? "header" : "secondary";
  }
  return { ...value, design };
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (typeof value !== "object" || value === null) return value;
  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .map((key) => [key, stable(record[key])]),
  );
}

/** What a picture of the server's was drawn from: everything the strip and
 * the hero are made of (the count, the colours, the stamp and what stands
 * behind it) and the sample, however its keys were ordered. A label, a field
 * or the reward changes none of it, so typing one asks for no new picture. */
export function drawKey(value: CardStudioValue, state: number): string {
  const { design } = value;
  const options = designOptions(design);
  return JSON.stringify(
    stable({
      state,
      stamps: value.stamps_required,
      background: value.background_color.toUpperCase(),
      // The renderer's stamp colour: the text colour where none is set.
      stampColour: (design.stamp?.color || value.foreground_color).toUpperCase(),
      glyph: design.stamp?.glyph || "check",
      style: options.style,
      mark: options.mark,
      sticker: options.sticker,
      tint: options.tint,
      pattern: design.pattern || "none",
      panel: options.panelColor.toUpperCase(),
      wallpaper: options.wallpaper,
    }),
  );
}

/** The server's picture of a card at one count: Apple's strip and Google's
 * hero, as data URLs. */
export interface DrawnCard {
  key: string;
  strip?: string;
  hero?: string;
}

/** The strip and hero at `state` out of a design read's or a preview's
 * `images`, where each is `{state: url}`. */
export function picturesAt(images: unknown, state: number): Omit<DrawnCard, "key"> {
  const record = (images && typeof images === "object" ? images : {}) as Record<string, unknown>;
  const at = (role: string) => {
    const states = record[role];
    if (!states || typeof states !== "object") return undefined;
    const url = (states as Record<string, unknown>)[String(state)];
    return typeof url === "string" && url ? url : undefined;
  };
  return { strip: at("strip_states"), hero: at("hero_states") };
}

/** The wallet's sticker list (`GET .../stickers`), and whether it draws the
 * card design options at all. While it doesn't say so, the studio offers
 * none of them: a server that can't draw them refuses a card that has one. */
export interface StudioStickers {
  list: readonly Sticker[];
  status: StickersStatus;
  available: boolean;
}

/** The sticker list as a read of it stands: on its way, there (and whether
 * the options are), or failed, when the studio offers none of them. */
export function studioStickers(read: {
  data?: { stickers: Sticker[]; available: boolean };
  isError: boolean;
}): StudioStickers {
  if (read.data) return { list: read.data.stickers, status: "ready", available: read.data.available };
  return { list: [], status: read.isError ? "unavailable" : "loading", available: false };
}

/** A design read's own picture, keyed by the card it read: the server drew
 * the stored card at one count (the studio's sample, or the one asked for),
 * so it stands for any draft whose strip is that card's at that count. */
export function readPicture(value: CardStudioValue, images: unknown): DrawnCard | null {
  const state = drawnState(images);
  if (state === null) return null;
  return { key: drawKey(value, state), ...picturesAt(images, state) };
}

/** The count a design read's pictures were drawn at, or null for none. A
 * read drawn by passbox-api holds one: the studio's sample, or the one asked
 * for. */
export function drawnState(images: unknown): number | null {
  const record = (images && typeof images === "object" ? images : {}) as Record<string, unknown>;
  const states = record.strip_states ?? record.hero_states;
  const state = states && typeof states === "object" ? Number(Object.keys(states)[0]) : NaN;
  return Number.isInteger(state) ? state : null;
}

/** What to ask the server 400 ms after an edit, or as the sample moves: the
 * check alone, or for a card it draws itself, the check and its picture at
 * the count shown. Nothing while a plain card is unchanged, or while a
 * drawn card's picture of this strip at this count is already in hand. */
export interface ServerAsk {
  value: CardStudioValue;
  /** The count to draw; none for the check alone. */
  state?: number;
  images: boolean;
}

export function serverAsk({
  value,
  sample,
  changed,
  pictures,
}: {
  value: CardStudioValue;
  sample: number;
  /** The draft differs from the saved card. */
  changed: boolean;
  /** The server's pictures in hand: its latest, the design read's. */
  pictures: readonly (DrawnCard | null)[];
}): ServerAsk | null {
  if (isStyled(value.design)) {
    const key = drawKey(value, sample);
    // One answered for this strip, drawn or not: a failure isn't asked again
    // until something changes.
    if (pictures.some((picture) => picture?.key === key)) return changed ? { value, images: false } : null;
    return { value, state: sample, images: true };
  }
  return changed ? { value, images: false } : null;
}

/** Whether an ask is one already sent: the same draft (by identity: an
 * edit makes a new one), and if it wants a picture, a picture at the same
 * count. A picture's answer carries the check too, so the check alone of
 * that draft is never asked again. */
export function alreadyAsked(was: ServerAsk | null, ask: ServerAsk): boolean {
  if (!was || was.value !== ask.value) return false;
  return !ask.images || (was.images && was.state === ask.state);
}

/** What the stage hands the frozen previews for the count shown: the
 * pictures to treat as published, whether they stand for the draft (so the
 * stand-in steps aside), whether a fresher one is on its way, and whether
 * the server answered for this draft and drew nothing. */
export interface StagePictures {
  stripStates?: Record<string, string>;
  heroStates?: Record<string, string>;
  /** The stand-in shows: nothing the server drew stands for this draft. */
  unsaved: boolean;
  /** A picture of this draft at this count is still to come (or loading). */
  drawing: boolean;
  failed: boolean;
}

export function stagePictures({
  styled,
  unsaved,
  sample,
  stripStates,
  heroStates,
  pictures,
  key,
  loaded = () => true,
}: {
  styled: boolean;
  unsaved: boolean;
  sample: number;
  /** The published pictures that have loaded (a plain card's). */
  stripStates?: Record<string, string>;
  heroStates?: Record<string, string>;
  /** The server's pictures of a card it draws itself, first found first:
   * the design read's, then its latest of the draft. */
  pictures: readonly (DrawnCard | null)[];
  /** `drawKey` of the draft and the count shown. */
  key: string;
  /** Whether a picture's image has loaded on this page: one that hasn't is
   * on its way, not missing. */
  loaded?: (url: string) => boolean;
}): StagePictures {
  if (!styled) return { stripStates, heroStates, unsaved, drawing: false, failed: false };
  const at = (url: string | undefined) => (url && loaded(url) ? { [String(sample)]: url } : undefined);
  const shows = (picture: DrawnCard | null): picture is DrawnCard =>
    !!picture && !!((picture.strip && loaded(picture.strip)) || (picture.hero && loaded(picture.hero)));
  const fresh = pictures.find((picture) => shows(picture) && picture.key === key);
  if (fresh) {
    return { stripStates: at(fresh.strip), heroStates: at(fresh.hero), unsaved: false, drawing: false, failed: false };
  }
  // The server answered for this strip at this count and drew nothing. One
  // it drew that hasn't loaded yet is on its way, not a failure.
  const failed = pictures.some((picture) => picture?.key === key && !picture.strip && !picture.hero);
  // The last picture the server drew, of an earlier draft or count, stands in
  // until the fresh one comes: closer to the card than the badge grid.
  const stale = pictures.find(shows);
  if (stale) {
    return { stripStates: at(stale.strip), heroStates: at(stale.hero), unsaved: false, drawing: !failed, failed };
  }
  return { stripStates: undefined, heroStates: undefined, unsaved: true, drawing: !failed, failed };
}
