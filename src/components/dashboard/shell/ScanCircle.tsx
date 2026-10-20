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
 * the tablet's rail puts it at the head of the rail.
 */
export function ScanCircle({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-on group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ink",
        reduced
          ? "transition-colors duration-press ease-out group-active:bg-primary-hover"
          : "transition-transform duration-press ease-out group-active:scale-[0.97]",
        className,
      )}
    >
      <ScanLine className="size-7" strokeWidth={2} />
    </span>
  );
}
