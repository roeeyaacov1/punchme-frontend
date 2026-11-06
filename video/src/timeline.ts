/**
 * The punched cut's beats, in frames at 30 fps. Pure, so it can be tested:
 * `test/timeline.test.ts`. The spec's script, with its end times, is in
 * `docs/superpowers/specs/2026-11-07-promo-video-punch-design.md`.
 */

export type BeatId = "hook" | "promise" | "join" | "looks" | "stamps" | "reward" | "winback" | "proof" | "price" | "end";

export const BEATS: readonly { id: BeatId; length: number }[] = [
  { id: "hook", length: 78 },
  { id: "promise", length: 72 },
  { id: "join", length: 96 },
  { id: "looks", length: 90 },
  { id: "stamps", length: 108 },
  { id: "reward", length: 66 },
  { id: "winback", length: 96 },
  { id: "proof", length: 102 },
  { id: "price", length: 90 },
  { id: "end", length: 102 },
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
  proof: { cx: 540, cy: 1150 },
  price: { cx: 540, cy: 1000 },
  end: { cx: 540, cy: 1000 },
};

/** The punches between beats: one at every boundary, slots 0 to 8. */
export const PUNCHES: PunchAt[] = BEATS.slice(1).map((beat, index) => ({
  at: beatStart(beat.id),
  ...PUNCH_POINTS[beat.id as Exclude<BeatId, "hook">],
  slot: index,
}));

/** The tenth stamp, punched on the last beat: the card full. */
export const FINAL_STAMP = beatStart("end") + 30;

/** Where the tenth is punched: the middle of the end card, where the button lands. */
export const FINAL_PUNCH: PunchAt = { at: FINAL_STAMP, cx: 540, cy: 1000, slot: 9 };

export const ALL_PUNCHES: PunchAt[] = [...PUNCHES, FINAL_PUNCH];
