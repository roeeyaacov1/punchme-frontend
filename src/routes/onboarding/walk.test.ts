import { describe, expect, it } from "vitest";
import { emptyDraft, MAP_PARTS, type OnboardingDraft } from "./draft";
import { addressOf, businessMissing, nextUnseen, partAtAddress, walkDone, whereToStart } from "./walk";

function fullDraft(): OnboardingDraft {
  return {
    ...emptyDraft(),
    name: "Rothschild Coffee",
    niche: "cafe",
    background: "#4B2E1E",
    accent: "#C88A11",
    stamp: { kind: "glyph", glyph: "coffee" },
    stampsRequired: 8,
    reward: "Free coffee on your 8th visit",
  };
}

describe("nextUnseen", () => {
  it("starts at the business", () => expect(nextUnseen([])).toBe("business"));
  it("goes on in order", () => {
    expect(nextUnseen(["business"], "business")).toBe("colours");
    expect(nextUnseen(["business", "colours"], "colours")).toBe("stamp");
  });
  it("skips what was opened out of order, and wraps round", () => {
    expect(nextUnseen(["business", "stamp"], "business")).toBe("colours");
    expect(nextUnseen(["business", "stamp", "reward"], "reward")).toBe("colours");
  });
  it("never offers the part that is open", () => {
    expect(nextUnseen(["business", "colours", "stamp"], "reward")).toBeNull();
  });
  it("has nothing once every part is opened", () => {
    expect(nextUnseen(["reward", "stamp", "colours", "business"])).toBeNull();
  });
});

describe("walkDone", () => {
  it("is done only with all four", () => {
    expect(walkDone(["business", "colours", "stamp"])).toBe(false);
    expect(walkDone(["stamp", "business", "reward", "colours"])).toBe(true);
  });
});

describe("addresses", () => {
  it("names each part's address, and reads them back", () => {
    for (const part of MAP_PARTS.filter((p) => p !== "reward")) expect(partAtAddress(addressOf(part))).toBe(part);
    expect(partAtAddress("accent")).toBe("colours");
    expect(partAtAddress("reward")).toBeNull();
    expect(partAtAddress("account")).toBeNull();
  });
});

describe("businessMissing", () => {
  it("says what the business still needs", () => {
    expect(businessMissing({ name: "  ", niche: "cafe" })).toBe("name");
    expect(businessMissing({ name: "Rothschild Coffee", niche: null })).toBe("trade");
    expect(businessMissing({ name: "Rothschild Coffee", niche: "cafe" })).toBeNull();
  });
});

describe("whereToStart", () => {
  it("starts a new owner at the business", () => expect(whereToStart(emptyDraft())).toBe("business"));
  it("walks a finished card that never had the walk from its first part", () =>
    expect(whereToStart(fullDraft())).toBe("business"));
  it("goes to the first part not yet opened", () => {
    expect(whereToStart({ ...fullDraft(), seen: ["business"] })).toBe("color");
    expect(whereToStart({ ...fullDraft(), seen: ["business", "colours", "stamp"] })).toBe("reward");
  });
  it("goes on to saving once the walk is done", () => {
    expect(whereToStart({ ...fullDraft(), seen: [...MAP_PARTS] })).toBe("account");
    expect(whereToStart({ ...fullDraft(), reward: null, seen: [...MAP_PARTS] })).toBe("reward");
  });
  it("sends a lost picture back to the stamp first", () => {
    const lost = { ...fullDraft(), stamp: { kind: "image" as const, hash: "gone" }, seen: [...MAP_PARTS] };
    expect(whereToStart(lost, () => false)).toBe("stamp");
  });
});
