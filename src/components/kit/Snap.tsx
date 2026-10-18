import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { useReducedMotion } from "./motion";

/** Never two flashes closer than this: comfortably under three a second. */
const FLASH_GAP_MS = 400;

/**
 * The scan answering like a photo snap: a flash of the panels' own warm
 * light, #fff4e6, over the whole viewfinder, clearing from 0.85 to nothing
 * in 220ms (from 0.6 at night). Place it inside the frame, after the answer,
 * and give it the answer's id as `snap`; the answer's lit panel settles
 * under it, and the newest stamp lands, and all of it is over at 300ms.
 *
 * With reduced motion the flash is a 0.3 glow over 150ms. A second answer
 * inside 400ms gets no second flash at all, so the frame can never flash
 * three times in a second (WCAG 2.3.1).
 */
export function SnapFlash({ snap }: { snap: string | number | null }) {
  const reduced = useReducedMotion();
  const last = useRef(-Infinity);
  const [flash, setFlash] = useState<string | number | null>(null);

  useEffect(() => {
    if (snap === null) return;
    const now = performance.now();
    if (now - last.current < FLASH_GAP_MS) return;
    last.current = now;
    setFlash(snap);
  }, [snap]);

  if (flash === null) return null;
  return (
    <span
      key={flash}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-light",
        reduced ? "animate-snap-glow" : "animate-snap-flash",
      )}
    />
  );
}
