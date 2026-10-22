import { focusRing, noTapFlash } from "./classes";

export type ButtonVariant = "primary" | "secondary" | "ink" | "quiet" | "danger";
export type ButtonSize = "md" | "lg" | "icon";

/**
 * Every button-shaped thing in the kit, a link styled as one included.
 *
 * A full pill in Rubik 500. The border is transparent unless a variant draws
 * it, so a button keeps an edge in Windows' high-contrast mode. Hover only
 * where a pointer hovers, and never on a disabled button: the hover variant
 * sorts after `disabled:`, so it is held back with `:not(:disabled)`.
 */
const BASE = `relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full border font-heading font-medium leading-tight transition-[transform,background-color,border-color,color,box-shadow] duration-press ease-out-strong disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait [&_svg]:size-5 [&_svg]:shrink-0 ${noTapFlash} ${focusRing}`;

/** A press sinks the button a little, unless motion is reduced. */
const PRESS = "active:scale-[0.97]";

/** The rows' 6% ink well, laid over the button's own fill as an inset rather
 * than in place of it, so a lit button on the camera's dark glass stays lit. */
const WELL = "[&:not(:disabled)]:active:shadow-[inset_0_0_0_100vmax_rgb(var(--c-ink)/0.06)]";

/**
 * With reduced motion a press doesn't sink: it tints where it stands, so a
 * finger still sees it land with the tap's own flash switched off. Measured
 * at the tightest ground each one stands on:
 * - coral takes its hover: ink on it 4.90:1, 9.16:1 at night;
 * - ink comes up to 90% over its ground: its label 10.31:1, on Panel Light;
 * - the rest take the well: ink 9.30:1, on the failed answer's light, and
 *   danger's words 5.34:1, on Panel Light.
 */
const PRESS_TINT: Record<ButtonVariant, string> = {
  primary: "[&:not(:disabled)]:active:bg-primary-hover",
  secondary: WELL,
  ink: "[&:not(:disabled)]:active:bg-ink/90",
  quiet: WELL,
  danger: WELL,
};

const VARIANTS: Record<ButtonVariant, string> = {
  // Coral is a fill that always carries its label in ink (5.50:1, 4.90:1 on
  // hover). As an edge it is 2.45:1 on the wall, which a label makes up for.
  primary:
    "border-transparent bg-primary text-primary-on [&:not(:disabled)]:hover-fine:bg-primary-hover",
  // A lit panel with a soft edge: the label identifies it, the edge is
  // decoration (1.41:1).
  secondary:
    "border-border-strong bg-surface text-ink [&:not(:disabled)]:hover-fine:border-field",
  // Ink with a cream label (14.88:1): the action on gold, where coral beside
  // gold would be 1.47:1, and "Reward given" on a full card.
  ink: "border-transparent bg-ink text-surface [&:not(:disabled)]:hover-fine:bg-ink/90",
  // A text button, such as "Not now". Still a 44px target.
  quiet: "border-transparent bg-transparent text-ink [&:not(:disabled)]:hover-fine:bg-ink/5",
  // Red words with a red edge (5.79:1 on the wall) and no fill: an error is
  // never a warm fill either.
  danger:
    "border-danger bg-surface text-danger [&:not(:disabled)]:hover-fine:bg-ink/5",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-base",
  lg: "min-h-[3.25rem] px-7 text-[1.0625rem]",
  // Square and 44px: an icon button must carry an aria-label.
  icon: "h-11 w-11 shrink-0 p-0 text-base",
};

export function buttonClasses(variant: ButtonVariant, size: ButtonSize, reduced: boolean) {
  return [BASE, VARIANTS[variant], SIZES[size], reduced ? PRESS_TINT[variant] : PRESS].join(" ");
}
