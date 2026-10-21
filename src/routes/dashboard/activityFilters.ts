import type { ActivityItem } from "../../api/loyalty";

/**
 * The activity feed's model: classify, filter, bucket.
 *
 * Pure and tested, because none of it is visible in a screenshot. Whether a
 * search matches, whether a day boundary falls where it should, and whether
 * two cards can end up wearing the same code are all things a render test
 * would not catch and a unit test does.
 *
 * The API has no filter parameters — `/activity` takes `page` and
 * `page_size` and nothing else — so every one of these runs client-side over
 * a window the page has already fetched. See `fetchActivityWindow`.
 */

export type Kind = "stamp" | "gift" | "manual" | "removed" | "import";

/** Order matters: it is the order of the filter's options. */
export const KINDS: readonly Kind[] = [
  "stamp",
  "gift",
  "manual",
  "removed",
  "import",
];

/** Above this a single event stops being a stamp and is an import. */
export const BULK_EVENT = 6;
/** Characters of the card serial kept when there is no name to show, and how
 * far that is allowed to grow before two cards would wear the same code. */
const CODE_LENGTH = 4;
const CODE_MAX_LENGTH = 8;

/** The `who` filter's value for rows no person performed. */
export const AUTOMATIC = "\u0000automatic";

export function kindOf(event: ActivityItem): Kind {
  if (event.stamps < 0) return "removed";
  if (event.source === "automation") return "gift";
  if (event.stamps > BULK_EVENT) return "import";
  // `scan`, `adjust` and `automation` are the only three the backend writes
  // (StampEvent.Source in apps/loyalty/models.py). A positive `adjust` is the
  // owner typing a stamp in from the customers table, not a customer at the
  // counter, and the action column is where that difference shows.
  return event.source === "adjust" ? "manual" : "stamp";
}

export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * A short code per card, for rows the API has no name for.
 *
 * Four characters is enough to tell two rows apart, which is the only job a
 * serial can do on this screen — and the full value is a credential that
 * `/api/cards/{serial}` and `/redeem` authenticate on, so it does not belong
 * on a page of fifty rows. Widened for the whole window if any two serials in
 * it would collide, so a code never quietly claims two cards are one.
 */
export function codesFor(items: Pick<ActivityItem, "card_serial">[]) {
  const serials = [...new Set(items.map((e) => e.card_serial))];
  let length = CODE_LENGTH;
  const short = (serial: string) =>
    serial
      .replace(/[^0-9a-z]/gi, "")
      .slice(-length)
      .toUpperCase();
  while (
    length < CODE_MAX_LENGTH &&
    new Set(serials.map(short)).size < serials.length
  ) {
    length += 1;
  }
  return new Map(serials.map((serial) => [serial, short(serial)]));
}

export interface ActivityRow {
  event: ActivityItem;
  kind: Kind;
  /** The customer, or "" where the API has no name for this card. */
  name: string;
  /** Always present: the row's label when there is no name, and a search key
   * either way — an owner searching the code they can see should find it. */
  code: string;
  /** Local part of the staff email, or null for a rule-driven row. */
  actor: string | null;
  /** Local midnight of the event's own day, ms. */
  day: number;
  /** Everything a search runs against, folded once at build time rather than
   * per keystroke per row. */
  haystack: string;
}

export function buildRows(items: ActivityItem[]): ActivityRow[] {
  const codes = codesFor(items);
  return items.map((event) => {
    const code = codes.get(event.card_serial) ?? "";
    // Optional-chained even though the schema says required: a frontend
    // pointed at a deploy older than punchme-backend's activity-name change
    // reads `undefined` here, and that has to fall back to the code rather
    // than throw.
    const name = event.customer_display_name?.trim() ?? "";
    // The domain is the same forty characters on every row and never
    // distinguishes two people at one shop.
    const actor = event.business_user_email
      ? event.business_user_email.split("@")[0]
      : null;
    return {
      event,
      kind: kindOf(event),
      name,
      code,
      actor,
      day: startOfDay(Date.parse(event.created_at)),
      haystack: `${name} ${code} ${actor ?? ""}`.toLowerCase(),
    };
  });
}

export interface Filters {
  kind: Kind | "all";
  /** A staff local part, `AUTOMATIC`, or "all". */
  who: string;
  search: string;
  /** Local midnight of the one day being shown, or null for the whole
   * window. Set by clicking the chart. */
  day: number | null;
}

export const NO_FILTERS: Filters = {
  kind: "all",
  who: "all",
  search: "",
  day: null,
};

export function isFiltered(f: Filters): boolean {
  return (
    f.kind !== "all" || f.who !== "all" || f.search.trim() !== "" || f.day !== null
  );
}

export function matches(row: ActivityRow, f: Filters): boolean {
  if (f.kind !== "all" && row.kind !== f.kind) return false;
  if (f.who === AUTOMATIC ? row.actor !== null : f.who !== "all" && row.actor !== f.who) {
    return false;
  }
  if (f.day !== null && row.day !== f.day) return false;
  const needle = f.search.trim().toLowerCase();
  return needle === "" || row.haystack.includes(needle);
}

/** Everyone who appears as an actor in the window, for the `who` options.
 * Sorted so the list does not reshuffle as new events arrive. */
export function actorsOf(rows: ActivityRow[]): string[] {
  return [...new Set(rows.map((r) => r.actor).filter((a): a is string => !!a))].sort(
    (a, b) => a.localeCompare(b),
  );
}

/** Whether any row in the window was performed by no person, so the
 * "automatic" option only appears where it would select something. */
export function hasAutomatic(rows: ActivityRow[]): boolean {
  return rows.some((r) => r.actor === null);
}

/**
 * The chart's series: one value per day, oldest first.
 *
 * Unfiltered this is the net the shop handed out, so a removal subtracts.
 * With a single kind chosen it is the size of that kind — otherwise picking
 * "removed" would plot a fortnight of negative numbers, and a chart clamped
 * to zero is not a chart.
 */
export function dayTotals(
  rows: ActivityRow[],
  startDay: number,
  dayCount: number,
  signed: boolean,
): number[] {
  const buckets = new Array<number>(Math.max(0, dayCount)).fill(0);
  const DAY_MS = 24 * 60 * 60 * 1000;
  for (const row of rows) {
    const index = Math.round((row.day - startDay) / DAY_MS);
    if (index >= 0 && index < buckets.length) {
      buckets[index] += signed ? row.event.stamps : Math.abs(row.event.stamps);
    }
  }
  // A day that netted out below the line is a day with nothing to show, not
  // a line dipping under its own axis.
  return buckets.map((n) => Math.max(0, n));
}

/**
 * The first day the walk loaded whole, or null when it reached the start of
 * its window.
 *
 * `fetchActivityWindow` walks back from the newest event and its guard can
 * stop it part of the way into a day. Everything newer than the oldest event
 * it holds was loaded, but that event's own day was cut short, so it is no
 * more a whole day than the days before it: drawn, it would be a smaller copy
 * of the false drop a missing day drawn as zero makes. Whole days start the
 * next midnight.
 */
export function wholeDaysFrom(items: Pick<ActivityItem, "created_at">[], truncated: boolean): number | null {
  if (!truncated || items.length === 0) return null;
  let oldest = Infinity;
  for (const event of items) oldest = Math.min(oldest, Date.parse(event.created_at));
  const next = new Date(startOfDay(oldest));
  // Calendar arithmetic rather than +24h, so a clock change can't move it.
  next.setDate(next.getDate() + 1);
  return next.getTime();
}

/**
 * How many rows each day holds, over everything the filters let through, so
 * a day's heading counts the whole day even when the list shows only the top
 * of it.
 */
export function countByDay(rows: Pick<ActivityRow, "day">[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const row of rows) counts.set(row.day, (counts.get(row.day) ?? 0) + 1);
  return counts;
}

/**
 * Marks the rows that open a new day, so the date column can print itself
 * once instead of twenty-five times. Runs over the *filtered* list, because
 * which row opens a day depends on which rows are showing.
 */
export function markDayOpeners(rows: ActivityRow[]): (ActivityRow & {
  opensDay: boolean;
})[] {
  let previous: number | null = null;
  return rows.map((row) => {
    const opensDay = row.day !== previous;
    previous = row.day;
    return { ...row, opensDay };
  });
}
