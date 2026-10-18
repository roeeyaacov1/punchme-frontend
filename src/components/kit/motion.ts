import { createContext, useContext } from "react";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

/**
 * Lets a page preview reduced motion without changing the OS setting —
 * the style guide's switch. It can only ask for less motion: someone whose
 * device asks for reduced motion gets it whatever this says.
 */
export const ReducedMotionPreview = createContext(false);

/**
 * Whether the kit should use its gentler motion: the device's setting, or
 * the preview above. Every motion choice in the kit — transitions included —
 * goes through here rather than through `motion-reduce:` utilities, so the
 * preview shows exactly what the setting would.
 *
 * Reduced is gentler, not none: light arrives at full strength in 150ms
 * with no travel, and a stamp appears at its final size.
 */
export function useReducedMotion(): boolean {
  const prefers = usePrefersReducedMotion();
  const preview = useContext(ReducedMotionPreview);
  return prefers || preview;
}
