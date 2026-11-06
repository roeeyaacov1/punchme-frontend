/** The onboarding draft: everything an owner decides before they have an
 * account, kept on this device until sign-up turns it into a real Business
 * and CardTemplate.
 *
 * Two rules keep it honest. *Resolve at read time, write on Next*: picking a
 * trade never overwrites a colour the owner already chose — `resolveDraft`
 * fills whatever is still null with the trade's defaults so the phone shows a
 * complete card from step one, and each step's Next writes its resolved value
 * down. And *the draft is small*: pixels (a cropped photo) live under a
 * separate key that is only written when the picture changes, so the
 * per-keystroke draft write never carries base64.
 *
 * Everything in this file is pure; the storage helpers are the only ones that
 * touch the browser, and they are wrapped so a full or disabled localStorage
 * degrades to memory instead of throwing. */

import type { TFunction } from "i18next";
import type { CardTemplateIn } from "../../api/businesses";
import type { DesignDoc } from "../../api/designs";
import type { Preset } from "../../api/presets";
import type { CardPreviewValue } from "../../components/card-studio/CardPreviews";
import { isStyled } from "../../components/card-studio/designOptions";
import { derivedLabelColor, relatedAccents } from "../../lib/accentPalette";
import { CARD_PATTERNS, type CardPattern } from "../../lib/cardPatterns";
import { HEX_RE, normalizeHex, readableInk } from "../../lib/color";
import { STAMP_GLYPH_NAMES } from "../../lib/stampGlyphs";

export const NICHES = ["barber", "cafe", "trainer", "therapist", "other"] as const;
export type Niche = (typeof NICHES)[number];

/** The steps whose state lives in the draft, in order. `account` closes the
 * list: everything after it (wallet, billing) is governed by the account and
 * the created card, not by anything stored here. `look` opens it, and is a
 * step only while the wizard offers the card looks. */
export const DRAFT_STEPS = ["look", "business", "color", "accent", "stamp", "reward", "account"] as const;
export type DraftStep = (typeof DRAFT_STEPS)[number];

/** Every screen of the wizard, for the progress row. */
export const ALL_STEPS = [...DRAFT_STEPS, "wallet", "billing"] as const;
export type WizardStep = (typeof ALL_STEPS)[number];

/** The parts of the card the owner walks on the map, in the walk's order. */
export const MAP_PARTS = ["business", "colours", "stamp", "reward"] as const;
export type MapPart = (typeof MAP_PARTS)[number];

export const MIN_STAMPS = 2;
export const MAX_STAMPS = 12;
/** The API keeps a business name to 120 characters (BusinessIn.name). */
export const NAME_MAX = 120;

export type StampChoice =
  | { kind: "glyph"; glyph: string }
  /** The picture lives in the art store under `hash`. */
  | { kind: "image"; hash: string };

export interface CommittedRecord {
  businessId: string;
  /** null = the Business exists but the template does not yet (a lost
   * response mid-commit); the next attempt creates only the template. */
  templateId: string | null;
  /** Stable JSON of the template input at commit time — a later visit
   * through the account step patches only when this changed. */
  fingerprint: string;
  /** Which picture was uploaded as stamp_art, if any. */
  artHash: string | null;
  /** `design_synced_at` right after create/PATCH: the wallet step waits for
   * a sync *newer* than this, or it would trust last time's PNGs. */
  syncBaseline: string | null;
  errorBaseline: string;
}

/** The design options a look brings, as the design doc names them (card
 * looks, brief §7.5). The check isn't one: the wizard never offers it. */
export interface DraftOptions {
  style?: "badge" | "icon";
  /** "" is none: the glyph. */
  sticker?: string;
  tint?: boolean;
  /** "" is none. */
  wallpaper?: string;
  stamps_place?: "secondary" | "header";
  stamps_format?: "count" | "fraction";
  logo_text?: boolean;
}

export interface OnboardingDraft {
  v: 1;
  name: string;
  niche: Niche | null;
  /** Autofilled from Google Places when a place is picked; never asked for. */
  phone: string;
  background: string | null;
  /** → design.stamp.color */
  accent: string | null;
  /** Advanced text colour; null = whichever ink reads on the background. */
  foreground: string | null;
  stamp: StampChoice | null;
  /** The texture drawn behind the stamps, in the stamp colour → design.pattern */
  pattern: CardPattern | null;
  stampsRequired: number | null;
  reward: string | null;
  committed: CommittedRecord | null;
  updatedAt: number;
  /** The parts of the card opened on the map so far, each once. Absent on
   * a draft from before the map, which reads as none opened. Only the walk
   * reads it: `commit.ts` never does, so it never reaches the server. */
  seen?: MapPart[];
  /* The card looks (brief §7.5). Each is absent on a draft from before them,
   * which reads as a classic card: no look and no options. */
  /** The catalog look the card started from, picked on `/onboarding/look`. */
  look?: string;
  /** The look's design options, as the owner has them now. */
  options?: DraftOptions;
  /** The ground behind the stamps → design.panel_color. Null is none. */
  panel?: string | null;
  /** The label colour Apple shows. Null derives it from the card, as before. */
  label?: string | null;
  /** The logo, by its hash: its pixels live under `LOGO_KEY`. */
  logo?: string | null;
}

export function emptyDraft(): OnboardingDraft {
  return {
    v: 1,
    name: "",
    niche: null,
    phone: "",
    background: null,
    accent: null,
    foreground: null,
    stamp: null,
    pattern: null,
    stampsRequired: null,
    reward: null,
    committed: null,
    updatedAt: 0,
  };
}

/* ── Parsing ─────────────────────────────────────────────────────────── */

function isNiche(value: unknown): value is Niche {
  return typeof value === "string" && (NICHES as readonly string[]).includes(value);
}

function hexOrNull(value: unknown): string | null {
  return typeof value === "string" ? normalizeHex(value) : null;
}

function parseStamp(value: unknown): StampChoice | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (raw.kind === "glyph" && typeof raw.glyph === "string" && STAMP_GLYPH_NAMES.includes(raw.glyph)) {
    return { kind: "glyph", glyph: raw.glyph };
  }
  if (raw.kind === "image" && typeof raw.hash === "string") {
    return { kind: "image", hash: raw.hash };
  }
  return null;
}

function parseCommitted(value: unknown): CommittedRecord | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.businessId !== "string" || !raw.businessId) return null;
  return {
    businessId: raw.businessId,
    templateId: typeof raw.templateId === "string" ? raw.templateId : null,
    fingerprint: typeof raw.fingerprint === "string" ? raw.fingerprint : "",
    artHash: typeof raw.artHash === "string" ? raw.artHash : null,
    syncBaseline: typeof raw.syncBaseline === "string" ? raw.syncBaseline : null,
    errorBaseline: typeof raw.errorBaseline === "string" ? raw.errorBaseline : "",
  };
}

/** The known parts, once each, in the order they were opened. */
function parseSeen(value: unknown[]): MapPart[] {
  const seen: MapPart[] = [];
  for (const part of value) {
    if ((MAP_PARTS as readonly unknown[]).includes(part) && !seen.includes(part as MapPart)) {
      seen.push(part as MapPart);
    }
  }
  return seen;
}

/** A sticker's name as the wallet lists them: lowercase words joined by
 * dashes ("hot-beverage"). */
const STICKER_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

function stickerOrNone(value: unknown): string | undefined {
  if (value === "") return "";
  return typeof value === "string" && STICKER_NAME.test(value) ? value : undefined;
}

/** The known options, each by its known values; anything else is left out,
 * one by one, as a bad field is. */
function parseOptions(value: object): DraftOptions {
  const raw = value as Record<string, unknown>;
  const options: DraftOptions = {};
  if (raw.style === "badge" || raw.style === "icon") options.style = raw.style;
  const sticker = stickerOrNone(raw.sticker);
  if (sticker !== undefined) options.sticker = sticker;
  if (typeof raw.tint === "boolean") options.tint = raw.tint;
  const wallpaper = stickerOrNone(raw.wallpaper);
  if (wallpaper !== undefined) options.wallpaper = wallpaper;
  if (raw.stamps_place === "secondary" || raw.stamps_place === "header") options.stamps_place = raw.stamps_place;
  if (raw.stamps_format === "count" || raw.stamps_format === "fraction") options.stamps_format = raw.stamps_format;
  if (typeof raw.logo_text === "boolean") options.logo_text = raw.logo_text;
  return options;
}

/** The card looks' fields, each only when it was stored, so a draft from
 * before them parses back to exactly what was stored. */
function parseLookFields(raw: Record<string, unknown>): Partial<OnboardingDraft> {
  const fields: Partial<OnboardingDraft> = {};
  if (typeof raw.look === "string" && raw.look) fields.look = raw.look;
  if (raw.options && typeof raw.options === "object" && !Array.isArray(raw.options)) {
    fields.options = parseOptions(raw.options);
  }
  if ("panel" in raw) fields.panel = hexOrNull(raw.panel);
  if ("label" in raw) fields.label = hexOrNull(raw.label);
  if ("logo" in raw) fields.logo = typeof raw.logo === "string" && raw.logo ? raw.logo : null;
  return fields;
}

/** Anything that isn't a v1 draft becomes null — a stale shape from an
 * older build must never resurrect as half a card. Field by field, so one
 * bad value drops that value rather than the whole draft. */
export function parseDraft(value: unknown): OnboardingDraft | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (raw.v !== 1) return null;
  const stamps =
    typeof raw.stampsRequired === "number" && Number.isInteger(raw.stampsRequired)
      ? raw.stampsRequired
      : null;
  return {
    v: 1,
    name: typeof raw.name === "string" ? raw.name : "",
    niche: isNiche(raw.niche) ? raw.niche : null,
    phone: typeof raw.phone === "string" ? raw.phone : "",
    background: hexOrNull(raw.background),
    accent: hexOrNull(raw.accent),
    foreground: hexOrNull(raw.foreground),
    stamp: parseStamp(raw.stamp),
    pattern: (CARD_PATTERNS as string[]).includes(raw.pattern as string) ? (raw.pattern as CardPattern) : null,
    stampsRequired: stamps !== null && stamps >= MIN_STAMPS && stamps <= MAX_STAMPS ? stamps : null,
    reward: typeof raw.reward === "string" ? raw.reward : null,
    committed: parseCommitted(raw.committed),
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
    // Left out, not emptied, when there is nothing to read: a draft from
    // before the map parses back to exactly what was stored.
    ...(Array.isArray(raw.seen) ? { seen: parseSeen(raw.seen) } : {}),
    ...parseLookFields(raw),
  };
}

/* ── Progress ────────────────────────────────────────────────────────── */

export function stepIndex(step: WizardStep): number {
  return ALL_STEPS.indexOf(step);
}

/** The first draft step that still needs the owner. `hasArt` says whether
 * the picture a stamp choice points at is actually in the art store — a
 * quota failure can drop it, and then the stamp step has to be revisited.
 *
 * `looks`: the wizard offers the card looks, where the trade is asked with
 * them, first. A draft with a trade but no look is a card from before them,
 * and goes on as one. */
export function firstIncompleteStep(
  draft: OnboardingDraft | null,
  hasArt: (hash: string) => boolean = () => true,
  looks = false,
): DraftStep {
  if (looks && !draft?.niche) return "look";
  if (!draft || !draft.name.trim() || !draft.niche) return "business";
  if (!draft.background || !HEX_RE.test(draft.background)) return "color";
  if (!draft.accent || !HEX_RE.test(draft.accent)) return "accent";
  if (!draft.stamp) return "stamp";
  if (draft.stamp.kind === "glyph" && !STAMP_GLYPH_NAMES.includes(draft.stamp.glyph)) return "stamp";
  if (draft.stamp.kind !== "glyph" && !hasArt(draft.stamp.hash)) return "stamp";
  const n = draft.stampsRequired;
  if (n === null || !Number.isInteger(n) || n < MIN_STAMPS || n > MAX_STAMPS) return "reward";
  if (!draft.reward || !draft.reward.trim()) return "reward";
  return "account";
}

/** Is there a card half-designed on this device? True once the owner has
 * named the business, picked a colour, or already committed — anything
 * less is an untouched wizard, and nobody needs sending back to that.
 *
 * Not the same question as `firstIncompleteStep`: a draft with only the
 * trade chosen still answers "business" there, but there is nothing in it
 * worth returning for. */
export function hasDraftInProgress(draft: OnboardingDraft | null): boolean {
  if (!draft) return false;
  return draft.committed !== null || draft.name.trim() !== "" || draft.background !== null;
}

/* ── Defaults per trade ──────────────────────────────────────────────── */

/** The glyph a trade starts with. Every one is in the server registry. */
export const NICHE_GLYPH: Record<Niche, string> = {
  barber: "scissors",
  cafe: "coffee",
  trainer: "dumbbell",
  therapist: "leaf",
  other: "star",
};

/** What the wizard falls back to when there is no preset to read from —
 * matches the server's own defaults, so the phone never shows a card the
 * server would refuse. */
const FALLBACK = { background: "#0E1120", stamps: 10 };

export interface ResolvedDraft {
  name: string;
  niche: Niche;
  phone: string;
  background: string;
  accent: string;
  foreground: string;
  label: string;
  stamp: StampChoice;
  pattern: CardPattern;
  stampsRequired: number;
  reward: string;
  /** The look the card started from; null on a classic card. */
  look: string | null;
  /** The look's options, each at its default where the draft says nothing.
   * Null on a classic card, which writes none of them. */
  options: Required<DraftOptions> | null;
  /** The ground behind the stamps, or null for none. */
  panel: string | null;
  /** The logo's hash, or null for none. */
  logo: string | null;
}

/** A look's options with every one said: the card as it was before the
 * options, where the draft says nothing. */
export function optionsOf(options: DraftOptions | undefined): Required<DraftOptions> {
  return {
    style: options?.style ?? "badge",
    sticker: options?.sticker ?? "",
    tint: options?.tint ?? false,
    wallpaper: options?.wallpaper ?? "",
    stamps_place: options?.stamps_place ?? "secondary",
    stamps_format: options?.stamps_format ?? "count",
    logo_text: options?.logo_text ?? false,
  };
}

/** The draft with every null filled by the trade's default, ready for the
 * phone or the API. `presets` may still be loading — the fallbacks then
 * stand in until it arrives, and nothing is written back. */
export function resolveDraft(
  draft: OnboardingDraft,
  presets: Preset[] | undefined,
  t: TFunction,
): ResolvedDraft {
  const niche: Niche = draft.niche ?? "other";
  // A look the wizard can't draw (`wizardOffers`) sets none of its defaults.
  const preset = presets?.find((p) => p.niche === niche && !isStyled((p.design ?? {}) as DesignDoc));
  const background =
    draft.background ?? normalizeHex(preset?.background_color ?? "") ?? FALLBACK.background;
  // A chosen accent is honoured as chosen (the colour step drops one that
  // stops fitting when the background changes; see `accentFits`).
  const accent = draft.accent ?? relatedAccents(background)[0] ?? readableInk(background);
  const rewardDefault = t(`onboarding.card.reward.${niche}`, {
    defaultValue: preset?.reward_description ?? "",
  });
  return {
    name: draft.name,
    niche,
    phone: draft.phone,
    background,
    accent,
    foreground: draft.foreground ?? readableInk(background),
    label: draft.label ?? derivedLabelColor(background),
    stamp: draft.stamp ?? { kind: "glyph", glyph: NICHE_GLYPH[niche] },
    pattern: draft.pattern ?? "none",
    stampsRequired: draft.stampsRequired ?? preset?.stamps_required ?? FALLBACK.stamps,
    reward: draft.reward ?? rewardDefault,
    look: draft.look ?? null,
    options: draft.look ? optionsOf(draft.options) : null,
    panel: draft.look ? (draft.panel ?? null) : null,
    logo: draft.logo ?? null,
  };
}

/* ── Adapters ────────────────────────────────────────────────────────── */

/** The design doc the wizard writes. It carries the same three fields the
 * niche presets ship — customer name, the visit counter, and a back-of-card
 * line — with labels in the card's language rather than copied from the
 * preset, so an English owner gets English labels and a Hebrew owner gets
 * exactly the strings the presets already use. Always a full doc: the
 * server stores `design` wholesale.
 *
 * A card from a look also writes the look's options, as the owner has them
 * (card looks, brief §7.5, with Roee's answer of 6 Nov: the fields stay the
 * wizard's own, in the card's language). The count at the top takes its
 * field to the header, as the studio's `withStampsPlace` does. A classic
 * card writes none of them, so its doc, and the save's fingerprint, are
 * what they were. */
export function buildDesignDoc(resolved: ResolvedDraft, lang: string, t: TFunction): DesignDoc {
  const glyph = resolved.stamp.kind === "glyph" ? resolved.stamp.glyph : "check";
  const niche = resolved.niche;
  const options = resolved.options;
  const doc: DesignDoc = {
    default_language: lang === "he" ? "HE" : "EN",
    fields: [
      {
        binding: "person.displayName",
        label: t(`onboarding.card.fields.name.${niche}`),
        section: "SECONDARY_FIELDS",
        alignment: "LEFT",
        default_value: "",
      },
      {
        binding: "members.member.points",
        label: t(`onboarding.card.fields.points.${niche}`),
        section: options?.stamps_place === "header" ? "HEADER_FIELDS" : "SECONDARY_FIELDS",
        alignment: "RIGHT",
        default_value: "0",
        change_message: t("onboarding.card.fields.pointsChange"),
      },
      {
        binding: "universal.info",
        label: t("onboarding.card.fields.info"),
        section: "BACK_FIELDS",
        alignment: "NATURAL",
        default_value: resolved.reward,
      },
    ],
    barcode: { format: "QR", payload: "${pid}", alt_text: "" },
    stamp: { glyph, color: resolved.accent },
    pattern: resolved.pattern,
  };
  if (!options) return doc;
  return {
    ...doc,
    stamp: { glyph, color: resolved.accent, style: options.style, sticker: options.sticker, tint: options.tint },
    panel_color: resolved.panel ?? "",
    wallpaper: options.wallpaper,
    stamps_place: options.stamps_place,
    stamps_format: options.stamps_format,
    logo_text: options.logo_text,
  };
}

/** Everything `POST .../templates` (and a full PATCH) wants. */
export function buildTemplateInput(
  resolved: ResolvedDraft,
  presets: Preset[] | undefined,
  lang: string,
  t: TFunction,
): CardTemplateIn {
  const preset = presets?.find((p) => p.niche === resolved.niche && !isStyled((p.design ?? {}) as DesignDoc));
  return {
    name: t(`onboarding.card.templateName.${resolved.niche}`, {
      defaultValue: preset?.name ?? "Loyalty Card",
    }),
    stamps_required: resolved.stampsRequired,
    reward_description: resolved.reward,
    background_color: resolved.background,
    foreground_color: resolved.foreground,
    label_color: resolved.label,
    logo_url: "",
    // No stamp_strategy. The backend dropped it from CardTemplateIn on
    // purpose — "native" means a template drawn by hand in the PassKit
    // portal, which nothing in this API can create, and flipping a
    // provisioned template to it freezes the design for good. New templates
    // take the model default (tierSwap) either way, so sending it was
    // already a no-op the server ignored.
    design: buildDesignDoc(resolved, lang, t),
  };
}

/** Deterministic identity of what would be sent — key order fixed by
 * construction, so equal inputs give equal strings. */
export function fingerprint(input: CardTemplateIn): string {
  return JSON.stringify(input);
}

/** How many stamps the phone shows punched: enough that the accent colour
 * is visible (tiles render grey until punched), short of a full card. */
export function sampleStamps(stampsRequired: number): number {
  return Math.min(stampsRequired - 1, Math.max(1, Math.ceil(stampsRequired * 0.4)));
}

/** What the phone renders. `unsaved: true` keeps the preview on the CSS
 * strip — there are no published PNGs for a card that does not exist yet. */
export function draftPreviewValue(
  resolved: ResolvedDraft,
  lang: string,
  t: TFunction,
  artUrl: string | undefined,
  /** The name the card will be created under — `buildTemplateInput`'s, so
   * the Google header shows the same program name before and after the
   * template exists. */
  cardName?: string,
  /** The logo kept on this device, when there is one. */
  logoUrl?: string,
): CardPreviewValue {
  return {
    businessName: resolved.name,
    cardName,
    stampsRequired: resolved.stampsRequired,
    currentStamps: sampleStamps(resolved.stampsRequired),
    rewardDescription: resolved.reward,
    backgroundColor: resolved.background,
    foregroundColor: resolved.foreground,
    labelColor: resolved.label,
    design: buildDesignDoc(resolved, lang, t),
    stampArtUrl: resolved.stamp.kind === "glyph" ? undefined : artUrl,
    unsaved: true,
    // One logo, as the wizard keeps it: Apple's row and Google's circle.
    ...(logoUrl ? { logoUrl, appleLogoUrl: logoUrl, logoText: resolved.options?.logo_text === true } : {}),
  };
}

/* ── Storage ─────────────────────────────────────────────────────────── */

export const DRAFT_KEY = "punchme.onboardingDraft";
export const ART_KEY = "punchme.onboardingDraft.art";
/** The logo, kept like the stamp's picture but under a key of its own (the
 * card looks, brief §11): one picture per key. */
export const LOGO_KEY = "punchme.onboardingDraft.logo";

export interface StoredArt {
  hash: string;
  dataUrl: string;
}

/** Memory stands in when localStorage is unavailable (private mode, quota,
 * disabled) — the wizard keeps working for the length of the tab. */
const memory = new Map<string, string>();

function readKey(key: string): string | null {
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    /* fall through to memory */
  }
  return memory.get(key) ?? null;
}

/** Returns false when the value could not be persisted anywhere but memory. */
function writeKey(key: string, value: string): boolean {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeKey(key: string) {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to remove */
  }
}

export function loadDraft(): OnboardingDraft | null {
  const raw = readKey(DRAFT_KEY);
  if (!raw) return null;
  try {
    return parseDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveDraft(draft: OnboardingDraft): void {
  writeKey(DRAFT_KEY, JSON.stringify(draft));
}

function loadPicture(key: string): StoredArt | null {
  const raw = readKey(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredArt>;
    if (typeof parsed.hash === "string" && typeof parsed.dataUrl === "string") {
      return { hash: parsed.hash, dataUrl: parsed.dataUrl };
    }
  } catch {
    /* corrupt — treat as absent */
  }
  return null;
}

export function loadArt(): StoredArt | null {
  return loadPicture(ART_KEY);
}

/** False means the picture only survives in memory (quota) — the caller
 * can warn that a reload would lose it. */
export function saveArt(art: StoredArt): boolean {
  return writeKey(ART_KEY, JSON.stringify(art));
}

export function clearArt(): void {
  removeKey(ART_KEY);
}

export function loadLogo(): StoredArt | null {
  return loadPicture(LOGO_KEY);
}

/** As `saveArt`: false when the logo only survives in memory. */
export function saveLogo(logo: StoredArt): boolean {
  return writeKey(LOGO_KEY, JSON.stringify(logo));
}

export function clearLogo(): void {
  removeKey(LOGO_KEY);
}

export function clearDraft(): void {
  removeKey(DRAFT_KEY);
  removeKey(ART_KEY);
  removeKey(LOGO_KEY);
}
