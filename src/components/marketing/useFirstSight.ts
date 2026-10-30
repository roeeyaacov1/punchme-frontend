import { useEffect, useState } from "react";

/** Every 5%, so a reading lands close to wherever the element crosses. */
const STEPS = Array.from({ length: 21 }, (_, index) => index / 20);

export interface FirstSightOptions {
  /**
   * How much of the element must be on screen, from 0 to 1. One taller than
   * the screen counts once it fills that much of it instead, so a phone held
   * sideways or text at 200% can't leave a moment waiting forever.
   */
  share?: number;
  /** The observer's root margin: `"0px 0px -10% 0px"` counts only what has come 10% up the screen. */
  inset?: string;
}

/**
 * True from the first time an element is properly in view, and from then on:
 * the landing page's moments each happen once, when the visitor can see
 * them. The returned ref is a callback, so the element can change; the one
 * there now is the one watched.
 *
 * Without an IntersectionObserver it is seen at once, so nothing waits on a
 * browser that can't tell.
 */
export function useFirstSight<T extends Element>({ share = 0, inset = "0px" }: FirstSightOptions = {}) {
  const [element, setElement] = useState<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen || !element) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const room = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? Infinity);
        // A pixel of slack: a box at a fractional position never quite shows whole.
        if (entry.intersectionRect.height >= room * share - 1) setSeen(true);
      },
      { rootMargin: inset, threshold: share > 0 ? STEPS : 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, seen, share, inset]);

  return [setElement, seen] as const;
}
