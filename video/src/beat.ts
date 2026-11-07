import { DURATION, beatStart } from "./timeline.ts";

/**
 * The track the video is cut to: 120 BPM at 30 fps, so a beat is 15 frames
 * and a bar 60. The kicks are listed here once; `scripts/music.ts` plays
 * them and the picture pulses with them, so the two can't drift. Pure:
 * `test/beat.test.ts`.
 */
export const BPM = 120;
export const BEAT = 15;
export const BAR = 60;

/** Whether the groove plays at a frame: four on the floor, claps on two and four, bass. */
export function grooveAt(frame: number): "intro" | "groove" | "build" | "outro" {
  if (frame < beatStart("promise")) return "intro";
  if (frame < beatStart("stamps")) return "groove";
  if (frame < beatStart("reward")) return "build";
  if (frame < beatStart("end") + BAR) return "groove";
  return "outro";
}

function kicks(): number[] {
  const out: number[] = [];
  for (let frame = 0; frame < DURATION; frame += BEAT) {
    const part = grooveAt(frame);
    const inBar = (frame % BAR) / BEAT;
    if (part === "intro" && inBar % 2 === 0) out.push(frame);
    if (part === "groove") out.push(frame);
    // The build keeps its first bar's downbeats, then drops the kick for the riser.
    if (part === "build" && frame < beatStart("reward") - BAR && inBar % 2 === 0) out.push(frame);
    // One last hit as the card fills.
    if (part === "outro" && frame === beatStart("end") + BAR) out.push(frame);
  }
  return out;
}

/** Every kick drum's frame. */
export const KICKS = kicks();

const PULSE_FRAMES = 8;

/** How hard the picture pulses at a frame: 1 on a kick, easing to 0 over eight frames. */
export function pulse(frame: number): number {
  let level = 0;
  for (const kick of KICKS) {
    const k = frame - kick;
    if (k >= 0 && k < PULSE_FRAMES) level = Math.max(level, (1 - k / PULSE_FRAMES) ** 2);
  }
  return level;
}
