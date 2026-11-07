import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AppleCardPreview } from "../../../src/components/card-studio/CardPreviews";
import { WallpaperStage } from "../../../src/components/kit/WallpaperStage";
import { MOMENTS, SLAMS } from "../cues.ts";
import type { Lang } from "../i18n";
import { EASE_OUT, progress } from "../motion.ts";
import { HERO, lookPass } from "../looks";
import { Scaled } from "../pieces";
import { findStrip, stampInStrip, useInnerBox } from "../stage/measure";
import { Slam } from "../stage/Slam";
import { useImagesReady } from "../stage/useImagesReady";
import { LOCK } from "../layout.ts";
import { beatStart } from "../timeline.ts";
import { StampRing } from "./Stamps";


/**
 * Beat 7: "Then it reminds them to come back." The kit's lock-screen stage,
 * marked as a sample on an iPhone, with the hero pass back at zero: the
 * win-back message comes down onto it, and its free stamp lands.
 */
export function Winback() {
  const { t, i18n } = useTranslation();
  const f = useCurrentFrame();
  const lang = i18n.language as Lang;
  const start = beatStart("winback");
  const ding = MOMENTS.ding - start;
  const gift = MOMENTS.freeStamp - start;
  const stamps = f >= gift ? 1 : 0;
  const pass = useMemo(() => lookPass(HERO, stamps, t, lang), [stamps, t, lang]);
  const business = t("landing.templates.items.barber.business");
  const title = t("landing.after.message.title");
  const arrived = progress(f, ding, 7, EASE_OUT);
  const strip = useInnerBox(340 * LOCK.s, findStrip);
  useImagesReady(strip.ref);
  const ring = strip.box ? stampInStrip(strip.box, 0) : null;

  return (
    <AbsoluteFill>
      <div className="absolute inset-x-[80px] flex flex-col items-center gap-[28px]" style={{ top: 370 }}>
        <Slam at={SLAMS.winback![0]} size={84}>
          {t("video:winback.line")}
        </Slam>
        <span
          className="inline-flex items-center whitespace-nowrap rounded-full border-[3px] border-border-strong font-body font-semibold text-ink-muted"
          style={{ fontSize: 38, lineHeight: 1.3, minHeight: 64, paddingInline: 28, opacity: progress(f, 14, 5) }}
        >
          {t("video:winback.badge")}
        </span>
      </div>
      <div className="video-stage absolute" style={{ left: 540 - 170 * LOCK.s, top: LOCK.top }}>
        <style>{`.video-stage figure > div > div:first-child { opacity: ${arrived}; transform: translateY(${(arrived - 1) * 24}px); }`}</style>
        <div ref={strip.ref}>
          <Scaled width={340} scale={LOCK.s}>
            <WallpaperStage
              cardColor={HERO.background_color}
              stampColor={pass.design.stamp?.color ?? HERO.label_color}
              foregroundColor={HERO.foreground_color}
              notification={{ sender: business, title, body: t("landing.after.message.body") }}
              arrive={f < ding ? "waiting" : "now"}
              summary={t("landing.after.stageSummary", { title, business })}
            >
              <AppleCardPreview {...pass} />
            </WallpaperStage>
          </Scaled>
        </div>
        {ring && <StampRing x={ring.x} y={ring.y} r={ring.r} frame={f - gift} />}
      </div>
    </AbsoluteFill>
  );
}
