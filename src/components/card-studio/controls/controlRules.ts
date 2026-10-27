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
