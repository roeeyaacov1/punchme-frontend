import type { DesignDoc, DesignField } from "../../api/designs";
import type { Sticker, StickersStatus } from "./controls/controlRules";
import type { CardStudioValue, HeldPictures } from "./studioDraft";

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

/** The pictures held for Save that the server draws a card with (backend
 * PR #20, `held`): the stamp's, the before and after art, and the strip
 * background. Never the logo, which the stage shows itself. */
export const HELD_ART_USES = ["stamp_art", "stamped_art", "unstamped_art", "strip_base"] as const;

export type HeldArt = Partial<Record<(typeof HELD_ART_USES)[number], string>>;

export function heldArt(held: HeldPictures | undefined): HeldArt {
  const art: HeldArt = {};
  for (const use of HELD_ART_USES) if (held?.[use]) art[use] = held[use];
  return art;
}

/** A held picture told apart from another without the whole data URL in
 * every key: its length and its last characters. */
function fingerprint(dataUrl: string): string {
  return `${dataUrl.length}:${dataUrl.slice(-32)}`;
}

function heldKey(held: HeldArt | undefined): Record<string, string> {
  return Object.fromEntries(HELD_ART_USES.flatMap((use) => (held?.[use] ? [[use, fingerprint(held[use]!)]] : [])));
}

/** What a picture of the server's was drawn from: everything the strip and
 * the hero are made of (the count, the colours, the stamp and what stands
 * behind it, and the pictures held for Save it was drawn with) and the
 * sample, however its keys were ordered. A label, a field or the reward
 * changes none of it, so typing one asks for no new picture. */
export function drawKey(value: CardStudioValue, state: number, held?: HeldArt): string {
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
      held: heldKey(held),
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

/**
 * How the studio stands toward the options (brief §6.1, §6.7):
 * - `options`: the list says the wallet draws them, and the trays offer them;
 * - `outage`: the list can't be read, and the card already uses them, so the
 *   trays say what it has and offer nothing that would drop it unasked;
 * - `plain`: today's studio, exactly.
 */
export type StudioMode = "options" | "outage" | "plain";

export function studioMode(stickers: StudioStickers, design: DesignDoc): StudioMode {
  if (stickers.available) return "options";
  if (stickers.status === "unavailable" && isStyled(design)) return "outage";
  return "plain";
}

/**
 * What draws nothing gets out of the way (§6.7), one rule each.
 *
 * The tint ("בצבע הכרטיס") shades a sticker or a picture; the glyph is drawn
 * in the stamp colour already.
 */
export function tintShows(design: DesignDoc, pictureInUse: boolean): boolean {
  return !!designOptions(design).sticker || pictureInUse;
}

/** The tint as its switch shows it: the wallet draws it only on a stamp on
 * its own, so on a stamp in a circle it is off, though the doc keeps it for a
 * switch back. */
export function tintDrawn(design: DesignDoc): boolean {
  const options = designOptions(design);
  return options.tint && options.style === "icon";
}

/** The check isn't offered to owners (§5): a card that has it, on a stamp on
 * its own, shows the switch so it can be turned off, and keeps showing it
 * until a save leaves neither the card nor the draft with one, so it never
 * goes from under the finger. The catalog editor offers it always. */
export function markShows(design: DesignDoc, saved: DesignDoc, always = false): boolean {
  if (designOptions(design).style !== "icon") return false;
  return always || designOptions(design).mark === "check" || designOptions(saved).mark === "check";
}

/** Whether the stamps are drawn in their colour, so it is judged against what
 * they stand on (§11): a circle is always in the stamp colour, and on its own
 * a glyph is, or a sticker or a picture once tinted. An untinted sticker or
 * photo keeps its own colours. */
export function stampsDrawnInColour(design: DesignDoc, pictureInUse: boolean): boolean {
  const options = designOptions(design);
  if (options.style === "badge") return true;
  if (!options.sticker && !pictureInUse) return true;
  return tintDrawn(design);
}

/** A strip picture covers any pattern: the choice gives way to one line. */
export function patternShows(stripPictureInUse: boolean): boolean {
  return !stripPictureInUse;
}

/** A logo wider than this is a wordmark that already says the name
 * (passbox lint, `branding.logo_text`). */
export const WIDE_LOGO = 2;

export type LogoShape = "none" | "mark" | "wide";

/** The business's own logo, held or saved, as the name beside it needs it:
 * none, a mark (where the name can stand beside it), or a wide one. Its size
 * is the picture's own, once it has loaded; until then it counts as a mark. */
export function logoShape(ownLogo: boolean, size?: { width: number; height: number } | null): LogoShape {
  if (!ownLogo) return "none";
  if (size && size.height > 0 && size.width / size.height >= WIDE_LOGO) return "wide";
  return "mark";
}

/** Google Wallet shows about this many characters of a name (passbox lint). */
export const GOOGLE_NAME_CHARS = 20;

/** The first 20 characters of a name past Google's 20, as Google would show
 * them, or null for a name that fits. Counted by character, not UTF-16 unit. */
export function googleCut(text: string, limit = GOOGLE_NAME_CHARS): string | null {
  const chars = Array.from(text.trim());
  return chars.length > limit ? chars.slice(0, limit).join("") : null;
}

/** A pattern behind the stamps as one choice (§6.4): one of the textures, or a
 * sticker repeated faintly (`sticker:<name>`, the wallpaper). */
export type PatternChoice = "none" | "waves" | "dots" | "stripes" | `sticker:${string}`;

const TEXTURES = ["none", "waves", "dots", "stripes"] as const;

export function patternChoice(design: DesignDoc): PatternChoice {
  const wallpaper = designOptions(design).wallpaper;
  if (wallpaper) return `sticker:${wallpaper}`;
  const pattern = design.pattern;
  return pattern && (TEXTURES as readonly string[]).includes(pattern) ? pattern : "none";
}

/** The design with a pattern chosen. A sticker takes the texture's place, so
 * the texture is stored as none beside it: one choice, one stored value. */
export function withPatternChoice(value: CardStudioValue, choice: PatternChoice): CardStudioValue {
  if (choice.startsWith("sticker:")) {
    return withOption(value, { wallpaper: choice.slice("sticker:".length), pattern: "none" });
  }
  return withOption(value, { wallpaper: "", pattern: choice as DesignDoc["pattern"] });
}

/** What a styled card's stamps have, said in words while its options can't be
 * changed (§6.7): "קרואסון, בצבע הכרטיס, לבד". `names` holds the words. */
export function stampSummary(
  design: DesignDoc,
  names: { sticker: (name: string) => string; tinted: string; badge: string; icon: string },
): string {
  const options = designOptions(design);
  return [
    options.sticker ? names.sticker(options.sticker) : "",
    tintDrawn(design) ? names.tinted : "",
    options.style === "icon" ? names.icon : names.badge,
  ]
    .filter(Boolean)
    .join(", ");
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
  /** The pictures held for Save it is drawn with. */
  held?: HeldArt;
}

export function serverAsk({
  value,
  sample,
  changed,
  pictures,
  held,
}: {
  value: CardStudioValue;
  sample: number;
  /** The pictures held for Save, which the server draws the card with. */
  held?: HeldArt;
  /** The draft differs from the saved card. */
  changed: boolean;
  /** The server's pictures in hand: its latest, the design read's. */
  pictures: readonly (DrawnCard | null)[];
}): ServerAsk | null {
  if (isStyled(value.design)) {
    const key = drawKey(value, sample, held);
    // One answered for this strip, drawn or not: a failure isn't asked again
    // until something changes.
    if (pictures.some((picture) => picture?.key === key)) return changed ? { value, images: false } : null;
    return { value, state: sample, images: true, held };
  }
  return changed ? { value, images: false } : null;
}

/** Whether an ask is one already sent: the same draft (by identity: an
 * edit makes a new one), and if it wants a picture, a picture at the same
 * count. A picture's answer carries the check too, so the check alone of
 * that draft is never asked again. */
export function alreadyAsked(was: ServerAsk | null, ask: ServerAsk): boolean {
  if (!was || was.value !== ask.value) return false;
  if (!ask.images) return true;
  return was.images && was.state === ask.state && JSON.stringify(heldKey(was.held)) === JSON.stringify(heldKey(ask.held));
}

/** The saved card's own picture, out of the design read: the server drew the
 * stored card at one count. */
export interface SavedPicture {
  state: number;
  strip?: string;
  hero?: string;
}

export function savedPictureOf(images: unknown): SavedPicture | null {
  const state = drawnState(images);
  return state === null ? null : { state, ...picturesAt(images, state) };
}

/**
 * What the stage shows when a drawing of the draft failed (§6.6): the saved
 * card, which is what customers have, never a picture of a card that is
 * neither the draft nor the saved one. A saved card the server draws itself
 * stands at the count its picture was drawn at; a plain one at the count
 * shown, from its published pictures, or the stand-in where they haven't
 * loaded. A styled card with no picture of its own falls to the stand-in.
 */
export function stageOnFailure({
  saved,
  savedPicture,
  sample,
  stripStates,
  heroStates,
}: {
  saved: CardStudioValue;
  savedPicture: SavedPicture | null;
  sample: number;
  /** The published pictures that have loaded (a plain card's). */
  stripStates?: Record<string, string>;
  heroStates?: Record<string, string>;
}): { currentStamps: number; stripStates?: Record<string, string>; heroStates?: Record<string, string>; unsaved: boolean } {
  const count = Math.min(sample, saved.stamps_required);
  if (!isStyled(saved.design)) return { currentStamps: count, stripStates, heroStates, unsaved: false };
  if (!savedPicture || (!savedPicture.strip && !savedPicture.hero)) {
    return { currentStamps: count, unsaved: true };
  }
  const at = (url?: string) => (url ? { [String(savedPicture.state)]: url } : undefined);
  return {
    currentStamps: savedPicture.state,
    stripStates: at(savedPicture.strip),
    heroStates: at(savedPicture.hero),
    unsaved: false,
  };
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

/** What the stage last showed in the strip's place: a picture (Apple's strip
 * and Google's hero), or the stand-in a card is drawn with on the page. */
export type StageShown = { strip?: string; hero?: string } | "stand-in";

export function stagePictures({
  styled,
  unsaved,
  sample,
  stripStates,
  heroStates,
  pictures,
  key,
  loaded = () => true,
  last = null,
  need,
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
  /** What the stage showed last (`stageShown`), kept up while the fresh
   * picture is on its way. */
  last?: StageShown | null;
  /** The wallet's own picture, Apple's strip or Google's hero: a picture
   * counts as shown only once that one has loaded. Left out, either. */
  need?: "strip" | "hero";
}): StagePictures {
  if (!styled) return { stripStates, heroStates, unsaved, drawing: false, failed: false };
  const at = (url: string | undefined) => (url && loaded(url) ? { [String(sample)]: url } : undefined);
  const shows = (picture: { strip?: string; hero?: string } | null): picture is DrawnCard => {
    if (!picture) return false;
    if (need) return !!picture[need] && loaded(picture[need]!);
    return !!((picture.strip && loaded(picture.strip)) || (picture.hero && loaded(picture.hero)));
  };
  const fresh = pictures.find((picture) => shows(picture) && picture.key === key);
  if (fresh) {
    return { stripStates: at(fresh.strip), heroStates: at(fresh.hero), unsaved: false, drawing: false, failed: false };
  }
  // The server answered for this strip at this count and drew nothing. One
  // it drew that hasn't loaded yet is on its way, not a failure.
  const failed = pictures.some((picture) => picture?.key === key && !picture.strip && !picture.hero);
  // While the fresh one comes, the stage keeps what it shows (§6.6): another
  // picture in between, such as the saved card's, would be a flash.
  if (last === "stand-in") return { stripStates: undefined, heroStates: undefined, unsaved: true, drawing: !failed, failed };
  if (last && shows(last)) {
    return { stripStates: at(last.strip), heroStates: at(last.hero), unsaved: false, drawing: !failed, failed };
  }
  // Nothing to keep: the last picture the server drew, of an earlier draft or
  // count, stands in until the fresh one comes, closer to the card than the
  // badge grid.
  const stale = pictures.find(shows);
  if (stale) {
    return { stripStates: at(stale.strip), heroStates: at(stale.hero), unsaved: false, drawing: !failed, failed };
  }
  return { stripStates: undefined, heroStates: undefined, unsaved: true, drawing: !failed, failed };
}

/**
 * What the stage shows now, for `stagePictures` to keep up while a drawing is
 * on its way: the picture at the count, or the stand-in. A styled card's
 * stand-in shown only until any picture of it has loaded (`waiting`) is
 * nothing to keep, unless it was being kept already.
 */
export function stageShown(
  last: StageShown | null,
  {
    stripStates,
    heroStates,
    count,
    unsaved,
    waiting,
  }: {
    stripStates?: Record<string, string>;
    heroStates?: Record<string, string>;
    count: number;
    unsaved: boolean;
    waiting: boolean;
  },
): StageShown | null {
  const strip = unsaved ? undefined : stripStates?.[String(count)];
  const hero = unsaved ? undefined : heroStates?.[String(count)];
  if (strip || hero) return { strip, hero };
  return !waiting || last === "stand-in" ? "stand-in" : null;
}
