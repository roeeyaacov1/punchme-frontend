import type { AutomationOut, MessagingSummary } from "../../../api/messaging";

/**
 * What Messages decides before it draws anything: the one notice it shows,
 * the order the rules stand in, and what a rule's row can truthfully say
 * about who it reaches. Pure, so each rule has a test.
 */

/** The name the owner gave a rule, or its kind's when it is blank. */
export function ruleName(rule: Pick<AutomationOut, "name" | "kind">, t: (key: string) => string): string {
  return rule.name.trim() || t(`messaging.kinds.${rule.kind}`);
}

/** No tick from the scheduler for this long, while a rule is on, is late. */
export const STALE_TICK_MS = 60 * 60 * 1000;

export type MessagesNotice = "freeOwner" | "freeHire" | "notOpen" | "paused" | "onHold" | "late";

/**
 * The one notice, the first of these that holds: Free, sending not open for
 * this business, sending paused on PunchMe's side, the rules on hold, the
 * scheduler late. Stacked, they buried the one that mattered under three
 * warnings; each one later in the list either follows from an earlier one
 * or can wait until it clears.
 *
 * A summary that hasn't loaded decides nothing but Free, which the plan
 * already says.
 */
export function messagesNotice({
  isPro,
  owns,
  summary,
  rules,
  now = Date.now(),
}: {
  isPro: boolean;
  owns: boolean;
  summary: MessagingSummary | undefined;
  rules: readonly AutomationOut[];
  now?: number;
}): MessagesNotice | null {
  if (!isPro) return owns ? "freeOwner" : "freeHire";
  if (!summary) return null;
  if (!summary.can_send) return "notOpen";
  if (summary.dispatch_enabled === false) return "paused";
  if (!summary.can_reach_one_customer) return "onHold";
  const tick = summary.scheduler_last_tick_at ? Date.parse(summary.scheduler_last_tick_at) : null;
  if (rules.some((rule) => rule.is_active) && (tick === null || now - tick > STALE_TICK_MS)) return "late";
  return null;
}

/**
 * On, off, or on and held: switched on, but the wallet can only publish to
 * a whole card design and more than one customer holds it, so a rule that
 * names one person can't send. A held rule keeps its mark until that
 * changes; it never reads as running.
 */
export type RuleState = "on" | "off" | "held";

export function ruleState(rule: AutomationOut, canReachOne: boolean): RuleState {
  if (!rule.is_active) return "off";
  return canReachOne ? "on" : "held";
}

const STATE_RANK: Record<RuleState, number> = { on: 0, off: 1, held: 2 };

/** Rules that are on first, soonest run first; then those switched off;
 * then those on hold. Otherwise in the order they came. */
export function orderRules(rules: readonly AutomationOut[], canReachOne: boolean): AutomationOut[] {
  const when = (rule: AutomationOut) => {
    const at = rule.next_run_at ? Date.parse(rule.next_run_at) : Number.NaN;
    return Number.isNaN(at) ? Number.POSITIVE_INFINITY : at;
  };
  return rules
    .map((rule, index) => ({ rule, index, state: ruleState(rule, canReachOne) }))
    .sort((a, b) => {
      const byState = STATE_RANK[a.state] - STATE_RANK[b.state];
      if (byState !== 0) return byState;
      if (a.state === "on") {
        const byRun = when(a.rule) - when(b.rule);
        if (byRun !== 0 && !Number.isNaN(byRun)) return byRun;
      }
      return a.index - b.index;
    })
    .map(({ rule }) => rule);
}

/** A rule that is on, whose next run is already behind it: the scheduler
 * missed it, and the row says so rather than show a time in the past. */
export function isLate(rule: AutomationOut, canReachOne: boolean, now = Date.now()): boolean {
  if (ruleState(rule, canReachOne) !== "on" || !rule.next_run_at) return false;
  return Date.parse(rule.next_run_at) < now;
}

/**
 * Who a rule reaches, only where the summary holds that exact figure:
 * - a win-back of 14, 30, 60 or 90 days, from the counts the audience query
 *   itself makes, matching now;
 * - a birthday rule, the birthdays in this month.
 *
 * Not for a reward reminder: the summary counts every reward waiting,
 * however long, and the rule waits a number of days first. Not for a rule
 * kept to customers who opted in, which the summary doesn't count.
 */
export type Reach = { when: "now" | "month"; count: number };

export function ruleReach(rule: AutomationOut, summary: MessagingSummary | undefined): Reach | null {
  if (!summary || rule.opt_in_only) return null;
  if (rule.kind === "inactive" && rule.inactive_days !== null) {
    const count = summary.inactive_counts[String(rule.inactive_days)];
    return count === undefined ? null : { when: "now", count };
  }
  if (rule.kind === "birthday") return { when: "month", count: summary.birthdays_this_month };
  return null;
}
