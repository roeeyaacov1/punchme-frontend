import { useTranslation } from "react-i18next";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { MOMENTS, SLAMS } from "../cues.ts";
import { CLAMP, EASE_OUT, progress } from "../motion.ts";
import { CATALOG, HERO_ID } from "../looks";
import { useHebrew } from "../pieces";
import { LookCard, PASS_H } from "../stage/LookCard";
import { Slam } from "../stage/Slam";
import { beatStart } from "../timeline.ts";

/** The hero first, then the rest of the published looks as the catalog lists them. */
const RING = [CATALOG.find((preset) => preset.id === HERO_ID)!, ...CATALOG.filter((preset) => preset.id !== HERO_ID)];
const STEP = 360 / RING.length;
const RADIUS = 820;
const SCALE = 1.7;
/** The ring's middle on the frame. */
const MIDDLE = 1100;

const SPIN = { at: MOMENTS.looksSpin - beatStart("looks"), frames: 40, turns: 540 } as const;

/**
 * Beat 4: "Your card. / Your look." The eight published styled looks, each
 * its own picture drawn by the wallet, on a ring that spins and slows onto
 * the hero, blurred while it is fast. The other way round in Hebrew.
 */
export function Looks() {
  const { t } = useTranslation();
  const f = useCurrentFrame();
  const hebrew = useHebrew();
  const way = hebrew ? -1 : 1;
  const turn = (frame: number) => way * SPIN.turns * (1 - interpolate(frame, [SPIN.at, SPIN.at + SPIN.frames], [0, 1], { ...CLAMP, easing: EASE_OUT }));
  const angle = turn(f);
  const speed = Math.abs(turn(f + 1) - angle);
  const blur = Math.min(8, speed * 0.4);
  const [line1, line2] = SLAMS.looks!;
  return (
    <AbsoluteFill>
      <div className="absolute inset-x-[80px] flex flex-col items-center" style={{ top: 370 }}>
        <Slam at={line1} size={120}>
          {t("video:looks.line1")}
        </Slam>
        <Slam at={line2} size={120}>
          {t("video:looks.line2")}
        </Slam>
      </div>
      <div className="absolute inset-0" style={{ perspective: 2400, opacity: progress(f, 8, 8) }}>
        <div
          className="absolute"
          style={{ left: 540, top: MIDDLE, transformStyle: "preserve-3d", transform: `translateZ(${-RADIUS}px) rotateY(${angle}deg)` }}
        >
          {RING.map((preset, i) => (
            <div
              key={preset.id}
              className="absolute"
              style={{
                left: -150 * SCALE,
                top: (-PASS_H * SCALE) / 2,
                transform: `rotateY(${i * STEP * way}deg) translateZ(${RADIUS}px)`,
                backfaceVisibility: "hidden",
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              }}
            >
              <LookCard preset={preset} stamps="own" scale={SCALE} />
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}
