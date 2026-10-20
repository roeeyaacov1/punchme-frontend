import { describe, expect, it } from "vitest";
import en from "../../i18n/locales/en/common.json";
import he from "../../i18n/locales/he/common.json";
import {
  BAR_KEYS,
  NAV_GROUPS,
  barItems,
  inMore,
  moreGroups,
  pageFor,
  visibleGroups,
  type NavGroup,
} from "./navigation";

const ROLES = ["staff", "manager", "owner"] as const;
const groupKeys = (groups: NavGroup[]) => groups.map((group) => group.key);
const pageKeys = (groups: NavGroup[]) => groups.flatMap((group) => group.items.map((item) => item.key));

describe("visibleGroups", () => {
  it("gives each role whole groups, and nothing above it", () => {
    expect(groupKeys(visibleGroups("staff"))).toEqual(["counter"]);
    expect(groupKeys(visibleGroups("manager"))).toEqual(["counter", "facing"]);
    expect(groupKeys(visibleGroups("owner"))).toEqual(["counter", "facing", "business"]);
  });

  it("shows nothing before the role is known", () => {
    expect(visibleGroups(null)).toEqual([]);
  });

  it("keeps every page in a group at the group's floor", () => {
    // Otherwise a hire would see half a group, and a heading over a door that
    // refuses them.
    for (const group of NAV_GROUPS) {
      expect(new Set(group.items.map((item) => item.min)).size, group.key).toBe(1);
    }
  });

  it("orders each group by how often its pages are opened", () => {
    expect(pageKeys(visibleGroups("owner"))).toEqual([
      "scan",
      "overview",
      "customers",
      "activity",
      "messages",
      "design",
      "standee",
      "referrals",
      "billing",
      "team",
    ]);
  });

  it("names every group and page in both languages", () => {
    for (const group of NAV_GROUPS) {
      expect(typeof en.dashboard.groups[group.key], group.key).toBe("string");
      expect(typeof he.dashboard.groups[group.key], group.key).toBe("string");
      for (const item of group.items) {
        expect(typeof en.dashboard.nav[item.key], item.key).toBe("string");
        expect(typeof he.dashboard.nav[item.key], item.key).toBe("string");
      }
    }
  });
});

describe("the phone bar", () => {
  it("is the counter, the same four pages for every role, with Scan in the middle", () => {
    for (const role of ROLES) {
      expect(barItems(role).map((item) => item.key), role).toEqual([
        "overview",
        "customers",
        "scan",
        "activity",
      ]);
    }
  });

  it("carries only counter pages", () => {
    const counter = NAV_GROUPS[0].items.map((item) => item.key) as readonly string[];
    for (const key of BAR_KEYS) expect(counter).toContain(key);
  });
});

describe("the More sheet", () => {
  it("holds what customers see for a manager, and the business too for the owner", () => {
    expect(groupKeys(moreGroups("manager"))).toEqual(["facing"]);
    expect(groupKeys(moreGroups("owner"))).toEqual(["facing", "business"]);
  });

  it("is empty for staff, whose fifth slot opens the account instead", () => {
    expect(moreGroups("staff")).toEqual([]);
  });

  it("never repeats a page the bar carries, and leaves none out", () => {
    for (const role of ROLES) {
      const more = pageKeys(moreGroups(role));
      const bar = barItems(role).map((item) => item.key);
      expect(more.filter((key) => bar.includes(key)), role).toEqual([]);
      expect([...bar, ...more].sort(), role).toEqual(pageKeys(visibleGroups(role)).sort());
    }
  });
});

describe("pageFor", () => {
  it("finds the page a path belongs to, nested pages included", () => {
    expect(pageFor("/dashboard")?.key).toBe("overview");
    expect(pageFor("/dashboard/")?.key).toBe("overview");
    expect(pageFor("/dashboard/scan")?.key).toBe("scan");
    expect(pageFor("/dashboard/messages/new")?.key).toBe("messages");
    expect(pageFor("/dashboard/messages/automations/12")?.key).toBe("messages");
  });

  it("finds nothing for a path with no page", () => {
    expect(pageFor("/dashboard/nope")).toBeNull();
    expect(pageFor("/dashboard/scanner")).toBeNull();
    expect(pageFor("/login")).toBeNull();
  });
});

describe("inMore", () => {
  it("lights More only for a page in the viewer's own More", () => {
    expect(inMore("/dashboard/billing", "owner")).toBe(true);
    expect(inMore("/dashboard/messages/new", "manager")).toBe(true);
    // Refused pages: a manager's More holds no Billing, staff have no More.
    expect(inMore("/dashboard/billing", "manager")).toBe(false);
    expect(inMore("/dashboard/design", "staff")).toBe(false);
    // On the bar, or nowhere at all.
    expect(inMore("/dashboard/activity", "owner")).toBe(false);
    expect(inMore("/dashboard/nope", "owner")).toBe(false);
  });
});
