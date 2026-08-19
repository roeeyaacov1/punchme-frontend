import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { AppleCardPreview } from "../card-studio/CardPreviews";
import { HERO_TEMPLATES, heroDesignDoc } from "./heroTemplates";
import { LockScreen } from "./LockScreen";
import { focusRing } from "./primitives";

const ROTATE_MS = 5000;

/** One wallpaper per trade, all mounted so the light cross-fades with the
 * card instead of snapping ahead of it. */
const WALLPAPERS = HERO_TEMPLATES.map((template) => ({
  id: template.id,
  backgroundColor: template.backgroundColor,
  accentColor: template.labelColor,
}));

/** How long after load the stamp lands, and how long the screen stays woken. */
const STAMP_AT_MS = 1200;
const WAKE_MS = 700;

/**
 * The hero's demonstration: a real card on a real lock screen, taking a stamp.
 *
 * Renders through the studio's own `AppleCardPreview`, so the hero can't
 * drift from what the designer actually produces — if the card layout
 * changes, this changes with it.
 *
 * The demonstration is one prop. `AppleCardPreview` draws both the stamp grid
 * and the visits field from `currentStamps`, so bumping it by one makes the
 * frozen renderer do the real thing: a stamp appears and the count ticks. It
 * happens once, roughly a second after load — a loop would be decoration,
 * and this is the product.
 *
 * All slides are mounted and cross-faded rather than swapped, which keeps
 * the hero's height fixed: cards differ in stamp count, and a card that
 * grows a second stamp row would otherwise shove the page around on every
 * rotation.
 */
export function HeroCardCarousel() {
  const { t } = useTranslation();
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Picking a card is taking control: rotation stops for good rather than
  // yanking the visitor off the card they just chose five seconds later.
  // It also gives the auto-advance a genuine stop mechanism (WCAG 2.2.2).
  const [stopped, setStopped] = useState(false);
  // Under reduced motion the card is simply already stamped — the settled
  // state, no sequence to sit through.
  const [landed, setLanded] = useState(reduced);
  const [wake, setWake] = useState(false);

  useEffect(() => {
    if (reduced) {
      setLanded(true);
      return;
    }
    const stamp = window.setTimeout(() => {
      setLanded(true);
      setWake(true);
    }, STAMP_AT_MS);
    const settle = window.setTimeout(() => setWake(false), STAMP_AT_MS + WAKE_MS);
    return () => {
      window.clearTimeout(stamp);
      window.clearTimeout(settle);
    };
  }, [reduced]);

  useEffect(() => {
    // Auto-rotation is decoration. Under reduced-motion it never starts, so
    // the tabs become the only way through — which is why they're real
    // buttons rather than indicators.
    if (reduced || paused || stopped) return;
    const timer = window.setInterval(
      () => setActive((i) => (i + 1) % HERO_TEMPLATES.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [reduced, paused, stopped]);

  const labels = {
    name: t("landing.templates.nameLabel"),
    points: t("landing.templates.pointsLabel"),
  };
  const current = HERO_TEMPLATES[active];

  return (
    <div
      // A definite width, not `w-full`. This sits in a flex item that is
      // sized by its content, so with an intrinsic width the widest child —
      // the caption — decided how wide the device was, and the café's longer
      // line made its phone visibly bigger than the barber's on every
      // rotation. Pinning the column fixes the device, the bloom's centre and
      // the floating chips' distance from the phone in one go.
      //
      // 17rem, not more: it puts the device at roughly 1:1.9, which reads as
      // a phone. Much below this and the widest strip runs out of room — ten
      // stamps at the renderer's fixed 30px tile need 182px, which is all but
      // 5px of the strip here, so this is close to the floor.
      className="flex w-[17rem] max-w-full flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <LockScreen
        wallpapers={WALLPAPERS}
        activeId={current.id}
        wake={wake}
        // A whole device, sized so the pass inside lands near life size.
        // It used to be pulled up and cropped by the section; now it stands
        // in the hero's light instead of cutting it off. The 19rem lives on
        // the column above, so this just fills it.
        className="w-full"
      >
        <div className="relative">
          {HERO_TEMPLATES.map((template, i) => {
            const isActive = i === active;
            return (
              <div
                key={template.id}
                // The first slide holds the layout; the rest stack on top of
                // it absolutely so the container never resizes.
                className={cn(
                  i === 0 ? "relative" : "absolute inset-0",
                  "transition-opacity duration-500 motion-reduce:transition-none",
                  isActive ? "opacity-100" : "pointer-events-none opacity-0",
                )}
                aria-hidden={!isActive}
              >
                <AppleCardPreview
                  businessName={t(
                    `landing.templates.items.${template.key}.business`,
                  )}
                  stampsRequired={template.stampsRequired}
                  currentStamps={template.currentStamps + (landed ? 1 : 0)}
                  rewardDescription={t(
                    `landing.templates.items.${template.key}.reward`,
                  )}
                  backgroundColor={template.backgroundColor}
                  foregroundColor={template.foregroundColor}
                  labelColor={template.labelColor}
                  design={heroDesignDoc(template, labels)}
                />
              </div>
            );
          })}
        </div>
      </LockScreen>

      {/* Named trades rather than dots: the first question a shop owner asks
          is whether this is for their kind of shop, and it should be
          answerable above the fold. */}
      <div
        className="mt-5 flex items-center gap-1"
        role="tablist"
        aria-label={t("landing.templates.ariaLabel")}
      >
        {HERO_TEMPLATES.map((template, i) => (
          <button
            key={template.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => {
              setActive(i);
              setStopped(true);
            }}
            className={cn(
              "inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm transition-colors",
              i === active
                ? "font-bold text-ink underline decoration-primary decoration-2 underline-offset-8"
                : "font-medium text-ink-subtle hover:text-ink",
              focusRing,
            )}
          >
            {t(`landing.templates.items.${template.key}.trade`)}
          </button>
        ))}
      </div>

      {/* What the card actually gives you — the pass itself never shows the
          reward, so this line is the only place it appears. Two lines are
          reserved: at a fixed column width the longer captions wrap, and
          letting the block grow would jog the page on every rotation.
          Balanced so the second line is half a sentence rather than the one
          orphaned word the café's line ends on otherwise. */}
      <p className="mt-1 min-h-[2.5rem] text-balance text-center text-sm text-ink-muted">
        {t(`landing.templates.items.${current.key}.caption`)}
      </p>
    </div>
  );
}
