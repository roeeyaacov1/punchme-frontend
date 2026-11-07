import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { progress, slam } from "../motion.ts";
import { cn } from "../../../src/lib/cn";
import { useHebrew } from "../pieces";

const KICK = [0, 0, 0, 0, 0, 6, -6, 2];

/**
 * Words that land: lit on the frame they land, from 135% to their size in
 * five frames on the overshoot (`slam` in motion.ts), with a small kick as
 * they hit. Rubik 700 in ink.
 * `at` is the frame in the beat they land on (`SLAMS`); `off` fades them
 * out over four frames from there. Until `at` they hold their place unseen,
 * so a line's layout never jumps.
 */
export function Slam({
  at,
  off,
  size = 136,
  weight = 700,
  tone = "ink",
  className,
  style,
  children,
}: {
  at: number;
  off?: number;
  size?: number;
  weight?: 500 | 700;
  /** Ink on the light grounds, the lit panel's cream on the dark band. */
  tone?: "ink" | "light";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const t = useCurrentFrame();
  const hebrew = useHebrew();
  const { opacity, scale } = slam(t, at);
  const out = off === undefined ? 0 : progress(t, off, 4);
  const kick = KICK[Math.floor(t - at)] ?? 0;
  return (
    <div
      className={cn("text-balance text-center font-heading", tone === "ink" ? "text-ink" : "text-surface", className)}
      style={{
        fontSize: size,
        fontWeight: weight,
        lineHeight: hebrew ? 1.12 : 1.02,
        letterSpacing: hebrew ? 0 : "-0.025em",
        opacity: opacity * (1 - out),
        transform: `translateX(${kick}px) scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
