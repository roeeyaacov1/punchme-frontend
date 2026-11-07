import { useCurrentFrame } from "remotion";
import { OVERSHOOT, lerp, progress } from "../motion.ts";
import { SLOT, slotCenter } from "../punch.ts";
import { useHebrew } from "../pieces";
import { STRIP_HANDOFF, panelGold, slotGold } from "../strip.ts";
import { ALL_PUNCHES, PUNCH } from "../timeline.ts";

/** The strip's box on the frame, for the end beat to take it over. */
export function stripRect(): { x: number; y: number; w: number; h: number } {
  const first = slotCenter(0, false);
  const last = slotCenter(9, false);
  return { x: first.x - SLOT.size / 2, y: SLOT.y - SLOT.size / 2, w: last.x - first.x + SLOT.size, h: SLOT.size };
}

/**
 * The video as a punch card: ten slots across the top, each filled by a
 * punched disc as it lands, with a small bounce. When the tenth lands, the
 * card is full and the strip turns gold, the reward's one fill, slot by
 * slot in reading order and then its panel, all of it before the end beat
 * takes it over (`strip.ts`). Empty slots are rings of ink at a quarter, so they
 * read on every ground; a stamp is coral with an ink rim.
 */
export function Strip() {
  const f = useCurrentFrame();
  const rtl = useHebrew();
  if (f >= STRIP_HANDOFF) return null;
  const card = stripRect();
  const rise = progress(f, 8, 10, OVERSHOOT);
  return (
    <>
      <div
        className="absolute rounded-[30px] border-2 border-border-strong"
        style={{
          left: card.x - 26,
          top: card.y - 18,
          width: card.w + 52,
          height: card.h + 36,
          opacity: progress(f, 8, 4),
          background: `color-mix(in srgb, #f0b429 ${panelGold(f) * 100}%, rgb(var(--c-surface)))`,
          transform: `translateY(${(1 - rise) * -40}px)`,
          boxShadow: "0 12px 32px rgb(43 37 33 / 0.16)",
        }}
      />
      {ALL_PUNCHES.map((p, i) => {
        const at = slotCenter(p.slot, rtl);
        const appear = progress(f, 14 + i * 1.5, 8, OVERSHOOT);
        const landed = p.at + PUNCH.flight;
        const filled = f >= landed;
        const bounce = filled ? lerp(1.22, 1, progress(f, landed, 7, OVERSHOOT)) : 1;
        const gold = slotGold(f, i);
        return (
          <div
            key={p.slot}
            className="absolute rounded-full"
            style={{
              left: at.x - SLOT.size / 2,
              top: at.y - SLOT.size / 2,
              width: SLOT.size,
              height: SLOT.size,
              transform: `scale(${appear * bounce})`,
              background: filled ? (gold > 0 ? `color-mix(in srgb, #f0b429 ${gold * 100}%, #f67748)` : "#f67748") : "transparent",
              boxShadow: filled ? "inset 0 0 0 4px rgb(43 37 33)" : "inset 0 0 0 4px rgb(43 37 33 / 0.28)",
            }}
          />
        );
      })}
    </>
  );
}
