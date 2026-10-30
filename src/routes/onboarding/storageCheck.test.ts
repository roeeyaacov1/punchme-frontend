import { describe, expect, it } from "vitest";
import { storageVerdict } from "./storageCheck";

describe("storageVerdict", () => {
  it("is full when the wizard's own key can't be written", () => {
    expect(storageVerdict({ probe: false, stored: "draft", written: "draft" })).toBe("full");
  });

  it("is kept when storage holds the draft as it was last written", () => {
    expect(storageVerdict({ probe: true, stored: "draft", written: "draft" })).toBe("kept");
  });

  it("is full when storage still holds an older draft than the one on screen", () => {
    expect(storageVerdict({ probe: true, stored: "before the edit", written: "after the edit" })).toBe("full");
    expect(storageVerdict({ probe: true, stored: null, written: "the first edit" })).toBe("full");
  });

  it("has nothing to compare before the first change", () => {
    expect(storageVerdict({ probe: true, stored: null, written: null })).toBe("kept");
  });
});
