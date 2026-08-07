import type { ReactNode } from "react";
import { useInView } from "../../lib/useInView";
import { cn } from "../../lib/cn";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Fade + rise into view once, on scroll. Direction-neutral (vertical only) so it works identically in RTL/LTR. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(!inView && "opacity-0", inView && "animate-fade-up", className)}
      style={inView ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
