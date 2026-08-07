import { useEffect, useState } from "react";
import { useInView } from "./useInView";

/** Animates 0 → target with an ease-out curve once the element scrolls into view. */
export function useCountUp<T extends HTMLElement>(target: number, duration = 1200) {
  const { ref, inView } = useInView<T>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return { ref, value };
}
