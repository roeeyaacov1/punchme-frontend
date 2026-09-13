/**
 * The referral settings screen's model: one sentence per row, and the
 * preview's rendering of what those sentences produce. Pure, so the shape
 * of the screen can be tested without React.
 *
 * The owner never sees the words event, action, recipient or rule. Each
 * row is "when X, [ ] do Y" — the slot's (event, recipient) pair is an
 * implementation detail of the API the row talks to.
 */

import type { ReferralRule, RuleEvent, RuleRecipient } from "../api/referrals";

/** Product limits, mirrored from the backend's MESSAGING_* defaults. The
 * API is the real gate (422 referral_rule_invalid); these keep the counters
 * honest while typing. */
export const REFERRAL_MESSAGE_LIMITS = { title: 40, body: 160 } as const;

/** The gift picker's choices: N stamps, or the whole card (value 0). */
export const GIFT_CHOICES = [1, 2, 3] as const;
export const FULL_CARD = 0;

export interface RuleSlot {
  event: RuleEvent;
  recipient: RuleRecipient;
  /** Whether the row offers a gift at all — the scanned row may only speak. */
  gifts: boolean;
}

/** Screen order, and the one row that can never gift (enforced server-side
 * by a check constraint; here it just has no picker). */
export const RULE_SLOTS: readonly RuleSlot[] = [
  { event: "friend_joined", recipient: "friend", gifts: true },
  { event: "friend_first_stamp", recipient: "referrer", gifts: true },
  { event: "friend_completed_card", recipient: "referrer", gifts: true },
  { event: "scanned", recipient: "referrer", gifts: false },
];

/** `event_recipient` — also the i18n key of the row's sentence. An
 * underscore rather than a colon, which i18next reads as a namespace. */
export function slotKey(slot: { event: RuleEvent; recipient: RuleRecipient }): string {
  return `${slot.event}_${slot.recipient}`;
}

/** The picker's value for a rule: 1..N stamps, or FULL_CARD. */
export function giftChoice(rule: Pick<ReferralRule, "gift_stamps" | "gift_complete_card">): number {
  return rule.gift_complete_card ? FULL_CARD : rule.gift_stamps;
}

/** The rule fields a picker choice means. */
export function giftPatch(choice: number): { gift_stamps: number; gift_complete_card: boolean } {
  return choice === FULL_CARD
    ? { gift_stamps: 0, gift_complete_card: true }
    : { gift_stamps: choice, gift_complete_card: false };
}

export function hasGift(rule: Pick<ReferralRule, "gift_stamps" | "gift_complete_card">): boolean {
  return rule.gift_stamps > 0 || rule.gift_complete_card;
}

/** Whether switching the row on would be refused by the API as empty: a
 * gift row needs a gift or a text, the scanned row needs a text. */
export function rowIsEmpty(
  rule: Pick<ReferralRule, "gift_stamps" | "gift_complete_card" | "body">,
): boolean {
  return !hasGift(rule) && !rule.body.trim();
}

// --- the preview ------------------------------------------------------------
//
// Same placeholders the backend's apps/referrals/rendering.py knows, in
// either spelling, so what the owner sees on screen and what the member gets
// on their phone agree.

const SPELLINGS: Record<string, string> = {
  name: "name",
  שם: "name",
  friend: "friend",
  חבר: "friend",
  business: "business",
  עסק: "business",
  reward: "reward",
  פרס: "reward",
};
const TOKEN = /\{([^{}\n]{1,24})\}/g;

export interface PreviewContext {
  name: string;
  friend: string;
  business: string;
  reward: string;
}

export const SAMPLE_NAMES = {
  HE: { name: "דנה", friend: "נועה" },
  EN: { name: "Dana", friend: "Noa" },
} as const;

/** After an empty substitution: no space before punctuation, no double
 * spaces — "היי {שם}, מה נשמע" with no name reads "היי, מה נשמע". */
function tidy(text: string): string {
  return text
    .replace(/[ \t]+([,!.?:;…])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function renderPreview(text: string, context: PreviewContext): string {
  return tidy(
    (text || "").replace(TOKEN, (whole, inner: string) => {
      const key = SPELLINGS[inner.trim()];
      if (!key) return whole;
      return context[key as keyof PreviewContext] ?? "";
    }),
  );
}

/** Tokens the renderer would leave in place — the owner typed a brace word
 * the message cannot carry. */
export function unknownPlaceholders(text: string): string[] {
  const unknown: string[] = [];
  for (const match of (text || "").matchAll(TOKEN)) {
    if (!SPELLINGS[match[1].trim()]) unknown.push(`{${match[1].trim()}}`);
  }
  return unknown;
}
