/** Where the staged pieces stand on the frame, where it is checked: `test/fixes.test.ts`. */

/** The kit's lock-screen stage (340px wide), at this scale and top edge. */
export const LOCK = { s: 1.58, top: 668 } as const;

/**
 * The stage's own height, and the foot of its "Roughly how it looks on the
 * lock screen" label, in its own pixels: measured off the render of 7 Nov 2026.
 */
export const LOCK_STAGE = { h: 590, labelBottom: 566 } as const;
