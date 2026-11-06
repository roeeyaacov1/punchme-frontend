import { useTranslation } from "react-i18next";
import { Cake, Gift, UserRoundX, type LucideIcon } from "lucide-react";
import { useCurrentFrame } from "remotion";
import { AppleCardPreview } from "../../../src/components/card-studio/CardPreviews";
import { WallpaperStage } from "../../../src/components/kit/WallpaperStage";
import { landedStamps, samplePass, tradeTemplate } from "../../../src/components/marketing/samples";
import { SITE_PX, light, progress, sec } from "../motion";
import { Caption, Lead, SafeArea, Scaled, Stack } from "../pieces";

export const AFTER = {
  /** The sample message comes down onto the lock screen. */
  message: sec(0.9),
  /** The stage goes, and the three rules come on. */
  rules: sec(4.0),
} as const;

/** The three automatic rules, with the Messages page's marks (AfterTheyLeave.tsx). */
const RULES: { kind: "inactive" | "birthday" | "reward_waiting"; icon: LucideIcon }[] = [
  { kind: "inactive", icon: UserRoundX },
  { kind: "birthday", icon: Cake },
  { kind: "reward_waiting", icon: Gift },
];

/** The stage at the site's own phone scale, so its words land near the frame's floor. */
const STAGE_SCALE = SITE_PX;
/** How much of the stage shows: the message and the top of the card. */
const WINDOW = 972;

/**
 * 4. After they walk out. The landing page's lock screen: the kit's
 * `WallpaperStage` with the card and the sample "We miss you", labelled as a
 * sample and as iPhone's (on Android the message appears on the card, without
 * the alert). No line under the title: the message on the lock screen says
 * it, and the screen keeps to about twelve words. The message arrives as the stage brings it, rebuilt from frames:
 * the last 8px down as it lights on, over 240ms. Then the three automatic
 * rules by name, set once and sending on their own.
 *
 * The stage stands at the site's phone scale and is framed to its top, the
 * message and the head of the card, so the message reads; the stage's own
 * "Roughly how it looks on the lock screen", which that framing leaves out,
 * is set under it at frame size.
 */
export function AfterScene() {
  const { t } = useTranslation();
  const frame = useCurrentFrame();
  const template = tradeTemplate("barber");
  const business = t(`landing.templates.items.${template.key}.business`);
  const title = t("landing.after.message.title");
  const arrived = progress(frame, AFTER.message, 240);

  return (
    <SafeArea>
      <Caption size={76}>{t("landing.after.title")}</Caption>

      <Stack className="mt-[40px] flex-1 place-items-start justify-items-center">
        <div className="flex flex-col items-center" style={light(frame, 0, AFTER.rules)}>
          <span
            className="inline-flex items-center whitespace-nowrap rounded-full border-[3px] border-border-strong font-body font-semibold text-ink-muted"
            style={{ fontSize: 40, lineHeight: 1.3, minHeight: 68, paddingInline: 28 }}
          >
            {t("video:after.badge")}
          </span>
          <div
            className="video-stage relative mt-[28px] overflow-hidden"
            style={{ height: WINDOW, borderRadius: 28 * STAGE_SCALE }}
          >
            <style>{`.video-stage figure > div > div:first-child { opacity: ${arrived}; transform: translateY(${(arrived - 1) * 8}px); }`}</style>
            <Scaled width={340} scale={STAGE_SCALE}>
              <WallpaperStage
                cardColor={template.backgroundColor}
                stampColor={template.stampColor}
                foregroundColor={template.foregroundColor}
                notification={{ sender: business, title, body: t("landing.after.message.body") }}
                summary={t("landing.after.stageSummary", { title, business })}
              >
                <AppleCardPreview {...samplePass(template, t, landedStamps(template))} />
              </WallpaperStage>
            </Scaled>
          </div>
          <Lead size={40} style={{ marginTop: 24 }}>
            {t("messaging.editor.previewLabel")}
          </Lead>
        </div>

        <div className="flex w-full flex-col" style={{ gap: 48 }}>
        <div style={light(frame, AFTER.rules)}>
          <Caption size={60}>{t("video:after.rules")}</Caption>
        </div>
        <ul className="flex w-full flex-col gap-[28px]">
          {RULES.map((rule, index) => {
            const Icon = rule.icon;
            return (
              <li
                key={rule.kind}
                className="flex items-center gap-[40px] rounded-[64px] border-2 border-border bg-surface px-[48px] py-[40px] shadow-panel"
                style={light(frame, AFTER.rules + 4 + index * 4)}
              >
                <span className="flex size-[120px] shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink">
                  <Icon aria-hidden className="size-[60px]" />
                </span>
                <span className="font-heading font-medium text-ink" style={{ fontSize: 64, lineHeight: 1.2 }}>
                  {t(`messaging.kinds.${rule.kind}`)}
                </span>
              </li>
            );
          })}
        </ul>
        </div>
      </Stack>
    </SafeArea>
  );
}
