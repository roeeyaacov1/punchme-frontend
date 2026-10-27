import { ScanLine } from "lucide-react";
import { useReducedMotion } from "../../kit";
import { cn } from "../../../lib/cn";

/**
 * Scan's coral circle: 56px, carrying its ink icon at 28px (5.50:1; at
 * night #1a120d on #ff8a5c, 7.95:1). It goes inside a link that is the
 * `group`: a press sinks it to 0.97 in 120ms, or darkens it to coral's hover
 * with reduced motion, and the link's keyboard focus draws the ink ring
 * around the circle itself. No halo and no shadow.
 *
 * The phone bar raises it out of the bar inside a ring of the bar's ground;
 * the tablet's rail puts it at the head of the rail. Where large text makes
 * the ring narrower than the circle would be, the circle shrinks to keep its
 * band of ring, and the icon stays half the circle.
 */
export function ScanCircle({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <span
      aria-hidden
      className={cn(
        "flex aspect-square w-14 max-w-[calc(100%-0.5rem)] shrink-0 items-center justify-center rounded-full bg-primary text-primary-on group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ink",
        reduced
          ? "transition-colors duration-press ease-out group-active:bg-primary-hover"
          : "transition-transform duration-press ease-out group-active:scale-[0.97]",
        className,
      )}
    >
      <ScanLine className="h-auto w-1/2" strokeWidth={2} />
    </span>
  );
}
