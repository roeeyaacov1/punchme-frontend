import type { Business } from "../api/businesses";
import type { Role } from "../api/team";

/** Free plan can't enroll real customers — PassKit bills per card. The owner
 * can still design and preview their own card for free either way. */
export function canEnrollRealCustomers(business: Business | null): boolean {
  return business?.plan === "pro";
}

/**
 * What the signed-in person is to this business, and what that lets them do.
 *
 * Ranked, not orthogonal: every owner can do what a manager can, every
 * manager what a staff member can. `RANK` is the only place that ordering
 * lives on this side, and it mirrors `businesses/services.py:ROLE_RANK`
 * exactly — the API is the real boundary and answers 403 regardless, so
 * everything here is about not offering a door that won't open.
 */
const RANK: Record<Role, number> = { staff: 0, manager: 1, owner: 2 };

export function roleOf(business: Business | null): Role | null {
  if (!business) return null;
  const role = business.viewer_role;
  if (role === "owner" || role === "manager" || role === "staff") return role;
  // An API that doesn't send the field yet — a deploy where this ships ahead
  // of the backend, or a rollback. Before memberships existed, anyone who
  // could reach GET /businesses/me WAS its owner, so that is the honest
  // reading of a missing value; treating it as "no role" would instead hide
  // billing, the card and the standee from every existing owner and lock
  // them out of their own dashboard until the backend caught up.
  return "owner";
}

export function atLeast(role: Role | null, minimum: Role): boolean {
  return role !== null && RANK[role] >= RANK[minimum];
}

/** Anything that changes what customers see: the card, the standee, the
 * messages that go out. */
export function canManage(role: Role | null): boolean {
  return atLeast(role, "manager");
}

/** Money, the team, and the deletes that take a business's worth of rows
 * with them. */
export function isOwner(role: Role | null): boolean {
  return atLeast(role, "owner");
}
