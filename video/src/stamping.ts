import { ms } from "./motion.ts";
import { beatStart } from "./timeline.ts";

/**
 * When each stamp lands in a run: the gaps shrink evenly in ratio from
 * `firstMs` to `lastMs`, so the run speeds up like a counter spinning down.
 * Accumulated unrounded and each landing rounded to its frame.
 */
export function stampTimes(start: number, count: number, firstMs = 300, lastMs = 90): number[] {
  const times = [start];
  let elapsed = 0;
  for (let i = 0; i < count - 1; i++) {
    elapsed += firstMs * (lastMs / firstMs) ** (i / Math.max(1, count - 2));
    times.push(start + Math.round(ms(elapsed)));
  }
  return times;
}

/** The hero card's run, 0 to 10, a second into the stamps beat: after the scan's flash. */
export const STAMPS_FROM = beatStart("stamps") + 30;
export const HERO_STAMPS = stampTimes(STAMPS_FROM, 10);
