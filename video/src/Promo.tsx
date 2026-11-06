import type { ComponentType, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import "../../src/index.css";
import "./video.css";
import { I18N, type Lang } from "./i18n";
import { FontGate } from "./pieces";
import { shake } from "./punch.ts";
import { Discs, HoleEdges, Punched } from "./stage/Punched";
import { Slam } from "./stage/Slam";
import { Strip } from "./stage/Strip";
import type { Ground } from "./stage/Wall";
import { BEATS, DURATION, PUNCH, beatStart, type BeatId } from "./timeline.ts";

export { DURATION };

function stub(id: BeatId): ComponentType {
  return function Stub() {
    return (
      <AbsoluteFill className="items-center justify-center">
        <Slam at={6}>{id}</Slam>
      </AbsoluteFill>
    );
  };
}

/** Each beat's scene and the ground it stands on. */
const SCENES: Record<BeatId, { Scene: ComponentType; ground: Ground }> = {
  hook: { Scene: stub("hook"), ground: "wall" },
  promise: { Scene: stub("promise"), ground: "coral" },
  join: { Scene: stub("join"), ground: "wall" },
  looks: { Scene: stub("looks"), ground: "panel" },
  stamps: { Scene: stub("stamps"), ground: "wall" },
  reward: { Scene: stub("reward"), ground: "gold" },
  winback: { Scene: stub("winback"), ground: "wall" },
  proof: { Scene: stub("proof"), ground: "panel" },
  price: { Scene: stub("price"), ground: "wall" },
  end: { Scene: stub("end"), ground: "wall" },
};

const OPENING = PUNCH.openDelay + PUNCH.open;

/** The camera: still, but for three frames' shake and a small jolt at each punch. */
function Camera({ children }: { children: ReactNode }) {
  const frame = useCurrentFrame();
  const { x, y } = shake(frame);
  const hit = x !== 0 || y !== 0;
  return <AbsoluteFill style={{ transform: hit ? `translate(${x}px, ${y}px) scale(1.03)` : undefined }}>{children}</AbsoluteFill>;
}

/**
 * The promo: ten beats on the wall, each punched through to the next, a
 * strip of ten slots across the top filling with the punched discs.
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
            <Strip />
            <Discs />
          </Camera>
        </FontGate>
      </AbsoluteFill>
    </I18nextProvider>
  );
}
