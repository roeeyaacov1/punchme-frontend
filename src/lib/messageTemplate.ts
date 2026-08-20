/**
 * Message templates, client side: the placeholders an owner can drop into a
 * message, and a faithful enough renderer to preview what one customer will
 * see. The backend (apps/messaging/rendering.py) is the source of truth; this
 * mirrors it so the live preview and the phone agree.
 *
 * Tokens are single-brace, in either spelling — `{שם}` / `{name}` — because
 * the chips insert whichever matches the card's language and an owner may
 * paste text from anywhere. The renderer accepts both.
 */

export type MessageLanguage = "HE" | "EN";
export type PlaceholderKey = "name" | "business" | "reward" | "days";
export type MessageKind = "inactive" | "birthday" | "reward_waiting" | "broadcast";

export interface Placeholder {
  key: PlaceholderKey;
  /** The token as inserted for this language, braces included. */
  token: string;
}

const SPELLINGS: Record<PlaceholderKey, { HE: string; EN: string }> = {
  name: { HE: "שם", EN: "name" },
  business: { HE: "עסק", EN: "business" },
  reward: { HE: "פרס", EN: "reward" },
  days: { HE: "ימים", EN: "days" },
};

const SPELLING_TO_KEY = new Map<string, PlaceholderKey>(
  (Object.keys(SPELLINGS) as PlaceholderKey[]).flatMap((key) => [
    [SPELLINGS[key].HE, key],
    [SPELLINGS[key].EN, key],
  ]),
);

const TOKEN_RE = /\{([^{}\n]{1,24})\}/g;

/** `{days}` only means something where a day count exists. */
const DAYS_KINDS: MessageKind[] = ["inactive", "reward_waiting"];

export const SAMPLE_NAMES: Record<MessageLanguage, string> = { HE: "דנה", EN: "Dana" };

/**
 * The placeholders a kind may carry — mirrors `allowed_keys` in
 * apps/messaging/rendering.py, which is what the send enforces.
 *
 * `{days}` needs a day count, which only the lapsed / reward-waiting rules
 * have. `{name}` needs per-customer delivery: a broadcast is published to a
 * whole CARD DESIGN, so one message cannot say two different names. The API
 * refuses it, and offering the chip only walked owners into that refusal
 * after they had written the whole message.
 */
export function allowedPlaceholderKeys(kind: MessageKind): PlaceholderKey[] {
  const keys: PlaceholderKey[] = [];
  if (kind !== "broadcast") keys.push("name");
  keys.push("business", "reward");
  if (DAYS_KINDS.includes(kind)) keys.push("days");
  return keys;
}

export function placeholdersFor(kind: MessageKind, language: MessageLanguage): Placeholder[] {
  return allowedPlaceholderKeys(kind).map((key) => ({
    key,
    token: `{${SPELLINGS[key][language]}}`,
  }));
}

export function placeholderToken(key: PlaceholderKey, language: MessageLanguage): string {
  return `{${SPELLINGS[key][language]}}`;
}

/** Tokens the renderer would not understand (or `{days}` on a kind that
 * has no day count) — shown as a warning before the backend's 422 says the
 * same thing. */
export function findUnknownPlaceholders(text: string, kind: MessageKind): string[] {
  const unknown: string[] = [];
  for (const match of text.matchAll(TOKEN_RE)) {
    const spelling = match[1].trim();
    const key = SPELLING_TO_KEY.get(spelling);
    if (key === undefined || (key === "days" && !DAYS_KINDS.includes(kind))) {
      unknown.push(match[0]);
    }
  }
  return Array.from(new Set(unknown));
}

/** Placeholders the renderer knows but this kind may not use — today just
 * `{שם}` in a broadcast, which the send refuses with
 * `placeholder_unsupported:name`. Warned while typing so nobody discovers
 * it only after pressing send. `{days}` stays with the unknown tokens,
 * which is how the API reports it. */
export function findUnsupportedPlaceholders(text: string, kind: MessageKind): string[] {
  const allowed = new Set(allowedPlaceholderKeys(kind));
  const found: string[] = [];
  for (const match of text.matchAll(TOKEN_RE)) {
    const key = SPELLING_TO_KEY.get(match[1].trim());
    if (key !== undefined && key !== "days" && !allowed.has(key)) found.push(match[0]);
  }
  return Array.from(new Set(found));
}

/** Hebrew counts 2–10 with the plural noun and 11+ with the singular
 * ("7 ימים", "30 יום"); one is spelled out. Same rule as the backend. */
export function daysPhrase(days: number, language: MessageLanguage): string {
  const n = Math.max(0, Math.trunc(days));
  if (language === "EN") return n === 1 ? "1 day" : `${n} days`;
  if (n === 1) return "יום אחד";
  if (n === 2) return "יומיים";
  if (n >= 3 && n <= 10) return `${n} ימים`;
  return `${n} יום`;
}

/** After an empty substitution: no space before punctuation, no double
 * spaces — "היי {שם}, מה נשמע" with no name reads "היי, מה נשמע". */
function tidy(text: string): string {
  return text
    .replace(/[ \t]+([,!.?:;…])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export interface RenderContext {
  name: string;
  business: string;
  reward: string;
  /** Already phrased ("30 יום"); empty when the kind has no day count. */
  days: string;
}

export function renderMessage(text: string, context: RenderContext): string {
  return tidy(
    text.replace(TOKEN_RE, (whole, inner: string) => {
      const key = SPELLING_TO_KEY.get(inner.trim());
      return key === undefined ? whole : context[key];
    }),
  );
}

/** What the preview (and the backend's test-send) renders with: a fixed
 * sample customer in the card's language. */
export function sampleContext(
  language: MessageLanguage,
  opts: { business: string; reward: string; kind: MessageKind; days?: number | null },
): RenderContext {
  let days = 0;
  if (opts.kind === "inactive") days = opts.days ?? 30;
  else if (opts.kind === "reward_waiting") days = opts.days ?? 7;
  return {
    name: SAMPLE_NAMES[language],
    business: opts.business,
    reward: opts.reward,
    days: days ? daysPhrase(days, language) : "",
  };
}

/** Puts `token` at the caret of a textarea/input and returns the new text
 * plus where the caret should land (after the token). */
export function insertAtCaret(
  text: string,
  token: string,
  selectionStart: number | null,
  selectionEnd: number | null,
): { text: string; caret: number } {
  const start = selectionStart ?? text.length;
  const end = selectionEnd ?? start;
  const before = text.slice(0, start);
  const after = text.slice(end);
  // Breathe: a token glued to a word reads as a typo on the lock screen.
  const lead = before && !/\s$/.test(before) ? " " : "";
  const trail = after && !/^[\s,.!?:;…]/.test(after) ? " " : "";
  const next = `${before}${lead}${token}${trail}${after}`;
  return { text: next, caret: (before + lead + token).length };
}

/** The starter bodies promise a gift only when the rule gives one. Swap
 * between the two while the owner hasn't edited the text. */
export function recipeBody(
  recipe: { body_with_gift: string; body_without_gift: string },
  hasGift: boolean,
): string {
  return hasGift ? recipe.body_with_gift : recipe.body_without_gift;
}

/** Text that promises a gift while the rule gives none — worth a warning. */
export function mentionsGift(text: string): boolean {
  return /מתנה|free stamp|gift/i.test(text);
}
