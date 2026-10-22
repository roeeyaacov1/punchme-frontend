import { describe, expect, it } from "vitest";
import { EMPTY_MESSAGE, giftChoiceOf, giftPatch, hasGift, messageProblems, messageReady, previewOf } from "./messageDraft";

const draft = (patch: Partial<typeof EMPTY_MESSAGE> = {}) => ({ ...EMPTY_MESSAGE, ...patch });

describe("the gift as one choice", () => {
  it("maps stamps and a full card both ways", () => {
    expect(giftChoiceOf(draft({ gift_stamps: 2 }))).toBe("2");
    expect(giftChoiceOf(draft({ gift_complete_card: true }))).toBe("full");
    expect(giftPatch("3")).toEqual({ gift_stamps: 3, gift_complete_card: false });
    expect(giftPatch("full")).toEqual({ gift_stamps: 0, gift_complete_card: true });
    expect(giftPatch(null)).toEqual({ gift_stamps: 0, gift_complete_card: false });
    expect(hasGift(draft())).toBe(false);
  });
});

describe("messageProblems", () => {
  it("finds a placeholder nobody knows, in the field it's in", () => {
    const problems = messageProblems(draft({ title: "{nope}", body: "hi" }), "broadcast");
    expect(problems.titleUnknown).toEqual(["{nope}"]);
    expect(problems.bodyUnknown).toEqual([]);
  });

  it("refuses a name in a message to everyone, and only there", () => {
    expect(messageProblems(draft({ body: "היי {שם}" }), "broadcast").bodyUnsupported).toEqual(["{שם}"]);
    expect(messageProblems(draft({ body: "היי {שם}" }), "inactive").bodyUnsupported).toEqual([]);
  });

  it("warns of a promised gift without blocking the send", () => {
    const promised = draft({ body: "a gift for you" });
    expect(messageProblems(promised, "broadcast").giftMismatch).toBe(true);
    expect(messageReady(promised, "broadcast")).toBe(true);
    expect(messageReady(draft({ body: "  " }), "broadcast")).toBe(false);
    expect(messageReady(draft({ body: "hi {שם}" }), "broadcast")).toBe(false);
  });
});

describe("previewOf", () => {
  it("renders for the sample customer, and leaves an empty title to the business's name", () => {
    const preview = previewOf(draft({ body: "{business}: {reward}" }), {
      kind: "broadcast",
      language: "EN",
      businessName: "Demo Coffee",
      rewardText: "a free coffee",
    });
    expect(preview).toEqual({ title: undefined, body: "Demo Coffee: a free coffee" });
  });
});
