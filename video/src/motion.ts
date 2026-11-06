import type { CSSProperties } from "react";
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
 * a stamp, the in-out for something already on screen moving across it.
 */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const OVERSHOOT = Easing.bezier(0.34, 1.4, 0.64, 1);
export const IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

/**
 * Frame pixels per site pixel. A phone shows the site about 400px wide, and
 * this frame is 1080px wide, so "8px at most" on the site is 8 × 2.7 here:
 * the same share of the screen.
 */
export const SITE_PX = WIDTH / 400;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 to 1 over `milliseconds` from frame `start`, on `easing`. */
export function progress(frame: number, start: number, milliseconds: number, easing = EASE_OUT): number {
  return interpolate(frame, [start, start + ms(milliseconds)], [0, 1], { ...CLAMP, easing });
}

/** Lights on, DESIGN.md's interface timing: 240ms. */
export const LIGHTS_ON_MS = 240;
/** An exit: 180ms. */
export const EXIT_MS = 180;

/**
 * How far ahead of the next thing's arrival an exit starts: 150ms, so the
 * outgoing line is nearly gone before the incoming one lights, and two lines
 * never stand over each other in one place.
 */
export const EXIT_LEAD = ms(150);

/**
 * The Lights On Rule: the light fades up over 240ms from `on` while the
 * thing rises 8 site px at most; it goes out in 180ms where it stands, ending
 * just after `off`, when whatever replaces it arrives. A negative `on`
 * means already lit.
 */
export function light(frame: number, on: number, off?: number): CSSProperties {
  const up = on < 0 ? 1 : progress(frame, on, LIGHTS_ON_MS);
  const down = off === undefined ? 0 : progress(frame, off - EXIT_LEAD, EXIT_MS);
  return {
    opacity: up * (1 - down),
    transform: up < 1 ? `translateY(${(1 - up) * 8 * SITE_PX}px)` : undefined,
  };
}

/** Whether a frame falls inside [from, to). */
export const within = (frame: number, from: number, to = Infinity) => frame >= from && frame < to;
