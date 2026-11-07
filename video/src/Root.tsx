import { Composition, type CalculateMetadataFunction } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./motion.ts";
import { DURATION, Promo } from "./Promo";
import { CELL, Sheet, type SheetProps } from "./Sheet";

/** The sheet takes its size from how many frames it shows. */
const sheetSize: CalculateMetadataFunction<SheetProps> = ({ props }) => ({
  width: CELL.w * props.cols,
  height: (CELL.h + CELL.label) * Math.ceil(props.frames.length / props.cols),
});

/** The same scenes twice, in Hebrew and in English, and a contact sheet for checking them. */
export function RemotionRoot() {
  return (
    <>
      <Composition
        id="PromoHe"
        component={Promo}
        defaultProps={{ lang: "he" as const }}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="PromoEn"
        component={Promo}
        defaultProps={{ lang: "en" as const }}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Sheet"
        component={Sheet}
        defaultProps={{ lang: "en", frames: [0, 78, 84, 899], cols: 4 } satisfies SheetProps}
        // As long as the promo: a frozen frame is clamped to its composition's length.
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        calculateMetadata={sheetSize}
      />
    </>
  );
}
