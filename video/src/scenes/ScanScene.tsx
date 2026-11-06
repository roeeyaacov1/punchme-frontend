import { useTranslation } from "react-i18next";
import { AbsoluteFill, interpolate } from "remotion";
import { SampleAnswer } from "../../../src/components/marketing/SampleAnswer";
import { tradeTemplate } from "../../../src/components/marketing/samples";
import {
  EXIT_LEAD,
  EXIT_MS,
  FULL,
  IN_OUT,
  IN_VIEW,
  LIGHTS_ON_MS,
  MOVE_MS,
  OVERSHOOT,
  PAIR,
  SWEEP_HALF,
  between,
  clipTo,
  lerpRect,
  light,
  ms,
  press,
  progress,
  sec,
  useBeat,
  within,
  type Rect,
} from "../motion";
import { Card, SafeArea, Say, Scaled, Stack, Tag, useHebrew } from "../pieces";
import { Reticle } from "./Reticle";

/** When things happen, from the beat's start. */
export const SCAN = {
  /** The camera's window closes round the card. */
  aperture: sec(0.15),
  /** The aiming corners lock on. */
  lock: sec(0.75),
  /** The first scan: the card's first stamp. */
  stamp: sec(1.5),
  /** Its answer clears. */
  clear: sec(3.3),
  /** Visits go by: a stamp each, until one short of full. */
  fill: sec(3.55),
  /** The scan that fills the card. */
  full: sec(4.9),
  /** "Give the reward" is pressed. */
  give: sec(6.3),
  /** The answer goes; the card under it is back to zero. */
  done: sec(6.8),
  /** The camera's window opens again. */
  open: sec(7.0),
} as const;

/** Frames between one visit's stamp and the next in the time-lapse. */
const FILL_STEP = 3;

/** Scan's viewfinder: 343px square at 375px (DESIGN.md), staged here at 2.5. */
const SCALE = 2.5;
const VIEW: Rect = { x: 540 - (343 * SCALE) / 2, y: 540, w: 343 * SCALE, h: 343 * SCALE, r: 28 * SCALE };

/**
 * 3. The scan. The card the customer just joined with comes over from the
 * wallet into the owner's camera, whose window closes round it, and the
 * aiming corners lock on. Then the answers, as Scan gives them, 12px inside
 * the frame: "Stamped" and its first stamp; visits going by, a stamp each,
 * on the card itself; and on the visit that fills it, "Card full!" with
 * "Give the reward", pressed. The answer clears off a card back to zero, and
 * the window opens for the lock screen to take it.
 *
 * Each answer is the landing page's `SampleAnswer`, its own CSS motion
 * frozen and the snap rebuilt here at the Scan page's timing: the flash
 * clears from 0.85 in 220ms, the panel settles from 1.04 in 180ms, the
 * newest stamp lands from 1.45 in 240ms after 60ms. The two flashes are 3.4
 * seconds apart.
 */
export function ScanScene() {
  const { t } = useTranslation();
  const { t: f, length } = useBeat();
  const lang = useHebrew() ? "he" : "en";
  const total = tradeTemplate("barber").stampsRequired;

  const from = { cx: PAIR.start[lang], top: PAIR.top, s: PAIR.s };
  const at = between(from, IN_VIEW, progress(f, 0, MOVE_MS, IN_OUT));
  const onCard =
    f < SCAN.stamp
      ? 0
      : f < SCAN.fill
        ? 1
        : f < SCAN.full
          ? Math.min(total - 1, 1 + Math.floor((f - SCAN.fill) / FILL_STEP) + 1)
          : f < SCAN.done - EXIT_LEAD
            ? total
            : 0;

  const window =
    f < SCAN.open
      ? lerpRect(FULL, VIEW, progress(f, SCAN.aperture, MOVE_MS, IN_OUT))
      : lerpRect(VIEW, FULL, progress(f, SCAN.open, MOVE_MS, IN_OUT));
  // The glass lights only as the window is nearly closed, and goes out
  // first as it opens, so the dark never spreads past the viewfinder.
  const glass = progress(f, SCAN.aperture + ms(MOVE_MS * 0.55), 260) * (1 - progress(f, SCAN.open, 220));

  const lockOn = progress(f, SCAN.lock, 450, IN_OUT);
  const aiming = f < SCAN.stamp ? lockOn : f < SCAN.full ? progress(f, SCAN.clear, LIGHTS_ON_MS) : 0;

  const flashAt = within(f, SCAN.full) ? SCAN.full : within(f, SCAN.stamp, SCAN.clear) ? SCAN.stamp : null;
  const flash = flashAt === null ? 0 : 0.85 * (1 - progress(f, flashAt, 220));

  return (
    <AbsoluteFill>
      {/* The camera: a hole in the wall that is never lit. */}
      <AbsoluteFill className="bg-glass" style={{ clipPath: clipTo(window), opacity: glass }} />

      <AbsoluteFill style={{ clipPath: clipTo(window) }}>
        <Card
          at={at}
          stamps={onCard}
          // The lock screen holds the card from here on.
          style={{ visibility: f >= length - SWEEP_HALF ? "hidden" : undefined }}
        />
      </AbsoluteFill>

      <div className="absolute" style={{ left: VIEW.x, top: VIEW.y, width: VIEW.w, height: VIEW.h }}>
        <div
          className="absolute left-1/2 top-1/2 aspect-square h-[68%] text-light"
          style={{
            opacity: aiming,
            transform: `translate(-50%, -50%) scale(${1.3 - 0.3 * lockOn})`,
          }}
        >
          <Reticle frame={f - SCAN.lock} />
        </div>

        <Scaled width={343} scale={SCALE}>
          <div className="relative aspect-square w-full">
            {within(f, SCAN.stamp, SCAN.clear + 2) && (
              <Answer frame={f} at={SCAN.stamp} off={SCAN.clear} kind="stamped" count={1} />
            )}
            {within(f, SCAN.full, SCAN.done + 2) && (
              <Answer frame={f} at={SCAN.full} off={SCAN.done} kind="full" count={total} give={SCAN.give} />
            )}
          </div>
        </Scaled>

        <span
          aria-hidden
          className="absolute inset-0 bg-light"
          style={{ opacity: flash, borderRadius: VIEW.r }}
        />
        <Tag style={light(f, SCAN.lock, SCAN.open)}>{t("landing.hero.counter.scan")}</Tag>
      </div>

      <SafeArea>
        <Stack className="min-h-[170px] items-start">
          <Say text={t("video:scan.stamp")} on={0} off={SCAN.clear} />
          <Say text={t("video:scan.full")} on={SCAN.clear} off={length} />
        </Stack>
      </SafeArea>
    </AbsoluteFill>
  );
}

/**
 * One answer, inset 12px over the camera: there at once under the flash,
 * settling from 1.04, its newest stamp landing from 1.45 on the overshoot.
 * The stamp is the answer's own `StampRow` stamp, reached by its place in
 * the row and scaled per frame; "Give the reward" sinks as a press does.
 */
function Answer({
  frame,
  at,
  off,
  kind,
  count,
  give,
}: {
  frame: number;
  at: number;
  off: number;
  kind: "stamped" | "full";
  count: number;
  give?: number;
}) {
  const template = tradeTemplate("barber");
  const settle = interpolate(progress(frame, at, 180), [0, 1], [1.04, 1]);
  const stamp = interpolate(progress(frame, at + ms(60), 240, OVERSHOOT), [0, 1], [1.45, 1]);
  const out = progress(frame, off - EXIT_LEAD, EXIT_MS);
  const pressed = give === undefined ? 1 : press(frame, give);
  const id = `answer-${kind}`;
  return (
    <div className="absolute inset-3 z-10" style={{ transform: `scale(${settle})`, opacity: 1 - out }}>
      <style>{`
        #${id} div[aria-hidden="true"] > span:nth-child(${count}) { transform: scale(${stamp}); }
        #${id} span.bg-ink { transform: scale(${pressed}); }
      `}</style>
      <div id={id} className="h-full">
        <SampleAnswer template={template} kind={kind} count={count} className="h-full justify-center" />
      </div>
    </div>
  );
}
