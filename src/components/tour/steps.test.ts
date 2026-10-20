import { describe, expect, it } from "vitest";
import en from "../../i18n/locales/en/common.json";
import he from "../../i18n/locales/he/common.json";
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

/** A dotted key's string in one language's file, or undefined. */
function copy(tree: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((node, key) => (node && typeof node === "object" ? (node as Record<string, unknown>)[key] : undefined), tree);
}

describe("tourSteps", () => {
  it("walks each role on each plan as the brief draws it", () => {
    expect(keys("owner", true)).toEqual(["overview", "customers", "join", "design", "scan"]);
    expect(keys("manager", true)).toEqual(["overview", "customers", "join", "design", "scan"]);
    expect(keys("staff", true)).toEqual(["overview", "customers", "scan"]);
    expect(keys("owner", false)).toEqual(["overview", "join", "activate", "scan"]);
    expect(keys("manager", false)).toEqual(["overview", "join", "scan"]);
    expect(keys("staff", false)).toEqual(["overview", "scan"]);
  });

  it("walks a hire past nothing they cannot open", () => {
    // The same rule the navigation is built with: staff stay on the counter.
    for (const canEnroll of [true, false]) {
      for (const step of tourSteps("staff", canEnroll)) expect(step.group).toBe("counter");
    }
    expect(keys("manager", true)).not.toContain("activate");
    expect(keys("manager", false)).not.toContain("activate");
  });

  it("skips Customers on Free, where there are none yet", () => {
    for (const role of ["staff", "manager", "owner"] as const) {
      expect(keys(role, false)).not.toContain("customers");
    }
  });

  it("shows the studio only once the card is live", () => {
    // A Free owner came out of the wizard four steps ago, and those four
    // steps were the studio.
    expect(keys("manager", true)).toContain("design");
    expect(keys("owner", false)).not.toContain("design");
  });

  it("shows activating only until it is activated, and only to the owner", () => {
    expect(keys("owner", false)).toContain("activate");
    expect(keys("owner", true)).not.toContain("activate");
  });

  it("gives the Activate stop the price, to be set left to right", () => {
    const activate = tourSteps("owner", false).find((step) => step.key === "activate");
    expect(activate?.values?.price).toBe(99);
    expect(copy(en, activate!.body)).toContain("{{price}}");
    expect(copy(he, activate!.body)).toContain("<ltr>₪{{price}}</ltr>");
  });

  it("tells a hire their own Overview line, on either plan", () => {
    // "The card you designed" isn't a manager's or a staff member's to have
    // designed; the Free checklist's Activate would refuse them too.
    for (const role of ["staff", "manager"] as const) {
      expect(tourSteps(role, true)[0].body).toBe("tour.steps.overview.bodyHire");
      expect(tourSteps(role, false)[0].body).toBe("tour.steps.overview.bodyFreeHire");
    }
    expect(tourSteps("owner", true)[0].body).toBe("tour.steps.overview.body");
    expect(tourSteps("owner", false)[0].body).toBe("tour.steps.overview.bodyFree");
  });

  it("never tells a Free business what is only true on Pro", () => {
    const proBodies = new Set(
      EVERY_CASE.filter(([, canEnroll]) => canEnroll).flatMap(([role]) =>
        tourSteps(role, true).map((step) => step.body),
      ),
    );
    for (const role of ["staff", "manager", "owner"] as const) {
      for (const step of tourSteps(role, false)) {
        expect(proBodies.has(step.body), `${role} on Free at ${step.key}`).toBe(false);
      }
    }
  });

  it("asks for a tap only on Scan, and never on Free", () => {
    for (const [role, canEnroll] of EVERY_CASE) {
      const acting = tourSteps(role, canEnroll).filter((step) => step.act);
      expect(acting.map((step) => step.key), `${role} ${canEnroll}`).toEqual(canEnroll ? ["scan"] : []);
    }
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
        expect(step.group).toMatch(/^(counter|facing|business)$/);
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

  it("has every word it says in both languages", () => {
    for (const [role, canEnroll] of EVERY_CASE) {
      for (const step of tourSteps(role, canEnroll)) {
        const used = [step.title, step.body, step.act, `dashboard.groups.${step.group}`, `dashboard.nav.${step.nav}`];
        for (const key of used.filter((k): k is string => !!k)) {
          expect(typeof copy(en, key), `en ${key}`).toBe("string");
          expect(typeof copy(he, key), `he ${key}`).toBe("string");
        }
      }
    }
  });
});
