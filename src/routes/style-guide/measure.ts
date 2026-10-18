import { contrastRatio } from "../../lib/color";

/**
 * Contrast, measured off the page as it renders rather than copied from a
 * comment, so the guide can't drift from the stylesheet.
 *
 * `contrastRatio` takes hex and reads anything else as black, which would
 * print a plausible ratio for a colour it never saw — so every computed
 * colour is parsed here, and a parse that fails returns null instead.
 */

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** A computed colour: `rgb(1, 2, 3)`, `rgba(1, 2, 3, 0.15)` or `rgb(1 2 3 / 0.15)`. */
export function parseColor(value: string): Rgba | null {
  const match = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/,
  );
  if (!match) return null;
  const alpha = match[4] === undefined ? 1 : match[4].endsWith("%")
    ? parseFloat(match[4]) / 100
    : parseFloat(match[4]);
  return { r: +match[1], g: +match[2], b: +match[3], a: alpha };
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const mix = (t: number, b: number) => t * top.a + b * (1 - top.a);
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 1 };
}

function hex({ r, g, b }: Rgba): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * The colour actually behind an element: its own background, composited
 * over every translucent layer under it until an opaque one, the way a 15%
 * wash sits on its panel.
 */
export function groundOf(element: Element | null): Rgba | null {
  const layers: Rgba[] = [];
  for (let node = element; node; node = node.parentElement) {
    const colour = parseColor(getComputedStyle(node).backgroundColor);
    if (!colour) return null;
    if (colour.a === 0) continue;
    layers.push(colour);
    if (colour.a >= 1) break;
  }
  if (layers.length === 0) return null;
  return layers.reduceRight((below, layer) => over(layer, below));
}

/** WCAG 2, truncated to two decimals so a printed 4.50 is at least 4.50. */
export function truncate(ratio: number): number {
  return Math.floor(ratio * 100) / 100;
}

export type Measured = "text" | "edge";

/**
 * Text: the sample's colour against what is behind it. Edge: the sample's
 * border against the ground it sits on.
 */
export function measure(sample: HTMLElement, kind: Measured): number | null {
  const style = getComputedStyle(sample);
  const ground = kind === "text" ? groundOf(sample) : groundOf(sample.parentElement);
  const front = parseColor(kind === "text" ? style.color : style.borderTopColor);
  if (!ground || !front) return null;
  const visible = front.a < 1 ? over(front, ground) : front;
  return truncate(contrastRatio(hex(visible), hex(ground)));
}
