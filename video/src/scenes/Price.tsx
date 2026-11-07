import { useTranslation } from "react-i18next";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SLAMS } from "../cues.ts";
import { EASE_OUT, ms, progress } from "../motion.ts";
import { Lead, Ltr } from "../pieces";

/**
 * Beat 9: the price, as the landing page prints it, in a panel that
 * switches on like a sign: its edge first, then its light over 600ms
 * (DESIGN.md's activation), the figure with it. Under it, when you pay.
 */
export function Price() {
  const { t } = useTranslation();
  const f = useCurrentFrame();
  const at = SLAMS.price![0];
  const edge = progress(f, at - 6, 4);
  const lit = progress(f, at, ms(600), EASE_OUT);
  return (
    <AbsoluteFill className="items-center justify-center" style={{ paddingInline: 96, paddingBottom: 60 }}>
      <div className="relative w-full" style={{ opacity: edge }}>
        <div aria-hidden className="absolute inset-0 rounded-[64px] border-[3px] border-border-strong" />
        <div aria-hidden className="absolute inset-0 rounded-[64px] border-2 border-border bg-surface shadow-panel" style={{ opacity: lit }} />
        <div className="relative flex flex-col items-center px-[56px] py-[80px] text-center" style={{ opacity: lit, transform: `scale(${0.96 + 0.04 * lit})` }}>
          <span className="type-figure text-ink" style={{ fontSize: 260, lineHeight: 1 }}>
            <Ltr>{t("landing.pricing.pro.price")}</Ltr>
          </span>
          <span className="mt-[28px] font-heading font-medium text-ink" style={{ fontSize: 68, lineHeight: 1.2 }}>
            {t("landing.pricing.pro.per")}
          </span>
        </div>
      </div>
      <Lead size={54} className="mt-[64px]" style={{ opacity: progress(f, at + 15, 4) }}>
        {t("video:price.free")}
      </Lead>
    </AbsoluteFill>
  );
}
