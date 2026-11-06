import { useTranslation } from "react-i18next";
import { interpolate, useCurrentFrame } from "remotion";
import { AppleCardPreview } from "../../../src/components/card-studio/CardPreviews";
import { SampleAnswer } from "../../../src/components/marketing/SampleAnswer";
import { samplePass, tradeTemplate } from "../../../src/components/marketing/samples";
import { EXIT_LEAD, EXIT_MS, IN_OUT, OVERSHOOT, LIGHTS_ON_MS, light, ms, progress, sec, within } from "../motion";
import { Caption, SafeArea, Scaled, Stack, Tag } from "../pieces";

/** When things happen, from the beat's start. */
export const SCAN = {
  /** The first scan: a stamp, two to go. */
  stamp: sec(1.2),
  /** Its answer clears, and the camera is on the next visit's card. */
  clear: sec(3.9),
  /** The second scan: the card is full. */
  full: sec(5.0),
} as const;

/** Scan's viewfinder: 343px square at 375px (DESIGN.md), staged here as a whole. */
const VIEWFINDER = 343;
const SCALE = 2.5;

/**
 * 3. The scan. The owner's camera on the customer's pass, then the answer as
 * Scan gives it, over the camera, 12px in from its edges: "Stamped" with how
 * many are left, and later, on the visit that fills the card, "Card full!"
 * with "Give the reward". Each answer is the landing page's `SampleAnswer`,
 * its own CSS motion frozen and the snap rebuilt here from frames, at the
 * Scan page's timing: the flash clears from 0.85 in 220ms, the panel settles
 * from 1.04 in 180ms, the newest stamp lands from 1.45 in 240ms after 60ms.
 * The two flashes are four seconds apart.
 */
export function ScanScene() {
  const { t } = useTranslation();
  const frame = useCurrentFrame();
  const template = tradeTemplate("barber");
  const total = template.stampsRequired;
  // The card the camera sees: a stamp short, then stamped, then the next
  // visit's, a stamp short of full.
  const onCard =
    frame < SCAN.stamp ? template.currentStamps : frame < SCAN.clear - EXIT_LEAD ? template.currentStamps + 1 : total - 1;
  // The aiming aid, while the camera is looking: gone under each answer,
  // lighting again as the first one clears.
  const aiming = frame < SCAN.stamp ? 1 : frame < SCAN.full ? progress(frame, SCAN.clear, LIGHTS_ON_MS) : 0;

  const flashAt = within(frame, SCAN.full) ? SCAN.full : within(frame, SCAN.stamp, SCAN.clear) ? SCAN.stamp : null;
  const flash = flashAt === null ? 0 : 0.85 * (1 - progress(frame, flashAt, 220));

  return (
    <SafeArea>
      <Stack className="min-h-[170px] items-start">
        <div style={light(frame, 0, SCAN.clear)}>
          <Caption>{t("video:scan.stamp")}</Caption>
        </div>
        <div style={light(frame, SCAN.clear)}>
          <Caption>{t("video:scan.full")}</Caption>
        </div>
      </Stack>

      <div className="mt-[150px]">
        <Scaled
          width={VIEWFINDER}
          scale={SCALE}
          overlay={<Tag>{t("landing.hero.counter.scan")}</Tag>}
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-glass bg-glass text-light">
            {/* The card as the camera sees it, its code inside the reticle. */}
            <div className="absolute left-1/2 top-[-78px] w-[300px] origin-top -translate-x-1/2 scale-[0.86]">
              <AppleCardPreview {...samplePass(template, t, onCard)} />
            </div>
            <Reticle frame={frame} opacity={aiming} />

            {within(frame, SCAN.stamp) && frame < SCAN.full && (
              <Answer frame={frame} at={SCAN.stamp} off={SCAN.clear} kind="stamped" count={template.currentStamps + 1} />
            )}
            {within(frame, SCAN.full) && <Answer frame={frame} at={SCAN.full} kind="full" count={total} />}

            {/* The flash of the panels' own light, over the whole viewfinder. */}
            <span aria-hidden className="absolute inset-0 rounded-[inherit] bg-light" style={{ opacity: flash }} />
          </div>
        </Scaled>
      </div>
    </SafeArea>
  );
}

/**
 * One answer, inset 12px over the camera: there at once under the flash,
 * settling from 1.04, its newest stamp landing from 1.45 on the overshoot.
 * The stamp is the answer's own `StampRow` stamp, reached by its place in
 * the row and scaled per frame.
 */
function Answer({
  frame,
  at,
  off,
  kind,
  count,
}: {
  frame: number;
  at: number;
  off?: number;
  kind: "stamped" | "full";
  count: number;
}) {
  const template = tradeTemplate("barber");
  const filled = kind === "full" ? template.stampsRequired : count;
  const settle = interpolate(progress(frame, at, 180), [0, 1], [1.04, 1]);
  const stamp = interpolate(progress(frame, at + ms(60), 240, OVERSHOOT), [0, 1], [1.45, 1]);
  const out = off === undefined ? 0 : progress(frame, off - EXIT_LEAD, EXIT_MS);
  const id = `answer-${kind}`;
  return (
    <div className="absolute inset-3 z-10" style={{ transform: `scale(${settle})`, opacity: 1 - out }}>
      <style>{`#${id} div[aria-hidden="true"] > span:nth-child(${filled}) { transform: scale(${stamp}); }`}</style>
      <div id={id} className="h-full">
        <SampleAnswer template={template} kind={kind} count={filled} className="h-full justify-center" />
      </div>
    </div>
  );
}

/**
 * The Scan page's aiming aid, its four corners and its line, drawn the same
 * way (`ScannerViewport`'s `Reticle` isn't exported). Its sweep is rebuilt
 * from frames: down the frame and back, on the in-out.
 */
function Reticle({ frame, opacity }: { frame: number; opacity: number }) {
  const cycle = sec(2.4);
  const phase = (frame % cycle) / cycle;
  const across = phase < 0.5 ? IN_OUT(phase * 2) : IN_OUT(2 - phase * 2);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ opacity }}
    >
      <div className="relative aspect-square h-[68%]">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
        >
          <path d="M2 22V8a6 6 0 0 1 6-6h14" />
          <path d="M78 2h14a6 6 0 0 1 6 6v14" />
          <path d="M98 78v14a6 6 0 0 1-6 6H78" />
          <path d="M22 98H8a6 6 0 0 1-6-6V78" />
        </svg>
        <div className="absolute inset-x-3 inset-y-2 overflow-hidden">
          <div className="h-full w-full" style={{ transform: `translateY(${across * 100}%)` }}>
            <div className="h-0.5 w-full rounded-full bg-current" />
          </div>
        </div>
      </div>
    </div>
  );
}
