import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { OVERSHOOT, progress } from "../motion.ts";
import { useHebrew } from "../pieces";

/**
 * A perspective box whose child swings in from `from` (degrees about y and
 * x, and a depth in px) to flat, over `settle` frames on the overshoot, then
 * sways a little about y while it stays. The swing mirrors in Hebrew.
 */
export function Tilt({
  from,
  at,
  settle = 18,
  sway = 2.5,
  className,
  style,
  children,
}: {
  from: { ry: number; rx: number; z: number };
  at: number;
  settle?: number;
  sway?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const t = useCurrentFrame();
  const rtl = useHebrew();
  const p = progress(t, at, settle, OVERSHOOT);
  const rest = 1 - p;
  const swayIn = progress(t, at + settle, 15);
  const swing = sway * swayIn * Math.sin(((t - at - settle) / 90) * 2 * Math.PI);
  const ry = (from.ry * rest + swing) * (rtl ? -1 : 1);
  return (
    <div className={className} style={{ perspective: 1600, ...style }}>
      <div
        style={{
          opacity: progress(t, at, 4),
          transform: `translateZ(${from.z * rest}px) rotateY(${ry}deg) rotateX(${from.rx * rest}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
}
