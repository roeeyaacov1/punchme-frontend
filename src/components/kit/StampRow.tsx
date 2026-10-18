import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { useReducedMotion } from "./motion";

export interface StampRowProps {
  total: number;
  filled: number;
  /**
   * The newest stamp lands: at the scan's pace (240ms after 60ms, from 1.45
   * on the overshoot) or as the 340ms stamp. A new `key` plays it again.
   * With reduced motion it is simply there, at its final size.
   */
  land?: "snap" | "stamp";
  /** The card's own glyph, set inside each filled stamp. */
  glyph?: LucideIcon;
  className?: string;
}

/**
 * A card's stamps as one unbroken line: it never wraps, it shrinks to fit,
 * and the next stamp to come is marked as "now". Decoration for the eye; the
 * count beside it is what a screen reader hears.
 */
export function StampRow({ total, filled, land, glyph: Glyph, className }: StampRowProps) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className={cn("flex w-full items-center justify-center gap-[clamp(3px,1.6%,8px)]", className)}>
      {Array.from({ length: total }, (_, index) => {
        const on = index < filled;
        const newest = land && on && index === filled - 1;
        const next = index === filled;
        return (
          <span
            key={index}
            className={cn(
              "flex aspect-square min-w-0 max-w-9 flex-1 items-center justify-center rounded-full",
              on ? "bg-ink text-surface" : next ? "border-2 border-ink" : "border-2 border-ink/30",
              newest && !reduced && (land === "snap" ? "animate-stamp-snap" : "animate-stamp-land"),
            )}
          >
            {on && Glyph && <Glyph strokeWidth={2.5} className="size-[55%]" />}
          </span>
        );
      })}
    </div>
  );
}
