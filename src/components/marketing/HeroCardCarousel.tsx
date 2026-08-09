import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { AppleCardPreview } from "../card-studio/CardPreviews";
import { HERO_TEMPLATES, heroDesignDoc } from "./heroTemplates";
import { focusRing } from "./primitives";

const ROTATE_MS = 5000;

/**
 * Rotating stack of real card templates.
 *
 * Renders through the studio's own `AppleCardPreview`, so the hero can't
 * drift from what the designer actually produces — if the card layout
 * changes, this changes with it.
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

  useEffect(() => {
    // Auto-rotation is decoration. Under reduced-motion it never starts, so
    // the dots become the only way through — which is why they're real
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

  return (
    <div
      className="flex w-full flex-col items-center gap-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative w-[300px] max-w-full">
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
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 scale-125 rounded-full blur-2xl transition-colors duration-500"
                style={{
                  background: `radial-gradient(circle, ${template.glow} 0%, rgba(200,138,17,0) 70%)`,
                }}
              />
              <AppleCardPreview
                businessName={t(`landing.templates.items.${template.key}.business`)}
                stampsRequired={template.stampsRequired}
                currentStamps={template.currentStamps}
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

      {/* Caption sits outside the stack so it doesn't fade with the card. */}
      <p className="min-h-[1.5rem] text-center text-sm text-ink-muted">
        {t(`landing.templates.items.${HERO_TEMPLATES[active].key}.caption`)}
      </p>

      <div
        className="flex items-center gap-2"
        role="tablist"
        aria-label={t("landing.templates.ariaLabel")}
      >
        {HERO_TEMPLATES.map((template, i) => (
          <button
            key={template.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={t(`landing.templates.items.${template.key}.business`)}
            onClick={() => {
              setActive(i);
              setStopped(true);
            }}
            className={cn(
              // 44px tap area via padding; the visual dot stays small.
              "inline-flex h-11 w-11 items-center justify-center rounded-full",
              focusRing,
            )}
          >
            <span
              className={cn(
                "block rounded-full transition-all duration-300",
                i === active
                  ? "h-2.5 w-6 bg-primary"
                  : "h-2.5 w-2.5 bg-ink-subtle/50",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
