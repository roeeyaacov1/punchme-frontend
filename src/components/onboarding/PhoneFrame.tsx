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
 *
 * `island` puts real controls in the Dynamic Island. That is the one place on
 * a phone that is *supposed* to hold a live control rather than chrome, so
 * the wallet switch lives there instead of floating in the panel underneath —
 * you change which wallet you are looking at on the device you are looking
 * at. Everything decorative here is `aria-hidden`, but the island is not:
 * a focusable control inside a hidden subtree is the one arrangement worse
 * than either alone.
 */
export function PhoneFrame({
  backgroundColor,
  accentColor,
  wake = false,
  island,
  className,
  children,
}: {
  /** The card's background — the wallpaper is tinted from it. */
  backgroundColor: string;
  /** The card's label colour — the wallpaper's light source. */
  accentColor: string;
  wake?: boolean;
  /** Live controls for the island. Falls back to a plain closed island. */
  island?: ReactNode;
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
    <div className={cn("relative mx-auto w-full max-w-[300px] overflow-hidden", className)}>
      {/* Bezel */}
      <div className="rounded-t-[2.6rem] bg-navy-deep p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        {/* Screen. Taller than any card, so the frame always runs past the
            crop and never shows a bottom edge. */}
        <div className="relative min-h-[460px] overflow-hidden rounded-t-[2.1rem]" style={wallpaper}>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 bg-white transition-opacity motion-reduce:hidden",
              wake ? "opacity-[0.09] duration-100" : "opacity-0 duration-[600ms]",
            )}
          />

          {/* Dynamic island. Expanded when it is carrying something. */}
          <div className="relative flex justify-center px-3 pt-3">
            {island ?? (
              <div
                aria-hidden="true"
                className="h-7 w-24 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              />
            )}
          </div>

          {/* The pass, where Wallet puts it. Hidden from assistive tech: it
              is a rendering of the card, and the layout speaks the card in
              its own `aria-live` summary rather than having it read as a
              pile of unlabelled fragments. */}
          <div aria-hidden="true" className="relative px-4 pb-6 pt-4 sm:pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The island as a segmented control.
 *
 * Black, because that is what the island is, and because it survives either
 * extreme of the wallpaper behind it: the gradient's top stop is the owner's
 * own card colour, so it can be white. On a light card the black pill reads;
 * on a dark one the selected segment — white, 21:1 — is what reads. The
 * unselected label is white/60 on black at 7.37:1.
 *
 * The focus ring is white with a black offset rather than the shared
 * `focusRing`, whose page-coloured offset would put a pale halo on the
 * screen.
 */
export function IslandSwitch<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  /** Names the group; the options carry their own visible labels. */
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex max-w-full items-center rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-[44px] min-w-0 truncate rounded-full px-3.5 text-xs font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              selected
                ? "bg-white text-black"
                : "text-white/60 hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
