import type { TFunction } from "i18next";
import type { DesignDoc, DesignField, ImageUse } from "../../api/designs";
import { normalizeHex, readableInk } from "../../lib/color";

/**
 * The card studio's draft, and the rules it keeps, pure so they can be
 * tested: what changed and how many, the reward on the back of the card,
 * the face's two labels, a free-text field's own binding, the API's text
 * limits, and where the sample starts.
 */

/** Everything the studio edits: the template's flat fields and its design
 * doc, as PATCH .../templates/{id} takes them. */
export interface CardStudioValue {
  name: string;
  stamps_required: number;
  reward_description: string;
  background_color: string;
  foreground_color: string;
  label_color: string;
  design: DesignDoc;
}

/** Published pictures, for the stage: hosted URLs, or a catalog look's art. */
export interface CardStudioImages {
  logo?: string;
  apple_logo?: string;
  stamp_art?: string;
  strip_base?: string;
  stamped_art?: string;
  unstamped_art?: string;
  /** The PNGs the phone gets, by stamp state. */
  strip_states?: Record<string, string>;
  hero_states?: Record<string, string>;
}

/** Pictures an owner has chosen and Save hasn't sent yet. */
export type HeldUse = Exclude<ImageUse, "icon">;
export type HeldPictures = Partial<Record<HeldUse, string>>;

/** The order Save sends them in: the logo, the stamp, then the strip art. */
export const HELD_ORDER: readonly HeldUse[] = ["logo", "stamp_art", "strip_base", "stamped_art", "unstamped_art"];

/** The held pictures once one of them has been sent: it goes, unless
 * another was chosen in its place while it was on its way. */
export function withoutSent(held: HeldPictures, use: HeldUse, sent: string): HeldPictures {
  if (held[use] !== sent) return held;
  const next = { ...held };
  delete next[use];
  return next;
}

/** The API's limits on what an owner types (CardTemplateIn, `_DesignDoc`). */
export const TEXT_LIMITS = {
  name: 80,
  reward: 200,
  label: 60,
  changeMessage: 120,
  value: 500,
  organization: 120,
  /** A catalog look's staff note (CatalogEntryIn). */
  catalogDescription: 200,
} as const;

/** The API refuses a card without a name, and one of spaces is none. */
export function nameMissing(value: CardStudioValue): boolean {
  return !value.name.trim();
}

/** At most this many fields; at least one, which the API requires. */
export const MAX_FIELDS = 10;

/** How many fields past the most the API takes: ones added elsewhere, read
 * in on top of the owner's own, can take a card past it. */
export function fieldsOver(value: CardStudioValue): number {
  return Math.max(0, (value.design.fields?.length ?? 0) - MAX_FIELDS);
}

/** The back field that carries the reward to the pass. */
export const BACK_BINDING = "universal.info";

/** The two fields on the card's face, and their sections. */
export const FACE_FIELDS = [
  { binding: "person.displayName", section: "SECONDARY_FIELDS" },
  { binding: "members.member.points", section: "AUXILIARY_FIELDS" },
] as const;

/** What a field can show. A free-text field may be added again and again,
 * each with a binding of its own; the other four once each. */
export const FIELD_KINDS = [
  "person.displayName",
  "members.member.points",
  "members.tier.name",
  "universal.info",
  "meta.custom",
] as const;
export type FieldKind = (typeof FIELD_KINDS)[number];

const CUSTOM = "meta.custom";

/** A field's kind, from its binding: `meta.custom_3` is free text. */
export function kindOf(binding: string): FieldKind | null {
  if (binding === CUSTOM || /^meta\.custom_\d+$/.test(binding)) return CUSTOM;
  return (FIELD_KINDS as readonly string[]).includes(binding) ? (binding as FieldKind) : null;
}

/** The direction of a field holding the owner's own words: the words' own
 * once there are some, the page's while it's empty. `dir="auto"` alone
 * reads an empty field as left to right, so in Hebrew its placeholder and
 * caret would start at the wrong edge. */
export function ownWordsDir(text: string): "auto" | undefined {
  return text ? "auto" : undefined;
}

/** A field as the owner knows it: its label, or what it shows. */
export function fieldName(field: DesignField, t: TFunction): string {
  const kind = kindOf(field.binding);
  return field.label?.trim() || (kind ? t(`studio.fields.binding.${kind}`) : field.binding);
}

function freeCustomBinding(used: ReadonlySet<string>): string {
  if (!used.has(CUSTOM)) return CUSTOM;
  for (let n = 2; ; n += 1) if (!used.has(`${CUSTOM}_${n}`)) return `${CUSTOM}_${n}`;
}

/** The design as the studio reads it, its fields one binding each. */
export function readDesign(design: DesignDoc): DesignDoc {
  if (!design.fields) return design;
  const fields = withUniqueBindings(design.fields);
  return fields === design.fields ? design : { ...design, fields };
}

/** A free-text binding no field has yet: `meta.custom`, then `meta.custom_2`… */
export function nextCustomBinding(fields: readonly DesignField[]): string {
  return freeCustomBinding(new Set(fields.map((field) => field.binding)));
}

const onFace = (field: DesignField) => (field.section ?? "BACK_FIELDS") !== "BACK_FIELDS";
const wordsOf = (field: DesignField) => (field.default_value ?? "").trim();

/**
 * The fields with one binding each, as the pass needs them: the old editor
 * let several share one, and the API refuses that now. Mended as the card is
 * read, so the next Save mends the card. A repeated free-text field gets a
 * binding of its own, as "Add field" gives one, so no words the owner typed
 * are lost. A repeat of a kind the card shows once shows the same thing, so
 * one copy is kept: the first on the card's face, so the stamp count never
 * leaves it, or else the first. A repeated line of text with words of its
 * own becomes free text with a binding of its own, words and all.
 */
export function withUniqueBindings(fields: DesignField[]): DesignField[] {
  if (new Set(fields.map((field) => field.binding)).size === fields.length) return fields;
  const used = new Set(fields.map((field) => field.binding));
  const kept = new Map<string, number>();
  fields.forEach((field, index) => {
    if (kindOf(field.binding) === CUSTOM) return;
    const first = kept.get(field.binding);
    if (first === undefined || (!onFace(fields[first]) && onFace(field))) kept.set(field.binding, index);
  });
  const placed = new Set<string>();
  const unique: DesignField[] = [];
  const ownBinding = (field: DesignField) => {
    const binding = freeCustomBinding(used);
    used.add(binding);
    unique.push({ ...field, binding });
  };
  fields.forEach((field, index) => {
    const keep = kept.get(field.binding);
    if (keep === undefined) {
      if (!placed.has(field.binding)) {
        placed.add(field.binding);
        unique.push(field);
      } else ownBinding(field);
    } else if (keep === index) {
      unique.push(field);
    } else if (field.binding === BACK_BINDING && wordsOf(field) && wordsOf(field) !== wordsOf(fields[keep])) {
      ownBinding(field);
    }
  });
  return unique;
}

/** The kinds "Add field" can offer: free text always, the rest only if absent. */
export function addableKinds(fields: readonly DesignField[]): FieldKind[] {
  if (fields.length >= MAX_FIELDS) return [];
  const used = new Set(fields.map((field) => kindOf(field.binding)));
  return FIELD_KINDS.filter((kind) => kind === CUSTOM || !used.has(kind));
}

/** A new field of a kind, on the back of the card. */
export function newField(kind: FieldKind, fields: readonly DesignField[]): DesignField {
  return {
    binding: kind === CUSTOM ? nextCustomBinding(fields) : kind,
    label: "",
    section: "BACK_FIELDS",
    alignment: "NATURAL",
  };
}

/** The field an open editor holds, followed by its binding when the fields
 * change under it (a fresher card read in): where it is now, or null if it
 * went. */
export function followField(
  before: readonly DesignField[] | undefined,
  after: readonly DesignField[] | undefined,
  index: number | null,
): number | null {
  const binding = index === null ? undefined : before?.[index]?.binding;
  if (binding === undefined) return null;
  const next = (after ?? []).findIndex((field) => field.binding === binding);
  return next === -1 ? null : next;
}

/** The label a face field carries, or "" for the default. */
export function faceLabel(fields: readonly DesignField[], binding: string): string {
  return fields.find((field) => field.binding === binding)?.label ?? "";
}

/** A face field the card hasn't got, which a label can't add: the card
 * already holds as many fields as it can. */
export function faceLabelFull(fields: readonly DesignField[], binding: string): boolean {
  return fields.length >= MAX_FIELDS && !fields.some((field) => field.binding === binding);
}

/** Rename a face field. One typed where there was none adds the field, while
 * the card has room for it; clearing one the studio added drops it again,
 * rather than sending an empty label. A field the card came with
 * (`savedFields`) keeps its place with an empty label: clearing the words
 * above the customer's name never takes the name off the card. These are the
 * only editors of the two labels. */
export function withFaceLabel(
  fields: readonly DesignField[],
  binding: string,
  section: DesignField["section"],
  label: string,
  savedFields: readonly DesignField[],
): DesignField[] {
  const index = fields.findIndex((field) => field.binding === binding);
  if (index === -1) {
    if (!label || faceLabelFull(fields, binding)) return [...fields];
    return [...fields, { binding, label, section, alignment: "NATURAL" }];
  }
  const field = fields[index];
  const added = !savedFields.some((saved) => saved.binding === binding);
  const plain =
    field.section === section &&
    !field.change_message &&
    !field.default_value &&
    (field.alignment === "NATURAL" || field.alignment === undefined);
  if (!label && added && plain && fields.length > 1) return fields.filter((_, i) => i !== index);
  return fields.map((f, i) => (i === index ? { ...f, label } : f));
}

/** What the back of the card says, against the reward. */
export type BackState =
  | { kind: "none" }
  | { kind: "follows" }
  | { kind: "empty" }
  | { kind: "differs"; text: string };

/**
 * The reward reaches the pass in one place, the back field's text. When it
 * says the reward it follows the reward; when it says nothing, the next
 * reward fills it; when it says something else it is left alone and said.
 * A card without that field has nothing to follow: the server's defaults
 * fill it from the reward themselves.
 */
export function backState(design: DesignDoc, reward: string): BackState {
  const field = design.fields?.find((candidate) => candidate.binding === BACK_BINDING);
  if (!field) return { kind: "none" };
  const text = (field.default_value ?? "").trim();
  if (text === reward.trim()) return { kind: "follows" };
  if (!text) return { kind: "empty" };
  return { kind: "differs", text };
}

function withBackText(value: CardStudioValue, text: string): CardStudioValue {
  const fields = value.design.fields?.map((field) =>
    field.binding === BACK_BINDING ? { ...field, default_value: text } : field,
  );
  return { ...value, design: { ...value.design, fields } };
}

/** A new reward. A back that says the reward, or nothing, says the new one
 * too, in the draft, where Wallet details shows it; words of its own stay. */
export function withReward(value: CardStudioValue, reward: string): CardStudioValue {
  const next = { ...value, reward_description: reward };
  const back = backState(value.design, value.reward_description).kind;
  return back === "follows" || back === "empty" ? withBackText(next, reward) : next;
}

/** "Put the reward there": the back says the reward, in the draft, and
 * follows it from then on, until words are typed there by hand. */
export function withRewardOnBack(value: CardStudioValue): CardStudioValue {
  return withBackText(value, value.reward_description);
}

/** A new card colour. While the text colour is automatic (the ink that
 * reads on the old colour), it moves to the ink that reads on the new one. */
export function withBackground(value: CardStudioValue, background: string): CardStudioValue {
  const automatic = sameColour(value.foreground_color, readableInk(value.background_color));
  return {
    ...value,
    background_color: background,
    foreground_color: automatic ? readableInk(background) : value.foreground_color,
  };
}

/** The text colour as the shared control sees it: null is automatic. */
export function textColourChoice(value: CardStudioValue): string | null {
  return sameColour(value.foreground_color, readableInk(value.background_color)) ? null : value.foreground_color;
}

/** The stamp colour, which the design keeps (falling back to the text colour,
 * as the renderer does). */
export function stampColourOf(value: CardStudioValue): string {
  return value.design.stamp?.color || value.foreground_color;
}

/** Where the sample opens: half the card, rounded down, at least 1, so the
 * stamp colour shows from the first look. */
export function sampleStart(stampsRequired: number): number {
  return Math.max(1, Math.floor(stampsRequired / 2));
}

/** About two lines of the reward row on a phone. */
const REWARD_ROW_MAX = 80;

/** The reward as its row under the card says it: whole while it's short,
 * then cut at the last word that fits, with an ellipsis, so a 200-character
 * reward doesn't run to seven lines. The reward tray holds all of it. */
export function rewardForRow(reward: string, max = REWARD_ROW_MAX): string {
  const text = reward.trim().replace(/\s+/g, " ");
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  const kept = space >= max / 2 ? cut.slice(0, space) : cut;
  return `${kept.replace(/[\s,.;:\-–—]+$/, "")}…`;
}

export type ChangeKind =
  | "reward"
  | "stamps"
  | "colours"
  | "stamp"
  | "texture"
  | "names"
  | "logo"
  | "fields"
  | "language"
  | "barcode"
  | "art";

function sameColour(a: string | undefined, b: string | undefined): boolean {
  return (normalizeHex(a ?? "") ?? a ?? "") === (normalizeHex(b ?? "") ?? b ?? "");
}

function isPlain(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** JSON with every object's keys in order, so two reads of one card match
 * however the server or the studio ordered them. */
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (!isPlain(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stable(value[key])]),
  );
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(stable(a ?? null)) === JSON.stringify(stable(b ?? null));
}

/** Two copies of one card, down to the last key. */
export function sameCard(a: CardStudioValue, b: CardStudioValue): boolean {
  return same(a, b);
}

/** One part of the card on a fresher copy: as fresh where the owner left it
 * alone, the owner's where they changed it, and an object merged key by key,
 * so a glyph chosen here keeps a stamp colour changed elsewhere. */
function rebaseValue(base: unknown, draft: unknown, fresh: unknown): unknown {
  if (same(draft, base)) return fresh;
  if (!isPlain(base) || !isPlain(draft) || !isPlain(fresh)) return draft;
  const merged: Record<string, unknown> = {};
  for (const key of new Set([...Object.keys(draft), ...Object.keys(fresh), ...Object.keys(base)])) {
    const value = rebaseValue(base[key], draft[key], fresh[key]);
    if (value !== undefined) merged[key] = value;
  }
  return merged;
}

/** The fields, matched by what each shows: one the owner left alone is as
 * the fresh card has it (or gone, if it went there), one they removed stays
 * removed, and one they added is theirs. One they changed is merged with the
 * fresh card's property by property, so a new reward written on the back
 * keeps a label changed there elsewhere. One added elsewhere comes after
 * theirs; a free-text one whose binding the owner's new field took gets a
 * binding of its own, as the mend on load gives one. */
function rebaseFields(
  base: readonly DesignField[] = [],
  draft: readonly DesignField[] = [],
  fresh: readonly DesignField[] = [],
): DesignField[] {
  if (same(draft, base)) return [...fresh];
  const was = new Map(base.map((field) => [field.binding, field]));
  const now = new Map(fresh.map((field) => [field.binding, field]));
  const fields: DesignField[] = [];
  for (const field of draft) {
    const before = was.get(field.binding);
    const after = now.get(field.binding);
    if (!before) fields.push(field);
    else if (!same(field, before)) fields.push(after ? (rebaseValue(before, field, after) as DesignField) : field);
    else if (after) fields.push(after);
  }
  const placed = new Map(fields.map((field) => [field.binding, field]));
  const used = new Set([...placed.keys(), ...now.keys()]);
  for (const field of fresh) {
    if (was.has(field.binding)) continue;
    const ours = placed.get(field.binding);
    if (!ours) {
      fields.push(field);
      placed.set(field.binding, field);
    } else if (kindOf(field.binding) === CUSTOM && !same(field, ours)) {
      const binding = freeCustomBinding(used);
      used.add(binding);
      fields.push({ ...field, binding });
    }
  }
  return fields;
}

/**
 * The owner's own edits on a fresher copy of the card. `base` is the card the
 * edits started from; whatever differs between it and `draft` is the owner's,
 * and everything else comes from `fresh`, so a save made elsewhere since is
 * never sent back undone.
 */
export function rebaseEdits(base: CardStudioValue, draft: CardStudioValue, fresh: CardStudioValue): CardStudioValue {
  const rebased = rebaseValue(base, draft, fresh) as CardStudioValue;
  if (!base.design.fields && !draft.design.fields && !fresh.design.fields) return rebased;
  const fields = rebaseFields(base.design.fields, draft.design.fields, fresh.design.fields);
  return { ...rebased, design: { ...rebased.design, fields } };
}

/** The fields with the face labels and the back's text set aside, which
 * count as names and as the reward. A face field the label editor added or
 * dropped, in its plain shape, is a name too. */
function plainFields(fields: readonly DesignField[] | undefined): DesignField[] {
  return (fields ?? [])
    .filter((field) => {
      const face = FACE_FIELDS.find((candidate) => candidate.binding === field.binding);
      if (!face) return true;
      const plain =
        field.section === face.section &&
        !field.change_message &&
        !field.default_value &&
        (field.alignment === "NATURAL" || field.alignment === undefined);
      return !plain;
    })
    .map((field) => ({
      ...field,
      label: FACE_FIELDS.some((face) => face.binding === field.binding) ? "" : (field.label ?? ""),
      default_value: field.binding === BACK_BINDING ? "" : (field.default_value ?? ""),
    }));
}

function backText(fields: readonly DesignField[] | undefined): string {
  return fields?.find((field) => field.binding === BACK_BINDING)?.default_value ?? "";
}

/**
 * What changed between the saved card and the draft, one entry per kind the
 * bar counts ("2 changes"). The reward counts once whether it changed on the
 * front, on the back, or both.
 */
export function changesBetween(saved: CardStudioValue, draft: CardStudioValue, held: HeldPictures = {}): ChangeKind[] {
  const changes: ChangeKind[] = [];
  const sd = saved.design;
  const dd = draft.design;
  if (saved.reward_description !== draft.reward_description || backText(sd.fields) !== backText(dd.fields)) {
    changes.push("reward");
  }
  if (saved.stamps_required !== draft.stamps_required) changes.push("stamps");
  if (
    !sameColour(saved.background_color, draft.background_color) ||
    !sameColour(saved.foreground_color, draft.foreground_color) ||
    !sameColour(saved.label_color, draft.label_color) ||
    !sameColour(sd.stamp?.color, dd.stamp?.color)
  ) {
    changes.push("colours");
  }
  if ((sd.stamp?.glyph ?? "check") !== (dd.stamp?.glyph ?? "check") || held.stamp_art) changes.push("stamp");
  if ((sd.pattern ?? "none") !== (dd.pattern ?? "none")) changes.push("texture");
  if (
    saved.name !== draft.name ||
    (sd.organization_name ?? "") !== (dd.organization_name ?? "") ||
    FACE_FIELDS.some((face) => faceLabel(sd.fields ?? [], face.binding) !== faceLabel(dd.fields ?? [], face.binding))
  ) {
    changes.push("names");
  }
  if (held.logo) changes.push("logo");
  if (!same(plainFields(sd.fields), plainFields(dd.fields))) changes.push("fields");
  if ((sd.default_language ?? "HE") !== (dd.default_language ?? "HE")) changes.push("language");
  if ((sd.barcode?.format ?? "QR") !== (dd.barcode?.format ?? "QR")) changes.push("barcode");
  if (held.strip_base || held.stamped_art || held.unstamped_art) changes.push("art");
  return changes;
}
