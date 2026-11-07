import { useTranslation } from "react-i18next";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SITE_URL } from "../config";
import { MOMENTS } from "../cues.ts";
import { CLAMP, IN_OUT, OVERSHOOT, lerp, progress } from "../motion.ts";
import { SLOT, slotCenter } from "../punch.ts";
import { Logo, Ltr, useHebrew } from "../pieces";
import { stripRect } from "../stage/Strip";
import { STRIP_HANDOFF } from "../strip.ts";
import { FINAL_PUNCH, beatStart } from "../timeline.ts";

/** The button the full strip becomes. */
const BUTTON = { w: 640, h: 152, cy: FINAL_PUNCH.cy } as const;
const MORPH = 14;

/**
 * Beat 10: the logo lands; the tenth stamp is punched out of the middle and
 * flies to the strip, which is full and turns gold, the reward; then the
 * strip comes down into the hole it left and becomes "Start free", coral
 * with its label in ink, the address under it.
 */
export function End() {
  const { t } = useTranslation();
  const f = useCurrentFrame();
  const hebrew = useHebrew();
  const start = beatStart("end");
  const punch = FINAL_PUNCH.at - start;
  const handoff = STRIP_HANDOFF - start;
  const morph = progress(f, handoff, MORPH, IN_OUT);
  const logo = progress(f, 6, 6, OVERSHOOT);

  // The hole the tenth stamp leaves, filled by the button as it lands.
  const hole = f >= punch && morph < 1;
  const holeScale = 1 - morph;

  // The strip, from its place to the button's.
  const from = stripRect();
  const pad = { x: 26, y: 18 };
  const box = {
    x: lerp(from.x - pad.x, 540 - BUTTON.w / 2, morph),
    y: lerp(from.y - pad.y, BUTTON.cy - BUTTON.h / 2, morph),
    w: lerp(from.w + pad.x * 2, BUTTON.w, morph),
    h: lerp(from.h + pad.y * 2, BUTTON.h, morph),
  };
  const coral = interpolate(f, [handoff + 4, handoff + MORPH], [0, 1], CLAMP);
  const slots = 1 - interpolate(f, [handoff, handoff + 7], [0, 1], CLAMP);
  const label = interpolate(f, [handoff + 9, handoff + MORPH], [0, 1], CLAMP);
  const gold = MOMENTS.full - start;

  return (
    <AbsoluteFill>
      <div className="absolute inset-x-0 flex justify-center" style={{ top: 640, opacity: progress(f, 6, 2), transform: `scale(${lerp(1.35, 1, logo)})` }}>
        <Logo height={150} />
      </div>
      {hole && (
        <div
          className="absolute rounded-full bg-ink"
          style={{
            left: FINAL_PUNCH.cx - 130,
            top: FINAL_PUNCH.cy - 130,
            width: 260,
            height: 260,
            transform: `scale(${holeScale})`,
            boxShadow: "inset 0 26px 40px rgb(0 0 0 / 0.6)",
          }}
        />
      )}
      {f >= handoff && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: box.x,
            top: box.y,
            width: box.w,
            height: box.h,
            borderRadius: lerp(30, BUTTON.h / 2, morph),
            background: `color-mix(in srgb, #f67748 ${coral * 100}%, #f0b429)`,
            // From the strip as it stands, border, shadow and all, to the button.
            border: `2px solid rgb(216 204 187 / ${1 - morph})`,
            boxShadow: `0 ${lerp(12, 18, morph)}px ${lerp(32, 40, morph)}px rgb(43 37 33 / ${lerp(0.16, 0.22, morph)})`,
          }}
        >
          {slots > 0 &&
            Array.from({ length: 10 }, (_, i) => {
              const c = slotCenter(i, hebrew);
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: ((c.x - SLOT.size / 2 - (from.x - pad.x)) / (from.w + pad.x * 2)) * box.w,
                    top: ((c.y - SLOT.size / 2 - (from.y - pad.y)) / (from.h + pad.y * 2)) * box.h,
                    width: SLOT.size * (box.w / (from.w + pad.x * 2)),
                    height: SLOT.size * (box.h / (from.h + pad.y * 2)),
                    opacity: slots,
                    background: f >= gold ? "#f0b429" : "#f67748",
                    boxShadow: "inset 0 0 0 4px rgb(43 37 33)",
                  }}
                />
              );
            })}
          <span className="font-heading font-bold text-ink" style={{ fontSize: 72, opacity: label }}>
            {t("landing.hero.cta")}
          </span>
        </div>
      )}
      <div
        className="absolute inset-x-0 text-center font-heading font-medium text-ink"
        style={{ top: BUTTON.cy + BUTTON.h / 2 + 48, fontSize: 60, opacity: progress(f, handoff + MORPH + 2, 6) }}
      >
        <Ltr>{new URL(SITE_URL).host}</Ltr>
      </div>
    </AbsoluteFill>
  );
}
