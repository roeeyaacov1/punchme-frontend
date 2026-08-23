import { describe, expect, it } from "vitest";
import { tourSteps } from "./steps";

const keys = (role: Parameters<typeof tourSteps>[0], canEnroll: boolean) =>
  tourSteps(role, canEnroll).map((step) => step.key);

describe("tourSteps", () => {
  it("shows a hire only what a hire can open", () => {
    // The same rule the rail is built with: never a door the API would
    // close. Nothing here is manager or owner work.
    expect(keys("staff", true)).toEqual(["scan", "customers"]);
    expect(keys("staff", false)).toEqual(["scan", "customers"]);
  });

  it("adds the card and the standee for a manager, and nothing about money", () => {
    expect(keys("manager", true)).toEqual(["scan", "join", "customers", "design"]);
    expect(keys("manager", false)).toEqual(["scan", "join", "customers", "design"]);
  });

  it("closes an owner's tour on activating, until it is activated", () => {
    expect(keys("owner", false)).toEqual([
      "scan",
      "join",
      "customers",
      "design",
      "activate",
    ]);
    expect(keys("owner", true)).toEqual(["scan", "join", "customers", "design"]);
  });

  it("stays short enough to be a tour", () => {
    for (const role of ["staff", "manager", "owner"] as const) {
      for (const canEnroll of [true, false]) {
        expect(keys(role, canEnroll).length).toBeLessThanOrEqual(5);
      }
    }
  });

  it("shows nothing to someone with no role at all", () => {
    // `roleOf` never returns null for a business that answered, so this is
    // the "we don't know yet" case — and an unknown role is not a reason to
    // guess which doors to show.
    expect(keys(null, true)).toEqual([]);
  });

  it("names a real place in the rail for every step", () => {
    for (const step of tourSteps("owner", false)) {
      expect(step.group).toMatch(/^(counter|marketing|setup)$/);
      expect(step.nav).toBeTruthy();
    }
  });
});
