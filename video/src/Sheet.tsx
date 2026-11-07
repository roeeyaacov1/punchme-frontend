import { AbsoluteFill, Freeze } from "remotion";
import type { Lang } from "./i18n";
import { HEIGHT, WIDTH } from "./motion.ts";
import { Promo } from "./Promo";

export type SheetProps = {
  lang: Lang;
  frames: number[];
  cols: number;
};

/** A frame's size on the sheet: a quarter of the video's. */
export const CELL = { w: WIDTH / 4, h: HEIGHT / 4, label: 36 } as const;

/**
 * A contact sheet for checking: given frames of the promo side by side, a
 * quarter size, each with its number. `npm run stills -- --sheet 75,78,84`.
 */
export function Sheet({ lang, frames, cols }: SheetProps) {
  return (
    <AbsoluteFill style={{ background: "#555", display: "grid", gridTemplateColumns: `repeat(${cols}, ${CELL.w}px)`, gap: 0, alignContent: "start" }}>
      {frames.map((frame) => (
        <div key={frame} style={{ width: CELL.w, height: CELL.h + CELL.label, position: "relative", overflow: "hidden" }}>
          <div style={{ height: CELL.label, color: "white", font: "600 24px sans-serif", padding: "4px 8px" }}>{frame}</div>
          <div style={{ width: WIDTH, height: HEIGHT, transform: "scale(0.25)", transformOrigin: "top left", position: "relative", overflow: "hidden" }}>
            <Freeze frame={frame}>
              <Promo lang={lang} />
            </Freeze>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
}
