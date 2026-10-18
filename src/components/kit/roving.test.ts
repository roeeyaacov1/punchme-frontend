import { describe, expect, it } from "vitest";
import { nextRovingIndex } from "./roving";

describe("nextRovingIndex", () => {
  it("moves right to the next tab in English", () => {
    expect(nextRovingIndex("ArrowRight", 0, 3, false)).toBe(1);
    expect(nextRovingIndex("ArrowLeft", 2, 3, false)).toBe(1);
  });

  it("moves left to the next tab in Hebrew, which reads right to left", () => {
    expect(nextRovingIndex("ArrowLeft", 0, 3, true)).toBe(1);
    expect(nextRovingIndex("ArrowRight", 2, 3, true)).toBe(1);
  });

  it("wraps at both ends", () => {
    expect(nextRovingIndex("ArrowRight", 2, 3, false)).toBe(0);
    expect(nextRovingIndex("ArrowLeft", 0, 3, false)).toBe(2);
    expect(nextRovingIndex("ArrowLeft", 2, 3, true)).toBe(0);
  });

  it("jumps to the ends with Home and End, in either language", () => {
    expect(nextRovingIndex("Home", 2, 4, false)).toBe(0);
    expect(nextRovingIndex("End", 0, 4, true)).toBe(3);
  });

  it("leaves every other key alone", () => {
    expect(nextRovingIndex("ArrowDown", 1, 3, false)).toBeNull();
    expect(nextRovingIndex("Enter", 1, 3, true)).toBeNull();
  });

  it("does nothing on an empty row", () => {
    expect(nextRovingIndex("ArrowRight", 0, 0, false)).toBeNull();
  });
});
