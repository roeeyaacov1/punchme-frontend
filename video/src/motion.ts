import { createContext, useContext, type CSSProperties } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

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
/** Activation, a panel switching from unlit to lit: 600ms, once. */
export const ACTIVATION_MS = 600;
/** Something on screen moving across it, on the in-out. */
export const MOVE_MS = 600;

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
 * means already lit: there from the beat's first frame, which the light
 * sweep brings in.
 */
export function light(frame: number, on: number, off?: number): CSSProperties {
  const up = on < 0 ? 1 : progress(frame, on, LIGHTS_ON_MS);
  const down = off === undefined ? 0 : progress(frame, off - EXIT_LEAD, EXIT_MS);
  return {
    opacity: up * (1 - down),
    transform: up < 1 ? `translateY(${(1 - up) * 8 * SITE_PX}px)` : undefined,
  };
}

/** A press, as the kit's buttons sink: to 0.97 in 120ms, back in 200ms. */
export function press(frame: number, at: number): number {
  const down = progress(frame, at, 120);
  const up = progress(frame, at + ms(120), 200);
  return 1 - 0.03 * down * (1 - up);
}

/** Whether a frame falls inside [from, to). */
export const within = (frame: number, from: number, to = Infinity) => frame >= from && frame < to;

/* ── Beats ────────────────────────────────────────────────────────────── */

/**
 * How one beat gives way to the next:
 * - `sweep`: a soft edge of light crosses the frame the way the language
 *   reads (right to left in Hebrew), the next beat behind it;
 * - `handoff`: the card stays where it is and the next beat takes it from
 *   there, so it travels through the video as one card.
 */
export type Boundary = "sweep" | "handoff";

/** Half a sweep, in frames: it crosses in 26, about 870ms, on the in-out. */
export const SWEEP_HALF = 13;

export interface BeatTiming {
  /** Frames the beat is mounted before its own first frame. */
  lead: number;
  length: number;
  intro?: Boundary;
  outro?: Boundary;
}

export const BeatContext = createContext<BeatTiming>({ lead: 0, length: Infinity });

/** The beat's own clock: 0 at its first frame, negative while it is led in. */
export function useBeat(): BeatTiming & { t: number } {
  const frame = useCurrentFrame();
  const timing = useContext(BeatContext);
  return { ...timing, t: frame - timing.lead };
}

/* ── The card's places ─────────────────────────────────────────────────── */

/** Where a pass stands: its centre's x, its top edge's y, and its scale. */
export interface At {
  cx: number;
  top: number;
  s: number;
}

export function between(a: At, b: At, p: number): At {
  return { cx: a.cx + (b.cx - a.cx) * p, top: a.top + (b.top - a.top) * p, s: a.s + (b.s - a.s) * p };
}

/** A rounded window on the frame, for clipping: the viewfinder, the lock screen. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

export const FULL: Rect = { x: 0, y: 0, w: WIDTH, h: HEIGHT, r: 0 };

export function lerpRect(a: Rect, b: Rect, p: number): Rect {
  const at = (from: number, to: number) => from + (to - from) * p;
  return { x: at(a.x, b.x), y: at(a.y, b.y), w: at(a.w, b.w), h: at(a.h, b.h), r: at(a.r, b.r) };
}

/** The window as a clip-path. */
export function clipTo(rect: Rect): string {
  const right = WIDTH - rect.x - rect.w;
  const bottom = HEIGHT - rect.y - rect.h;
  return `inset(${rect.y}px ${right}px ${bottom}px ${rect.x}px round ${rect.r}px)`;
}

/** The Apple pass's own height at 300px, for centring it on a point. */
export const APPLE_H = 352;

/** The joined card in the wallet pair (beat 2), where the scan takes it from. */
export const PAIR = { top: 600, s: 1.466, start: { he: 780, en: 300 }, end: { he: 300, en: 780 } } as const;

/**
 * The card as the scan's camera sees it (beat 3), where the lock screen
 * takes it from: its whole strip of stamps in view and its code in the
 * middle of the aiming corners.
 */
export const IN_VIEW: At = { cx: 540, top: 440, s: 2.0 };
