import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * A phone, from the top down, with the pass sitting where Wallet puts it.
 *
 * The one place in the app that draws a device: the wizard's whole promise is
 * "this is what lands on their phone", and the mock asked for the bezel. It
 * is cropped by its own container rather than drawn whole — the pass is the
 * subject, the phone is context — and the wallpaper is tinted from the
 * card's own colours (the landing lock screen's recipe), so changing the card
 * repaints the screen behind it.
 *
 * `wake` is the screen brightening for a moment, which is what a phone does
 * when a pass updates. The layout raises it every time a choice changes the
 * card; under reduced motion the layer never paints.
 */
export function PhoneFrame({
  backgroundColor,
  accentColor,
  wake = false,
  className,
  children,
}: {
  /** The card's background — the wallpaper is tinted from it. */
  backgroundColor: string;
  /** The card's label colour — the wallpaper's light source. */
  accentColor: string;
  wake?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const wallpaper = {
    background: [
      `radial-gradient(120% 75% at 18% 0%, ${accentColor}40 0%, transparent 58%)`,
      `radial-gradient(90% 60% at 92% 100%, ${accentColor}26 0%, transparent 62%)`,
      `linear-gradient(180deg, ${backgroundColor} 0%, #0b0d16 100%)`,
    ].join(", "),
  };

  return (
    <div
      className={cn("relative mx-auto w-full max-w-[300px] overflow-hidden", className)}
      aria-hidden="true"
    >
      {/* Bezel */}
      <div className="rounded-t-[2.6rem] bg-navy-deep p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        {/* Screen. Taller than any card, so the frame always runs past the
            crop and never shows a bottom edge. */}
        <div className="relative min-h-[460px] overflow-hidden rounded-t-[2.1rem]" style={wallpaper}>
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-white transition-opacity motion-reduce:hidden",
              wake ? "opacity-[0.09] duration-100" : "opacity-0 duration-[600ms]",
            )}
          />
          {/* Dynamic island */}
          <div className="relative flex justify-center pt-3">
            <div className="h-7 w-24 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
          </div>
          {/* The pass, where Wallet puts it. */}
          <div className="relative px-4 pb-6 pt-4 sm:pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
