import { describe, expect, it } from "vitest";
import {
  FULL_CARD,
  RULE_SLOTS,
  giftChoice,
  giftPatch,
  hasGift,
  renderPreview,
  rowIsEmpty,
  slotKey,
  unknownPlaceholders,
} from "./referralRules";

describe("the rows", () => {
  it("come in screen order and only the scanned one cannot gift", () => {
    expect(RULE_SLOTS.map(slotKey)).toEqual([
      "friend_joined_friend",
      "friend_first_stamp_referrer",
      "friend_completed_card_referrer",
      "scanned_referrer",
    ]);
    expect(RULE_SLOTS.filter((slot) => !slot.gifts).map(slotKey)).toEqual(["scanned_referrer"]);
  });

  it("maps a rule to the picker and back", () => {
    expect(giftChoice({ gift_stamps: 2, gift_complete_card: false })).toBe(2);
    expect(giftChoice({ gift_stamps: 0, gift_complete_card: true })).toBe(FULL_CARD);
    expect(giftPatch(3)).toEqual({ gift_stamps: 3, gift_complete_card: false });
    expect(giftPatch(FULL_CARD)).toEqual({ gift_stamps: 0, gift_complete_card: true });
  });

  it("knows an empty row when it sees one", () => {
    expect(hasGift({ gift_stamps: 0, gift_complete_card: false })).toBe(false);
    expect(rowIsEmpty({ gift_stamps: 0, gift_complete_card: false, body: "  " })).toBe(true);
    expect(rowIsEmpty({ gift_stamps: 0, gift_complete_card: false, body: "Hi" })).toBe(false);
    expect(rowIsEmpty({ gift_stamps: 1, gift_complete_card: false, body: "" })).toBe(false);
  });
});

describe("renderPreview", () => {
  const context = { name: "דנה", friend: "נועה", business: "מספרת יוסי", reward: "תספורת חינם" };

  it("substitutes both spellings", () => {
    expect(renderPreview("היי {שם}, {חבר} ביקרה בזכותך", context)).toBe(
      "היי דנה, נועה ביקרה בזכותך",
    );
    expect(renderPreview("Hi {name}, {friend} visited — {reward} at {business}", context)).toBe(
      "Hi דנה, נועה visited — תספורת חינם at מספרת יוסי",
    );
  });

  it("tidies an empty substitution", () => {
    expect(renderPreview("היי {שם}, מה נשמע", { ...context, name: "" })).toBe("היי, מה נשמע");
  });

  it("leaves an unknown token in place and names it", () => {
    expect(renderPreview("Hi {nam}", context)).toBe("Hi {nam}");
    expect(unknownPlaceholders("Hi {nam} and {חברה} and {name}")).toEqual(["{nam}", "{חברה}"]);
  });
});
