import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useReveal } from "./useReveal";

interface RevealProps {
  children: ReactNode;
  /** Stagger, in seconds, to match the previous signature. */
  delay?: number;
  className?: string;
}

/** Fade + rise into view once, on scroll, in a wrapper `<div>`.
 *
 * Direction-neutral (vertical only) so it works identically in RTL/LTR.
 * Reach for `useReveal` instead wherever the element that should rise is a
 * list item or a definition row — the wrapper would break the list. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const rise = useReveal<HTMLDivElement>(delay * 1000);

  return (
    <div ref={rise.ref} style={rise.style} className={cn(rise.className, className)}>
      {children}
    </div>
  );
}
