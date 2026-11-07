/**
 * The punched cut's beats, in frames at 30 fps, cut to a 120 BPM track: a
 * beat is 15 frames and a bar 60, and every beat of the video starts on a
 * beat of the music. Pure, so it can be tested: `test/timeline.test.ts`.
 */

export type BeatId = "hook" | "promise" | "join" | "looks" | "stamps" | "reward" | "winback" | "price" | "end";

export const BEATS: readonly { id: BeatId; length: number }[] = [
  { id: "hook", length: 60 },
  { id: "promise", length: 60 },
  { id: "join", length: 90 },
  { id: "looks", length: 90 },
  { id: "stamps", length: 90 },
  { id: "reward", length: 60 },
  { id: "winback", length: 60 },
  { id: "price", length: 60 },
  { id: "end", length: 120 },
];

export const DURATION = BEATS.reduce((sum, beat) => sum + beat.length, 0);

export function beatStart(id: BeatId): number {
  let from = 0;
  for (const beat of BEATS) {
    if (beat.id === id) return from;
    from += beat.length;
  }
  throw new Error(`No beat ${id}`);
}

export function beatLength(id: BeatId): number {
  return BEATS.find((beat) => beat.id === id)!.length;
}

export function beatAt(frame: number): BeatId {
  let from = 0;
  for (const beat of BEATS) {
    from += beat.length;
    if (frame < from) return beat.id;
  }
  return BEATS[BEATS.length - 1].id;
}

/**
 * The punch, in frames: the scene gives for `press` before it; the hole
 * holds at the die's size for `openDelay`, then opens out over `open`; the
 * punched disc takes `flight` to reach its slot.
 */
export const PUNCH = { press: 3, open: 12, flight: 14, openDelay: 3 } as const;

/** A punch: when it lands, where on the frame, and the strip's slot its disc fills. */
export interface PunchAt {
  at: number;
  cx: number;
  cy: number;
  slot: number;
}

/**
 * Where each boundary's punch lands, keyed by the beat it opens onto: the
 * point the outgoing beat's action ends on.
 */
export const PUNCH_POINTS: Record<Exclude<BeatId, "hook">, { cx: number; cy: number }> = {
  promise: { cx: 540, cy: 1042 },
  join: { cx: 540, cy: 1000 },
  looks: { cx: 540, cy: 1045 },
  stamps: { cx: 540, cy: 1100 },
  reward: { cx: 540, cy: 1045 },
  winback: { cx: 540, cy: 1050 },
  price: { cx: 540, cy: 1100 },
  end: { cx: 540, cy: 1000 },
};

/** The punches between beats, on their downbeats: one at every boundary, slots 0 to 7. */
export const PUNCHES: PunchAt[] = BEATS.slice(1).map((beat, index) => ({
  at: beatStart(beat.id),
  ...PUNCH_POINTS[beat.id as Exclude<BeatId, "hook">],
  slot: index,
}));

/**
 * The last two stamps, punched side by side on the end card on beats three
 * and four, so the card is full on the next downbeat. The button the strip
 * becomes lands over their holes.
 */
export const FINAL_PUNCHES: PunchAt[] = [
  { at: beatStart("end") + 30, cx: 400, cy: 1000, slot: 8 },
  { at: beatStart("end") + 45, cx: 680, cy: 1000, slot: 9 },
];

export const ALL_PUNCHES: PunchAt[] = [...PUNCHES, ...FINAL_PUNCHES];
