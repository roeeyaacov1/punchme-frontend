import { describe, expect, it } from "vitest";
import {
  AUTOMATIC,
  NO_FILTERS,
  actorsOf,
  buildRows,
  codesFor,
  dayTotals,
  hasAutomatic,
  isFiltered,
  kindOf,
  markDayOpeners,
  matches,
  startOfDay,
  type ActivityItemWithName,
} from "./activityFilters";

function event(over: Partial<ActivityItemWithName> = {}): ActivityItemWithName {
  return {
    card_serial: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee1234",
    stamps: 1,
    source: "scan",
    created_at: "2026-08-22T09:30:00Z",
    business_user_email: "roee@example.com",
    ...over,
  };
}

describe("kindOf", () => {
  it("reads a plain scan as a stamp", () => {
    expect(kindOf(event())).toBe("stamp");
  });

  it("reads an automation row as a gift", () => {
    expect(kindOf(event({ source: "automation" }))).toBe("gift");
  });

  it("separates a hand-entered stamp from one a customer earned", () => {
    // Both are +1 and both are real; only `source` tells them apart, and the
    // difference is the whole point of the Action column.
    expect(kindOf(event({ source: "adjust" }))).toBe("manual");
  });

  it("reads any negative delta as a removal, whatever its source", () => {
    expect(kindOf(event({ source: "adjust", stamps: -1 }))).toBe("removed");
    expect(kindOf(event({ source: "scan", stamps: -3 }))).toBe("removed");
  });

  it("reads a large positive delta as an import rather than a visit", () => {
    expect(kindOf(event({ stamps: 6 }))).toBe("stamp");
    expect(kindOf(event({ stamps: 7 }))).toBe("import");
  });

  it("prefers removal over import for a large negative correction", () => {
    expect(kindOf(event({ stamps: -9 }))).toBe("removed");
  });
});

describe("codesFor", () => {
  it("keeps the last four alphanumerics, upper-cased", () => {
    const codes = codesFor([{ card_serial: "abc-def-9x7q" }]);
    expect(codes.get("abc-def-9x7q")).toBe("9X7Q");
  });

  it("counts back over alphanumerics, not over punctuation", () => {
    // "zz-ab-cd" folds to "zzabcd"; the last four of that are "abcd".
    expect(codesFor([{ card_serial: "zz-ab-cd" }]).get("zz-ab-cd")).toBe("ABCD");
  });

  it("widens every code rather than let two cards share one", () => {
    const codes = codesFor([
      { card_serial: "first-00-1234" },
      { card_serial: "second-99-1234" },
    ]);
    const values = [...codes.values()];
    expect(new Set(values).size).toBe(2);
    // Widened for the whole window, not just the pair that collided, so the
    // column stays one width down the page.
    expect(values.every((v) => v.length === values[0].length)).toBe(true);
  });

  it("gives up widening rather than print the whole credential", () => {
    // Two serials differing only past the eighth character from the end.
    const codes = codesFor([
      { card_serial: "aXXXXXXXX" },
      { card_serial: "bXXXXXXXX" },
    ]);
    expect([...codes.values()].every((v) => v.length <= 8)).toBe(true);
  });
});

describe("buildRows", () => {
  it("prefers the customer's name and keeps the code as a search key", () => {
    const [row] = buildRows([event({ customer_display_name: "Dana Cohen" })]);
    expect(row.name).toBe("Dana Cohen");
    expect(row.code).toBe("1234");
    expect(row.haystack).toContain("dana cohen");
    expect(row.haystack).toContain("1234");
  });

  it("treats a blank or missing name as no name at all", () => {
    expect(buildRows([event({ customer_display_name: "   " })])[0].name).toBe("");
    expect(buildRows([event({ customer_display_name: null })])[0].name).toBe("");
    expect(buildRows([event()])[0].name).toBe("");
  });

  it("keeps only the local part of the staff email", () => {
    // The domain is identical on every row of a shop and never distinguishes
    // two people.
    expect(buildRows([event()])[0].actor).toBe("roee");
    expect(buildRows([event({ business_user_email: null })])[0].actor).toBeNull();
  });

  it("buckets each event into its own local day", () => {
    const [row] = buildRows([event({ created_at: "2026-08-22T09:30:00Z" })]);
    expect(row.day).toBe(startOfDay(Date.parse("2026-08-22T09:30:00Z")));
  });
});

describe("matches", () => {
  const rows = buildRows([
    event({ customer_display_name: "Dana Cohen" }),
    event({ source: "automation", business_user_email: null, card_serial: "x-5678" }),
    event({ source: "adjust", stamps: -1, business_user_email: "maya@example.com" }),
  ]);
  const [dana, gift, removal] = rows;

  it("passes everything through when nothing is set", () => {
    expect(rows.every((r) => matches(r, NO_FILTERS))).toBe(true);
    expect(isFiltered(NO_FILTERS)).toBe(false);
  });

  it("filters by action", () => {
    expect(matches(gift, { ...NO_FILTERS, kind: "gift" })).toBe(true);
    expect(matches(dana, { ...NO_FILTERS, kind: "gift" })).toBe(false);
  });

  it("filters by who performed it", () => {
    expect(matches(dana, { ...NO_FILTERS, who: "roee" })).toBe(true);
    expect(matches(removal, { ...NO_FILTERS, who: "roee" })).toBe(false);
  });

  it("selects rule-driven rows with the automatic option", () => {
    expect(matches(gift, { ...NO_FILTERS, who: AUTOMATIC })).toBe(true);
    expect(matches(dana, { ...NO_FILTERS, who: AUTOMATIC })).toBe(false);
  });

  it("searches the name, the code and the person, case-insensitively", () => {
    expect(matches(dana, { ...NO_FILTERS, search: "  dANa  " })).toBe(true);
    expect(matches(dana, { ...NO_FILTERS, search: "1234" })).toBe(true);
    expect(matches(removal, { ...NO_FILTERS, search: "maya" })).toBe(true);
    expect(matches(dana, { ...NO_FILTERS, search: "maya" })).toBe(false);
  });

  it("ignores a search of only whitespace instead of matching nothing", () => {
    expect(matches(dana, { ...NO_FILTERS, search: "   " })).toBe(true);
  });

  it("filters to a single day", () => {
    expect(matches(dana, { ...NO_FILTERS, day: dana.day })).toBe(true);
    expect(matches(dana, { ...NO_FILTERS, day: dana.day - 86_400_000 })).toBe(false);
  });

  it("requires every active filter, not any of them", () => {
    expect(matches(dana, { ...NO_FILTERS, kind: "stamp", who: "roee" })).toBe(true);
    expect(matches(dana, { ...NO_FILTERS, kind: "stamp", who: "maya" })).toBe(false);
  });
});

describe("actorsOf", () => {
  it("lists each person once, sorted, and reports the rule-driven rows", () => {
    const rows = buildRows([
      event({ business_user_email: "roee@example.com" }),
      event({ business_user_email: "dana@example.com" }),
      event({ business_user_email: "roee@example.com" }),
      event({ business_user_email: null }),
    ]);
    expect(actorsOf(rows)).toEqual(["dana", "roee"]);
    expect(hasAutomatic(rows)).toBe(true);
  });

  it("says there is nothing automatic when every row had a person", () => {
    expect(hasAutomatic(buildRows([event()]))).toBe(false);
  });
});

describe("dayTotals", () => {
  const DAY = 86_400_000;
  const start = startOfDay(Date.parse("2026-08-20T12:00:00Z"));
  const rows = buildRows([
    event({ created_at: new Date(start + 9 * 3600_000).toISOString(), stamps: 2 }),
    event({ created_at: new Date(start + 11 * 3600_000).toISOString(), stamps: 1 }),
    event({ created_at: new Date(start + DAY + 9 * 3600_000).toISOString(), stamps: 4 }),
  ]);

  it("sums each day into its own bucket, oldest first", () => {
    expect(dayTotals(rows, start, 3, true)).toEqual([3, 4, 0]);
  });

  it("nets removals out of the day they belong to", () => {
    const withRemoval = buildRows([
      event({ created_at: new Date(start + 9 * 3600_000).toISOString(), stamps: 3 }),
      event({
        created_at: new Date(start + 10 * 3600_000).toISOString(),
        stamps: -1,
        source: "adjust",
      }),
    ]);
    expect(dayTotals(withRemoval, start, 1, true)).toEqual([2]);
  });

  it("never draws below the axis", () => {
    const onlyRemovals = buildRows([
      event({
        created_at: new Date(start + 9 * 3600_000).toISOString(),
        stamps: -2,
        source: "adjust",
      }),
    ]);
    expect(dayTotals(onlyRemovals, start, 1, true)).toEqual([0]);
  });

  it("counts magnitude when one kind is chosen, so removals still plot", () => {
    // Signed, a fortnight of removals is a flat zero — which is not a chart.
    const onlyRemovals = buildRows([
      event({
        created_at: new Date(start + 9 * 3600_000).toISOString(),
        stamps: -2,
        source: "adjust",
      }),
    ]);
    expect(dayTotals(onlyRemovals, start, 1, false)).toEqual([2]);
  });

  it("drops events that fall outside the window rather than folding them in", () => {
    expect(dayTotals(rows, start + DAY, 1, true)).toEqual([4]);
    expect(dayTotals(rows, start - 5 * DAY, 2, true)).toEqual([0, 0]);
  });
});

describe("markDayOpeners", () => {
  it("marks the first row of each run, so the date prints once", () => {
    const DAY = 86_400_000;
    const start = startOfDay(Date.parse("2026-08-22T12:00:00Z"));
    const rows = buildRows([
      event({ created_at: new Date(start + 20 * 3600_000).toISOString() }),
      event({ created_at: new Date(start + 9 * 3600_000).toISOString() }),
      event({ created_at: new Date(start - DAY + 9 * 3600_000).toISOString() }),
    ]);
    expect(markDayOpeners(rows).map((r) => r.opensDay)).toEqual([true, false, true]);
  });

  it("is computed over what is showing, not over what was fetched", () => {
    // Filtering away the middle row of a day makes the next one the opener.
    const DAY = 86_400_000;
    const start = startOfDay(Date.parse("2026-08-22T12:00:00Z"));
    const rows = buildRows([
      event({ created_at: new Date(start - DAY + 9 * 3600_000).toISOString() }),
    ]);
    expect(markDayOpeners(rows)[0].opensDay).toBe(true);
  });

  it("handles an empty list", () => {
    expect(markDayOpeners([])).toEqual([]);
  });
});
