/**
 * Whether this person has been shown the tour, and where.
 *
 * Per person, because a shop's phone is passed from hand to hand: a new hire
 * signing in on the owner's phone gets their own walk rather than inheriting
 * the owner's "seen". The key carries the user's id.
 *
 * And per context, two places, not one. The dashboard in a browser tab and
 * the dashboard launched from a home-screen icon are the same app and a
 * different thing to learn — the icon opens full screen, straight to the
 * counter — and they are reached at two different moments: one the day the
 * owner signs up, the other the first morning they actually work off it. So
 * the tour is remembered per context, and finishing it in the browser does
 * not spend the one that matters at the counter.
 *
 * On iPhone this is not even a choice. A home-screen app gets its own storage
 * jar, so nothing written in Safari is readable inside it; two contexts are
 * simply what is true there. Writing them down makes Android agree rather
 * than quietly behave differently.
 *
 * Before it was per person, it was per device, under the bare key. That value
 * counts as seen for the owner, the person most likely to have seen it: the
 * first time an owner's walk is decided, it moves to their own key with its
 * contexts, and the bare key goes.
 */

export type TourContext = "web" | "app";

const KEY = "punchme.tourSeen";

/** Also the canonical order — `addSeen` writes in it, so the stored value is
 * the same string whichever context was reached first. */
const CONTEXTS: readonly TourContext[] = ["web", "app"];

/** Where one person's tour is remembered. */
export function seenKey(userId: number | string): string {
  return `${KEY}.${userId}`;
}

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

/** Pure: two stored values as one, every context either recorded. How the
 * device-wide value joins the owner's own. */
export function mergeSeen(a: string | null, b: string | null): string {
  const seen = [...parseSeen(a), ...parseSeen(b)];
  return CONTEXTS.filter((c) => seen.includes(c)).join(",");
}

/** The device-wide value, moved to the owner's own key once and removed. */
function adoptDeviceWide(userId: number | string): void {
  const legacy = localStorage.getItem(KEY);
  if (legacy === null) return;
  const mine = seenKey(userId);
  localStorage.setItem(mine, mergeSeen(localStorage.getItem(mine), legacy));
  localStorage.removeItem(KEY);
}

export function hasSeenTour(
  userId: number | string,
  context: TourContext,
  isOwner: boolean,
): boolean {
  try {
    if (isOwner) adoptDeviceWide(userId);
    return parseSeen(localStorage.getItem(seenKey(userId))).includes(context);
  } catch {
    // No storage — Safari with cookies blocked, an embedded browser. We
    // cannot remember, so we cannot stop: showing it means a modal over the
    // dashboard on every single load. Failing quiet is the smaller loss.
    return true;
  }
}

export function markTourSeen(userId: number | string, context: TourContext): void {
  try {
    const key = seenKey(userId);
    localStorage.setItem(key, addSeen(localStorage.getItem(key), context));
  } catch {
    /* the dismissal still holds for this page */
  }
}
