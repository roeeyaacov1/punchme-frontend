import { useLayoutEffect, useRef, useState } from "react";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Where an element inside a box stands, in the box's own pixels (its layout
 * width is `ownWidth`), whatever the box is scaled by on the frame: read from
 * the page after every render, kept when it moves by less than a pixel.
 */
export function useInnerBox(ownWidth: number, find: (root: HTMLElement) => Element | null | undefined) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const outer = root.getBoundingClientRect();
    const inner = find(root)?.getBoundingClientRect();
    if (!inner || outer.width === 0) return;
    const unit = ownWidth / outer.width;
    const next = { x: (inner.left - outer.left) * unit, y: (inner.top - outer.top) * unit, w: inner.width * unit, h: inner.height * unit };
    if (!box || Math.abs(next.x - box.x) + Math.abs(next.y - box.y) + Math.abs(next.w - box.w) > 1) setBox(next);
  });
  return { ref, box };
}

/** The pass's strip: the wallet's drawing of the stamps. */
export const findStrip = (root: HTMLElement) => root.querySelector('img[src*="strip"]');

/** The pass's code: the largest drawing in it. */
export function findCode(root: HTMLElement): Element | undefined {
  let best: Element | undefined;
  let area = 0;
  for (const svg of root.querySelectorAll("svg")) {
    const rect = svg.getBoundingClientRect();
    if (rect.width * rect.height > area) {
      area = rect.width * rect.height;
      best = svg;
    }
  }
  return best;
}

/**
 * Where stamp `i` (0-based) stands in the wallet's 750 × 288 drawing of a
 * ten-stamp strip, two rows of five, left to right whatever the language,
 * as the wallet draws it; and its radius. Measured off the drawing.
 */
export function stampInStrip(strip: Box, i: number): { x: number; y: number; r: number } {
  const col = i % 5;
  const row = Math.floor(i / 5);
  const unit = strip.w / 750;
  return { x: strip.x + (115 + col * 130) * unit, y: strip.y + (85 + row * 118) * unit, r: 52 * unit };
}
