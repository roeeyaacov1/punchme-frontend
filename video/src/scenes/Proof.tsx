import { useTranslation } from "react-i18next";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { ProofStat } from "../../../src/components/marketing/SourceLabel";
import { SLAMS } from "../cues.ts";
import { progress } from "../motion.ts";
import { Lead } from "../pieces";
import { Slam } from "../stage/Slam";

/**
 * Beat 8: the one sourced figure, as the landing page prints it, in its own
 * words: Square's "6x", its claim, and its source, which comes on with the
 * figure and stays the whole time it does. Printed, never counted.
 */
export function Proof() {
  const { t } = useTranslation();
  const f = useCurrentFrame();
  const stats = t("landing.proof.stats", { returnObjects: true }) as ProofStat[];
  const stat = stats.find((s) => s.id === "square")!;
  const at = SLAMS.proof![0];
  const words = progress(f, at, 4);
  return (
    <AbsoluteFill className="items-center justify-center" style={{ paddingInline: 96, paddingBottom: 120 }}>
      <Slam at={at} size={stat.value.length > 3 ? 220 : 300} className="whitespace-nowrap">
        {stat.value}
      </Slam>
      <Lead size={60} className="mt-[40px] text-ink" style={{ opacity: words }}>
        {stat.claim}
      </Lead>
      <div className="mt-[48px] h-[3px] w-[160px] bg-border-strong" style={{ opacity: words }} />
      <Lead size={38} className="mt-[40px]" style={{ opacity: words }}>
        {stat.source}
      </Lead>
    </AbsoluteFill>
  );
}
