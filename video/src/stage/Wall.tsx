import { AbsoluteFill, useCurrentFrame } from "remotion";
import { pulse } from "../beat.ts";
import { beatStart, type BeatId } from "../timeline.ts";
import { useHebrew } from "../pieces";

/**
 * What a beat stands on. The wall and the lit panel are the day palette's
 * grounds; coral and gold are fills that carry ink (5.50:1 and 9.4:1), so a
 * beat on them sets its words in ink like a button's label. The ink band
 * is the day palette's dark band, its words in the lit panel's cream
 * (14.88:1), for the reward, so its gold lights up. A punch that
 * opens onto a different ground reads as a hole.
 */
export type Ground = "wall" | "panel" | "coral" | "gold" | "ink";

const GROUND_CLASS: Record<Ground, string> = {
  wall: "bg-background",
  panel: "bg-surface",
  coral: "bg-primary",
  gold: "bg-gold",
  ink: "bg-navy-deep",
};

/** Large faint stamp rings drifting behind everything, for depth. */
const RINGS = [
  { x: 110, y: 380, r: 300, speed: 1 },
  { x: 930, y: 760, r: 420, speed: -0.6 },
  { x: 260, y: 1460, r: 360, speed: 0.8 },
  { x: 980, y: 1720, r: 220, speed: -1.2 },
  { x: 600, y: 1080, r: 170, speed: 0.5 },
];

export function Wall({ ground = "wall", beat }: { ground?: Ground; beat: BeatId }) {
  // The rings breathe with the kick: read on the video's own clock.
  const frame = useCurrentFrame();
  const beatPulse = pulse(beatStart(beat) + frame);
  const rtl = useHebrew();
  const drift = frame * 0.15 * (rtl ? -1 : 1);
  return (
    <AbsoluteFill className={GROUND_CLASS[ground]}>
      {RINGS.map((ring, index) => (
        <div
          key={index}
          className={ground === "ink" ? "absolute rounded-full border-surface/[0.05]" : "absolute rounded-full border-ink/[0.05]"}
          style={{
            left: ring.x - ring.r + drift * ring.speed * 6,
            top: ring.y - ring.r + drift * ring.speed * 2,
            width: ring.r * 2,
            height: ring.r * 2,
            borderWidth: Math.round(ring.r * 0.09),
            borderStyle: "solid",
            transform: `scale(${1 + 0.06 * beatPulse})`,
          }}
        />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 65% at 50% 46%, transparent 55%, rgb(43 37 33 / 0.11) 100%)" }} />
    </AbsoluteFill>
  );
}
