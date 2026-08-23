import { describe, expect, it } from "vitest";
import { toNameCase } from "./name";

describe("toNameCase", () => {
  it("cases a name however it was typed", () => {
    expect(toNameCase("dana cohen")).toBe("Dana Cohen");
    expect(toNameCase("DANA COHEN")).toBe("Dana Cohen");
    expect(toNameCase("dANA cOHEN")).toBe("Dana Cohen");
    expect(toNameCase("Dana Cohen")).toBe("Dana Cohen");
  });

  it("trims and collapses the spacing", () => {
    expect(toNameCase("  dana   cohen ")).toBe("Dana Cohen");
    expect(toNameCase("   ")).toBe("");
    expect(toNameCase("")).toBe("");
  });

  it("cases both sides of a hyphenated name", () => {
    expect(toNameCase("dana BEN-ari")).toBe("Dana Ben-Ari");
  });

  it("leaves a Hebrew name alone", () => {
    expect(toNameCase("דנה כהן")).toBe("דנה כהן");
    expect(toNameCase("  דנה   בן-ארי ")).toBe("דנה בן-ארי");
  });

  it("cases a one-letter prefix but not a geresh mid-word", () => {
    expect(toNameCase("SEAN O'BRIEN")).toBe("Sean O'Brien");
    expect(toNameCase("amit sa'ar")).toBe("Amit Sa'ar");
  });

  it("handles a single name and accented letters", () => {
    expect(toNameCase("dana")).toBe("Dana");
    expect(toNameCase("josé MARTÍNEZ")).toBe("José Martínez");
  });
});
