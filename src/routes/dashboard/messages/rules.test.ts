import { describe, expect, it } from "vitest";
import type { AutomationOut, MessagingSummary } from "../../../api/messaging";
import { STALE_TICK_MS, isLate, keepOrder, messagesNotice, orderRules, ruleReach, ruleState } from "./rules";

const NOW = Date.parse("2026-10-22T12:00:00Z");

function summary(patch: Partial<MessagingSummary> = {}): MessagingSummary {
  return {
    can_send: true,
    is_pro: true,
    customers_with_card: 300,
    customers_with_birthday: 120,
    inactive_counts: { "14": 80, "30": 86, "60": 12, "90": 3 },
    reward_waiting_count: 22,
    birthdays_this_month: 9,
    sent_this_month: 640,
    can_reach_one_customer: true,
    broadcasts_used_7d: 0,
    broadcasts_limit_7d: 2,
    next_broadcast_allowed_at: null,
    scheduler_last_tick_at: new Date(NOW - 60_000).toISOString(),
    dispatch_enabled: true,
    ...patch,
  };
}

let seq = 0;
function rule(patch: Partial<AutomationOut> = {}): AutomationOut {
  seq += 1;
  return {
    id: `rule-${seq}`,
    name: `Rule ${seq}`,
    kind: "inactive",
    status: "active",
    is_active: true,
    title: "",
    body: "Hi",
    gift_stamps: 0,
    gift_complete_card: false,
    inactive_days: 30,
    repeat_days: null,
    birthday_days_before: 0,
    reward_waiting_days: null,
    send_hour_local: 10,
    opt_in_only: false,
    template_id: null,
    next_run_at: "2026-10-23T07:00:00Z",
    last_run_local_date: null,
    audience_count: 0,
    sent_total: 0,
    failed_total: 0,
    reached_total: 0,
    sent_this_month: 0,
    last_sent_at: null,
    created_at: "2026-09-01T07:00:00Z",
    updated_at: "2026-09-01T07:00:00Z",
    ...patch,
  };
}

describe("messagesNotice", () => {
  it("says Free first, to the owner with the price and to a hire without", () => {
    expect(messagesNotice({ isPro: false, owns: true, summary: summary(), rules: [], now: NOW })).toBe("freeOwner");
    expect(messagesNotice({ isPro: false, owns: false, summary: undefined, rules: [], now: NOW })).toBe("freeHire");
  });

  it("decides nothing else until the summary is there", () => {
    expect(messagesNotice({ isPro: true, owns: true, summary: undefined, rules: [rule()], now: NOW })).toBeNull();
  });

  it("shows only the first that holds when they all do", () => {
    const everything = summary({
      can_send: false,
      dispatch_enabled: false,
      can_reach_one_customer: false,
      scheduler_last_tick_at: new Date(NOW - 5 * STALE_TICK_MS).toISOString(),
    });
    expect(messagesNotice({ isPro: true, owns: true, summary: everything, rules: [rule()], now: NOW })).toBe("notOpen");
    expect(messagesNotice({ isPro: true, owns: true, summary: { ...everything, can_send: true }, rules: [rule()], now: NOW })).toBe("paused");
    expect(
      messagesNotice({ isPro: true, owns: true, summary: { ...everything, can_send: true, dispatch_enabled: true }, rules: [rule()], now: NOW }),
    ).toBe("onHold");
  });

  it("calls the scheduler late only while a rule is on and an hour passed with no tick", () => {
    const stale = summary({ scheduler_last_tick_at: new Date(NOW - STALE_TICK_MS - 1).toISOString() });
    expect(messagesNotice({ isPro: true, owns: true, summary: stale, rules: [rule()], now: NOW })).toBe("late");
    expect(messagesNotice({ isPro: true, owns: true, summary: stale, rules: [rule({ is_active: false })], now: NOW })).toBeNull();
    expect(messagesNotice({ isPro: true, owns: true, summary: summary({ scheduler_last_tick_at: null }), rules: [rule()], now: NOW })).toBe("late");
    expect(messagesNotice({ isPro: true, owns: true, summary: summary(), rules: [rule()], now: NOW })).toBeNull();
  });
});

describe("orderRules", () => {
  it("puts the rules that are on first, soonest first, then off, then held", () => {
    const later = rule({ name: "later", next_run_at: "2026-10-24T07:00:00Z" });
    const sooner = rule({ name: "sooner", next_run_at: "2026-10-23T07:00:00Z" });
    const off = rule({ name: "off", is_active: false, next_run_at: null });
    expect(orderRules([off, later, sooner], true).map((r) => r.name)).toEqual(["sooner", "later", "off"]);
    // Held: everything that is on can't send, and goes last.
    expect(orderRules([later, off, sooner], false).map((r) => r.name)).toEqual(["off", "later", "sooner"]);
  });

  it("keeps a rule with no next run after the ones that have one", () => {
    const none = rule({ name: "none", next_run_at: null });
    const some = rule({ name: "some" });
    expect(orderRules([none, some], true).map((r) => r.name)).toEqual(["some", "none"]);
  });
});

describe("keepOrder", () => {
  it("keeps a switched rule where it stood, where sorting again would move it", () => {
    const first = rule({ name: "first" });
    const second = rule({ name: "second" });
    const third = rule({ name: "third" });
    const shown = orderRules([first, second, third], true).map((r) => r.id);
    const switchedOff = { ...first, is_active: false, next_run_at: null };
    expect(orderRules([switchedOff, second, third], true).map((r) => r.name)).toEqual(["second", "third", "first"]);
    expect(keepOrder([switchedOff, second, third], shown, true).map((r) => r.name)).toEqual(["first", "second", "third"]);
  });

  it("puts a rule it doesn't hold after, in its own order, and drops one that has gone", () => {
    const kept = rule({ name: "kept" });
    const gone = rule({ name: "gone" });
    const newOff = rule({ name: "new off", is_active: false, next_run_at: null });
    const newOn = rule({ name: "new on" });
    expect(keepOrder([newOff, kept, newOn], [gone.id, kept.id], true).map((r) => r.name)).toEqual(["kept", "new on", "new off"]);
  });
});

describe("ruleState and isLate", () => {
  it("never reads a held rule as running, or as late", () => {
    const missed = rule({ next_run_at: "2026-10-21T07:00:00Z" });
    expect(ruleState(missed, false)).toBe("held");
    expect(isLate(missed, false, NOW)).toBe(false);
    expect(isLate(missed, true, NOW)).toBe(true);
    expect(isLate(rule(), true, NOW)).toBe(false);
  });
});

describe("ruleReach", () => {
  it("gives a win-back its exact count, and a birthday rule the month's birthdays", () => {
    expect(ruleReach(rule(), summary())).toEqual({ when: "now", count: 86 });
    expect(ruleReach(rule({ kind: "birthday", inactive_days: null }), summary())).toEqual({ when: "month", count: 9 });
  });

  it("says nothing it can't count exactly", () => {
    expect(ruleReach(rule({ inactive_days: 45 }), summary())).toBeNull();
    expect(ruleReach(rule({ opt_in_only: true }), summary())).toBeNull();
    expect(ruleReach(rule({ kind: "reward_waiting", inactive_days: null, reward_waiting_days: 7 }), summary())).toBeNull();
    expect(ruleReach(rule(), undefined)).toBeNull();
  });
});
