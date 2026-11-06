import { useTranslation } from "react-i18next";
import { AbsoluteFill } from "remotion";
import { SLAMS } from "../cues.ts";
import { HERO } from "../looks";
import { LookCard } from "../stage/LookCard";
import { Slam } from "../stage/Slam";
import { Tilt } from "../stage/Tilt";

const [LINE1, LINE2] = SLAMS.hook!;

/** The hero pass's scale and top edge: 600px wide, its middle where the punch lands. */
export const HOOK_CARD = { s: 2.0, top: 690 } as const;

/**
 * Beat 1: "Your punch card, / in Wallet." slams in, and the hero pass, the
 * gold scissors look with three stamps, swings in under it.
 */
export function Hook() {
  const { t } = useTranslation();
  return (
    <AbsoluteFill className="items-center" style={{ paddingTop: 370, paddingInline: 80 }}>
      <Slam at={LINE1} size={100}>{t("video:hook.line1")}</Slam>
      <Slam at={LINE2} size={100}>{t("video:hook.line2")}</Slam>
      <Tilt from={{ ry: -75, rx: 14, z: -500 }} at={LINE2 + 4} settle={20} className="absolute" style={{ top: HOOK_CARD.top }}>
        <LookCard preset={HERO} stamps={3} scale={HOOK_CARD.s} />
      </Tilt>
    </AbsoluteFill>
  );
}
