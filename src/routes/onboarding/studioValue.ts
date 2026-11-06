import type { TFunction } from "i18next";
import { designOptions, type DesignOptions } from "../../components/card-studio/designOptions";
import type { CardStudioValue } from "../../components/card-studio/studioDraft";
import { CARD_PATTERNS, type CardPattern } from "../../lib/cardPatterns";
import { normalizeHex } from "../../lib/color";
import { STAMP_GLYPH_NAMES } from "../../lib/stampGlyphs";
import { buildDesignDoc, type DraftOptions, type OnboardingDraft, type ResolvedDraft } from "./draft";

/**
 * The map's card as the studio's trays take it, and a tray's change written
 * back into the draft. The trays the studio draws the design options with
 * (the business colour, the stamp, what stands behind it, the count on the
 * card) serve a card from a look as they are (card looks, brief §7.4), so a
 * control changed for one is changed for both. Pure, so it can be tested.
 */
export function studioValueOf(resolved: ResolvedDraft, lang: string, t: TFunction, cardName: string): CardStudioValue {
  return {
    name: cardName,
    stamps_required: resolved.stampsRequired,
    reward_description: resolved.reward,
    background_color: resolved.background,
    foreground_color: resolved.foreground,
    label_color: resolved.label,
    design: buildDesignDoc(resolved, lang, t),
  };
}

/** The options the draft keeps as `options`: the ground is a field of its
 * own, and the check isn't the wizard's. */
const KEPT: (keyof DesignOptions)[] = ["style", "sticker", "tint", "wallpaper", "stampsPlace", "stampsFormat", "logoText"];

function sameOptions(a: DesignOptions, b: DesignOptions): boolean {
  return KEPT.every((key) => a[key] === b[key]);
}

/**
 * What a tray's change writes: only what it changed from the card it was
 * shown (`shown`), so a colour the draft leaves to the card (an automatic
 * text or label) stays automatic. The options go as a whole once one of
 * them changes; the check isn't one, since the wizard never offers it. The
 * stamp's own choice changes only with its glyph: a picture is chosen, and
 * given up, through the picture's own path.
 */
export function draftPatchOf(next: CardStudioValue, shown: CardStudioValue): Partial<OnboardingDraft> {
  const patch: Partial<OnboardingDraft> = {};
  const hex = (value: string | undefined) => normalizeHex(value ?? "");
  if (hex(next.background_color) !== hex(shown.background_color)) patch.background = hex(next.background_color);
  if (hex(next.foreground_color) !== hex(shown.foreground_color)) patch.foreground = hex(next.foreground_color);
  if (hex(next.label_color) !== hex(shown.label_color)) patch.label = hex(next.label_color);
  if (hex(next.design.stamp?.color) !== hex(shown.design.stamp?.color)) patch.accent = hex(next.design.stamp?.color);
  if (next.stamps_required !== shown.stamps_required) patch.stampsRequired = next.stamps_required;

  const glyph = next.design.stamp?.glyph;
  if (glyph && glyph !== shown.design.stamp?.glyph && STAMP_GLYPH_NAMES.includes(glyph)) {
    patch.stamp = { kind: "glyph", glyph };
  }
  const pattern = next.design.pattern;
  if (pattern !== shown.design.pattern) {
    patch.pattern = pattern && (CARD_PATTERNS as string[]).includes(pattern) ? (pattern as CardPattern) : "none";
  }

  const now = designOptions(next.design);
  const was = designOptions(shown.design);
  if (now.panelColor !== was.panelColor) patch.panel = hex(now.panelColor);
  if (!sameOptions(now, was)) {
    const options: Required<DraftOptions> = {
      style: now.style,
      sticker: now.sticker,
      tint: now.tint,
      wallpaper: now.wallpaper,
      stamps_place: now.stampsPlace,
      stamps_format: now.stampsFormat,
      logo_text: now.logoText,
    };
    patch.options = options;
  }
  return patch;
}
