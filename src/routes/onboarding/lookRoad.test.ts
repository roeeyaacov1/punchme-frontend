import { describe, expect, it } from "vitest";
import { ALL_STEPS, emptyDraft, firstIncompleteStep, type OnboardingDraft } from "./draft";
import { LOOKS_ROAD, roadOf } from "./road";
import { whereToStart } from "./walk";

/** The fifth stop, the look, while the wizard offers the card looks (brief
 * §7.2), beside the road's and the walk's own tests. */

function draftOf(over: Partial<OnboardingDraft>): OnboardingDraft {
  return { ...emptyDraft(), updatedAt: 1, ...over };
}

describe("the road with the looks", () => {
  it("starts at the look, with the card next", () => {
    expect(roadOf("look", true)).toEqual({ stop: 1, total: 5, at: "look", next: "reward" });
    expect(roadOf("business", true)).toEqual({ stop: 2, total: 5, at: "reward", next: "account" });
    expect(roadOf("billing", true)).toEqual({ stop: 5, total: 5, at: "billing", next: null });
  });

  it("is five stops on every screen, never going back", () => {
    const numbers = ALL_STEPS.map((step) => roadOf(step, true));
    expect(new Set(numbers.map((place) => place.total))).toEqual(new Set([LOOKS_ROAD.length]));
    const stops = numbers.map((place) => place.stop);
    expect(stops).toEqual([...stops].sort((a, b) => a - b));
    expect(new Set(stops)).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it("gives the look's address to the map when there are no looks, where it goes", () => {
    expect(roadOf("look")).toEqual({ stop: 1, total: 4, at: "reward", next: "account" });
  });
});

describe("where a draft stands with the looks", () => {
  it("sends a draft with no trade to the look", () => {
    expect(firstIncompleteStep(null, undefined, true)).toBe("look");
    expect(firstIncompleteStep(draftOf({ name: "Danny's" }), undefined, true)).toBe("look");
    expect(whereToStart(draftOf({}), undefined, true)).toBe("look");
  });

  it("goes on to the business once the trade is there", () => {
    expect(firstIncompleteStep(draftOf({ niche: "cafe", look: "cafe-latte-cups" }), undefined, true)).toBe("business");
  });

  it("never sends back a draft with a trade and no look: a card from before them", () => {
    const before = draftOf({ name: "Danny's", niche: "barber", background: "#1F2937", accent: "#C88A11" });
    expect(firstIncompleteStep(before, undefined, true)).toBe(firstIncompleteStep(before));
    expect(whereToStart(before, undefined, true)).toBe(whereToStart(before));
  });

  it("leaves a wizard without the looks as it was", () => {
    expect(firstIncompleteStep(draftOf({}))).toBe("business");
    expect(whereToStart(draftOf({}))).toBe("business");
  });
});
