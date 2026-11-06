import { useTranslation } from "react-i18next";
import { interpolate } from "remotion";
import { AppleCardPreview } from "../../../src/components/card-studio/CardPreviews";
import { samplePass, tradeTemplate, type TradeKey } from "../../../src/components/marketing/samples";
import { ACTIVATION_MS, EASE_OUT, SITE_PX, ms, progress, sec, useBeat } from "../motion";
import { Caption, Lead, Lines, Logo, SafeArea, Scaled, Stack } from "../pieces";

/**
 * When each trade's card comes on, from the beat's start: the barbershop
 * from the first frame, the café, the studio, and the barbershop again, so
 * the card the rest of the video follows is the one the beat ends on.
 */
const CYCLE: { trade: TradeKey; at: number }[] = [
  { trade: "barber", at: -1 },
  { trade: "cafe", at: sec(1.3) },
  { trade: "trainer", at: sec(2.5) },
  { trade: "barber", at: sec(3.7) },
];

/** The landing page's crossover between trades: `--duration-crossfade`. */
const CROSSFADE_MS = 300;

/**
 * 1. The promise. Frame 0 is the thumbnail WhatsApp shows, so the logo, the
 * headline, the three noes and the sample card are all there from the first
 * frame; the field light behind the card comes on, as an activation. Then
 * the card crosses over through the landing page's three trades where it
 * stands, each a layer fading in over the last as the trade switch does,
 * and comes back to the barbershop.
 */
export function PromiseScene() {
  const { t } = useTranslation();
  const { t: frame } = useBeat();
  const lit = interpolate(frame, [0, ms(ACTIVATION_MS)], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <SafeArea>
      <Logo height={56} />
      <Caption size={100} style={{ marginTop: 40 }}>
        <Lines text={t("landing.hero.headline")} atComma />
      </Caption>
      <Lead style={{ marginTop: 20 }}>{t("video:promise.lead")}</Lead>
      <div className="relative mt-[52px] flex w-full flex-1 items-start justify-center pt-[64px]">
        <div
          aria-hidden
          className="theme-lit lit-field absolute inset-0"
          style={{ opacity: lit, borderRadius: 40 * SITE_PX }}
        />
        <Stack style={{ width: 300 * 2.05 }}>
          {CYCLE.map(({ trade, at }, index) => {
            // Each layer stands until the one after it is fully over it.
            const next = CYCLE[index + 1]?.at;
            if (at >= 0 && frame < at) return null;
            if (next !== undefined && frame >= next + ms(CROSSFADE_MS)) return null;
            const template = tradeTemplate(trade);
            return (
              <div key={index} style={{ opacity: at < 0 ? 1 : progress(frame, at, CROSSFADE_MS) }}>
                <Scaled width={300} scale={2.05}>
                  <div className="font-normal not-italic leading-normal tracking-normal">
                    <AppleCardPreview {...samplePass(template, t, template.currentStamps)} />
                  </div>
                </Scaled>
              </div>
            );
          })}
        </Stack>
      </div>
    </SafeArea>
  );
}
