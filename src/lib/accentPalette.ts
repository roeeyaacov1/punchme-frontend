/** The onboarding wizard's colour choices: the ten card backgrounds an owner
 * picks from, and the stamp accents offered against whichever they chose.
 *
 * These are card colours, not UI colours — they end up on the pass, never
 * around it — so what has to hold is legibility on the card itself: the
 * accent must read against the background (≥ 3:1, the UI-component floor),
 * and text is always the ink `readableInk` picks. */

import { contrastRatio, hexToHsl, hslToHex, normalizeHex, relativeLuminance } from "./color";

export interface CardBackground {
  /** i18n key suffix under `onboarding.color.names` — the accessible name. */
  key: string;
  hex: string;
}

/** Ten backgrounds, all drawn from families the app already uses (the six
 * `CARD_PALETTES`, the five niche presets, the swatch board). Ink per
 * `readableInk`: white on the first eight, navy on the last two. */
export const CARD_BACKGROUNDS: CardBackground[] = [
  { key: "midnight", hex: "#0E1120" }, // brand navy — white ink
  { key: "slate", hex: "#1F2937" }, // barber preset — white ink
  { key: "espresso", hex: "#4B2E1E" }, // café preset — white ink
  { key: "forest", hex: "#065F46" }, // trainer preset — white ink
  { key: "ocean", hex: "#12455F" }, // ocean palette — white ink
  { key: "indigo", hex: "#312E81" }, // therapist preset — white ink
  { key: "wine", hex: "#7A1F3D" }, // white ink, 10.0:1
  { key: "terracotta", hex: "#B23A1E" }, // the swatch-board orange darkened so white ink holds, 6.0:1
  { key: "blush", hex: "#F9E4E4" }, // blush palette — navy ink
  { key: "cream", hex: "#F5EFE6" }, // cream palette — navy ink
];

/** PunchMe gold — the landing hero stamps every card with it. */
export const BRAND_GOLD = "#C88A11";

/** Below this the background counts as dark; the same threshold `readableInk`
 * uses, so "dark background" and "white text" always agree. */
const DARK_LUMINANCE = 0.179;

const MIN_ACCENT_CONTRAST = 3;

function wrapHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

function isDark(bg: string): boolean {
  return relativeLuminance(bg) <= DARK_LUMINANCE;
}

/** Nudge lightness away from the background until the accent reads, or give
 * up (null) if the hue simply cannot get there. */
function legible(h: number, s: number, l: number, bg: string): string | null {
  const dark = isDark(bg);
  for (let step = 0; step <= 4; step += 1) {
    const candidateL = dark ? Math.min(92, l + step * 8) : Math.max(14, l - step * 8);
    const hex = hslToHex(h, s, candidateL);
    if (contrastRatio(hex, bg) >= MIN_ACCENT_CONTRAST) return hex;
  }
  return null;
}

/** Two accents that would look like the same swatch: near hue, near
 * lightness — or both greys. */
function tooClose(a: string, b: string): boolean {
  const ha = hexToHsl(a);
  const hb = hexToHsl(b);
  if (ha.s < 12 && hb.s < 12) return Math.abs(ha.l - hb.l) < 14;
  const dh = Math.abs(ha.h - hb.h);
  const hueGap = Math.min(dh, 360 - dh);
  return hueGap < 14 && Math.abs(ha.l - hb.l) < 12 && Math.abs(ha.s - hb.s) < 30;
}

/** Stamp accents that sit well on `background`: a tone-on-tone tint of its
 * own hue first, then the brand gold, then plain ink, then the hues that
 * relate to it on the wheel — complement, split complements, triads,
 * neighbours. Every result clears 3:1 against the background; near-duplicates
 * are dropped; at most `limit` are returned, in that order of preference. */
export function relatedAccents(background: string, limit = 8): string[] {
  const bg = normalizeHex(background) ?? "#0E1120";
  const { h, s } = hexToHsl(bg);
  const dark = isDark(bg);
  // A grey background has no hue to relate to; borrow the brand's.
  const hue = s < 10 ? hexToHsl(BRAND_GOLD).h : h;
  const sat = Math.min(70, Math.max(45, s < 10 ? 60 : s));
  const baseL = dark ? 62 : 38;

  const candidates: Array<string | null> = [
    // Tone on tone: the background's own hue, lifted.
    legible(hue, Math.min(55, Math.max(30, sat - 10)), dark ? 76 : 32, bg),
    BRAND_GOLD,
    dark ? "#FFFFFF" : "#0E1120",
    legible(wrapHue(hue + 180), sat, baseL, bg),
    legible(wrapHue(hue + 150), sat, baseL, bg),
    legible(wrapHue(hue + 210), sat, baseL, bg),
    legible(wrapHue(hue + 120), sat, baseL, bg),
    legible(wrapHue(hue + 240), sat, baseL, bg),
    legible(wrapHue(hue + 30), sat, baseL, bg),
    legible(wrapHue(hue - 30), sat, baseL, bg),
    dark ? "#F5EFE6" : "#4B2E1E",
  ];

  const picked: string[] = [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (contrastRatio(candidate, bg) < MIN_ACCENT_CONTRAST) continue;
    if (picked.some((p) => tooClose(p, candidate))) continue;
    picked.push(candidate);
    if (picked.length >= limit) break;
  }
  return picked;
}

/** The pass's field-label colour: a quiet tint of the background's own hue,
 * which is exactly the rule the presets follow (espresso → tan, forest →
 * mint, indigo → lavender). Light on dark cards, a shade on light ones. */
export function derivedLabelColor(background: string): string {
  const bg = normalizeHex(background) ?? "#0E1120";
  const { h, s } = hexToHsl(bg);
  const dark = isDark(bg);
  const hue = s < 10 ? 220 : h;
  const sat = s < 10 ? 12 : Math.min(45, Math.max(20, s * 0.6));
  return hslToHex(hue, sat, dark ? 80 : 32);
}

/** True when `accent` still reads against `background` — used to drop a
 * stale accent when the owner goes back and changes the background. */
export function accentFits(accent: string | null, background: string): boolean {
  if (!accent || !normalizeHex(accent)) return false;
  return contrastRatio(accent, background) >= MIN_ACCENT_CONTRAST;
}
