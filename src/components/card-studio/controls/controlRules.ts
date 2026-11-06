import type { TFunction } from "i18next";
import { contrastRatio, normalizeHex, readableInk } from "../../../lib/color";
import { STAMP_GLYPH_NAMES } from "../../../lib/stampGlyphs";
import { NICHE_GLYPH } from "../../../routes/onboarding/draft";

/**
 * The card controls' own rules, pure so they can be tested: which ready
 * look a card still wears, when a stamp colour stops showing, what
 * "automatic" text means, the glyphs in the trade's order, and when a text
 * field starts counting.
 */

/** The four colours a card is painted in. A ready look writes all four. */
export interface CardColours {
  background: string;
  stamp: string;
  text: string;
  label: string;
}

/** A ready-made look: four colours and the name it is offered under. */
export interface ReadyLook extends CardColours {
  key: string;
  name: string;
}

/** The renderer draws 2 to 12 stamps (apps/wallet/strips.py). */
export const MIN_STAMPS = 2;
export const MAX_STAMPS = 12;

/** The API keeps a reward to 200 characters (CardTemplateIn). */
export const REWARD_MAX = 200;

/** A stamp colour under this reads as part of the card, not a stamp on it:
 * the UI-component floor, and the one onboarding already offers against. */
export const MIN_STAMP_CONTRAST = 3;

function same(a: string, b: string): boolean {
  return (normalizeHex(a) ?? a) === (normalizeHex(b) ?? b);
}

/** The look the card still wears, or null. A look is a shortcut that writes
 * four colours, not a stored choice: an owner who then moves one colour has
 * left it, so nothing should still look chosen. */
export function matchingLook(colours: CardColours, looks: readonly ReadyLook[]): string | null {
  const look = looks.find(
    (candidate) =>
      same(candidate.background, colours.background) &&
      same(candidate.stamp, colours.stamp) &&
      same(candidate.text, colours.text) &&
      same(candidate.label, colours.label),
  );
  return look?.key ?? null;
}

/** True when the stamp will barely show on the card. Allowed, and said. */
export function isFaint(stamp: string, background: string): boolean {
  if (!normalizeHex(stamp) || !normalizeHex(background)) return false;
  return contrastRatio(stamp, background) < MIN_STAMP_CONTRAST;
}

/** Where a colour sits among offered swatches, or -1 for one of your own. */
export function swatchIndex(value: string | null, swatches: readonly string[]): number {
  if (!value) return -1;
  return swatches.findIndex((hex) => same(hex, value));
}

export type TextMode = "auto" | "white" | "black" | "custom";

/** The text colour's mode. `null` is automatic, as onboarding's draft keeps it. */
export function textModeOf(value: string | null): TextMode {
  if (value === null) return "auto";
  if (same(value, "#FFFFFF")) return "white";
  if (same(value, "#000000")) return "black";
  return "custom";
}

/** What automatic means on this card: black or white by its luminance. */
export function automaticText(background: string): string {
  return readableInk(background);
}

/** The sixteen glyphs with the trade's own first, the rest in their order. */
export function glyphsForTrade(niche: string | null | undefined): string[] {
  const own = niche ? (NICHE_GLYPH as Record<string, string | undefined>)[niche] : undefined;
  if (!own || !STAMP_GLYPH_NAMES.includes(own)) return [...STAMP_GLYPH_NAMES];
  return [own, ...STAMP_GLYPH_NAMES.filter((name) => name !== own)];
}

/** How many characters are left, once it matters: null until `from`
 * characters have been typed, so a short reward says nothing. Counted as
 * `maxLength` counts them, so the count reaches 0 where the field stops. */
export function charactersLeft(value: string, max: number, from: number): number | null {
  if (value.length < from) return null;
  return Math.max(0, max - value.length);
}

/** A paragraph, never lines: a pasted break, with the spaces round it, is one
 * space. The pass sets the reward as one run of words. */
export function oneParagraph(text: string): string {
  return text.replace(/[ \t]*[\r\n]+[ \t]*/g, " ");
}

/** How a stamp is drawn: in a filled circle, or the art on its own. */
export type StampStyle = "badge" | "icon";

/** Where the list of stickers stands: on its way, there, or not to be had. */
export type StickersStatus = "loading" | "ready" | "unavailable";

/** One of the wallet's built-in stickers, as the server lists it: its name
 * and a small picture of it. */
export interface Sticker {
  name: string;
  image: string;
}

/** A sticker as a person reads it: its own words where the app has them, and
 * otherwise its name with spaces ("glowing-star" is "glowing star"), for one
 * a newer server added. */
export function stickerLabel(name: string, t: TFunction): string {
  return t(`stickers.${name}`, { defaultValue: name.replace(/-/g, " ") });
}

/** Grounds offered for the panel: light ones for dark stamps and the reverse,
 * as the reference cards use them (white, cream, sand, mint, blush, navy). */
export const PANEL_SWATCHES = ["#FFFFFF", "#F6E7CB", "#F5EFE6", "#E3F4EC", "#FFF1F2", "#1A1F38"] as const;

/** Their names, in the same order: the grounds are said by name, never by
 * their hex (`cardControls.panel.names.*`). */
export const PANEL_SWATCH_NAMES = ["white", "cream", "sand", "mint", "blush", "navy"] as const;

/** Below this a panel's colour is too close to the card's to show: the
 * renderer's own check (passbox lint, MIN_PANEL_CONTRAST). */
export const MIN_PANEL_CONTRAST = 1.1;

/** True when the panel will barely show on the card. Allowed, and said. */
export function panelFaint(panel: string, background: string): boolean {
  if (!normalizeHex(panel) || !normalizeHex(background)) return false;
  return contrastRatio(panel, background) < MIN_PANEL_CONTRAST;
}
