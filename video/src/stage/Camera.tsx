import { AbsoluteFill, interpolate } from "remotion";
import { CLAMP, IN_OUT, progress } from "../motion.ts";

/**
 * A phone camera's aiming corners closing on a square: from 150% to its
 * size over `frames`, on the in-out, in ink. `size` is the square's side.
 */
export function Brackets({ x, y, size, at, frame, frames = 12, out }: { x: number; y: number; size: number; at: number; frame: number; frames?: number; out?: number }) {
  const lock = progress(frame, at, frames, IN_OUT);
  const gone = out === undefined ? 0 : progress(frame, out, 5);
  const s = size * (1.5 - 0.5 * lock);
  const arm = size * 0.24;
  const corner = (rotate: number, left: number, top: number) => (
    <div
      key={rotate}
      className="absolute border-surface"
      style={{ left, top, width: arm, height: arm, borderTopWidth: 12, borderLeftWidth: 12, borderRadius: "14px 0 0 0", transform: `rotate(${rotate}deg)`, filter: "drop-shadow(0 0 3px rgb(43 37 33)) drop-shadow(0 4px 10px rgb(43 37 33 / 0.5))" }}
    />
  );
  return (
    <div className="absolute" style={{ left: x - s / 2, top: y - s / 2, width: s, height: s, opacity: progress(frame, at, 4) * (1 - gone) }}>
      {corner(0, 0, 0)}
      {corner(90, s - arm, 0)}
      {corner(180, s - arm, s - arm)}
      {corner(270, 0, s - arm)}
    </div>
  );
}

/** The camera's flash: white over the frame, gone in six frames. */
export function Flash({ at, frame }: { at: number; frame: number }) {
  const opacity = interpolate(frame, [at, at + 1, at + 7], [0, 0.85, 0], CLAMP);
  return opacity > 0 ? <AbsoluteFill style={{ background: "white", opacity }} /> : null;
}
