import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE_OUT, IN_OUT, lerp, progress } from "../motion.ts";
import { discFlight, holeRadius, pressScale } from "../punch.ts";
import { useHebrew } from "../pieces";
import { ALL_PUNCHES, BEATS, PUNCH, PUNCHES, beatStart, type BeatId } from "../timeline.ts";
import { Wall, type Ground } from "./Wall";

const OPENING = PUNCH.openDelay + PUNCH.open;

/**
 * A beat, punched in and out. Mounted in a `Sequence` from its first frame,
 * it sees the previous beat's punch land on that frame: until the hole
 * covers the frame, it is drawn only inside the hole, settling from 112% as
 * the hole opens. Before its own punch it gives under the die; once punched
 * the camera rushes through it, and it dims, while the next beat opens over it.
 */
export function Punched({ id, ground, children }: { id: BeatId; ground: Ground; children: ReactNode }) {
  const index = BEATS.findIndex((beat) => beat.id === id);
  const f = beatStart(id) + useCurrentFrame();
  const intro = index > 0 ? PUNCHES[index - 1] : undefined;
  const outro = PUNCHES[index];

  let clipPath: string | undefined;
  let scale = 1;
  let origin = "50% 50%";
  let dim = 0;

  if (intro && f < intro.at + OPENING) {
    clipPath = `circle(${holeRadius(f, intro)}px at ${intro.cx}px ${intro.cy}px)`;
    scale = lerp(1.12, 1, progress(f, intro.at, OPENING, EASE_OUT));
    origin = `${intro.cx}px ${intro.cy}px`;
  }
  if (outro && f >= outro.at - PUNCH.press) {
    // Through the hole: the punched beat rushes past as the camera goes in.
    const through = progress(f, outro.at, OPENING, IN_OUT);
    scale = pressScale(f, outro) * lerp(1, 1.4, through);
    origin = `${outro.cx}px ${outro.cy}px`;
    dim = 0.3 * through;
  }

  return (
    <AbsoluteFill style={{ clipPath, transform: scale === 1 ? undefined : `scale(${scale})`, transformOrigin: origin }}>
      <Wall ground={ground} beat={id} />
      {children}
      {dim > 0 && <AbsoluteFill style={{ background: `rgb(43 37 33 / ${dim})` }} />}
    </AbsoluteFill>
  );
}

/**
 * The hole's edge while it opens: the paper's cut, a ring of ink with the
 * shadow it throws into the hole, fading as the hole grows past the frame.
 */
export function HoleEdges() {
  const f = useCurrentFrame();
  return (
    <>
      {PUNCHES.filter((p) => f >= p.at && f < p.at + OPENING).map((p) => {
        const r = holeRadius(f, p);
        const fade = 1 - progress(f, p.at + PUNCH.openDelay, PUNCH.open, IN_OUT);
        return (
          <div
            key={p.at}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: p.cx - r,
              top: p.cy - r,
              width: r * 2,
              height: r * 2,
              opacity: fade,
              boxShadow: "0 0 0 10px rgb(43 37 33), inset 0 22px 34px rgb(43 37 33 / 0.38)",
            }}
          />
        );
      })}
    </>
  );
}

/**
 * The punch's shockwave: a ring of light thrown out from the hole's edge,
 * thinning and fading over twelve frames.
 */
export function Shockwaves() {
  const f = useCurrentFrame();
  return (
    <>
      {ALL_PUNCHES.filter((p) => f >= p.at && f < p.at + 12).map((p) => {
        const k = progress(f, p.at, 12, EASE_OUT);
        const r = lerp(140, 720, k);
        return (
          <div
            key={p.at}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: p.cx - r,
              top: p.cy - r,
              width: r * 2,
              height: r * 2,
              opacity: 0.85 * (1 - k),
              boxShadow: `0 0 0 ${lerp(18, 2, k)}px rgb(255 253 250), 0 0 40px rgb(255 253 250 / 0.6)`,
            }}
          />
        );
      })}
    </>
  );
}

const TRAIL = [1.2, 2.4, 3.6];

/** The discs punched out, on their way up to the strip, each with a trail of fading ghosts. */
export function Discs() {
  const f = useCurrentFrame();
  const rtl = useHebrew();
  return (
    <>
      {ALL_PUNCHES.flatMap((p) =>
        TRAIL.map((back, i) => {
          const ghost = discFlight(f - back, p, rtl);
          if (!ghost || !discFlight(f, p, rtl)) return null;
          return (
            <div
              key={`${p.at}-${i}`}
              className="absolute rounded-full bg-primary"
              style={{
                left: ghost.x - 130,
                top: ghost.y - 130,
                width: 260,
                height: 260,
                opacity: 0.32 - i * 0.1,
                transform: `scale(${ghost.scale * (1 - 0.08 * (i + 1))})`,
              }}
            />
          );
        }),
      )}
      {ALL_PUNCHES.map((p) => {
        const flight = discFlight(f, p, rtl);
        if (!flight) return null;
        return (
          <div
            key={p.at}
            className="absolute rounded-full bg-primary"
            style={{
              left: flight.x - 130,
              top: flight.y - 130,
              width: 260,
              height: 260,
              boxShadow: "inset 0 0 0 16px rgb(43 37 33), 0 18px 40px rgb(43 37 33 / 0.28)",
              transform: `scale(${flight.scale}) rotate(${flight.rotate}deg)`,
            }}
          >
            <div className="absolute inset-[64px] rounded-full border-[10px] border-ink/30" />
          </div>
        );
      })}
    </>
  );
}
