import { describe, expect, it } from "vitest";
import type { ActivityItem, CustomerListItem } from "../../api/loyalty";
import { BRIEF_DAYS, buildBrief } from "./overviewBrief";

const DAY_MS = 24 * 60 * 60 * 1000;

/** A fixed "now" so every case reads as a date rather than as an offset from
 * whenever the suite happened to run. Local noon, so shifting by whole days
 * never crosses a midnight by accident. */
const NOW = new Date(2026, 7, 23, 12, 0, 0).getTime();

/** `daysAgo` is counted in calendar days from NOW's midnight, at noon, which
 * is what the brief buckets on. */
function at(daysAgo: number): string {
  return new Date(NOW - daysAgo * DAY_MS).toISOString();
}

function event(over: Partial<ActivityItem> = {}): ActivityItem {
  return {
    card_serial: "card-a",
    customer_display_name: "",
    stamps: 1,
    source: "scan",
    created_at: at(0),
    business_user_email: "roee@example.com",
    ...over,
  };
}

function customer(over: Partial<CustomerListItem> = {}): CustomerListItem {
  return {
    card_id: "id-a",
    customer_display_name: "Dana",
    customer_phone: null,
    stamp_count: 0,
    stamps_required: 10,
    status: "active",
    template_name: "Card",
    created_at: at(0),
    ...over,
  };
}

function brief(
  activity: ActivityItem[],
  customers: CustomerListItem[] = [],
  truncated = false,
) {
  return buildBrief({ activity, customers, now: NOW, truncated });
}

describe("returned — the headline", () => {
  it("counts a card seen on two separate days, not two stamps in one day", () => {
    const oneDay = brief([
      event({ card_serial: "a", created_at: at(1) }),
      event({ card_serial: "a", created_at: at(1) }),
    ]);
    expect(oneDay.returned).toBe(0);
    expect(oneDay.visits).toBe(1);

    const twoDays = brief([
      event({ card_serial: "a", created_at: at(1) }),
      event({ card_serial: "a", created_at: at(4) }),
    ]);
    expect(twoDays.returned).toBe(1);
    expect(twoDays.visits).toBe(2);
  });

  it("counts people, not stamps: one card is one returner however busy", () => {
    const b = brief([
      event({ card_serial: "a", created_at: at(1), stamps: 5 }),
      event({ card_serial: "a", created_at: at(2), stamps: 5 }),
    ]);
    expect(b.returned).toBe(1);
    expect(b.people).toBe(1);
  });

  it("leaves out an automation — a rule fires with nobody in the shop", () => {
    const b = brief([
      event({ card_serial: "a", created_at: at(1) }),
      event({ card_serial: "a", created_at: at(2), source: "automation" }),
    ]);
    expect(b.returned).toBe(0);
    expect(b.visits).toBe(1);
  });

  it("leaves out a stamp being taken back", () => {
    const b = brief([
      event({ card_serial: "a", created_at: at(1) }),
      event({ card_serial: "a", created_at: at(2), stamps: -1, source: "adjust" }),
    ]);
    expect(b.returned).toBe(0);
  });

  it("counts a stamp added by hand — a person recorded it at the counter", () => {
    const b = brief([
      event({ card_serial: "a", created_at: at(1), source: "adjust" }),
      event({ card_serial: "a", created_at: at(2), source: "scan" }),
    ]);
    expect(b.returned).toBe(1);
  });

  it("ignores anything older than the window", () => {
    const b = brief([
      event({ card_serial: "a", created_at: at(1) }),
      event({ card_serial: "a", created_at: at(BRIEF_DAYS + 5) }),
    ]);
    expect(b.returned).toBe(0);
    expect(b.people).toBe(1);
  });
});

describe("returnedDelta", () => {
  it("compares against the window before it", () => {
    const b = brief([
      // This window: two returners.
      event({ card_serial: "a", created_at: at(1) }),
      event({ card_serial: "a", created_at: at(2) }),
      event({ card_serial: "b", created_at: at(3) }),
      event({ card_serial: "b", created_at: at(4) }),
      // The window before: one.
      event({ card_serial: "c", created_at: at(BRIEF_DAYS + 1) }),
      event({ card_serial: "c", created_at: at(BRIEF_DAYS + 2) }),
    ]);
    expect(b.returned).toBe(2);
    expect(b.returnedDelta).toBe(1);
  });

  it("is null when the sample was truncated — a gap is not a fall", () => {
    const b = brief(
      [
        event({ card_serial: "a", created_at: at(1) }),
        event({ card_serial: "a", created_at: at(2) }),
      ],
      [],
      true,
    );
    expect(b.returnedDelta).toBeNull();
    expect(b.capped).toBe(true);
  });

  it("is null for a shop with nothing in either window", () => {
    expect(brief([]).returnedDelta).toBeNull();
  });
});

describe("the roster figures", () => {
  it("counts joins in each window off created_at", () => {
    const b = brief(
      [],
      [
        customer({ created_at: at(2) }),
        customer({ created_at: at(10) }),
        customer({ created_at: at(BRIEF_DAYS + 2) }),
      ],
    );
    expect(b.joined).toBe(2);
    expect(b.joinedDelta).toBe(1);
  });

  it("separates full cards from one-stamp-short ones", () => {
    const b = brief(
      [],
      [
        customer({ stamp_count: 10, stamps_required: 10 }),
        customer({ stamp_count: 12, stamps_required: 10 }),
        customer({ stamp_count: 9, stamps_required: 10 }),
        customer({ stamp_count: 8, stamps_required: 10 }),
      ],
    );
    expect(b.ready).toBe(2);
    expect(b.oneAway).toBe(1);
  });

  it("leaves out a voided card and a template with no requirement", () => {
    const b = brief(
      [],
      [
        customer({ status: "void", stamp_count: 10 }),
        customer({ stamps_required: 0, stamp_count: 0 }),
        customer({ stamp_count: 3 }),
      ],
    );
    expect(b.joined).toBe(1);
    expect(b.ready).toBe(0);
  });
});

describe("quietDays", () => {
  it("is null when nobody was ever stamped", () => {
    expect(brief([]).quietDays).toBeNull();
  });

  it("counts whole days back to the last visit", () => {
    expect(brief([event({ created_at: at(0) })]).quietDays).toBe(0);
    expect(brief([event({ created_at: at(4) })]).quietDays).toBe(4);
  });

  it("does not count an automation as somebody being in the shop", () => {
    const b = brief([
      event({ created_at: at(0), source: "automation" }),
      event({ created_at: at(6) }),
    ]);
    expect(b.quietDays).toBe(6);
  });

  it("looks past the window — a shop quiet for two months should say so", () => {
    expect(brief([event({ created_at: at(70) })]).quietDays).toBe(70);
  });
});

describe("customers", () => {
  it("is the roster minus the cards that are not customers", () => {
    const b = brief(
      [],
      [
        customer(),
        customer({ status: "void" }),
        customer({ stamps_required: 0 }),
      ],
    );
    expect(b.customers).toBe(1);
  });
});

describe("days — the band's ground", () => {
  it("always spans the whole window, quiet days included", () => {
    const b = brief([event({ created_at: at(3) })]);
    expect(b.days).toHaveLength(BRIEF_DAYS);
    expect(b.days[BRIEF_DAYS - 1].date.getTime()).toBeGreaterThan(
      b.days[0].date.getTime(),
    );
    expect(b.days.filter((d) => d.visits > 0)).toHaveLength(1);
  });

  it("counts people per day, not stamps", () => {
    const b = brief([
      event({ card_serial: "a", created_at: at(2), stamps: 4 }),
      event({ card_serial: "a", created_at: at(2) }),
      event({ card_serial: "b", created_at: at(2) }),
    ]);
    expect(b.days.find((d) => d.visits > 0)?.visits).toBe(2);
  });
});
