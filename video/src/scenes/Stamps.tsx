import { useTranslation } from "react-i18next";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MOMENTS, SLAMS } from "../cues.ts";
import { EASE_OUT, lerp, progress } from "../motion.ts";
import { HERO } from "../looks";
import { HERO_STAMPS } from "../stamping.ts";
import { Brackets, Flash } from "../stage/Camera";
import { LookCard } from "../stage/LookCard";
import { findCode, findStrip, stampInStrip, useInnerBox } from "../stage/measure";
import { Slam } from "../stage/Slam";
import { beatStart } from "../timeline.ts";

/** The hero pass: 690px wide, its middle where the next punch lands. */
export const STAMP_CARD = { s: 2.3, top: 640 } as const;
const LEFT = 540 - 150 * STAMP_CARD.s;

const KICK = [1.035, 1.02, 1.008];

/** A coral ring growing out of a stamp as it lands, and fading. */
export function StampRing({ x, y, r, frame }: { x: number; y: number; r: number; frame: number }) {
  if (frame < 0 || frame > 8) return null;
  const p = progress(frame, 0, 8, EASE_OUT);
  const size = lerp(r * 2, r * 4.2, p);
  return (
    <div
      className="pointer-events-none absolute rounded-full border-primary"
      style={{ left: x - size / 2, top: y - size / 2, width: size, height: size, borderWidth: 12, opacity: 1 - p }}
    />
  );
}

/**
 * Beat 5: "Every visit, a stamp." The owner's camera on the card, the
 * flash, then the stamps land one after another, faster and faster, each
 * the wallet's own drawing at that count, the card kicking at each.
 */
export function Stamps() {
  const { t } = useTranslation();
  const f = useCurrentFrame();
  const abs = beatStart("stamps") + f;
  const count = HERO_STAMPS.filter((frame) => frame <= abs).length;
  const since = count > 0 ? abs - HERO_STAMPS[count - 1] : Infinity;
  const kick = KICK[since] ?? 1;
  const strip = useInnerBox(300 * STAMP_CARD.s, findStrip);
  const code = useInnerBox(300 * STAMP_CARD.s, findCode);
  const flash = MOMENTS.stampsFlash - beatStart("stamps");
  const ring = count > 0 && strip.box ? stampInStrip(strip.box, count - 1) : null;

  return (
    <AbsoluteFill>
      <div className="absolute inset-x-[80px] flex justify-center" style={{ top: 370 }}>
        <Slam at={SLAMS.stamps![0]} size={104}>
          {t("video:stamps.line")}
        </Slam>
      </div>
      <div className="absolute" style={{ left: LEFT, top: STAMP_CARD.top, transform: `scale(${kick})` }}>
        <div ref={strip.ref}>
          <div ref={code.ref}>
            <LookCard preset={HERO} stamps={count} scale={STAMP_CARD.s} />
          </div>
        </div>
        {ring && <StampRing x={ring.x} y={ring.y} r={ring.r} frame={since} />}
      </div>
      {code.box && (
        <Brackets
          x={LEFT + code.box.x + code.box.w / 2}
          y={STAMP_CARD.top + code.box.y + code.box.h / 2}
          size={code.box.w * 1.3}
          at={15}
          frame={f}
          out={flash + 4}
        />
      )}
      <Flash at={flash} frame={f} />
    </AbsoluteFill>
  );
}
