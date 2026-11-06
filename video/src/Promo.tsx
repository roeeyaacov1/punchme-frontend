import type { ComponentType, CSSProperties } from "react";
import { I18nextProvider } from "react-i18next";
import { AbsoluteFill, Sequence, interpolate } from "remotion";
import "../../src/index.css";
import "./video.css";
import { I18N, type Lang } from "./i18n";
import { BeatContext, IN_OUT, SWEEP_HALF, sec, useBeat, type BeatTiming, type Boundary } from "./motion";
import { FontGate, useHebrew } from "./pieces";
import { AfterScene } from "./scenes/AfterScene";
import { EndScene } from "./scenes/EndScene";
import { JoinScene } from "./scenes/JoinScene";
import { PriceScene } from "./scenes/PriceScene";
import { PromiseScene } from "./scenes/PromiseScene";
import { RegularsScene } from "./scenes/RegularsScene";
import { ScanScene } from "./scenes/ScanScene";

interface Beat {
  id: string;
  /** How long it holds the screen, in frames, from its first frame to the next beat's. */
  length: number;
  Scene: ComponentType;
  /** How it takes over from the beat before it. */
  into?: Boundary;
}

/**
 * The beats, in order. Timings are in `video/voiceover.md` too: keep them
 * together. The card travels through the join, the scan and the lock screen
 * as one card (`handoff`); elsewhere a sweep of light changes the beat.
 */
export const BEATS: Beat[] = [
  { id: "promise", length: sec(5), Scene: PromiseScene },
  { id: "join", length: sec(7.5), Scene: JoinScene, into: "sweep" },
  { id: "scan", length: sec(8), Scene: ScanScene, into: "handoff" },
  { id: "after", length: sec(7.5), Scene: AfterScene, into: "handoff" },
  { id: "regulars", length: sec(5.5), Scene: RegularsScene, into: "sweep" },
  { id: "price", length: sec(6), Scene: PriceScene, into: "sweep" },
  { id: "end", length: sec(4), Scene: EndScene, into: "sweep" },
];

export const DURATION = BEATS.reduce((sum, beat) => sum + beat.length, 0);

/** How soft each edge of the sweep is, and the bare wall between them, in % of the frame. */
const SOFT = 16;
const GAP = 14;

/**
 * The sweep: a band of bare wall crossing the frame in reading direction on
 * the in-out, with soft edges. Ahead of it the outgoing beat goes out; behind
 * it the incoming beat is lit. Between them only the wall, so two beats'
 * words never stand over each other.
 */
function sweepMask(t: number, from: number, rtl: boolean, incoming: boolean): CSSProperties {
  const edge = interpolate(t, [from, from + 2 * SWEEP_HALF], [-SOFT, 100 + GAP + SOFT], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: IN_OUT,
  });
  const to = rtl ? "to left" : "to right";
  const back = edge - GAP - SOFT;
  const mask = incoming
    ? `linear-gradient(${to}, #000 ${back}%, transparent ${back + SOFT}%)`
    : `linear-gradient(${to}, transparent ${edge}%, #000 ${edge + SOFT}%)`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

function BeatShell({ Scene }: { Scene: ComponentType }) {
  const { t, length, intro, outro } = useBeat();
  const rtl = useHebrew();
  let style: CSSProperties | undefined;
  if (intro === "sweep" && t < SWEEP_HALF) style = sweepMask(t, -SWEEP_HALF, rtl, true);
  else if (outro === "sweep" && t > length - SWEEP_HALF) style = sweepMask(t, length - SWEEP_HALF, rtl, false);
  return (
    <AbsoluteFill style={style}>
      <Scene />
    </AbsoluteFill>
  );
}

/**
 * The promo: the wall, in the language's direction, with the beats on it.
 * Each beat is mounted a little before its first frame when the one before
 * hands over to it, and a little after its last when it sweeps out, and
 * reads its own clock from `useBeat`. Day palette only, as the landing page.
 */
export function Promo({ lang }: { lang: Lang }) {
  let from = 0;
  return (
    <I18nextProvider i18n={I18N[lang]}>
      <AbsoluteFill className="promo theme-lightbox bg-background text-ink" dir={lang === "he" ? "rtl" : "ltr"} lang={lang}>
        <FontGate>
          {BEATS.map((beat, index) => {
            const start = from;
            from += beat.length;
            const timing: BeatTiming = {
              lead: beat.into ? SWEEP_HALF : 0,
              length: beat.length,
              intro: beat.into,
              outro: BEATS[index + 1]?.into,
            };
            // A handoff ends the outgoing beat on its last frame: the
            // incoming one holds the card from there.
            const tail = timing.outro === "sweep" ? SWEEP_HALF : 0;
            return (
              <Sequence
                key={beat.id}
                name={beat.id}
                from={start - timing.lead}
                durationInFrames={timing.lead + beat.length + tail}
              >
                <BeatContext.Provider value={timing}>
                  <BeatShell Scene={beat.Scene} />
                </BeatContext.Provider>
              </Sequence>
            );
          })}
        </FontGate>
      </AbsoluteFill>
    </I18nextProvider>
  );
}
