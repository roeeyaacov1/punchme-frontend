import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

/**
 * The landing page's one scroll primitive: an element rises into place the
 * first time it is seen, and then stays put.
 *
 * A hook rather than only a wrapper component, because most of what reveals
 * on this page is a `<li>` in a `<ul>` or a `<dt>` in a `<dl>`. Wrapping
 * those in a `<div>` to animate them would trade the page's list semantics
 * for a fade, which is a bad trade. Apply it to the real element instead:
 *
 *     const rise = useReveal<HTMLLIElement>(i * 70);
 *     <li ref={rise.ref} style={rise.style} className={cn("…", rise.className)}>
 *
 * Two safeties, both of which matter more here than in the wrapper version
 * because this now gates the whole page rather than one section:
 *
 * - **Reduced motion is answered here, not in CSS.** `index.css` kills the
 *   keyframes with `animation: none !important`, which is enough to stop the
 *   movement but still leaves everything below the fold at `opacity-0` until
 *   it is scrolled to. Someone who asked for less motion should get the page
 *   already assembled, so this returns "visible, no animation" up front and
 *   never observes anything.
 * - **No observer means visible.** If `IntersectionObserver` is missing the
 *   fallback is the entire landing page rendering blank, so the hook opens
 *   in the revealed state rather than the hidden one.
 */

/**
 * ── One element, one job ────────────────────────────────────────────────
 *
 * The reveal is a CSS *animation*, and an animation with `fill-mode: both`
 * keeps applying its final keyframe forever. Animations also outrank normal
 * declarations in the cascade, so `fade-up`'s closing `translateY(0)`
 * silently beats any `hover:-translate-y-1` sharing the element: the card
 * fades in correctly and then refuses to lift, with nothing in the class
 * list to explain why.
 *
 * So a card that answers the pointer puts the reveal on its list item and
 * the hover on the panel inside it — see `cardHover` in the landing's
 * primitives. Each element then owns exactly one transition, and the reveal
 * (700ms, calm) never has to share a duration with the hover (200ms, quick).
 */
export function useReveal<T extends HTMLElement>(delayMs = 0) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (reduced) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      // Held back far enough that a row finishes arriving before it reaches
      // comfortable reading height, rather than animating under the reader's
      // eye. Small enough that a short section still triggers on a phone.
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  const revealed = reduced || seen;

  if (reduced) {
    return { ref, className: undefined, style: undefined, revealed: true } as const;
  }

  return {
    ref,
    /** Merge into the element's own classes with `cn`. */
    className: revealed ? "animate-fade-up" : "opacity-0",
    style: revealed && delayMs ? { animationDelay: `${delayMs}ms` } : undefined,
    /** True once the element has been seen — for anything a class can't say. */
    revealed,
  } as const;
}
