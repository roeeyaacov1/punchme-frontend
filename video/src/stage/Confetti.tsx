import { useCurrentFrame } from "remotion";
import { confetti } from "../confetti.ts";

/**
 * A burst of stamp confetti from `origin` at frame `at`: gold discs (the
 * reward's fill) and coral ones, each with an ink rim like the strip's stamps.
 */
export function Confetti({ at, origin, seed }: { at: number; origin: { x: number; y: number }; seed?: number }) {
  const f = useCurrentFrame();
  return (
    <>
      {confetti(f, at, origin, seed).map((bit, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: bit.x - bit.size / 2,
            top: bit.y - bit.size / 2,
            width: bit.size,
            height: bit.size,
            opacity: bit.opacity,
            background: bit.gold ? "#f0b429" : "#f67748",
            boxShadow: "inset 0 0 0 3px rgb(43 37 33)",
            transform: `rotate(${bit.rotate}deg) scaleX(${0.55 + 0.45 * Math.abs(Math.cos((bit.rotate * Math.PI) / 180))})`,
          }}
        />
      ))}
    </>
  );
}
