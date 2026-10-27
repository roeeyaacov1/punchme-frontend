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

/** A pair of reads made since the card the studio stands on: either landed
 * again and neither is older. A card made of one new read and one older than
 * the studio's own (as after a save whose re-read failed) waits for both. */
export function newerRead(was: ReadStamp, now: ReadStamp): boolean {
  if (now.templates < was.templates || now.design < was.design) return false;
  return now.templates > was.templates || now.design > was.design;
}
