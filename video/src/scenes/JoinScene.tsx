import { useTranslation } from "react-i18next";
import { useCurrentFrame } from "remotion";
import { AppleCardPreview, GoogleCardPreview } from "../../../src/components/card-studio/CardPreviews";
import { StandeeSheet } from "../../../src/components/dashboard/Standee";
import { samplePass, sampleSign, tradeTemplate } from "../../../src/components/marketing/samples";
import { SMS_CODE, SITE_URL } from "../config";
import { light, sec } from "../motion";
import { Caption, SafeArea, Scaled, Stack, Tag, useHebrew } from "../pieces";

/** When each line comes on, from the beat's start. */
export const JOIN = { code: sec(2.4), wallet: sec(4.8) } as const;

/**
 * 2. The join. The sign at the counter (the standee's own sheet, as the
 * landing page shows it), then the card in both wallets: the real Apple and
 * Google previews, each in its 300px slot. The form itself isn't shown, so
 * its consent box doesn't come up; the words say what a customer gives.
 */
export function JoinScene() {
  const { t } = useTranslation();
  const frame = useCurrentFrame();
  const hebrew = useHebrew();
  const template = tradeTemplate("barber");
  // The sample sign's code leads to the site, never to a join page that
  // doesn't exist (samples.ts reads the page's own address, which here is
  // the renderer's).
  const art = { ...sampleSign(template, t, true), enrollUrl: SITE_URL };
  const pass = samplePass(template, t, template.currentStamps + 1);

  return (
    <SafeArea>
      <Stack className="min-h-[170px] items-start">
        <div style={light(frame, 0, JOIN.code)}>
          <Caption>{t("video:join.scan")}</Caption>
        </div>
        <div style={light(frame, JOIN.code, JOIN.wallet)}>
          <Caption>{t(SMS_CODE ? "video:join.code" : "video:join.codeOff")}</Caption>
        </div>
        <div style={light(frame, JOIN.wallet)}>
          <Caption>{t("video:join.wallet")}</Caption>
        </div>
      </Stack>

      <Stack className="mt-[72px] flex-1 place-items-start justify-items-center">
        <div className="relative w-[640px]" style={light(frame, 0, JOIN.wallet)}>
          <StandeeSheet
            design="counter"
            format="a5"
            language={hebrew ? "he" : "en"}
            single
            art={art}
            className="rounded-md shadow-panel-lift ring-1 ring-rim/10"
          />
          <Tag foot>{t("landing.hero.counter.sign")}</Tag>
        </div>

        <div className="flex w-full items-start justify-center gap-[40px] pt-[120px]">
          <div style={light(frame, JOIN.wallet)}>
            <Scaled width={300} scale={1.466} overlay={<Tag foot>{t("studio.preview.apple")}</Tag>}>
              <AppleCardPreview {...pass} />
            </Scaled>
          </div>
          <div style={light(frame, JOIN.wallet + 4)}>
            <Scaled width={300} scale={1.466} overlay={<Tag foot>{t("studio.preview.google")}</Tag>}>
              <GoogleCardPreview {...pass} />
            </Scaled>
          </div>
        </div>
      </Stack>
    </SafeArea>
  );
}
