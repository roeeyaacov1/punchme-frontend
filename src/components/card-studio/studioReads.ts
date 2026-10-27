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

/** The pictures the renderer composites itself: kept on the template, named
 * in the design read's `assets`, but not carried by it. */
export const ART_USES = ["stamp_art", "stamped_art", "unstamped_art"] as const;
export type ArtUse = (typeof ART_USES)[number];
export type ArtCopies = Partial<Record<ArtUse, string>>;

/** This device's copies of the art (the upload echoes each back), for each
 * picture the design read says is on the card now. One sent from another
 * device has no copy here: its tile says it is on the card without it. */
export function publishedArt(assets: readonly string[], uploaded: ArtCopies): ArtCopies {
  const art: ArtCopies = {};
  for (const use of ART_USES) {
    const copy = uploaded[use];
    if (copy && assets.includes(use)) art[use] = copy;
  }
  return art;
}

/** The re-read after a save counts only when both reads landed after it was
 * asked for. Neither call throws: a failed read keeps the card from before
 * the save, and one made offline waits, both with their old times. */
export function bothLandedSince(asked: number, at: ReadStamp): boolean {
  return at.templates >= asked && at.design >= asked;
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

/** The later of two `synced_at`s, either of which may be missing: where the
 * sync stood before a save, from the design read and from the PATCH's own
 * answer (the template carries it as `design_synced_at`). The read can be
 * from before an earlier save in the same visit, whose sync has run since. */
export function laterSync(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a || !b) return a || b || null;
  return Date.parse(b) > Date.parse(a) ? b : a;
}

/** A pair of reads made since the card the studio stands on: either landed
 * again and neither is older. A card made of one new read and one older than
 * the studio's own (as after a save whose re-read failed) waits for both. */
export function newerRead(was: ReadStamp, now: ReadStamp): boolean {
  if (now.templates < was.templates || now.design < was.design) return false;
  return now.templates > was.templates || now.design > was.design;
}

/** How long Save waits for a read before going on without it: the API client
 * has no time limit of its own, and the studio holds still while it waits. */
export const READ_LIMIT_MS = 10_000;

/** Wait for `work` to settle, or `ms`, whichever comes first. Never throws:
 * a read that fails or doesn't come is judged by the times it left. */
export function settleWithin(work: Promise<unknown>, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    work.then(done, done);
  });
}
