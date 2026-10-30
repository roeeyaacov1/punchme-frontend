import { describe, expect, it } from "vitest";
import { ALL_STEPS } from "./draft";
import { ROAD, roadOf } from "./road";

describe("roadOf", () => {
  it("starts at the business, with the card next", () => {
    expect(roadOf("business")).toEqual({ stop: 1, total: 5, at: "business", next: "reward" });
  });

  it("makes the card screen and its three trays one stop", () => {
    for (const step of ["color", "accent", "stamp", "reward"] as const) {
      expect(roadOf(step)).toEqual({ stop: 2, total: 5, at: "reward", next: "account" });
    }
  });

  it("ends at going live, with nothing after it", () => {
    expect(roadOf("billing")).toEqual({ stop: 5, total: 5, at: "billing", next: null });
  });

  it("never changes length, and never goes back as the wizard goes on", () => {
    const stops = ALL_STEPS.map((step) => roadOf(step));
    expect(new Set(stops.map((place) => place.total))).toEqual(new Set([ROAD.length]));
    const numbers = stops.map((place) => place.stop);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    expect(new Set(numbers)).toEqual(new Set([1, 2, 3, 4, 5]));
  });
});
