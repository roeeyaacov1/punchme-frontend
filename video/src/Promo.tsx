import type { ComponentType } from "react";
import { I18nextProvider } from "react-i18next";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import "../../src/index.css";
import "./video.css";
import { I18N, type Lang } from "./i18n";
import { EXIT_LEAD, EXIT_MS, progress, sec } from "./motion";
import { FontGate } from "./pieces";
import { AfterScene } from "./scenes/AfterScene";
import { EndScene } from "./scenes/EndScene";
import { JoinScene } from "./scenes/JoinScene";
import { PriceScene } from "./scenes/PriceScene";
import { PromiseScene } from "./scenes/PromiseScene";
import { RegularsScene } from "./scenes/RegularsScene";
import { ScanScene } from "./scenes/ScanScene";

interface Beat {
  id: string;
  /** How long it holds the screen, in frames, before the next one comes on. */
  length: number;
  Scene: ComponentType;
}

/** The beats, in order. Timings are in `video/voiceover.md` too: keep them together. */
export const BEATS: Beat[] = [
  { id: "promise", length: sec(5), Scene: PromiseScene },
  { id: "join", length: sec(7.5), Scene: JoinScene },
  { id: "scan", length: sec(8), Scene: ScanScene },
  { id: "after", length: sec(7.5), Scene: AfterScene },
  { id: "regulars", length: sec(5.5), Scene: RegularsScene },
  { id: "price", length: sec(6), Scene: PriceScene },
  { id: "end", length: sec(4), Scene: EndScene },
];

/**
 * A beat goes out in 180ms, starting 150ms before the next one lights, so
 * the two barely overlap: a short, calm change with no two lines of text
 * standing over each other.
 */
const TAIL = 2;

export const DURATION = BEATS.reduce((sum, beat) => sum + beat.length, 0);

/** One beat on screen, going out over the next one's arrival, except the last, which holds. */
function BeatShell({ beat, last }: { beat: Beat; last: boolean }) {
  const frame = useCurrentFrame();
  const opacity = last ? 1 : 1 - progress(frame, beat.length - EXIT_LEAD, EXIT_MS);
  return (
    <AbsoluteFill style={{ opacity }}>
      <beat.Scene />
    </AbsoluteFill>
  );
}

/**
 * The promo: the wall, in the language's direction, with the beats on it.
 * Day palette only, as the landing page.
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
            const last = index === BEATS.length - 1;
            return (
              <Sequence key={beat.id} name={beat.id} from={start} durationInFrames={beat.length + (last ? 0 : TAIL)}>
                <BeatShell beat={beat} last={last} />
              </Sequence>
            );
          })}
        </FontGate>
      </AbsoluteFill>
    </I18nextProvider>
  );
}
