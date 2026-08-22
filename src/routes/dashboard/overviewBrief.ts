import type { ActivityItem, CustomerListItem } from "../../api/loyalty";
import { startOfDay } from "./activityFilters";

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
  /** Distinct people seen at all in the window. */
  people: number;
  /** One entry per day of the window, oldest first — how many people were
   * in that day. This is the shape the brief is drawn *on*: the hero band's
   * ground is the shop's own month, so no two owners see the same one. */
  days: { date: Date; visits: number }[];
  /** Visits in the window — one per person per day, so a gift of three
   * stamps is not three people through the door. */
  visits: number;
  /** Everyone on the roster who still counts as a customer. A voided card is
   * not one, and every other figure here already leaves it out — leaving it
   * in here alone would put two different definitions of "customer" side by
   * side in the same row of figures. */
  customers: number;
  /** Cards opened in the window, and against the window before it. Exact:
   * this comes off the whole roster, not off a sample. */
  joined: number;
  joinedDelta: number | null;
  /** Cards full and waiting to be spent, right now. */
  ready: number;
  /** One stamp short — the people walking in this week. */
  oneAway: number;
  /** Whole days since anybody was stamped, or null if nobody ever was. */
  quietDays: number | null;
  /** The activity sample stopped short of the window, so every figure drawn
   * from it is a floor rather than a count. */
  capped: boolean;
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
}: {
  /** At least `BRIEF_DAYS * 2` back, so the window before this one can be
   * compared. Order does not matter. */
  activity: ActivityItem[];
  /** The whole roster. */
  customers: CustomerListItem[];
  now: number;
  /** The activity walk gave up before reaching the far edge. */
  truncated: boolean;
}): Brief {
  // Whole days, so the window's edge lands at a midnight rather than at
  // whatever time the page happened to be opened — the same reason the week
  // ledger buckets by calendar day.
  const today = startOfDay(now);
  const start = today - (BRIEF_DAYS - 1) * DAY_MS;
  const prevStart = start - BRIEF_DAYS * DAY_MS;

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
  // Tuesday than one person twice, and the band is a picture of the room.
  const perDay = new Map<number, number>();
  for (const days of cardDays.values()) {
    visits += days.size;
    if (days.size >= 2) returned += 1;
    for (const day of days) perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }
  const series = Array.from({ length: BRIEF_DAYS }, (_, i) => {
    const at = start + i * DAY_MS;
    return { date: new Date(at), visits: perDay.get(at) ?? 0 };
  });

  const prevReturned = countReturned(inPrev);

  let live = 0;
  let joined = 0;
  let prevJoined = 0;
  let ready = 0;
  let oneAway = 0;
  for (const c of customers) {
    if (!countable(c)) continue;
    live += 1;
    const at = Date.parse(c.created_at);
    if (at >= start) joined += 1;
    else if (at >= prevStart) prevJoined += 1;
    const left = remainingOf(c);
    if (left === 0) ready += 1;
    else if (left === 1) oneAway += 1;
  }

  /** A shop with nothing in either window has not slowed down, it has not
   * started — "same as the 30 days before" would be true and useless. The
   * same rule the week ledger applies. */
  const delta = (a: number, b: number, known: boolean) =>
    known && (a > 0 || b > 0) ? a - b : null;

  return {
    returned,
    // Only comparable if the walk actually reached back past the previous
    // window; a truncated sample would report a fall that is really a gap in
    // what we fetched.
    returnedDelta: delta(returned, prevReturned, !truncated),
    people: cardDays.size,
    days: series,
    visits,
    customers: live,
    joined,
    // The roster is fetched whole, so this one is always knowable.
    joinedDelta: delta(joined, prevJoined, true),
    ready,
    oneAway,
    quietDays:
      lastVisit === -Infinity
        ? null
        : Math.max(0, Math.round((today - startOfDay(lastVisit)) / DAY_MS)),
    capped: truncated,
  };
}
