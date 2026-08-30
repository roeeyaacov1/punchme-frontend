import type { DesignDoc } from "../../api/designs";
import type { Preset } from "../../api/presets";
import { relatedAccents } from "../../lib/accentPalette";
import { CARD_PATTERNS, type CardPattern } from "../../lib/cardPatterns";
import { normalizeHex, readableInk } from "../../lib/color";
import { STAMP_GLYPH_NAMES } from "../../lib/stampGlyphs";
import { NICHE_GLYPH, type Niche, type OnboardingDraft } from "./draft";

/**
 * Ready-made looks — a finished card an owner can take whole.
 *
 * The wizard used to ask four questions to assemble one object: card colour,
 * stamp colour, stamp, reward. The landing page, meanwhile, sold that object
 * already finished. A look closes the gap: tap one and the card is designed,
 * leaving only the question that is actually the owner's to answer — how many
 * stamps, and what they are worth.
 *
 * **Where a look comes from.** The catalog, edited in `/admin`. Staff author
 * an entry in the same Card Studio owners use — colours, glyph, texture, stamp
 * count — publish it, and `GET /api/presets` serves it to this public wizard.
 * That is the whole pipeline; there is no second place to change a look.
 *
 * The built-in table below is a *floor*, not a rival source. The wizard is
 * public and the gallery has to render on a cold cache, an offline phone, or a
 * trade nobody has authored for yet — so it shows up to three looks per trade,
 * the catalog fills that from the front, and these make up any shortfall.
 * Publish three barber entries and no built-in barber look is ever seen again.
 * (`heroTemplates.ts` snapshots the same catalog for the landing hero and
 * explains the same trade-off at more length.)
 *
 * Every built-in accent is measured against its background at 3:1 or better —
 * the threshold `accentFits` enforces — so a look never lands the owner on a
 * card whose stamps don't read. The ratios are in the comments and are
 * load-bearing the same way `tailwind.config.js`'s are. A catalog look is only
 * as well measured as whoever authored it; the Card Studio's lint is the check
 * on that, at the point the choice is made.
 *
 * A look deliberately leaves `reward` alone, even though the catalog carries
 * one. It is the one field with money in it, and a product whose landing page
 * will tell an owner not to buy does not get to fill that in quietly.
 */
export interface CardLook {
  /** Unique within its trade: the catalog id, or the built-in's own key. */
  key: string;
  /** The name staff typed in `/admin`. Built-ins leave it unset and are named
   * from i18n instead — they are the only looks that can be. */
  name?: string;
  background: string;
  /** The stamp colour. Measured against `background`. */
  accent: string;
  glyph: string;
  pattern: CardPattern;
  stamps: number;
}

/** How many the gallery shows. Three fits a 375px panel three-across without
 * the tiles dropping below a card's worth of width. */
export const MAX_LOOKS = 3;

export const BUILTIN_LOOKS: Record<Niche, CardLook[]> = {
  barber: [
    { key: "classic", background: "#1F2937", accent: "#C88A11", glyph: "scissors", pattern: "stripes", stamps: 10 }, // 4.96:1
    { key: "warm", background: "#4B2E1E", accent: "#D9A441", glyph: "scissors", pattern: "dots", stamps: 10 }, // 5.46:1
    { key: "bold", background: "#7A1F3D", accent: "#E8C1A0", glyph: "scissors", pattern: "none", stamps: 8 }, // 6.01:1
  ],
  cafe: [
    { key: "warm", background: "#4B2E1E", accent: "#C88A11", glyph: "coffee", pattern: "dots", stamps: 8 }, // 4.15:1
    { key: "light", background: "#F5EFE6", accent: "#4B2E1E", glyph: "coffee", pattern: "none", stamps: 10 }, // 10.75:1
    { key: "night", background: "#0E1120", accent: "#C88A11", glyph: "coffee", pattern: "stripes", stamps: 8 }, // 6.34:1
  ],
  trainer: [
    { key: "fresh", background: "#065F46", accent: "#E9C46A", glyph: "dumbbell", pattern: "waves", stamps: 10 }, // 4.60:1
    { key: "bold", background: "#12455F", accent: "#5ED3C3", glyph: "dumbbell", pattern: "stripes", stamps: 10 }, // 5.67:1
    { key: "night", background: "#0E1120", accent: "#5ED3C3", glyph: "dumbbell", pattern: "none", stamps: 12 }, // 10.34:1
  ],
  therapist: [
    { key: "calm", background: "#312E81", accent: "#C88A11", glyph: "leaf", pattern: "waves", stamps: 6 }, // 3.86:1
    { key: "light", background: "#F9E4E4", accent: "#7A1F3D", glyph: "flower", pattern: "none", stamps: 6 }, // 8.25:1
    { key: "fresh", background: "#065F46", accent: "#F0E6D2", glyph: "leaf", pattern: "dots", stamps: 8 }, // 6.20:1
  ],
  other: [
    { key: "classic", background: "#0E1120", accent: "#C88A11", glyph: "star", pattern: "none", stamps: 10 }, // 6.34:1
    { key: "fresh", background: "#12455F", accent: "#C88A11", glyph: "sparkles", pattern: "waves", stamps: 10 }, // 3.48:1
    { key: "bold", background: "#7A1F3D", accent: "#F0DCC0", glyph: "gift", pattern: "dots", stamps: 8 }, // 7.51:1
  ],
};

/** The catalog row, as much of it as a look needs. Written structurally so
 * both shapes of the same table satisfy it: `PresetOut` as the public wizard
 * receives it, and `CatalogTemplateOut` as `/admin` edits it. */
export interface LookSource {
  id?: string | null;
  name?: string | null;
  background_color?: string | null;
  stamps_required: number;
  design?: Record<string, unknown> | null;
}

/**
 * A published catalog entry, read as a look.
 *
 * Every field is treated as untrusted, because it is: staff type it, and the
 * wizard is public. A background that is not a hex disqualifies the entry
 * outright — the tile would have no colour to be. Everything else falls back
 * the way `resolveDraft` falls back, so a half-filled entry still yields a
 * card rather than a broken one: no stamp colour means the palette's first
 * related accent, no glyph means the trade's, no texture means none.
 */
export function presetLook(preset: LookSource, niche: Niche): CardLook | null {
  const background = normalizeHex(preset.background_color ?? "");
  if (!background) return null;
  const design = (preset.design ?? {}) as DesignDoc;
  const glyph = design.stamp?.glyph;
  const pattern = design.pattern;
  return {
    key: preset.id ?? background,
    name: preset.name?.trim() || undefined,
    background,
    accent:
      normalizeHex(design.stamp?.color ?? "") ??
      relatedAccents(background)[0] ??
      readableInk(background),
    glyph: glyph && STAMP_GLYPH_NAMES.includes(glyph) ? glyph : NICHE_GLYPH[niche],
    pattern: pattern && (CARD_PATTERNS as string[]).includes(pattern) ? (pattern as CardPattern) : "none",
    stamps: preset.stamps_required,
  };
}

/** The looks to offer for a trade: the catalog first, in the order `/admin`
 * put them, then built-ins to fill the row. Deduplicated by background —
 * a built-in that repeats a published card's colour is the same look twice. */
export function looksFor(niche: Niche, presets: Preset[] | undefined): CardLook[] {
  const published = (presets ?? [])
    .filter((p) => p.niche === niche)
    .map((p) => presetLook(p, niche))
    .filter((look): look is CardLook => look !== null);
  const taken = new Set(published.map((l) => l.background.toLowerCase()));
  const filler = (BUILTIN_LOOKS[niche] ?? []).filter((l) => !taken.has(l.background.toLowerCase()));
  return [...published, ...filler].slice(0, MAX_LOOKS);
}

/** Which look the draft is currently sitting on, if any — so a look stays
 * selected across a Back, and stops being selected the moment the owner nudges
 * one of its colours. Glyph and pattern are not part of the match: a look is
 * identified by what the colour step can change. */
export function matchLook(draft: OnboardingDraft, looks: CardLook[]): string | null {
  const hit = looks.find(
    (l) =>
      l.background.toLowerCase() === draft.background?.toLowerCase() &&
      l.accent.toLowerCase() === draft.accent?.toLowerCase(),
  );
  return hit?.key ?? null;
}

/** The draft fields a look writes. Everything a card needs except the reward
 * and the number of visits it is worth — `stamps` is a starting position for
 * the slider on the very next screen, not an answer. */
export function lookPatch(look: CardLook): Partial<OnboardingDraft> {
  return {
    background: look.background,
    accent: look.accent,
    stamp: { kind: "glyph", glyph: look.glyph },
    pattern: look.pattern,
    stampsRequired: look.stamps,
  };
}
