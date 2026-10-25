import { ApiError } from "../../../api/errors";
import type { Member, Team } from "../../../api/team";

/**
 * What Team knows about its own rules, kept beside the page so it can be
 * tested without one.
 *
 * The backend caps a business at 25 people, the owner included, and 20 open
 * invitations (`apps/businesses/team.py`). Both answer 409
 * `team_cap_reached` without saying which, so the page tells them apart by
 * the team it is holding.
 */
export const MAX_MEMBERS = 25;

/**
 * Something, an "@", something, a dot, something. The API takes any string
 * as an address, so "dana@" would make a link no one can ever accept; this
 * stops that before the call, and leaves the rest to the person signing in.
 */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** What making a link answered, as the key that says it. Never the API's
 * own `detail`, which is English and written for developers. */
export function inviteRefusalKey(error: unknown, team: Team | undefined): string {
  if (error instanceof ApiError) {
    if (error.code === "already_a_member") return "team.error.alreadyMember";
    if (error.code === "team_cap_reached") {
      return (team?.members.length ?? 0) >= MAX_MEMBERS ? "team.error.capMembers" : "team.error.capInvitations";
    }
    if (error.status === 422) return "team.error.badEmail";
  }
  return "team.error.generic";
}

/** What a change to someone already here answered. A 404 means another
 * device got there first: the person left, or the link was cancelled. */
export function changeRefusalKey(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) return "team.error.gone";
  return "team.error.generic";
}

/**
 * The hires who joined after the owner last looked. With no look on record,
 * nobody: the first visit after this shipped mustn't light up a whole team
 * that has been there for months.
 */
export function joinedSince(members: readonly Member[], since: number | null): Set<string> {
  const fresh = new Set<string>();
  if (since === null) return fresh;
  for (const person of members) {
    if (!person.is_owner && person.id && Date.parse(person.joined_at) > since) fresh.add(person.id);
  }
  return fresh;
}
