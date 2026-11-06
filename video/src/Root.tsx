import { Composition } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./motion";
import { DURATION, Promo } from "./Promo";

/** The same scenes twice, in Hebrew and in English. */
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
    </>
  );
}
