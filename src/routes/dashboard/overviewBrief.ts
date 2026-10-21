import type { ActivityItem, CustomerListItem } from "../../api/loyalty";
import { startOfDay, wholeDaysFrom } from "./activityFilters";

/**
 * The brief: what a shop owner is owed in one glance.
 *
 * The landing page sells this product on Square's finding that a *regular* —
 * someone who comes back four or more times a year — is worth about six times
 * a one-time customer, and `calculator.ts` prices a year of PunchMe in
 * regulars. So the number that has to be at the top of the dashboard is the
 * one the owner was sold: are people coming back.
 *
 * Not stamps. A stamp counts a first-timer and a tenth-visit regular exactly
 * the same, which makes "47 stamps this week" a number that cannot go down
 * for the right reason or up for the wrong one.
 *
 * What this deliberately does **not** claim:
 *
 * - **Lifetime visits.** `stamp_count` resets to zero on redemption, so a
 *   customer who has filled three cards reads as a beginner. Square's own
 *   "four times a year" is therefore not computable from this API, and this
 *   file never pretends otherwise — it counts return visits inside a window
 *   it can actually see.
 * - **Rewards claimed.** `redeem_card` writes a `RewardRedemption` row and
 *   `list_business_activity` reads `StampEvent` only, so the moment the free
 *   coffee is handed over is invisible here. `ready` is who is *owed* one,
 *   never who got one.
 *
 * Everything below is derived from the two reads the overview already makes.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** The window the brief reports on, and the one before it that gives it a
 * direction. Rolling rather than calendar: on the 1st of the month "0 people
 * came back this month" is true, alarming and useless. */
export const BRIEF_DAYS = 30;

/** The week: today and the six days before it, against the seven before. */
export const WEEK_DAYS = 7;

/** Local midnight `days` calendar days before `midnight`. Calendar arithmetic
 * rather than 24-hour steps, so a window that crosses a clock change still
 * lands every day on its own midnight. */
function daysBefore(midnight: number, days: number): number {
  const d = new Date(midnight);
  d.setDate(d.getDate() - days);
  return d.getTime();
}

/** Below this a quiet run is just a slow week; at or above it the standee has
 * plausibly fallen over behind the till, and that is worth saying. */
export const QUIET_DAYS = 3;

export interface Brief {
  /** People who came back — seen on two or more separate days in the window.
   * The headline. */
  returned: number;
  /** Against the window before it, or null when the sample could not prove
   * what that window held. Never guessed. */
  returnedDelta: number | null;
  /** The 30 days before were loaded whole, so a comparison with them is one.
   * When not, the page says there is no comparison rather than staying
   * silent, unless there was nothing to compare. */
  previousLoaded: boolean;
  /** Distinct people seen at all in the window. */
  people: number;
  /** One entry per day of the window, oldest first — how many people were
   * in that day. `loaded` is false for a day the walk didn't load whole: its
   * `visits` is then no count at all, and is drawn as not loaded, never as
   * a zero. */
  days: { date: Date; visits: number; loaded: boolean }[];
  /** Visits in the window — one per person per day, so a gift of three
   * stamps is not three people through the door. */
  visits: number;
  /** Everyone on the roster who still counts as a customer. A voided card is
   * not one, and every other figure here already leaves it out — leaving it
   * in here alone would put two different definitions of "customer" side by
   * side in the same row of figures. */
  customers: number;
  /** Cards opened in the window, and against the window before it. Exact
   * while the roster reached past the window: it comes newest first, so a
   * roster stopped by its own guard still holds every recent join. */
  joined: number;
  joinedDelta: number | null;
  /** The roster stopped inside the window, so `joined` is a floor. */
  joinedCapped: boolean;
  /** Cards full and waiting to be spent, right now. */
  ready: number;
  /** One stamp short — the people walking in this week. */
  oneAway: number;
  /** The roster stopped at its own guard, so `customers`, `ready` and
   * `oneAway` are floors. */
  rosterCapped: boolean;
  /** Whole days since anybody was stamped, or null if nobody ever was. */
  quietDays: number | null;
  /** When that last visit was, for saying since when. */
  lastVisit: number | null;
  /** The walk stopped inside the 30 days themselves, so `returned`,
   * `people` and `visits` are floors rather than counts. A walk that only
   * stopped inside the 30 days before leaves these exact: it loaded every
   * event newer than the oldest one it holds. */
  capped: boolean;
  /** The week, under the same rule. */
  week: Week;
}

export interface Week {
  /** Seven days, oldest first: the stamps handed out (a rule's gift left
   * out, a stamp taken back netted off), or not loaded whole. */
  days: { date: Date; stamps: number; loaded: boolean }[];
  total: number;
  /** The walk stopped inside this week, so `total` is a floor. */
  capped: boolean;
  /** Against last week, or null when last week wasn't loaded whole, or when
   * both weeks were empty: a shop that hasn't started hasn't slowed down. */
  delta: number | null;
}

/** A stamp that means a person was standing at the counter.
 *
 * `automation` is excluded because a messaging rule fires on a schedule with
 * nobody present, and a non-positive one is a correction being taken back —
 * neither is a visit. This is the same line the week ledger draws. */
function isVisit(event: ActivityItem): boolean {
  return event.source !== "automation" && event.stamps > 0;
}

/** Card serial → the distinct local days it was stamped on.
 *
 * Keyed on `card_serial` because that is the only identity the activity feed
 * carries; it cannot be joined to the roster's `card_id` and does not need to
 * be — everything here is counted within the feed. */
function daysPerCard(items: ActivityItem[]): Map<string, Set<number>> {
  const seen = new Map<string, Set<number>>();
  for (const event of items) {
    if (!isVisit(event)) continue;
    const day = startOfDay(Date.parse(event.created_at));
    const days = seen.get(event.card_serial);
    if (days) days.add(day);
    else seen.set(event.card_serial, new Set([day]));
  }
  return seen;
}

function countReturned(items: ActivityItem[]): number {
  let returned = 0;
  for (const days of daysPerCard(items).values()) if (days.size >= 2) returned += 1;
  return returned;
}

function remainingOf(c: CustomerListItem): number {
  return Math.max(0, c.stamps_required - c.stamp_count);
}

/** A card that can still be counted — a voided one is not a customer, and a
 * template with no requirement has no such thing as "full". */
function countable(c: CustomerListItem): boolean {
  return c.status !== "void" && c.stamps_required > 0;
}

export function buildBrief({
  activity,
  customers,
  now,
  truncated,
  rosterTruncated = false,
}: {
  /** At least `BRIEF_DAYS * 2` back, so the window before this one can be
   * compared. Order does not matter. */
  activity: ActivityItem[];
  /** The whole roster, newest first, as the endpoint returns it. */
  customers: CustomerListItem[];
  now: number;
  /** The activity walk gave up before reaching the far edge. */
  truncated: boolean;
  /** The roster walk stopped at its own guard. */
  rosterTruncated?: boolean;
}): Brief {
  // Whole days, so the window's edge lands at a midnight rather than at
  // whatever time the page happened to be opened — the same reason the week
  // buckets by calendar day.
  const today = startOfDay(now);
  const start = daysBefore(today, BRIEF_DAYS - 1);
  const prevStart = daysBefore(start, BRIEF_DAYS);
  // Everything from this midnight on was loaded whole; null when the walk
  // reached its far edge. Floors are decided per window from it, not from
  // the walk as a whole: a busy shop's 30 days are exact even when the 30
  // before them were cut.
  const firstWhole = wholeDaysFrom(activity, truncated);
  const loadedFrom = (from: number) => firstWhole === null || firstWhole <= from;

  const inWindow: ActivityItem[] = [];
  const inPrev: ActivityItem[] = [];
  let lastVisit = -Infinity;
  for (const event of activity) {
    const at = Date.parse(event.created_at);
    if (isVisit(event) && at > lastVisit) lastVisit = at;
    if (at >= start) inWindow.push(event);
    else if (at >= prevStart) inPrev.push(event);
  }

  const cardDays = daysPerCard(inWindow);
  let visits = 0;
  let returned = 0;
  // People per day, not stamps per day: two people once each is a busier
  // Tuesday than one person twice, and the chart is a picture of the room.
  const perDay = new Map<number, number>();
  for (const days of cardDays.values()) {
    visits += days.size;
    if (days.size >= 2) returned += 1;
    for (const day of days) perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }
  const series = Array.from({ length: BRIEF_DAYS }, (_, i) => {
    const at = daysBefore(start, -i);
    return { date: new Date(at), visits: perDay.get(at) ?? 0, loaded: loadedFrom(at) };
  });

  const prevReturned = countReturned(inPrev);

  let live = 0;
  let joined = 0;
  let prevJoined = 0;
  let ready = 0;
  let oneAway = 0;
  let oldestJoin = Infinity;
  for (const c of customers) {
    const at = Date.parse(c.created_at);
    if (at < oldestJoin) oldestJoin = at;
    if (!countable(c)) continue;
    live += 1;
    if (at >= start) joined += 1;
    else if (at >= prevStart) prevJoined += 1;
    const left = remainingOf(c);
    if (left === 0) ready += 1;
    else if (left === 1) oneAway += 1;
  }
  // The roster comes newest first, so a roster stopped by its guard still
  // holds every join newer than its oldest row.
  const rosterReached = (from: number) => !rosterTruncated || oldestJoin < from;

  /** A shop with nothing in either window has not slowed down, it has not
   * started — "same as the 30 days before" would be true and useless. */
  const delta = (a: number, b: number, known: boolean) =>
    known && (a > 0 || b > 0) ? a - b : null;

  return {
    returned,
    // Only comparable if the walk reached back past the previous window; a
    // cut sample would report a fall that is really a gap in what was read.
    returnedDelta: delta(returned, prevReturned, !truncated),
    previousLoaded: !truncated,
    people: cardDays.size,
    days: series,
    visits,
    customers: live,
    joined,
    joinedDelta: delta(joined, prevJoined, rosterReached(prevStart)),
    joinedCapped: !rosterReached(start),
    ready,
    oneAway,
    rosterCapped: rosterTruncated,
    quietDays:
      lastVisit === -Infinity
        ? null
        : Math.max(0, Math.round((today - startOfDay(lastVisit)) / DAY_MS)),
    lastVisit: lastVisit === -Infinity ? null : lastVisit,
    capped: !loadedFrom(start),
    week: buildWeek(activity, today, loadedFrom),
  };
}

/** The week, day by day: the stamps handed out, a rule's gift left out and a
 * stamp taken back netted off, so the total is the sum of what is drawn. */
function buildWeek(activity: ActivityItem[], today: number, loadedFrom: (from: number) => boolean): Week {
  const start = daysBefore(today, WEEK_DAYS - 1);
  const prevStart = daysBefore(start, WEEK_DAYS);
  const days = Array.from({ length: WEEK_DAYS }, (_, i) => daysBefore(start, -i));
  const stamps = new Map<number, number>();
  let prevWeek = 0;
  for (const event of activity) {
    if (event.source === "automation") continue;
    const at = Date.parse(event.created_at);
    if (at >= start) {
      const day = startOfDay(at);
      stamps.set(day, (stamps.get(day) ?? 0) + event.stamps);
    } else if (at >= prevStart) {
      prevWeek += event.stamps;
    }
  }
  const total = days.reduce((sum, day) => sum + (stamps.get(day) ?? 0), 0);
  const prevKnown = loadedFrom(prevStart);
  return {
    days: days.map((day) => ({ date: new Date(day), stamps: stamps.get(day) ?? 0, loaded: loadedFrom(day) })),
    total,
    capped: !loadedFrom(start),
    delta: prevKnown && (total > 0 || prevWeek > 0) ? total - prevWeek : null,
  };
}
