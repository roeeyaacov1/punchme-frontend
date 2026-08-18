/** The onboarding draft: everything an owner decides before they have an
 * account, kept on this device until sign-up turns it into a real Business
 * and CardTemplate.
 *
 * Two rules keep it honest. *Resolve at read time, write on Next*: picking a
 * trade never overwrites a colour the owner already chose — `resolveDraft`
 * fills whatever is still null with the trade's defaults so the phone shows a
 * complete card from step one, and each step's Next writes its resolved value
 * down. And *the draft is small*: pixels (an emoji rasterised to PNG, a
 * cropped photo) live under a separate key that is only written when the
 * picture changes, so the per-keystroke draft write never carries base64.
 *
 * Everything in this file is pure; the storage helpers are the only ones that
 * touch the browser, and they are wrapped so a full or disabled localStorage
 * degrades to memory instead of throwing. */

import type { TFunction } from "i18next";
import type { CardTemplateIn } from "../../api/businesses";
import type { DesignDoc } from "../../api/designs";
import type { Preset } from "../../api/presets";
import type { CardPreviewValue } from "../../components/card-studio/CardPreviews";
import { derivedLabelColor, relatedAccents } from "../../lib/accentPalette";
import { HEX_RE, normalizeHex, readableInk } from "../../lib/color";
import { STAMP_GLYPH_NAMES } from "../../lib/stampGlyphs";

export const NICHES = ["barber", "cafe", "trainer", "therapist", "other"] as const;
export type Niche = (typeof NICHES)[number];

/** The steps whose state lives in the draft, in order. `account` closes the
 * list: everything after it (wallet, billing) is governed by the account and
 * the created card, not by anything stored here. */
export const DRAFT_STEPS = ["business", "color", "accent", "stamp", "reward", "account"] as const;
export type DraftStep = (typeof DRAFT_STEPS)[number];

/** Every screen of the wizard, for the progress row. */
export const ALL_STEPS = [...DRAFT_STEPS, "wallet", "billing"] as const;
export type WizardStep = (typeof ALL_STEPS)[number];

export const MIN_STAMPS = 2;
export const MAX_STAMPS = 12;

export type StampChoice =
  | { kind: "glyph"; glyph: string }
  /** The PNG lives in the art store under `hash`. */
  | { kind: "emoji"; emoji: string; hash: string }
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
  stampsRequired: number | null;
  reward: string | null;
  committed: CommittedRecord | null;
  updatedAt: number;
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
  if (raw.kind === "emoji" && typeof raw.emoji === "string" && typeof raw.hash === "string") {
    return { kind: "emoji", emoji: raw.emoji, hash: raw.hash };
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
    stampsRequired: stamps !== null && stamps >= MIN_STAMPS && stamps <= MAX_STAMPS ? stamps : null,
    reward: typeof raw.reward === "string" ? raw.reward : null,
    committed: parseCommitted(raw.committed),
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
  };
}

/* ── Progress ────────────────────────────────────────────────────────── */

export function stepIndex(step: WizardStep): number {
  return ALL_STEPS.indexOf(step);
}

/** The first draft step that still needs the owner. `hasArt` says whether
 * the picture a stamp choice points at is actually in the art store — a
 * quota failure can drop it, and then the stamp step has to be revisited. */
export function firstIncompleteStep(
  draft: OnboardingDraft | null,
  hasArt: (hash: string) => boolean = () => true,
): DraftStep {
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
  stampsRequired: number;
  reward: string;
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
  const preset = presets?.find((p) => p.niche === niche);
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
    label: derivedLabelColor(background),
    stamp: draft.stamp ?? { kind: "glyph", glyph: NICHE_GLYPH[niche] },
    stampsRequired: draft.stampsRequired ?? preset?.stamps_required ?? FALLBACK.stamps,
    reward: draft.reward ?? rewardDefault,
  };
}

/* ── Adapters ────────────────────────────────────────────────────────── */

/** The design doc the wizard writes. It carries the same three fields the
 * niche presets ship — customer name, the visit counter, and a back-of-card
 * line — with labels in the card's language rather than copied from the
 * preset, so an English owner gets English labels and a Hebrew owner gets
 * exactly the strings the presets already use. Always a full doc: the
 * server stores `design` wholesale. */
export function buildDesignDoc(resolved: ResolvedDraft, lang: string, t: TFunction): DesignDoc {
  const glyph = resolved.stamp.kind === "glyph" ? resolved.stamp.glyph : "check";
  const niche = resolved.niche;
  return {
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
        section: "SECONDARY_FIELDS",
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
    pattern: "none",
  };
}

/** Everything `POST .../templates` (and a full PATCH) wants. */
export function buildTemplateInput(
  resolved: ResolvedDraft,
  presets: Preset[] | undefined,
  lang: string,
  t: TFunction,
): CardTemplateIn {
  const preset = presets?.find((p) => p.niche === resolved.niche);
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
    stamp_strategy: "tierSwap",
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
): CardPreviewValue {
  return {
    businessName: resolved.name,
    stampsRequired: resolved.stampsRequired,
    currentStamps: sampleStamps(resolved.stampsRequired),
    rewardDescription: resolved.reward,
    backgroundColor: resolved.background,
    foregroundColor: resolved.foreground,
    labelColor: resolved.label,
    design: buildDesignDoc(resolved, lang, t),
    stampArtUrl: resolved.stamp.kind === "glyph" ? undefined : artUrl,
    unsaved: true,
  };
}

/* ── Storage ─────────────────────────────────────────────────────────── */

export const DRAFT_KEY = "punchme.onboardingDraft";
export const ART_KEY = "punchme.onboardingDraft.art";

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

export function loadArt(): StoredArt | null {
  const raw = readKey(ART_KEY);
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

/** False means the picture only survives in memory (quota) — the caller
 * can warn that a reload would lose it. */
export function saveArt(art: StoredArt): boolean {
  return writeKey(ART_KEY, JSON.stringify(art));
}

export function clearArt(): void {
  removeKey(ART_KEY);
}

export function clearDraft(): void {
  removeKey(DRAFT_KEY);
  removeKey(ART_KEY);
}
