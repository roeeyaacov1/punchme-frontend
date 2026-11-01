import { describe, expect, it } from "vitest";
import { EMPTY_MESSAGE } from "../../../components/messaging/messageDraft";
import { nextRunAt, ruleSentence, triggerValid, type RuleDraft } from "./ruleSentence";

const phrase = { days: (n: number) => `${n}d`, hour: (h: number) => `${h}:00` };

function rule(patch: Partial<RuleDraft> = {}): RuleDraft {
  return {
    ...EMPTY_MESSAGE,
    body: "We miss you",
    name: "Win-back",
    kind: "inactive",
    inactive_days: 30,
    repeat_days: null,
    birthday_days_before: 0,
    reward_waiting_days: 7,
    send_hour_local: 10,
    ...patch,
  };
}

const keys = (pieces: ReturnType<typeof ruleSentence>) => pieces.map((piece) => piece.key.replace("messaging.sentence.", ""));

describe("ruleSentence", () => {
  it("says a win-back's ceiling, its days and its hour", () => {
    const [lead] = ruleSentence(rule(), 86, phrase);
    expect(lead).toEqual({ key: "messaging.sentence.inactive", values: { hour: "10:00", days: "30d" }, count: 86 });
  });

  it("speaks while the count is on its way, and says nobody matches in words", () => {
    expect(keys(ruleSentence(rule(), null, phrase))).toEqual(["inactiveCounting", "optIn"]);
    expect(keys(ruleSentence(rule(), 0, phrase))).toEqual(["inactiveNone", "optIn"]);
  });

  it("adds the repeat, the gift and who agreed, in that order", () => {
    const pieces = ruleSentence(rule({ repeat_days: 30, gift_stamps: 2 }), 5, phrase);
    expect(keys(pieces)).toEqual(["inactive", "repeat", "giftStamps", "optIn"]);
    expect(pieces[2].count).toBe(2);
    expect(keys(ruleSentence(rule({ gift_complete_card: true }), 5, phrase))).toEqual(["inactive", "giftFull", "optIn"]);
  });

  it("says a birthday rule's day, and a reward reminder's wait and count", () => {
    expect(keys(ruleSentence(rule({ kind: "birthday" }), 3, phrase))).toEqual(["birthday", "optIn"]);
    expect(ruleSentence(rule({ kind: "birthday", birthday_days_before: 3 }), 3, phrase)[0].values).toEqual({
      hour: "10:00",
      days: "3d",
    });
    expect(keys(ruleSentence(rule({ kind: "reward_waiting" }), 22, phrase))).toEqual(["rewardWaiting", "matchNow", "optIn"]);
    expect(keys(ruleSentence(rule({ kind: "reward_waiting" }), 0, phrase))).toEqual(["rewardWaiting", "matchNone", "optIn"]);
  });

  it("never promises a gift on a reward reminder", () => {
    expect(keys(ruleSentence(rule({ kind: "reward_waiting", gift_stamps: 1 }), null, phrase))).toEqual([
      "rewardWaiting",
      "optIn",
    ]);
  });
});

describe("nextRunAt", () => {
  it("is later today before the hour, and tomorrow once it has struck", () => {
    expect(nextRunAt(10, new Date(2026, 9, 22, 9, 30))).toEqual(new Date(2026, 9, 22, 10, 0));
    expect(nextRunAt(10, new Date(2026, 9, 22, 10, 0))).toEqual(new Date(2026, 9, 23, 10, 0));
    expect(nextRunAt(10, new Date(2026, 9, 22, 21, 0))).toEqual(new Date(2026, 9, 23, 10, 0));
  });
});

describe("triggerValid", () => {
  it("takes what the API takes, and waits on a number that isn't one yet", () => {
    expect(triggerValid(rule())).toBe(true);
    expect(triggerValid(rule({ inactive_days: 6 }))).toBe(false);
    expect(triggerValid(rule({ inactive_days: Number.NaN }))).toBe(false);
    expect(triggerValid(rule({ repeat_days: 400 }))).toBe(false);
    expect(triggerValid(rule({ kind: "reward_waiting", reward_waiting_days: 91 }))).toBe(false);
    expect(triggerValid(rule({ kind: "birthday", birthday_days_before: 14 }))).toBe(true);
  });
});
