/**
 * Whether this person has been shown the tour, and where.
 *
 * Two places, not one. The dashboard in a browser tab and the dashboard
 * launched from a home-screen icon are the same app and a different thing to
 * learn — the icon opens full screen, straight to the counter, with a tab bar
 * where the browser had a rail — and they are reached at two different
 * moments: one the day the owner signs up, the other the first morning they
 * actually work off it. So the tour is remembered per context, and finishing
 * it in the browser does not spend the one that matters at the counter.
 *
 * On iPhone this is not even a choice. A home-screen app gets its own storage
 * jar, so nothing written in Safari is readable inside it; two contexts are
 * simply what is true there. Writing them down makes Android agree rather
 * than quietly behave differently.
 */

export type TourContext = "web" | "app";

const KEY = "punchme.tourSeen";

/** Also the canonical order — `addSeen` writes in it, so the stored value is
 * the same string whichever context was reached first. */
const CONTEXTS: readonly TourContext[] = ["web", "app"];

/** Pure: the contexts recorded in a stored value. Anything unrecognised is
 * dropped rather than trusted — this is a key a person can edit by hand, and
 * a typo in it should cost at most one extra tour. */
export function parseSeen(raw: string | null): TourContext[] {
  if (!raw) return [];
  const found = raw.split(",").map((part) => part.trim());
  return CONTEXTS.filter((context) => found.includes(context));
}

/** Pure: that value with one more context recorded. */
export function addSeen(raw: string | null, context: TourContext): string {
  const seen = parseSeen(raw);
  return CONTEXTS.filter((c) => c === context || seen.includes(c)).join(",");
}

export function hasSeenTour(context: TourContext): boolean {
  try {
    return parseSeen(localStorage.getItem(KEY)).includes(context);
  } catch {
    // No storage — Safari with cookies blocked, an embedded browser. We
    // cannot remember, so we cannot stop: showing it means a modal over the
    // dashboard on every single load. Failing quiet is the smaller loss.
    return true;
  }
}

export function markTourSeen(context: TourContext): void {
  try {
    localStorage.setItem(KEY, addSeen(localStorage.getItem(KEY), context));
  } catch {
    /* the dismissal still holds for this page */
  }
}
