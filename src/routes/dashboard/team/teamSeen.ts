/**
 * When the owner last saw their team on this device, per business.
 *
 * A link sent last week comes back as a person, and the row that changed
 * keeps its light until it has been seen: a hire who joined since this time
 * is "New" on the next visit. Kept on the device because seeing is: the
 * owner's phone and their laptop each learn it once.
 */
const KEY = "punchme.teamSeen";

export function lastTeamVisit(businessId: string): number | null {
  if (!businessId) return null;
  try {
    const raw = Number(localStorage.getItem(`${KEY}.${businessId}`));
    return Number.isFinite(raw) && raw > 0 ? raw : null;
  } catch {
    // No storage: nobody is new, which is the quiet way to be wrong.
    return null;
  }
}

export function rememberTeamVisit(businessId: string, at: number): void {
  if (!businessId) return;
  try {
    localStorage.setItem(`${KEY}.${businessId}`, String(at));
  } catch {
    /* the badge just shows again next time */
  }
}
