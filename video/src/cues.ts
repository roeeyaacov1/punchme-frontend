import { HERO_STAMPS } from "./stamping.ts";
import { FINAL_PUNCHES, PUNCH, PUNCHES, beatStart, type BeatId } from "./timeline.ts";

/**
 * What the video sounds like when, over the track (`music.wav`). The scenes
 * move on the same frames, so the moments live here and both read them;
 * every one is on the track's beat or its half. Pure: `test/cues.test.ts`.
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

/**
 * The frames, from each beat's start, at which its words land: on the
 * second beat, after the punch that opens the beat on its first.
 */
export const SLAMS: Partial<Record<BeatId, number[]>> = {
  // The first line lands on frame 0: WhatsApp's thumbnail is the first frame.
  hook: [0, 15],
  promise: [15, 30, 45],
  join: [15],
  looks: [15, 30],
  stamps: [15],
  reward: [30, 37.5],
  winback: [15],
  price: [15],
  end: [15],
};

/**
 * The hook's first line is this many frames into its landing on frame 0,
 * so the video's first picture (WhatsApp's thumbnail) is the line at its
 * size, its slam still settling, rather than an empty wall or the line at 135%.
 */
export const HOOK_LEAD = 3;

/** The moments the scenes and the sounds share, in absolute frames. */
export const MOMENTS = {
  /** The camera's corners lock on the sign's code, and the flash: beat four. */
  joinFlash: beatStart("join") + 45,
  /** The carousel of looks starts to spin: beat four, after its two lines. */
  looksSpin: beatStart("looks") + 45,
  /** The owner's camera on the hero card, and the flash: beat three. */
  stampsFlash: beatStart("stamps") + 30,
  /** "Card full" bursts open on the drop's second beat. */
  reward: beatStart("reward") + 15,
  /** The win-back message lands on the lock screen: beat three. */
  ding: beatStart("winback") + 30,
  /** Its free stamp lands on the card: beat four. */
  freeStamp: beatStart("winback") + 45,
  /** The strip, full, turns gold: as the last disc lands, a frame before the downbeat. */
  full: FINAL_PUNCHES[1].at + PUNCH.flight,
} as const;

/** Each sound's level over the track: `scripts/sfx.ts` mixes them with it and prints the peak. */
const VOLUME: Record<string, number> = {
  punch: 0.5,
  slam: 0.34,
  whoosh: 0.22,
  stamp: 0.42,
  shutter: 0.34,
  ding: 0.42,
  chime: 0.48,
};

const volumeOf = (sound: Sound) => VOLUME[sound.startsWith("stamp-") ? "stamp" : sound];

/**
 * Every cue, sorted by frame. Listed in priority order, so where two would
 * start on one frame, the later-listed one moves to the next free frame.
 */
export function cues(): Cue[] {
  const wanted: [number, Sound][] = [
    ...PUNCHES.map((p): [number, Sound] => [p.at, "punch"]),
    ...FINAL_PUNCHES.map((p): [number, Sound] => [p.at, "punch"]),
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
      frames.map((frame): [number, Sound] => [Math.round(beatStart(id) + frame), "slam"]),
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
