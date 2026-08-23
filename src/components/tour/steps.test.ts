import { describe, expect, it } from "vitest";
import { tourSteps } from "./steps";

type Role = Parameters<typeof tourSteps>[0];

const keys = (role: Role, canEnroll: boolean) =>
  tourSteps(role, canEnroll).map((step) => step.key);

const EVERY_CASE: [Role, boolean][] = [
  ["staff", true],
  ["staff", false],
  ["manager", true],
  ["manager", false],
  ["owner", true],
  ["owner", false],
];

describe("tourSteps", () => {
  it("walks a hire past nothing they cannot open", () => {
    // The same rule the rail is built with. Both stops are counter work.
    expect(keys("staff", true)).toEqual(["overview", "customers", "scan"]);
    expect(keys("staff", false)).toEqual(["overview", "customers", "scan"]);
  });

  it("adds the standee for a manager, and nothing about money", () => {
    expect(keys("manager", false)).toEqual([
      "overview",
      "customers",
      "join",
      "scan",
    ]);
  });

  it("shows the studio only once the card is live", () => {
    // A free owner came out of the wizard four steps ago and those four steps
    // were the studio; showing it back to them is showing them what they just
    // did.
    expect(keys("manager", true)).toContain("design");
    expect(keys("manager", false)).not.toContain("design");
  });

  it("shows activating only until it is activated", () => {
    expect(keys("owner", false)).toEqual([
      "overview",
      "customers",
      "join",
      "activate",
      "scan",
    ]);
    expect(keys("owner", true)).toEqual([
      "overview",
      "customers",
      "join",
      "design",
      "scan",
    ]);
  });

  it("ends on the scanner every time", () => {
    for (const [role, canEnroll] of EVERY_CASE) {
      const walk = keys(role, canEnroll);
      expect(walk[walk.length - 1]).toBe("scan");
    }
  });

  it("stays at five stops or fewer", () => {
    for (const [role, canEnroll] of EVERY_CASE) {
      expect(keys(role, canEnroll).length).toBeLessThanOrEqual(5);
    }
  });

  it("shows nothing to someone with no role at all", () => {
    // `roleOf` never returns null for a business that answered, so this is
    // the "we don't know yet" case — and an unknown role is not a reason to
    // guess which doors to open.
    expect(keys(null, true)).toEqual([]);
  });

  it("gives every stop a route and something to light up", () => {
    for (const [role, canEnroll] of EVERY_CASE) {
      for (const step of tourSteps(role, canEnroll)) {
        expect(step.to).toMatch(/^\/dashboard(\/|$)/);
        expect(step.anchor).toBeTruthy();
        expect(step.group).toMatch(/^(counter|marketing|setup)$/);
        expect(step.nav).toBeTruthy();
      }
    }
  });

  it("never drives to the scanner — arriving there opens the camera", () => {
    for (const [role, canEnroll] of EVERY_CASE) {
      for (const step of tourSteps(role, canEnroll)) {
        expect(step.to).not.toBe("/dashboard/scan");
      }
    }
  });

  it("asks for a tap only where a tap does something", () => {
    const acting = tourSteps("owner", true).filter((step) => step.act);
    expect(acting.map((s) => s.key)).toEqual(["scan"]);
  });
});
