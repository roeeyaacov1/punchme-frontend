import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Frames in a number of milliseconds, unrounded: interpolate takes fractions. */
export const ms = (milliseconds: number) => (milliseconds / 1000) * FPS;

/** Frames in a number of seconds, whole. */
export const sec = (seconds: number) => Math.round(seconds * FPS);

/**
 * DESIGN.md's curves: the ease-out for anything arriving, the overshoot for
 * a stamp landing, the in-out for something already on screen moving across
 * it. The punched cut uses them harder and faster than the interface does,
 * but on the same shapes.
 */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1);
export const IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 to 1 over `frames` from frame `start`, on `easing`. */
export function progress(frame: number, start: number, frames: number, easing: (t: number) => number = EASE_OUT): number {
  return interpolate(frame, [start, start + frames], [0, 1], { ...CLAMP, easing });
}

export const lerp = (from: number, to: number, p: number) => from + (to - from) * p;

/**
 * A slam's look at frame `t` for words landing at `at`: lit on the frame they land,
 * at 135%, settling to their size over five frames on the overshoot. Lit at
 * once, so words landing on frame 0 are the video's first picture.
 */
export function slam(t: number, at: number): { opacity: number; scale: number } {
  return { opacity: interpolate(t, [at - 1, at], [0, 1], CLAMP), scale: lerp(1.35, 1, progress(t, at, 5, OVERSHOOT)) };
}
