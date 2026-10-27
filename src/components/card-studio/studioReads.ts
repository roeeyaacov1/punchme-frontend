/**
 * The studio's reads of the card, and when one is fresher than the card the
 * studio stands on. Pure, so it can be tested.
 */

/** When each of the two reads that make up the card last landed
 * (TanStack Query's `dataUpdatedAt`): the template list and the design. */
export interface ReadStamp {
  templates: number;
  design: number;
}

/**
 * Whether the wallet's sync has run since a save: its `synced_at` later than
 * it was before. The sync is asynchronous, so a read just after the save
 * still carries the strip pictures drawn before it. (`sync.revision` is the
 * pass builder's version, not a count of syncs, so it can't say.)
 */
export function syncMovedPast(before: string | null, now: string | null): boolean {
  if (!now) return false;
  if (!before) return true;
  return Date.parse(now) > Date.parse(before);
}

/** A pair of reads made since the card the studio stands on: either landed
 * again and neither is older. A card made of one new read and one older than
 * the studio's own (as after a save whose re-read failed) waits for both. */
export function newerRead(was: ReadStamp, now: ReadStamp): boolean {
  if (now.templates < was.templates || now.design < was.design) return false;
  return now.templates > was.templates || now.design > was.design;
}
