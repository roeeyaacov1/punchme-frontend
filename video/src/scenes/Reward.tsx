import { useTranslation } from "react-i18next";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SampleAnswer } from "../../../src/components/marketing/SampleAnswer";
import { tradeTemplate } from "../../../src/components/marketing/samples";
import { MOMENTS, SLAMS } from "../cues.ts";
import { OVERSHOOT, lerp, progress } from "../motion.ts";
import { Scaled } from "../pieces";
import { Slam } from "../stage/Slam";
import { beatStart } from "../timeline.ts";

const SCALE = 2.4;

/**
 * Beat 6, on the dark band: "Card full. / Reward ready." The scan's own
 * answer for a full card, the landing page's `SampleAnswer`, bursts open,
 * its gold lit against the dark.
 */
export function Reward() {
  const { t } = useTranslation();
  const f = useCurrentFrame();
  const at = MOMENTS.reward - beatStart("reward");
  const burst = progress(f, at, 8, OVERSHOOT);
  const [line1, line2] = SLAMS.reward!;
  return (
    <AbsoluteFill>
      <div className="absolute inset-x-[80px] flex flex-col items-center" style={{ top: 370 }}>
        <Slam at={line1} size={110} tone="light">
          {t("video:reward.line1")}
        </Slam>
        <Slam at={line2} size={110} tone="light">
          {t("video:reward.line2")}
        </Slam>
      </div>
      <div
        className="absolute"
        style={{ left: 540 - 150 * SCALE, top: 720, opacity: progress(f, at, 3), transform: `scale(${lerp(0.6, 1, burst)})`, transformOrigin: "50% 40%" }}
      >
        <Scaled width={300} scale={SCALE}>
          <SampleAnswer template={tradeTemplate("barber")} kind="full" count={10} />
        </Scaled>
      </div>
    </AbsoluteFill>
  );
}
