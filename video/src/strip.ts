import { MOMENTS } from "./cues.ts";
import { progress } from "./motion.ts";

/** The frame from which the end beat draws the strip itself, as it becomes the button. */
export const STRIP_HANDOFF = MOMENTS.full + 14;

/** How gold slot `i` is, in reading order, each over five frames: all gold before the handoff. */
export function slotGold(frame: number, i: number): number {
  return progress(frame, MOMENTS.full + i * 0.8, 5);
}

/** How gold the strip's panel is: from cream after the first slots, wholly gold the frame before the handoff. */
export function panelGold(frame: number): number {
  return progress(frame, MOMENTS.full + 4, 9);
}
