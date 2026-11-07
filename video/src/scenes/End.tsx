import { useTranslation } from "react-i18next";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SITE_URL } from "../config";
import { MOMENTS } from "../cues.ts";
import { CLAMP, IN_OUT, OVERSHOOT, lerp, progress } from "../motion.ts";
import { SLOT, slotCenter } from "../punch.ts";
import { Logo, Ltr, useHebrew } from "../pieces";
import { stripRect } from "../stage/Strip";
import { STRIP_HANDOFF } from "../strip.ts";
import { SLAMS } from "../cues.ts";
import { FINAL_PUNCHES, beatStart } from "../timeline.ts";

/** The button the full strip becomes. */
const BUTTON = { w: 640, h: 152, cy: FINAL_PUNCHES[0].cy } as const;
const MORPH = 14;

/**
 * The last beat: the logo lands; the last two stamps are punched out side by
 * side, on beats three and four, and fly to the strip, which is full on the
 * downbeat and turns gold, the reward; then the strip comes down over the
 * holes they left and becomes "Start free", coral with its label in ink,
 * the address under it.
 */
export function End() {
  const { t } = useTranslation();
  const f = useCurrentFrame();
  const hebrew = useHebrew();
  const start = beatStart("end");
  const handoff = STRIP_HANDOFF - start;
  const morph = progress(f, handoff, MORPH, IN_OUT);
  const logoAt = SLAMS.end![0];
  const logo = progress(f, logoAt, 6, OVERSHOOT);

  // The holes the last two stamps leave, filled by the button as it lands.
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
      <div className="absolute inset-x-0 flex justify-center" style={{ top: 640, opacity: progress(f, logoAt - 1, 1), transform: `scale(${lerp(1.35, 1, logo)})` }}>
        <Logo height={150} />
      </div>
      {FINAL_PUNCHES.filter((p) => f >= p.at - start && morph < 1).map((p) => (
        <div
          key={p.slot}
          className="absolute rounded-full bg-ink"
          style={{
            left: p.cx - 130,
            top: p.cy - 130,
            width: 260,
            height: 260,
            transform: `scale(${holeScale})`,
            boxShadow: "inset 0 26px 40px rgb(0 0 0 / 0.6)",
          }}
        />
      ))}
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
