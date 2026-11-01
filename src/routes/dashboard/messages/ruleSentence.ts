import type { AutomationKind } from "../../../api/messaging";
import type { MessageDraft } from "../../../components/messaging/messageDraft";

/** A rule being written: the message, and when and to whom it goes. */
export interface RuleDraft extends MessageDraft {
  name: string;
  kind: AutomationKind;
  /** NaN while a typed number isn't one yet. */
  inactive_days: number;
  repeat_days: number | null;
  birthday_days_before: number;
  reward_waiting_days: number;
  send_hour_local: number;
}

/** The ranges the API takes (`*_range` refusals). */
export const RULE_RANGES = {
  inactive_days: [7, 365],
  repeat_days: [7, 365],
  reward_waiting_days: [1, 90],
  birthday_days_before: [0, 14],
} as const;

export function inRange(value: number, [low, high]: readonly [number, number]): boolean {
  return Number.isFinite(value) && value >= low && value <= high;
}

/** Whether the rule's trigger is one the API would take: what the live
 * count and the save both wait for. */
export function triggerValid(rule: RuleDraft): boolean {
  if (rule.kind === "inactive") {
    return (
      inRange(rule.inactive_days, RULE_RANGES.inactive_days) &&
      (rule.repeat_days === null || inRange(rule.repeat_days, RULE_RANGES.repeat_days))
    );
  }
  if (rule.kind === "reward_waiting") return inRange(rule.reward_waiting_days, RULE_RANGES.reward_waiting_days);
  return inRange(rule.birthday_days_before, RULE_RANGES.birthday_days_before);
}

/**
 * When a rule switched on now first runs: the next time its hour comes
 * round, in local time. The backend's first-run guard skips today once the
 * hour has struck, so that is later today or tomorrow.
 */
export function nextRunAt(hour: number, now: Date): Date {
  const at = new Date(now);
  at.setHours(hour, 0, 0, 0);
  if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
  return at;
}

/** One sentence of the rule, as a key, its words, and a count said through
 * the plural forms and set as a figure. */
export interface SentencePiece {
  key: string;
  values?: Record<string, string>;
  count?: number;
}

/**
 * The rule in one sentence, before anything is asked: who gets it, and
 * when, in the order the owner reads it.
 *
 * - A win-back runs at the next send hour for everyone away that long, then
 *   for each person on the day they reach it, once per lapse until a real
 *   visit, or again every `repeat_days` while they stay away. The live count
 *   is a ceiling, not a promise: it doesn't apply the gap the backend keeps
 *   between two automated messages to one customer, so the sentence says
 *   "up to".
 * - A birthday rule runs at its hour on the birthday, or some days before.
 * - A reward reminder runs at its hour for a reward that has waited its days.
 *
 * Then its gift, and that it reaches only those who agreed to messages, as
 * every rule does since 2026-11-01 (the counts are of them too). `phrase`
 * says a number of days and an hour the way the page's language does.
 */
export function ruleSentence(
  rule: RuleDraft,
  audience: number | null,
  phrase: { days: (n: number) => string; hour: (h: number) => string },
): SentencePiece[] {
  const hour = phrase.hour(rule.send_hour_local);
  const pieces: SentencePiece[] = [];
  if (rule.kind === "inactive") {
    const days = phrase.days(rule.inactive_days);
    if (audience === null) pieces.push({ key: "messaging.sentence.inactiveCounting", values: { hour, days } });
    else if (audience === 0) pieces.push({ key: "messaging.sentence.inactiveNone", values: { hour, days } });
    else pieces.push({ key: "messaging.sentence.inactive", values: { hour, days }, count: audience });
    if (rule.repeat_days !== null) {
      pieces.push({ key: "messaging.sentence.repeat", values: { days: phrase.days(rule.repeat_days) } });
    }
  } else if (rule.kind === "birthday") {
    pieces.push(
      rule.birthday_days_before > 0
        ? { key: "messaging.sentence.birthdayBefore", values: { hour, days: phrase.days(rule.birthday_days_before) } }
        : { key: "messaging.sentence.birthday", values: { hour } },
    );
  } else {
    pieces.push({ key: "messaging.sentence.rewardWaiting", values: { hour, days: phrase.days(rule.reward_waiting_days) } });
    if (audience !== null) {
      pieces.push(audience === 0 ? { key: "messaging.sentence.matchNone" } : { key: "messaging.sentence.matchNow", count: audience });
    }
  }
  // A reward reminder carries no gift: its cards are already full.
  if (rule.kind !== "reward_waiting") {
    if (rule.gift_complete_card) pieces.push({ key: "messaging.sentence.giftFull" });
    else if (rule.gift_stamps > 0) pieces.push({ key: "messaging.sentence.giftStamps", count: rule.gift_stamps });
  }
  pieces.push({ key: "messaging.sentence.optIn" });
  return pieces;
}
