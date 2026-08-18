/** Hex helpers plus the swatch board shared by every colour control. */

export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** `abc`, `#abc`, `aabbcc`, `#AABBCC` → `#AABBCC`. Returns null when the
 * input isn't a colour *yet* — a half-typed hex must not overwrite the
 * saved design, so callers only commit when this succeeds. */
export function normalizeHex(raw: string): string | null {
  const body = raw.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(body)) return `#${body.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(body)) {
    return `#${body
      .split("")
      .map((c) => c + c)
      .join("")
      .toUpperCase()}`;
  }
  return null;
}

/** `#RRGGBB` → 0–255 channels. Null for anything that isn't a full hex. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

/** WCAG 2 relative luminance, 0 (black) to 1 (white). Non-colours read as
 * black so a half-typed hex never flips a contrast decision to "fine". */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const channel = (value255: number) => {
    const value = value255 / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** WCAG contrast ratio between two colours, 1:1 to 21:1. Order-free. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la >= lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

/** Black or white, whichever stays legible on `hex`. Uses WCAG relative
 * luminance rather than a naive channel average, so mid yellows and cyans
 * get the black tick they need instead of an invisible white one. The
 * 0.179 threshold is where white-on-colour and black-on-colour contrast
 * are equal. */
export function readableInk(hex: string): "#000000" | "#FFFFFF" {
  if (!normalizeHex(hex)) return "#000000";
  return relativeLuminance(hex) > 0.179 ? "#000000" : "#FFFFFF";
}

/** `#RRGGBB` → HSL in degrees / percent / percent. Non-colours → black. */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return { h, s: s * 100, l: l * 100 };
}

/** Linear blend of two colours in sRGB, `t` = 0 → `a`, 1 → `b`. */
export function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return normalizeHex(a) ?? "#000000";
  const clamp = Math.min(1, Math.max(0, t));
  const channel = (x: number, y: number) =>
    Math.round(x + (y - x) * clamp)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(ca.r, cb.r)}${channel(ca.g, cb.g)}${channel(ca.b, cb.b)}`.toUpperCase();
}

/** HSL (degrees, percent, percent) → `#RRGGBB`. Hue wraps. */
export function hslToHex(hue: number, s: number, l: number): string {
  const h = ((hue % 360) + 360) % 360;
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const component = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${component(0)}${component(8)}${component(4)}`.toUpperCase();
}

/** A random colour that still looks designed. The hue is free but the
 * saturation and lightness stay inside the band the presets live in —
 * uniform RGB noise produces muddy colours nobody would pick. */
export function randomSwatch(): string {
  return hslToHex(
    Math.floor(Math.random() * 360),
    55 + Math.random() * 25,
    38 + Math.random() * 26,
  );
}

/** Two rows of nine: neutrals and earths on top, the vivid hues below.
 * Drawn from the same families as CARD_PALETTES so a hand-picked colour
 * still sits next to a preset palette without clashing. */
export const COLOR_SWATCHES: string[] = [
  "#FFFFFF", "#F5EFE6", "#D9D2C7", "#9AA3B2", "#5C6478", "#0E1120", "#4B2E1E", "#8C5A3B", "#D2B48C",
  "#E4572E", "#F0B429", "#6BBF59", "#2E9E8F", "#63D2E2", "#12455F", "#3454D1", "#7C5CBF", "#C4356B",
];
