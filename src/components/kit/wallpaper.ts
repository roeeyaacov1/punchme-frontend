import { hexToRgb, mixHex, normalizeHex } from "../../lib/color";

/**
 * The wallpaper the owner's card stands on, made from the card itself.
 *
 * The brief's recipe (visual-world.md, "The choice" #1): the card's own
 * colour, a lighter tone of it 30% of the way to white, and only a hint of
 * the stamp colour, 28% of the way to it, blurred 44px, with no saturation
 * boost. Gentler than Lock screen's, which mixed in the stamp colour at full
 * strength.
 *
 * There is no blur at runtime. A 44px Gaussian blur of a solid shape has a
 * known edge — the coverage at a distance d past it is ½·erfc(d / (44·√2)) —
 * so the curve is written into the stops of plain radial gradients and the
 * browser draws the blur's result directly. Nothing is filtered, nothing is
 * rasterised, scrolling only composites, and a colour change costs nothing.
 */

/** The 44px blur's edge: [px from the shape's edge, coverage]. */
export const BLUR_FALLOFF: ReadonlyArray<readonly [number, number]> = [
  [-132, 0.999],
  [-88, 0.977],
  [-66, 0.933],
  [-44, 0.841],
  [-22, 0.691],
  [0, 0.5],
  [22, 0.309],
  [44, 0.159],
  [66, 0.067],
  [88, 0.023],
  [132, 0],
];

/** How far toward white the tone sits, and toward the stamp the hint. */
export const TONE_TOWARD_WHITE = 0.3;
export const HINT_TOWARD_STAMP = 0.28;

/** Where the two soft shapes sit on a portrait stage, and how big they are. */
const TONE_SHAPE = { at: "26% 16%", radius: 168 };
const HINT_SHAPE = { at: "80% 84%", radius: 184 };

export interface Wallpaper {
  backgroundColor: string;
  backgroundImage: string;
}

/** One blurred disc, as a radial gradient whose stops follow the falloff. */
export function blurredDisc(hex: string, at: string, radius: number): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const stops = BLUR_FALLOFF.map(
    ([offset, coverage]) =>
      `rgb(${rgb.r} ${rgb.g} ${rgb.b} / ${coverage}) ${Math.max(0, radius + offset)}px`,
  );
  return `radial-gradient(circle at ${at}, ${stops.join(", ")})`;
}

/** The wallpaper for a card colour and a stamp colour. */
export function wallpaperFor(cardColor: string, stampColor: string): Wallpaper {
  const tone = mixHex(cardColor, "#ffffff", TONE_TOWARD_WHITE);
  const hint = mixHex(cardColor, stampColor, HINT_TOWARD_STAMP);
  const layers = [
    blurredDisc(tone, TONE_SHAPE.at, TONE_SHAPE.radius),
    blurredDisc(hint, HINT_SHAPE.at, HINT_SHAPE.radius),
  ].filter((layer): layer is string => layer !== null);
  return {
    backgroundColor: normalizeHex(cardColor) ?? "#2B2521",
    backgroundImage: layers.join(", "),
  };
}
