import type { ComponentType, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import "../../src/index.css";
import "./video.css";
import { I18N, type Lang } from "./i18n";
import { FontGate } from "./pieces";
import { pulse } from "./beat.ts";
import { MOMENTS } from "./cues.ts";
import { shake } from "./punch.ts";
import { Confetti } from "./stage/Confetti";
import { Discs, HoleEdges, Punched, Shockwaves } from "./stage/Punched";
import { End } from "./scenes/End";
import { Hook } from "./scenes/Hook";
import { Join } from "./scenes/Join";
import { Looks } from "./scenes/Looks";
import { Price } from "./scenes/Price";
import { PromiseScene } from "./scenes/Promise";
import { Reward } from "./scenes/Reward";
import { Stamps } from "./scenes/Stamps";
import { Winback } from "./scenes/Winback";
import { Sounds } from "./stage/Sounds";
import { Strip } from "./stage/Strip";
import type { Ground } from "./stage/Wall";
import { BEATS, DURATION, PUNCH, beatStart, type BeatId } from "./timeline.ts";

export { DURATION };

/** Each beat's scene and the ground it stands on. */
const SCENES: Record<BeatId, { Scene: ComponentType; ground: Ground }> = {
  hook: { Scene: Hook, ground: "wall" },
  promise: { Scene: PromiseScene, ground: "coral" },
  join: { Scene: Join, ground: "wall" },
  looks: { Scene: Looks, ground: "panel" },
  stamps: { Scene: Stamps, ground: "wall" },
  reward: { Scene: Reward, ground: "ink" },
  winback: { Scene: Winback, ground: "wall" },
  price: { Scene: Price, ground: "wall" },
  end: { Scene: End, ground: "wall" },
};

const OPENING = PUNCH.openDelay + PUNCH.open;

/**
 * The camera: it bumps in with every kick of the track, and shakes for three
 * frames with a jolt at each punch.
 */
function Camera({ children }: { children: ReactNode }) {
  const frame = useCurrentFrame();
  const { x, y } = shake(frame);
  const hit = x !== 0 || y !== 0;
  const scale = (hit ? 1.03 : 1) * (1 + 0.014 * pulse(frame));
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}>{children}</AbsoluteFill>;
}

/**
 * The promo: nine beats cut to a 120 BPM track, each punched through to the
 * next on a downbeat, a strip of ten slots across the top filling with the
 * punched discs.
 */
export function Promo({ lang }: { lang: Lang }) {
  return (
    <I18nextProvider i18n={I18N[lang]}>
      <AbsoluteFill className="promo theme-lightbox bg-background text-ink" dir={lang === "he" ? "rtl" : "ltr"} lang={lang}>
        <FontGate>
          <Camera>
            {BEATS.map((beat, index) => {
              const { Scene, ground } = SCENES[beat.id];
              const tail = index < BEATS.length - 1 ? OPENING : 0;
              return (
                <Sequence key={beat.id} name={beat.id} from={beatStart(beat.id)} durationInFrames={beat.length + tail}>
                  <Punched id={beat.id} ground={ground}>
                    <Scene />
                  </Punched>
                </Sequence>
              );
            })}
            <HoleEdges />
            <Shockwaves />
            <Strip />
            <Discs />
            <Confetti at={MOMENTS.reward} origin={{ x: 540, y: 1040 }} />
            <Confetti at={MOMENTS.full} origin={{ x: 540, y: 262 }} seed={23} />
          </Camera>
          <Sounds />
        </FontGate>
      </AbsoluteFill>
    </I18nextProvider>
  );
}
