import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

/** True for a moment after `value` changes — drives `PhoneFrame.wake`.
 * Under reduced motion it never fires. */
export function useWakeOnChange(value: unknown, holdMs = 700): boolean {
  const reduced = usePrefersReducedMotion();
  const [wake, setWake] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    setWake(true);
    const timer = window.setTimeout(() => setWake(false), holdMs);
    return () => window.clearTimeout(timer);
  }, [value, holdMs, reduced]);
  return wake;
}
