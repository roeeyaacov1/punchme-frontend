import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { StandeeSheet } from "../../../src/components/dashboard/Standee";
import { sampleSign, tradeTemplate } from "../../../src/components/marketing/samples";
import { SITE_URL, SMS_CODE } from "../config";
import { MOMENTS, SLAMS } from "../cues.ts";
import { EASE_OUT, IN_OUT, OVERSHOOT, lerp, progress } from "../motion.ts";
import { HERO } from "../looks";
import { Lead, Tag, useHebrew } from "../pieces";
import { Brackets, Flash } from "../stage/Camera";
import { LookCard, PASS_H } from "../stage/LookCard";
import { Slam } from "../stage/Slam";
import { beatStart } from "../timeline.ts";

/** The sign at the counter: the standee's own A5 sheet, drawn at this width. */
const SIGN = { left: 280, top: 790, width: 520 } as const;

/** The beat's moments, from its first frame. */
const J = {
  signIn: 8,
  aim: 22,
  flash: MOMENTS.joinFlash - beatStart("join"),
  rise: 40,
  fan: 60,
  tags: 70,
} as const;

/** The pair, fanned: each pass at 1.45 (435px wide), their tops here. */
const PAIR = { s: 1.45, top: 790, apart: 205, tilt: 7 } as const;

/**
 * Beat 3: "Scan the sign." The standee's sign drops in, a phone's corners
 * close on its code, the flash; the pass rises out of the code, and
 * Google's slides out from behind Apple's, the two fanned apart.
 */
export function Join() {
  const { t } = useTranslation();
  const f = useCurrentFrame();
  const hebrew = useHebrew();
  const lang = hebrew ? "he" : "en";
  // The sample sign's code leads to the site, never to a join page that doesn't exist.
  const art = { ...sampleSign(tradeTemplate("barber"), t, true), enrollUrl: SITE_URL };
  const qr = useQrCentre();

  const signIn = progress(f, J.signIn, 10, OVERSHOOT);
  const signOut = progress(f, J.rise, 12, EASE_OUT);
  const qrX = SIGN.left + qr.x;
  const qrY = SIGN.top + qr.y;

  // The pass: out of the code, small, to the middle; then the pair parts.
  const rise = progress(f, J.rise, 18, IN_OUT);
  const fan = progress(f, J.fan, 14, OVERSHOOT);
  const side = hebrew ? -1 : 1;
  const s = lerp(0.35, PAIR.s, rise);
  const middleTop = lerp(qrY - (PASS_H * 0.35) / 2, PAIR.top, rise);
  const appleX = lerp(qrX, 540, rise) - side * PAIR.apart * fan;
  const googleX = 540 + side * PAIR.apart * fan;
  const tags = progress(f, J.tags, 6);

  return (
    <AbsoluteFill>
      <div className="absolute inset-x-[80px] flex flex-col items-center gap-[24px]" style={{ top: 370 }}>
        <Slam at={SLAMS.join![0]} size={100}>
          {t("video:join.scan")}
        </Slam>
        <Lead size={50} style={{ opacity: progress(f, 16, 6) }}>
          {t(SMS_CODE ? "video:join.code" : "video:join.codeOff")}
        </Lead>
      </div>

      {signOut < 1 && (
        <div
          className="absolute"
          style={{
            left: SIGN.left,
            top: SIGN.top,
            width: SIGN.width,
            opacity: progress(f, J.signIn, 3) * (1 - signOut),
            transform: `scale(${lerp(1.25, 1, signIn) * lerp(1, 0.9, signOut)})`,
          }}
        >
          <div ref={qr.ref}>
            <StandeeSheet design="counter" format="a5" language={lang} single art={art} className="rounded-md shadow-panel-lift ring-1 ring-rim/10" />
          </div>
          <Tag foot style={{ opacity: 1 - signOut }}>
            {t("landing.hero.counter.sign")}
          </Tag>
        </div>
      )}
      <Brackets x={qrX} y={qrY} size={qr.size * 1.15} at={J.aim} frame={f} out={J.rise} />

      {f >= J.rise && (
        <>
          <div
            className="absolute"
            style={{
              left: googleX - 150 * PAIR.s,
              top: PAIR.top,
              opacity: progress(f, J.fan, 3),
              transform: `rotate(${side * PAIR.tilt * fan}deg)`,
            }}
          >
            <LookCard
              preset={HERO}
              stamps={0}
              platform="google"
              scale={PAIR.s}
              overlay={
                <Tag foot style={{ opacity: tags }}>
                  {t("studio.preview.google")}
                </Tag>
              }
            />
          </div>
          <div
            className="absolute"
            style={{
              left: appleX - 150 * s,
              top: middleTop,
              opacity: progress(f, J.rise, 3),
              transform: `rotate(${-side * PAIR.tilt * fan}deg)`,
            }}
          >
            <LookCard
              preset={HERO}
              stamps={0}
              scale={s}
              overlay={
                <Tag foot style={{ opacity: tags }}>
                  {t("studio.preview.apple")}
                </Tag>
              }
            />
          </div>
        </>
      )}
      <Flash at={J.flash} frame={f} />
    </AbsoluteFill>
  );
}

/**
 * Where the sign's code is, inside the sign: the largest drawing in it,
 * read from the page in the sign's own pixels at whatever scale it is drawn.
 */
function useQrCentre() {
  const ref = useRef<HTMLDivElement>(null);
  const [centre, setCentre] = useState({ x: SIGN.width / 2, y: 300, size: 300 });
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    if (box.width === 0) return;
    const unit = SIGN.width / box.width;
    let best: DOMRect | null = null;
    for (const svg of root.querySelectorAll("svg")) {
      const rect = svg.getBoundingClientRect();
      if (!best || rect.width * rect.height > best.width * best.height) best = rect;
    }
    if (!best) return;
    const next = { x: (best.left - box.left + best.width / 2) * unit, y: (best.top - box.top + best.height / 2) * unit, size: best.width * unit };
    if (Math.abs(next.x - centre.x) + Math.abs(next.y - centre.y) + Math.abs(next.size - centre.size) > 1) setCentre(next);
  });
  return { ref, ...centre };
}
