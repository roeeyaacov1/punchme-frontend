import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Cake, Gift, UserRoundX, type LucideIcon } from "lucide-react";
import { AbsoluteFill, interpolate } from "remotion";
import { AppleCardPreview } from "../../../src/components/card-studio/CardPreviews";
import { WallpaperStage } from "../../../src/components/kit/WallpaperStage";
import { samplePass, tradeTemplate } from "../../../src/components/marketing/samples";
import {
  EXIT_LEAD,
  IN_OUT,
  IN_VIEW,
  MOVE_MS,
  OVERSHOOT,
  SITE_PX,
  between,
  clipTo,
  lerpRect,
  light,
  ms,
  progress,
  sec,
  useBeat,
  type Rect,
} from "../motion";
import { Card, Lead, SafeArea, Say, Scaled } from "../pieces";

export const AFTER = {
  /** The sample message comes down onto the lock screen. */
  message: sec(1.3),
  /** The gift stamp it speaks of is on the card. */
  gift: sec(1.6),
  /** The lock screen goes, and the three rules come on. */
  rules: sec(4.2),
} as const;

/** The three automatic rules, with the Messages page's marks (AfterTheyLeave.tsx). */
const RULES: { kind: "inactive" | "birthday" | "reward_waiting"; icon: LucideIcon }[] = [
  { kind: "inactive", icon: UserRoundX },
  { kind: "birthday", icon: Cake },
  { kind: "reward_waiting", icon: Gift },
];

/** The stage at the site's own phone scale, so its words land near the frame's floor. */
const STAGE_SCALE = SITE_PX;
/** The lock screen's window: the message and the head of the card. */
const WIN: Rect = { x: 540 - (340 * STAGE_SCALE) / 2, y: 450, w: 340 * STAGE_SCALE, h: 972, r: 28 * STAGE_SCALE };
/** Where that window closes in from: round the card as the camera left it, inside the safe area. */
const OPEN: Rect = { x: 0, y: WIN.y - 110, w: 1080, h: WIN.h + 280, r: WIN.r };

/**
 * 4. After they walk out. The card leaves the camera, and the landing
 * page's lock screen builds round it: the kit's `WallpaperStage`, its window
 * closing in as its wallpaper lights. The card is back to zero, the reward
 * given; the sample "We miss you" comes down as the stage brings a message
 * (the last 8px as it lights on, over 240ms), and the free stamp it speaks of
 * is on the card a moment later, at once, as Wallet shows it. Labelled as a
 * sample and as iPhone's: on Android the message appears on the card,
 * without the alert. Then the three automatic rules by name, set once and
 * sending on their own, each mark landing like a stamp.
 *
 * The stage stands at the site's phone scale and is framed to its top, so
 * the message reads; the stage's own "Roughly how it looks on the lock
 * screen", which that framing leaves out, is set under it at frame size.
 */
export function AfterScene() {
  const { t } = useTranslation();
  const { t: f } = useBeat();
  const template = tradeTemplate("barber");
  const business = t(`landing.templates.items.${template.key}.business`);
  const title = t("landing.after.message.title");

  // Where the stage keeps the card's place: under the message.
  const stage = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState(96);
  useLayoutEffect(() => {
    const height = stage.current?.querySelector<HTMLElement>("figure > div > div:first-child")?.offsetHeight;
    if (height && Math.abs(height - message) > 0.5) setMessage(height);
  });
  const slot = { cx: 540, top: WIN.y + (24 + message + 12) * STAGE_SCALE, s: STAGE_SCALE };

  const at = between(IN_VIEW, slot, progress(f, 0, MOVE_MS + 100, IN_OUT));
  const window = lerpRect(OPEN, WIN, progress(f, sec(0.15), MOVE_MS, IN_OUT));
  // The wallpaper lights as the window draws in, not before.
  const wallpaper = progress(f, sec(0.15) + ms(MOVE_MS * 0.4), 360);
  const arrived = progress(f, AFTER.message, 240);
  // The lock screen goes as the rules come: its light out, a step back.
  const gone = progress(f, AFTER.rules - EXIT_LEAD, 270);
  const stageOut = { opacity: 1 - gone, transform: `scale(${1 - 0.03 * gone})`, transformOrigin: "540px 900px" };

  return (
    <AbsoluteFill>
      <AbsoluteFill style={stageOut}>
        <AbsoluteFill style={{ clipPath: clipTo(window) }}>
          <div ref={stage} className="video-stage absolute" style={{ left: WIN.x, top: WIN.y, opacity: wallpaper }}>
            <style>{`.video-stage figure > div > div:first-child { opacity: ${arrived}; transform: translateY(${(arrived - 1) * 8}px); }`}</style>
            <Scaled width={340} scale={STAGE_SCALE}>
              <WallpaperStage
                cardColor={template.backgroundColor}
                stampColor={template.stampColor}
                foregroundColor={template.foregroundColor}
                notification={{ sender: business, title, body: t("landing.after.message.body") }}
                summary={t("landing.after.stageSummary", { title, business })}
              >
                {/* The card's place, kept; the card itself comes in from the camera. */}
                <div className="invisible">
                  <AppleCardPreview {...samplePass(template, t, 0)} />
                </div>
              </WallpaperStage>
            </Scaled>
          </div>
          <Card at={at} stamps={f < AFTER.gift ? 0 : 1} />
        </AbsoluteFill>

        <div className="absolute inset-x-0 flex justify-center" style={{ top: 345, ...light(f, sec(0.5)) }}>
          <span
            className="inline-flex items-center whitespace-nowrap rounded-full border-[3px] border-border-strong font-body font-semibold text-ink-muted"
            style={{ fontSize: 40, lineHeight: 1.3, minHeight: 68, paddingInline: 28 }}
          >
            {t("video:after.badge")}
          </span>
        </div>
        <div className="absolute inset-x-0" style={{ top: WIN.y + WIN.h + 28, ...light(f, sec(0.9)) }}>
          <Lead size={40}>{t("messaging.editor.previewLabel")}</Lead>
        </div>
      </AbsoluteFill>

      <SafeArea>
        <Say text={t("landing.after.title")} on={0} size={76} />
        <div className="mt-[40px] flex w-full flex-col" style={{ gap: 48 }}>
          <Say text={t("video:after.rules")} on={AFTER.rules} size={60} />
          <ul className="flex w-full flex-col gap-[28px]">
            {RULES.map((rule, index) => {
              const Icon = rule.icon;
              const on = AFTER.rules + sec(0.25) + index * 4;
              const mark = interpolate(progress(f, on + 3, 340, OVERSHOOT), [0, 1], [0.6, 1]);
              return (
                <li
                  key={rule.kind}
                  className="flex items-center gap-[40px] rounded-[64px] border-2 border-border bg-surface px-[48px] py-[40px] shadow-panel"
                  style={light(f, on)}
                >
                  <span
                    className="flex size-[120px] shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink"
                    style={{ transform: `scale(${mark})` }}
                  >
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
      </SafeArea>
    </AbsoluteFill>
  );
}
