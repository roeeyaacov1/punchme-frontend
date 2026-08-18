import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

/**
 * A fragment of a phone's lock screen, at life size.
 *
 * Deliberately not a device mockup: no bezel, no notch, no glossy render, no
 * float. On a wide screen it is clipped at the top, as if the phone were
 * standing on the counter and you were looking at part of it. The point is
 * that the pass is shown where it actually lives, which is the one thing an
 * owner has to believe before anything else on this page matters.
 *
 * The wallpaper is derived from the cards' own colours rather than a stock
 * photo, so switching trades repaints the whole screen — and so nothing here
 * is invented. `wake` brightens it for a moment, which is what a phone does
 * when a pass updates.
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
    <div className={cn("relative overflow-hidden bg-navy-deep", className)}>
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

      <div className="relative flex flex-col items-center px-5 pb-8 pt-8 sm:pb-10 sm:pt-16">
        <p className="text-sm font-medium text-white/70">{date}</p>
        <p
          className="mt-1 font-heading text-5xl font-normal tabular-nums tracking-tight text-white sm:text-6xl"
          // The clock is staging around the real subject; it should not be
          // read out before the pass.
          aria-hidden="true"
        >
          {time}
        </p>

        <div className="mt-8 w-full max-w-[320px] sm:mt-10">{children}</div>
      </div>
    </div>
  );
}
