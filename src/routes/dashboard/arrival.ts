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
 * Pass only the keys of rows on screen now. The class it gives a key goes
 * on that row: added to a row already there, it plays the light again in
 * place, which is how a row says its state has changed.
 */
export function useArrivals(arriving: readonly string[]): (key: string) => string | undefined {
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
  const motion = reduced ? "animate-gentle-in" : "animate-lights-on";
  return (key) => (waiting.includes(key) ? motion : undefined);
}
