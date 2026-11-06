import { HERO_STAMPS } from "./stamping.ts";
import { FINAL_STAMP, PUNCH, PUNCHES, beatStart, type BeatId } from "./timeline.ts";

/**
 * What the video sounds like when. The scenes move on the same frames, so
 * the moments live here and both read them. Pure: `test/cues.test.ts`.
 */

export type Sound =
  | "punch"
  | "slam"
  | "whoosh"
  | "shutter"
  | "ding"
  | "chime"
  | `stamp-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;

export interface Cue {
  frame: number;
  sound: Sound;
  volume: number;
}

/** The frames, from each beat's start, at which its words land. */
export const SLAMS: Partial<Record<BeatId, number[]>> = {
  hook: [6, 16],
  promise: [8, 20, 32],
  join: [6],
  looks: [6, 16],
  stamps: [6],
  reward: [12, 22],
  winback: [6],
  proof: [8],
  price: [8],
};

/** The moments the scenes and the sounds share, in absolute frames. */
export const MOMENTS = {
  /** The camera's corners lock on the sign's code, and the flash. */
  joinFlash: beatStart("join") + 36,
  /** The carousel of looks starts to spin. */
  looksSpin: beatStart("looks") + 24,
  /** The owner's camera on the hero card, and the flash. */
  stampsFlash: beatStart("stamps") + 22,
  /** "Card full" bursts open. */
  reward: beatStart("reward") + 8,
  /** The win-back message lands on the lock screen. */
  ding: beatStart("winback") + 34,
  /** Its free stamp lands on the card. */
  freeStamp: beatStart("winback") + 56,
  /** The strip, full, turns gold. */
  full: FINAL_STAMP + PUNCH.flight,
} as const;

/** Each sound's level in the mix: the whole mix peaks near -3 dBFS (`scripts/sfx.ts` prints it), headroom for the AAC encode. */
const VOLUME: Record<string, number> = {
  punch: 0.68,
  slam: 0.42,
  whoosh: 0.27,
  stamp: 0.45,
  shutter: 0.38,
  ding: 0.45,
  chime: 0.53,
};

const volumeOf = (sound: Sound) => VOLUME[sound.startsWith("stamp-") ? "stamp" : sound];

/**
 * Every cue, sorted by frame. Listed in priority order, so where two would
 * start on one frame, the later-listed one moves to the next free frame.
 */
export function cues(): Cue[] {
  const wanted: [number, Sound][] = [
    ...PUNCHES.map((p): [number, Sound] => [p.at, "punch"]),
    [FINAL_STAMP, "punch"],
    ...HERO_STAMPS.map((frame, i): [number, Sound] => [frame, `stamp-${i + 1}` as Sound]),
    ...PUNCHES.map((p): [number, Sound] => [p.at + PUNCH.openDelay, "whoosh"]),
    [MOMENTS.joinFlash, "shutter"],
    [MOMENTS.stampsFlash, "shutter"],
    [MOMENTS.looksSpin, "whoosh"],
    [MOMENTS.reward, "chime"],
    [MOMENTS.ding, "ding"],
    [MOMENTS.freeStamp, "stamp-1"],
    [MOMENTS.full, "chime"],
    ...(Object.entries(SLAMS) as [BeatId, number[]][]).flatMap(([id, frames]) =>
      frames.map((frame): [number, Sound] => [beatStart(id) + frame, "slam"]),
    ),
  ];
  const taken = new Set<number>();
  const placed = wanted.map(([frame, sound]) => {
    let at = frame;
    while (taken.has(at)) at += 1;
    taken.add(at);
    return { frame: at, sound, volume: volumeOf(sound) };
  });
  return placed.sort((a, b) => a.frame - b.frame);
}
