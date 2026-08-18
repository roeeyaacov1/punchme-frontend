import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

/**
 * A phone on its lock screen, with the pass where Wallet puts it.
 *
 * It used to be a fragment — a hard-edged slab of screen, cropped by its own
 * container, on the assumption that a bezel would read as a stock mockup.
 * That worked on the old oat ground and stopped working on white: a black
 * rectangle with square corners reads as a box pasted onto the page, it cut
 * the hero's violet light off at its edge instead of standing in it, and it
 * was the only phone left in the product without a frame — the dashboard
 * mock and the onboarding wizard both draw one.
 *
 * So it is a whole device now, lit from behind and shadowed onto the page.
 * The clock is deliberately smaller than a real lock screen's: on a phone
 * the clock is the subject, here the pass is, and at full size it was the
 * second-loudest thing in the hero after the headline.
 *
 * The wallpaper is still derived from the cards' own colours rather than a
 * stock photo, so switching trades repaints the whole screen — and so
 * nothing here is invented. `wake` brightens it for a moment, which is what
 * a phone does when a pass updates.
 */

export interface Wallpaper {
  id: string;
  /** The card's background — the wallpaper is tinted from it. */
  backgroundColor: string;
  /** The card's label colour, used as the wallpaper's light source. */
  accentColor: string;
}

/** CSS gradients can't be transitioned, so every wallpaper is a mounted layer
 * and the swap is an opacity cross-fade. Painting one gradient and animating
 * `background` instead made the light change instantly while the card was
 * still fading, which put the barber's card on the café's screen for half a
 * second. */
function wallpaperStyle({ backgroundColor, accentColor }: Wallpaper) {
  return {
    background: [
      `radial-gradient(120% 75% at 18% 0%, ${accentColor}40 0%, transparent 58%)`,
      `radial-gradient(90% 60% at 92% 100%, ${accentColor}26 0%, transparent 62%)`,
      `linear-gradient(180deg, ${backgroundColor} 0%, #0b0d16 100%)`,
    ].join(", "),
  };
}

export function LockScreen({
  wallpapers,
  activeId,
  wake = false,
  className,
  children,
}: {
  wallpapers: Wallpaper[];
  activeId: string;
  /** True for a moment as a stamp lands. */
  wake?: boolean;
  className?: string;
  /** The pass itself. */
  children: ReactNode;
}) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "he" ? "he-IL" : "en-IL";

  // The real time, read once at mount. A frozen 9:41 is the mockup cliché,
  // and there is nothing to gain from lying about the clock.
  const { time, date } = useMemo(() => {
    const now = new Date();
    return {
      time: new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
      date: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(now),
    };
  }, [locale]);

  return (
    // The bezel. Near-black rather than pure, so it sits in the same family
    // as the dashboard mock's frame, and lifted off the white ground by a
    // long soft shadow rather than a border.
    <div
      className={cn(
        "rounded-[2.75rem] bg-brand-night p-3 shadow-[0_40px_80px_-32px_rgb(15_15_35/0.55)] ring-1 ring-inset ring-white/10",
        className,
      )}
    >
      {/* No base wallpaper on this element on purpose — only the layers
          below. A base would snap to the incoming colour while the outgoing
          layer was still fading over it, which is the half-second of
          barber-card-on-the-café's-screen the cross-fade exists to avoid. */}
      <div className="relative overflow-hidden rounded-[2.1rem] bg-brand-night">
        {wallpapers.map((paper) => (
          <div
            key={paper.id}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
              paper.id === activeId ? "opacity-100" : "opacity-0",
            )}
            style={wallpaperStyle(paper)}
          />
        ))}

        {/* The screen waking as the pass updates. Pointer-events off; it is
            light, not a layer anyone can hit. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-white transition-opacity motion-reduce:hidden",
            wake ? "opacity-[0.09] duration-100" : "opacity-0 duration-[600ms]",
          )}
        />

        <div className="relative flex flex-col px-4 pb-5 pt-3">
          {/* Dynamic island. Decoration here — on the landing there is
              nothing live to put in it, unlike the wizard's, which holds
              the wallet switch. */}
          <div
            aria-hidden="true"
            className="mx-auto h-6 w-20 shrink-0 rounded-full bg-black/85"
          />

          <p className="mt-6 text-center text-xs font-medium text-white/70">
            {date}
          </p>
          <p
            className="mt-0.5 text-center font-heading text-4xl font-normal tabular-nums tracking-tight text-white"
            // Staging around the real subject; it should not be read out
            // before the pass.
            aria-hidden="true"
          >
            {time}
          </p>

          <div className="mt-6">{children}</div>

          {/* Home indicator. The one cue that says the device continues to
              be a device below the pass. */}
          <div
            aria-hidden="true"
            className="mx-auto mt-8 h-1 w-24 shrink-0 rounded-full bg-white/40"
          />
        </div>
      </div>
    </div>
  );
}
