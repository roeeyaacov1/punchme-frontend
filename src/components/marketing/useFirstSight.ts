import { useEffect, useState } from "react";
import { useReducedMotion } from "../kit";

/** Every 5%, so a reading lands close to wherever the element crosses. */
const STEPS = Array.from({ length: 21 }, (_, index) => index / 20);

/**
 * Everything above the line 10% up from the foot of the screen, including
 * all that has scrolled past: a panel jumped over by an anchor, or one whose
 * top is off screen while focus is inside it, is never left dark.
 */
const RISEN = "1000000px 0px -10% 0px";

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

/**
 * A panel lighting on the first time its top comes 10% up the screen: dark
 * until then, then LitPanel's `arrive`, the light fading up over 240ms while
 * the panel rises 8px. On paper it is always lit. With reduced motion it is
 * lit from the first paint and never waits.
 *
 * LitPanel takes no ref, so `ref` goes on the first thing inside the panel,
 * which comes up the screen with the panel's top.
 */
export function useLightsOn<T extends Element>() {
  const reduced = useReducedMotion();
  const [ref, seen] = useFirstSight<T>({ inset: RISEN });
  return {
    ref,
    arrive: seen && !reduced,
    dark: seen || reduced ? undefined : "opacity-0 print:opacity-100",
  };
}
