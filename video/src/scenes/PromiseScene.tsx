import { useTranslation } from "react-i18next";
import { interpolate, useCurrentFrame } from "remotion";
import { AppleCardPreview } from "../../../src/components/card-studio/CardPreviews";
import { samplePass, tradeTemplate } from "../../../src/components/marketing/samples";
import { EASE_OUT, SITE_PX, ms } from "../motion";
import { Caption, Lead, Lines, Logo, SafeArea, Scaled } from "../pieces";

/** Activation, the card's panel switching from unlit to lit: 600ms, once. */
const ACTIVATION_MS = 600;

/**
 * 1. The promise. Frame 0 is the thumbnail WhatsApp shows, so the logo, the
 * headline, the three noes and the sample card are all there from the first
 * frame; only the field light behind the card comes on, as an activation.
 */
export function PromiseScene() {
  const { t } = useTranslation();
  const frame = useCurrentFrame();
  const template = tradeTemplate("barber");
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
        <Scaled width={300} scale={2.05}>
          <AppleCardPreview {...samplePass(template, t, template.currentStamps)} />
        </Scaled>
      </div>
    </SafeArea>
  );
}
