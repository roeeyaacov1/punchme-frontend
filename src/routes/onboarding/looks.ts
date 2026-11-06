import type { TFunction } from "i18next";
import type { DesignDoc } from "../../api/designs";
import type { Preset } from "../../api/presets";
import type { ColourBase } from "../../components/card-studio/brandColours";
import type { CardPreviewValue } from "../../components/card-studio/CardPreviews";
import { stickerLabel, type ReadyLook } from "../../components/card-studio/controls/controlRules";
import { designOptions, isStyled } from "../../components/card-studio/designOptions";
import { SUPPORTED_LANGS } from "../../i18n/languages";
import { derivedLabelColor, relatedAccents } from "../../lib/accentPalette";
import { CARD_PATTERNS, type CardPattern } from "../../lib/cardPatterns";
import { normalizeHex, readableInk } from "../../lib/color";
import { STAMP_GLYPH_NAMES } from "../../lib/stampGlyphs";
import {
  draftPreviewValue,
  emptyDraft,
  NICHE_GLYPH,
  NICHES,
  resolveDraft,
  type Niche,
  type OnboardingDraft,
} from "./draft";
import { drawBody, drawKey } from "./drawing";

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

/** A catalog look the wizard can offer: one drawn with what a look carries
 * here (colours, glyph, texture). A look built from the wallet's design
 * options (a sticker, a panel, stamps on their own: `isStyled`) would arrive
 * as only its colours, the bakery's croissants an orange card with a
 * coffee cup, so the wizard leaves it out. */
export function wizardOffers(preset: Pick<Preset, "design">): boolean {
  return !isStyled((preset.design ?? {}) as DesignDoc);
}

/** The looks to offer for a trade: the catalog first, in the order `/admin`
 * put them, then built-ins to fill the row. Deduplicated by background —
 * a built-in that repeats a published card's colour is the same look twice. */
export function looksFor(niche: Niche, presets: Preset[] | undefined): CardLook[] {
  const published = (presets ?? [])
    .filter((p) => p.niche === niche && wizardOffers(p))
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

/**
 * The trade's looks as the card controls offer them (`CardColourPicker`'s
 * ready looks): the stamp colour as `stamp`, the words in the automatic
 * colour and the labels as the card derives them, so the look the card
 * started from is found again. A built-in look is named in the page's
 * language; a catalog look by its place ("Look 1"), since the catalog has
 * one name, in one language, until the backend gives it one per language.
 * The names are for a screen reader: the tiles show the look itself.
 */
export function readyLooks(looks: readonly CardLook[], t: TFunction): ReadyLook[] {
  return looks.map((look, index) => ({
    key: look.key,
    name: look.name ? t("onboarding.looks.numbered", { n: index + 1 }) : t(`onboarding.looks.names.${look.key}`),
    background: look.background,
    stamp: look.accent,
    text: readableInk(look.background),
    label: derivedLabelColor(look.background),
  }));
}

/**
 * The trades' default rewards as they were until 29 Oct 2026, when they
 * lost their numbers: a draft saved before then can still say one, and
 * "the tenth haircut free" contradicts a card of eight stamps. Data to
 * match, never shown, so not copy for `t()`: en, then he, in `NICHES`'
 * order.
 */
const NUMBERED_DEFAULTS = [
  "10th haircut free",
  "Free coffee on your 8th visit",
  "1 free training session",
  "Free treatment on your 6th visit",
  "Free reward after 10 visits",
  "התספורת העשירית חינם",
  "קפה שמיני חינם",
  "אימון חינם אחרי 10 אימונים",
  "טיפול שישי חינם",
  "הטבה חינם אחרי 10 ביקורים",
];

/** A reward that is still one of the old numbered defaults. */
export function numberedDefault(reward: string | null): boolean {
  return reward !== null && NUMBERED_DEFAULTS.includes(reward.trim());
}

/** Every trade's default reward, in every language the app speaks, and the
 * numbered ones from before: a reward still saying one of them is the
 * trade's, not the owner's (`withTradeLook`). */
export function defaultRewards(t: TFunction): string[] {
  return [
    ...NICHES.flatMap((niche) => SUPPORTED_LANGS.map((lng) => t(`onboarding.card.reward.${niche}`, { lng }))),
    ...NUMBERED_DEFAULTS,
  ];
}

/** The draft still wears this look whole: nothing a look writes was changed. */
function wears(draft: OnboardingDraft, look: CardLook): boolean {
  return (
    draft.background?.toLowerCase() === look.background.toLowerCase() &&
    draft.accent?.toLowerCase() === look.accent.toLowerCase() &&
    draft.stamp?.kind === "glyph" &&
    draft.stamp.glyph === look.glyph &&
    draft.pattern === look.pattern &&
    draft.stampsRequired === look.stamps
  );
}

/**
 * What the business's Next writes, so the card screen opens on a finished
 * card: the trade's first look, in every field the owner hasn't chosen.
 *
 * A field the owner chose is never overwritten. One thing does follow a
 * change of trade: a card still wearing some trade's first look, untouched,
 * takes the new trade's, so going back and turning a barber into a café
 * doesn't leave scissors on the café's card. So does a reward that is still
 * one of the trades' own defaults (`defaultRewards`, in every language),
 * which goes back to empty and reads the new trade's.
 */
export function withTradeLook(
  draft: OnboardingDraft,
  presets: Preset[] | undefined,
  defaultRewards: readonly string[],
): Partial<OnboardingDraft> {
  const look = looksFor(draft.niche ?? "other", presets)[0];
  if (!look) return {};
  const patch: Partial<OnboardingDraft> = {};
  const untouched = NICHES.some((trade) => {
    const first = looksFor(trade, presets)[0];
    return first !== undefined && wears(draft, first);
  });
  if (untouched) {
    if (!wears(draft, look)) Object.assign(patch, lookPatch(look));
  } else {
    if (draft.background === null) patch.background = look.background;
    if (draft.accent === null) {
      // A card colour of the owner's own gets a stamp colour that reads on it.
      patch.accent =
        draft.background === null
          ? look.accent
          : (relatedAccents(draft.background)[0] ?? readableInk(draft.background));
    }
    if (draft.stamp === null) patch.stamp = { kind: "glyph", glyph: look.glyph };
    if (draft.pattern === null) patch.pattern = look.pattern;
    if (draft.stampsRequired === null) patch.stampsRequired = look.stamps;
  }
  if (draft.reward !== null && defaultRewards.includes(draft.reward.trim())) patch.reward = null;
  return patch;
}

/* ── The looks screen (card looks, brief §7) ─────────────────────────── */

/**
 * A published look the wizard shows as itself: one built from the wallet's
 * design options, with both its pictures drawn when staff published it
 * (backend PR #20, item 1). A look whose drawing failed comes without them,
 * and is left out.
 */
export function drawnLook(preset: Preset): boolean {
  return !wizardOffers(preset) && !!preset.pictures?.strip && !!preset.pictures?.hero;
}

/**
 * Whether the wizard opens on the looks: the wallet draws the design options
 * (the public sticker list says `available`), and the catalog has a look to
 * show for them. Otherwise, a list that says no or doesn't answer, or no
 * look published yet, the wizard is today's, exactly.
 */
export function looksOffered(available: boolean | undefined, presets: Preset[] | undefined): boolean {
  return available === true && (presets ?? []).some(drawnLook);
}

/** A trade's drawn looks, in the order `/admin` put them. */
export function drawnLooks(niche: Niche, presets: Preset[] | undefined): Preset[] {
  return (presets ?? []).filter((preset) => preset.niche === niche && drawnLook(preset));
}

/**
 * The trades a screen offers: the ones the catalog has a look for once it
 * has said, or all five while it hasn't or when it lists none (the API's
 * closed set, and the built-in looks dress every one). The trade already
 * chosen always stays, so a catalog that changed under a draft never hides
 * it. The business tray's rule, for the looks screen.
 */
export function listedTrades(presets: Preset[] | undefined, chosen: Niche | null): Niche[] {
  const listed = presets?.length ? NICHES.filter((niche) => presets.some((preset) => preset.niche === niche)) : NICHES;
  return NICHES.filter((niche) => listed.includes(niche) || niche === chosen);
}

/** What is on a look's stamps, said in the page's language: its sticker, or
 * its glyph where it has none. */
function stampWords(preset: Preset, t: TFunction): string {
  const design = (preset.design ?? {}) as DesignDoc;
  const sticker = designOptions(design).sticker;
  if (sticker) return stickerLabel(sticker, t);
  const glyph = design.stamp?.glyph;
  const niche = (NICHES as readonly string[]).includes(preset.niche) ? (preset.niche as Niche) : "other";
  return t(`onboarding.stamp.glyphs.${glyph && STAMP_GLYPH_NAMES.includes(glyph) ? glyph : NICHE_GLYPH[niche]}`);
}

/**
 * A look's name, by what is on its stamps (Roee, 6 Nov 2026): "קרואסון",
 * "Croissant". The catalog has one name per look, in one language, so the
 * wizard names a look from its own locale files instead. Two looks of one
 * trade that would share a name are told apart by their place among those
 * that do: the first keeps it, the next is "קרואסון 2".
 */
export function lookName(preset: Preset, siblings: readonly Preset[], t: TFunction): string {
  const name = stampWords(preset, t);
  const same = siblings.filter((look) => stampWords(look, t) === name);
  const place = same.findIndex((look) => look.id === preset.id);
  return place > 0 ? t("onboarding.look.again", { name, n: place + 1 }) : name;
}

/** How many stamps a look's picture shows: halfway full, at least one, as
 * the backend draws it (`looks.halfway`). */
export function pictureStamps(stampsRequired: number): number {
  return Math.min(Math.max(1, Math.floor(stampsRequired / 2)), stampsRequired);
}

/** A look's own card: everything the look sets taken from the look, the
 * owner's name and reward kept. */
function lookItself(preset: Preset, draft: OnboardingDraft, presets: Preset[] | undefined, t: TFunction) {
  const itself: OnboardingDraft = { ...draft, look: undefined, stamp: null, stampsRequired: null };
  return resolveDraft({ ...itself, ...lookChoicePatch(preset, itself, presets, []) }, presets, t);
}

/**
 * Whether the drawing would draw the draft's card as it draws the look
 * itself, so that the look's published picture can stand on the stage until
 * the draft's own drawing comes (on arriving from the looks screen, or on
 * switching wallets). A card changed in anything the drawing shows is not:
 * the look's own colours there would be a card the owner no longer has.
 */
export function stillItself(
  preset: Preset,
  draft: OnboardingDraft,
  presets: Preset[] | undefined,
  t: TFunction,
  wallet: "apple" | "google",
): boolean {
  const mine = drawBody(resolveDraft(draft, presets, t), wallet);
  const its = drawBody(lookItself(preset, draft, presets, t), wallet);
  return !!mine && !!its && drawKey(mine) === drawKey(its);
}

/**
 * A drawn look as the pass shows it, as itself: its own colours and its own
 * pictures, at the count they were drawn at, with the owner's name and
 * reward where the draft has them. The look screen's card, and the map's
 * when the draft can't be drawn ("כך הוא נראה בצבעים שלו"), or before its
 * first drawing while it is still the look's own (`stillItself`).
 */
export function lookPreview(
  preset: Preset,
  draft: OnboardingDraft,
  presets: Preset[] | undefined,
  lang: string,
  t: TFunction,
  cardName?: string,
): CardPreviewValue | null {
  if (!preset.pictures) return null;
  const resolved = lookItself(preset, draft, presets, t);
  const total = preset.stamps_required;
  const at = pictureStamps(total);
  return {
    ...draftPreviewValue(resolved, lang, t, undefined, cardName),
    stampsRequired: total,
    currentStamps: at,
    stripStates: { [at]: preset.pictures.strip },
    heroStates: { [at]: preset.pictures.hero },
    unsaved: false,
  };
}

/**
 * What "Continue" with a look writes, beside the trade: everything a look
 * sets, the colours, the stamp and what stands behind it, the count's place
 * and how it is written. Never what is the owner's own: the name, the logo
 * and whether its name stands beside it, a picture for a stamp, a reward
 * they wrote, or a count they set (one that isn't the last look's). A
 * reward still saying a trade's default goes back to empty, to read the new
 * trade's. The same look again changes nothing.
 *
 * The check mark isn't taken: Roee prefers cards without it, and the wizard
 * never offers it (brief §5).
 */
export function lookChoicePatch(
  preset: Preset,
  draft: OnboardingDraft,
  presets: Preset[] | undefined,
  defaults: readonly string[],
): Partial<OnboardingDraft> {
  const patch: Partial<OnboardingDraft> = {};
  if (draft.reward !== null && defaults.includes(draft.reward.trim())) patch.reward = null;
  if (draft.look === preset.id) return patch;

  const niche = (NICHES as readonly string[]).includes(preset.niche) ? (preset.niche as Niche) : "other";
  const design = (preset.design ?? {}) as DesignDoc;
  const options = designOptions(design);
  const background = normalizeHex(preset.background_color) ?? "#0E1120";
  const glyph = design.stamp?.glyph;
  const pattern = design.pattern;

  Object.assign(patch, {
    look: preset.id,
    background,
    accent: normalizeHex(design.stamp?.color ?? "") ?? relatedAccents(background)[0] ?? readableInk(background),
    foreground: normalizeHex(preset.foreground_color) ?? readableInk(background),
    label: normalizeHex(preset.label_color),
    pattern: pattern && (CARD_PATTERNS as string[]).includes(pattern) ? (pattern as CardPattern) : "none",
    panel: normalizeHex(options.panelColor),
    options: {
      style: options.style,
      sticker: options.sticker,
      tint: options.tint,
      wallpaper: options.wallpaper,
      stamps_place: options.stampsPlace,
      stamps_format: options.stampsFormat,
      logo_text: draft.options?.logo_text ?? false,
    },
  } satisfies Partial<OnboardingDraft>);
  if (draft.stamp?.kind !== "image") {
    patch.stamp = { kind: "glyph", glyph: glyph && STAMP_GLYPH_NAMES.includes(glyph) ? glyph : NICHE_GLYPH[niche] };
  }
  if (!ownCount(draft, presets)) patch.stampsRequired = preset.stamps_required;
  return patch;
}

/**
 * A card from a look made a card from before the looks, where the wallet
 * draws none of the options (`studioMode` "off"; the studio's
 * `withoutOptions`). The look goes, with its options, its ground and its
 * label colour, which today's wizard leaves to the card, and the wizard is
 * today's again, exactly. The name, the colours, the stamp's symbol or
 * picture, the texture, the count, the reward and the logo stay: none of
 * them is an option.
 */
export function withoutLook(): Partial<OnboardingDraft> {
  return { look: undefined, options: undefined, panel: undefined, label: undefined };
}

/** The count is the owner's once it isn't what the last look set. */
function ownCount(draft: OnboardingDraft, presets: Preset[] | undefined): boolean {
  if (draft.stampsRequired === null) return false;
  const last = presets?.find((look) => look.id === draft.look);
  const lastBuiltIn = Object.values(BUILTIN_LOOKS)
    .flat()
    .find((look) => look.key === draft.look);
  return draft.stampsRequired !== (last?.stamps_required ?? lastBuiltIn?.stamps);
}

/**
 * The colours the card's look set, for the colours tray: they follow the
 * business colour too while the card is still the look's colour, so a look
 * just picked never reads as changed by hand (`ColourBase`). None for a card
 * from before the looks.
 */
export function lookBase(draft: OnboardingDraft, presets: Preset[] | undefined): ColourBase | undefined {
  if (!draft.look) return undefined;
  const preset = presets?.find((look) => look.id === draft.look);
  if (preset) {
    const own = lookChoicePatch(preset, emptyDraft(), presets, []);
    return {
      card: own.background ?? preset.background_color,
      text: own.foreground ?? undefined,
      label: own.label ?? undefined,
      stamps: own.accent ?? undefined,
      ground: own.panel ?? null,
    };
  }
  const builtIn = Object.values(BUILTIN_LOOKS)
    .flat()
    .find((look) => look.key === draft.look);
  return builtIn ? { card: builtIn.background, stamps: builtIn.accent } : undefined;
}

/**
 * The same for a trade with no drawn look: its classic look, as today's
 * tile shows it (`looksFor`), started as a card of the looks with none of
 * the options on, which the map's trays can then add.
 */
export function classicChoicePatch(
  look: CardLook,
  draft: OnboardingDraft,
  presets: Preset[] | undefined,
  defaults: readonly string[],
): Partial<OnboardingDraft> {
  const patch: Partial<OnboardingDraft> = {};
  if (draft.reward !== null && defaults.includes(draft.reward.trim())) patch.reward = null;
  if (draft.look === look.key) return patch;
  const { stamp, stampsRequired, ...colours } = lookPatch(look);
  Object.assign(patch, colours, {
    look: look.key,
    foreground: null,
    label: null,
    panel: null,
    options: { logo_text: draft.options?.logo_text ?? false },
  } satisfies Partial<OnboardingDraft>);
  if (draft.stamp?.kind !== "image") patch.stamp = stamp;
  if (!ownCount(draft, presets)) patch.stampsRequired = stampsRequired;
  return patch;
}
