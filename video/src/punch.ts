import { interpolate } from "remotion";
import { CLAMP, EASE_IN, EASE_OUT, HEIGHT, IN_OUT, WIDTH, lerp, progress } from "./motion.ts";
import { ALL_PUNCHES, PUNCH, type PunchAt } from "./timeline.ts";

/**
 * The punch's geometry, frame by frame: the hole, the scene giving, the
 * camera's shake, the disc's flight to the strip. Pure, so it can be
 * tested: `test/punch.test.ts`.
 */

/** The die's radius: a 260px hole. */
export const DIE_R = 130;

/**
 * The strip's ten slots across the top of the frame, just under the 220px
 * that WhatsApp's and Stories' own controls can cover.
 */
export const SLOT = { size: 64, gap: 22, y: 262 } as const;

const SLOTS = 10;
const SPAN = SLOTS * SLOT.size + (SLOTS - 1) * SLOT.gap;

/** A slot's centre: slot 0 first in reading order, at the right in Hebrew. */
export function slotCenter(i: number, rtl: boolean): { x: number; y: number } {
  const ltr = (WIDTH - SPAN) / 2 + SLOT.size / 2 + i * (SLOT.size + SLOT.gap);
  return { x: rtl ? WIDTH - ltr : ltr, y: SLOT.y };
}

/** The frame's farthest corner from a point, so a hole there covers it all. */
function farthest(cx: number, cy: number): number {
  return Math.max(Math.hypot(cx, cy), Math.hypot(WIDTH - cx, cy), Math.hypot(cx, HEIGHT - cy), Math.hypot(WIDTH - cx, HEIGHT - cy));
}

/** The hole's radius: none before the punch, the die's at it, then opening out to the whole frame. */
export function holeRadius(frame: number, p: PunchAt): number {
  if (frame < p.at) return 0;
  const from = p.at + PUNCH.openDelay;
  return interpolate(frame, [from, from + PUNCH.open], [DIE_R, farthest(p.cx, p.cy) + 40], { ...CLAMP, easing: IN_OUT });
}

/** The scene giving under the die, just before it lands: to 0.985. */
export function pressScale(frame: number, p: PunchAt): number {
  if (frame < p.at - PUNCH.press || frame >= p.at) return 1;
  return 1 - 0.015 * progress(frame, p.at - PUNCH.press, PUNCH.press, EASE_IN);
}

const SHAKE_X = [14, -9, 4];
const SHAKE_Y = [-8, 6, -2];

/** The camera's shake, summed over every punch: three frames from each. */
export function shake(frame: number): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const p of ALL_PUNCHES) {
    const k = Math.floor(frame) - p.at;
    if (k >= 0 && k < SHAKE_X.length) {
      x += SHAKE_X[k];
      y += SHAKE_Y[k];
    }
  }
  return { x, y };
}

/**
 * The punched disc on its way to its slot: an arc up and over to it,
 * shrinking to the slot's size and spinning, the other way in Hebrew. Null
 * before the punch and once it has landed (the strip draws it then).
 */
export function discFlight(frame: number, p: PunchAt, rtl: boolean): { x: number; y: number; scale: number; rotate: number } | null {
  if (frame < p.at || frame >= p.at + PUNCH.flight) return null;
  const q = progress(frame, p.at, PUNCH.flight, EASE_OUT);
  const to = slotCenter(p.slot, rtl);
  const control = { x: (p.cx + to.x) / 2, y: Math.min(p.cy, to.y) - 260 };
  const bezier = (a: number, c: number, b: number) => (1 - q) ** 2 * a + 2 * (1 - q) * q * c + q ** 2 * b;
  return {
    x: bezier(p.cx, control.x, to.x),
    y: bezier(p.cy, control.y, to.y),
    scale: lerp(1, SLOT.size / (2 * DIE_R), q),
    rotate: (rtl ? -200 : 200) * q,
  };
}

/** How many stamps the strip holds at a frame: one per disc landed. */
export function stampsLanded(frame: number): number {
  return ALL_PUNCHES.filter((p) => p.at + PUNCH.flight <= frame).length;
}
