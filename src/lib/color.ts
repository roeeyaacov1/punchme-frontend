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

/** Black or white, whichever stays legible on `hex`. Uses WCAG relative
 * luminance rather than a naive channel average, so mid yellows and cyans
 * get the black tick they need instead of an invisible white one. The
 * 0.179 threshold is where white-on-colour and black-on-colour contrast
 * are equal. */
export function readableInk(hex: string): "#000000" | "#FFFFFF" {
  const normalized = normalizeHex(hex);
  if (!normalized) return "#000000";
  const channel = (index: number) => {
    const value = parseInt(normalized.slice(1 + index * 2, 3 + index * 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}

function hslToHex(h: number, s: number, l: number): string {
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
