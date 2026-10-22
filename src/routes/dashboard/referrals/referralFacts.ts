import { ApiError } from "../../../api/errors";
import type { Referral, ReferralGrant, ReferralRule } from "../../../api/referrals";
import { hasGift, slotKey } from "../../../lib/referralRules";
import { problemKey } from "../problem";

/** The field slugs a refused setting says in a sentence of its own. */
const SETTING_SLUGS = ["title_too_long", "body_too_long", "gift_stamps", "rule_empty", "scanned_has_no_gift", "max_rewarded_per_referrer"];

/**
 * A refusal as the owner reads it: the plan's or the pilot's in its own
 * words, a setting's field slug as a sentence (never the slug itself), a
 * referral decided elsewhere as such, and anything else as the dashboard
 * says a failed change.
 */
export function referralProblemKey(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "upgrade_required") return "referrals.blocked.upgrade_required";
    if (error.code === "referrals_not_enabled") return "referrals.blocked.not_enabled_for_pilot";
    if (error.code === "referral_not_reviewable") return "referrals.decision.decided";
    if (error.code === "referral_rule_invalid" || error.code === "referral_program_invalid") {
      const slug = error.message.replace(/_range$/, "");
      return SETTING_SLUGS.includes(slug) ? `referrals.errors.${slug}` : "referrals.errors.generic";
    }
  }
  return problemKey(error);
}

/**
 * What Refer a friend works out before it draws: how far back to read the
 * gifts, what they came to this month, what each answer to a flagged
 * referral does, and how a person who isn't there any more is named.
 * Pure, so each rule has a test.
 */

/** Pages of 100 gifts the page reads at most, newest first. */
export const GRANT_PAGES = 10;

export function monthStart(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

/**
 * How far back the gifts are read: to the start of this month, or to the
 * oldest referral on screen if that is older. A referral's gifts are always
 * newer than the referral itself, so that covers every row shown as well
 * as the month.
 */
export function grantsHorizon(referrals: readonly Pick<Referral, "created_at">[], now: Date): number {
  const oldest = referrals.reduce((min, referral) => Math.min(min, Date.parse(referral.created_at)), Infinity);
  return Math.min(monthStart(now), oldest);
}

/** A page of gifts that already reaches past the horizon, or an empty one,
 * ends the walk. */
export function walkReached(page: readonly Pick<ReferralGrant, "created_at">[], horizon: number): boolean {
  return page.length === 0 || Date.parse(page[page.length - 1].created_at) < horizon;
}

/** What the program gave since the start of this month: the stamps it
 * added, and the cards it filled. */
export function monthGifts(grants: readonly ReferralGrant[], now: Date): { stamps: number; cards: number } {
  const since = monthStart(now);
  let stamps = 0;
  let cards = 0;
  for (const grant of grants) {
    if (grant.status !== "granted" || !grant.granted_at || Date.parse(grant.granted_at) < since) continue;
    if (grant.gift_complete_card) cards += 1;
    else stamps += grant.stamps_granted;
  }
  return { stamps, cards };
}

/** A referral's own gifts, granted or not, in the order they came. */
export function giftsOf(referralId: string, grants: readonly ReferralGrant[]): ReferralGrant[] {
  return grants
    .filter((grant) => grant.referral_id === referralId && grant.event !== "scanned")
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
}

const on = (rules: readonly ReferralRule[], event: ReferralRule["event"], recipient: ReferralRule["recipient"]) =>
  rules.find((rule) => rule.event === event && rule.recipient === recipient && rule.enabled);

/** The gift rules that are on, in the order things happen to a friend:
 * joining, a first stamp, a first full card. */
export function giftRulesOn(rules: readonly ReferralRule[]): ReferralRule[] {
  return (["friend_joined_friend", "friend_first_stamp_referrer", "friend_completed_card_referrer"] as const)
    .map((key) => rules.find((rule) => slotKey(rule) === key && rule.enabled && hasGift(rule)))
    .filter((rule): rule is ReferralRule => rule !== undefined);
}

/**
 * What counting a flagged referral does, from the rules that are on: the
 * friend's welcome gift fires now, and the member's gifts wait for the
 * friend's first stamp or first full card. Not counting keeps the friend's
 * card and gives nobody anything for it.
 */
export function decisionEffects(rules: readonly ReferralRule[]): { welcome: boolean; memberGift: boolean } {
  const welcome = on(rules, "friend_joined", "friend");
  const firstStamp = on(rules, "friend_first_stamp", "referrer");
  const completed = on(rules, "friend_completed_card", "referrer");
  return {
    welcome: !!welcome && hasGift(welcome),
    memberGift: (!!firstStamp && hasGift(firstStamp)) || (!!completed && hasGift(completed)),
  };
}

/** The sentence that says what counting does, by what the rules give. */
export function countSentenceKey(effects: { welcome: boolean; memberGift: boolean }): string {
  if (effects.welcome && effects.memberGift) return "referrals.decision.countBoth";
  if (effects.welcome) return "referrals.decision.countWelcome";
  if (effects.memberGift) return "referrals.decision.countMember";
  return "referrals.decision.countPlain";
}

/** The reasons a flag has its own sentence for; any other is said plainly. */
const FLAG_REASONS = ["self_referral", "shared_device", "burst"];

export function flagReasonKey(reason: string): string {
  return `referrals.decision.reason.${FLAG_REASONS.includes(reason) ? reason : "unknown"}`;
}

/**
 * A person in a referral's line. The API sends no phone, so a customer
 * with no name and a customer whose card was removed are told apart by the
 * card: a removed card leaves no card id.
 */
export type Person = { kind: "name"; name: string } | { kind: "noName" } | { kind: "removed" };

export function personOf(name: string, cardId: string | null): Person {
  if (cardId === null) return { kind: "removed" };
  return name.trim() ? { kind: "name", name: name.trim() } : { kind: "noName" };
}
