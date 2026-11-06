import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StandeeSheet } from "../../../src/components/dashboard/Standee";
import { sampleSign, tradeTemplate } from "../../../src/components/marketing/samples";
import { SITE_URL, SMS_CODE } from "../config";
import {
  APPLE_H,
  IN_OUT,
  LIGHTS_ON_MS,
  MOVE_MS,
  PAIR,
  SWEEP_HALF,
  between,
  light,
  progress,
  sec,
  useBeat,
  type At,
} from "../motion";
import { Card, SafeArea, Say, Stack, Tag, useHebrew } from "../pieces";
import { Reticle } from "./Reticle";

/** When each line comes on, from the beat's start. */
export const JOIN = { code: sec(2.0), wallet: sec(4.0) } as const;

/** The sign at the counter: the standee's own A5 sheet, drawn at this width. */
const SIGN = { left: 220, top: 470, width: 640 } as const;

/**
 * 2. The join. The sign at the counter (the standee's own sheet, as the
 * landing page shows it), a phone's camera locking onto its code, and then
 * the card: it rises out of the code into the middle of the frame, and the
 * Google Wallet card slides out from behind the Apple one, the two side by
 * side, each the real preview in its 300px slot. The card has no stamps
 * yet: it has just been joined. The form itself isn't shown, so its consent
 * box doesn't come up; the words say what a customer gives.
 */
export function JoinScene() {
  const { t } = useTranslation();
  const { t: f, length } = useBeat();
  const hebrew = useHebrew();
  const lang = hebrew ? "he" : "en";
  const template = tradeTemplate("barber");
  // The sample sign's code leads to the site, never to a join page that
  // doesn't exist (samples.ts reads the page's own address, which here is
  // the renderer's).
  const art = { ...sampleSign(template, t, true), enrollUrl: SITE_URL };

  const qr = useQrCentre();
  const W = JOIN.wallet;

  // The sign goes as the card comes out of its code, the card already
  // rising before the sign's light is out.
  const rise = W - 8;
  const signOut = progress(f, rise + 2, 360);
  const lockOn = progress(f, sec(0.5), 450, IN_OUT);

  // The card: from the code, small, to the middle; then the pair parts.
  const fromCode: At = { cx: SIGN.left + qr.x, top: SIGN.top + qr.y - (APPLE_H * 0.3) / 2, s: 0.3 };
  const middle: At = { cx: 540, top: PAIR.top, s: PAIR.s };
  const grow = progress(f, rise, MOVE_MS, IN_OUT);
  const part = progress(f, W + sec(0.7), MOVE_MS, IN_OUT);
  const apple = part > 0 ? between(middle, { ...middle, cx: PAIR.start[lang] }, part) : between(fromCode, middle, grow);
  // Google goes out to the end side as the scan takes the Apple card.
  const away = progress(f, length - sec(0.6), 300, IN_OUT);
  const outward = (PAIR.end[lang] > 540 ? 1 : -1) * 60 * away;
  const google = between(middle, { ...middle, cx: PAIR.end[lang] + outward }, part);
  const tagsOn = W + sec(1.35);

  return (
    <SafeArea>
      <Stack className="min-h-[170px] items-start">
        <Say text={t("video:join.scan")} on={-1} off={JOIN.code} />
        <Say text={t(SMS_CODE ? "video:join.code" : "video:join.codeOff")} on={JOIN.code} off={JOIN.wallet} />
        <Say text={t("video:join.wallet")} on={JOIN.wallet} off={length} />
      </Stack>

      <div
        className="absolute"
        style={{
          left: SIGN.left,
          top: SIGN.top,
          width: SIGN.width,
          opacity: 1 - signOut,
          transform: `scale(${1 - 0.04 * signOut})`,
        }}
      >
        <div ref={qr.ref}>
          <StandeeSheet
            design="counter"
            format="a5"
            language={lang}
            single
            art={art}
            className="rounded-md shadow-panel-lift ring-1 ring-rim/10"
          />
        </div>
        <Tag foot>{t("landing.hero.counter.sign")}</Tag>
        {/* A phone's camera locking onto the code, in the scan's own corners. */}
        <div
          className="absolute text-light"
          style={{
            left: qr.x - (qr.size * 1.3) / 2,
            top: qr.y - (qr.size * 1.3) / 2,
            width: qr.size * 1.3,
            height: qr.size * 1.3,
            opacity: lockOn,
            transform: `scale(${1.35 - 0.35 * lockOn})`,
          }}
        >
          <Reticle frame={f - sec(0.9)} line={f >= sec(0.9)} />
        </div>
      </div>

      {f >= rise && (
        <>
          <Card
            at={google}
            stamps={0}
            platform="google"
            style={{ opacity: part * (1 - away) }}
            overlay={
              <Tag foot style={light(f, tagsOn, length - sec(0.45))}>
                {t("studio.preview.google")}
              </Tag>
            }
          />
          <Card
            at={apple}
            stamps={0}
            style={{
              opacity: progress(f, rise, LIGHTS_ON_MS),
              // The scan holds the card from here on.
              visibility: f >= length - SWEEP_HALF ? "hidden" : undefined,
            }}
            overlay={
              <Tag foot style={light(f, tagsOn, length - sec(0.45))}>
                {t("studio.preview.apple")}
              </Tag>
            }
          />
        </>
      )}
    </SafeArea>
  );
}

/**
 * Where the sign's code is, inside the sign: the largest drawing in it. Read
 * from the page, in the sign's own pixels, whatever scale it is drawn at.
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
    const next = {
      x: (best.left - box.left + best.width / 2) * unit,
      y: (best.top - box.top + best.height / 2) * unit,
      size: best.width * unit,
    };
    if (Math.abs(next.x - centre.x) + Math.abs(next.y - centre.y) + Math.abs(next.size - centre.size) > 1) setCentre(next);
  });
  return { ref, ...centre };
}
