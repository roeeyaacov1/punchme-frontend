import { useEffect, useState } from "react";
import { useReducedMotion } from "../../components/kit";

/** --duration-lights, and a frame or two: by then the light is up. */
const LIT_MS = 300;

/**
 * Rows that arrive by light, once each. A key passed in lights on (240ms,
 * or the gentle 150ms fade with reduced motion) from the render it first
 * appears in, and is shown as it is once its light is up, so a tab switched
 * back to, or a filter that brings the row back, doesn't play it again.
 *
 * Pass only the keys of rows on screen now; the class it gives a key goes
 * on that row. Something already on screen that only changes, such as a
 * row's badge, passes `plays` instead of taking the lights on: replayed on
 * a row that is there, an arrival flickers it and moves its words.
 */
export function useArrivals(arriving: readonly string[], plays?: string): (key: string) => string | undefined {
  const reduced = useReducedMotion();
  const [lit, setLit] = useState<ReadonlySet<string>>(() => new Set());
  const waiting = arriving.filter((key) => !lit.has(key));
  const signature = waiting.join(" ");
  useEffect(() => {
    if (!signature) return;
    const keys = signature.split(" ");
    const timer = window.setTimeout(() => setLit((done) => new Set([...done, ...keys])), LIT_MS);
    return () => window.clearTimeout(timer);
  }, [signature]);
  const motion = plays ?? (reduced ? "animate-gentle-in" : "animate-lights-on");
  return (key) => (waiting.includes(key) ? motion : undefined);
}
