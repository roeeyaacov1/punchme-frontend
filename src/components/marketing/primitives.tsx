import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useReveal } from "../motion/useReveal";

/** Shared layout + button primitives for the public landing page.
 *
 * Deliberately local to this directory rather than added to
 * `components/ui`: the app's Button is pill-shaped and navy-filled, which is
 * right for the dashboard and wrong here. The onboarding wizard inherits the
 * landing's language and so imports `ctaClasses`/`focusRing` from here; the
 * dashboard does not.
 *
 * `Section` and `SectionHeader` are used only by this directory, which is
 * why the landing redesign could restyle them outright. `ctaClasses` and
 * `focusRing` are not — the wizard and the login page spend them too — so
 * they are expressed entirely in tokens and render byte-identically under
 * the default theme. */

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

/** The grounds a section can sit on.
 *
 * The redesign alternates white against a pale wash for the reading
 * sections, and drops a saturated band whenever the page changes subject —
 * that banding is most of what gives the page its rhythm on a phone, where
 * only one section is ever visible at a time. */
export type SectionTone = "background" | "surface" | "violet" | "royal" | "night";

const TONE_CLASS: Record<SectionTone, string> = {
  background: "bg-background",
  surface: "bg-surface",
  violet: "bg-brand-violet",
  royal: "grad-band",
  night: "bg-brand-night",
};

export function Section({
  id,
  tone = "background",
  className,
  children,
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      // scroll-mt keeps an anchored heading clear of the 80px sticky header.
      className={cn(
        "py-16 scroll-mt-24 sm:py-20 lg:py-28",
        TONE_CLASS[tone],
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("t-eyebrow text-primary-text", className)}>{children}</p>
  );
}

/** Section openers are set flush to the start edge and underscored with a
 * short accent bar.
 *
 * The bar is the design's one repeating ornament, and it hangs at the start
 * edge — `start-0`, not `left-0`, so in Hebrew it sits under the first word
 * rather than trailing off the end of the line. The Figma draws it at the
 * start in some sections and the end in others; the start is the one that
 * agrees with the text.
 *
 * Because it repeats eight times down the page, it is also the one thing the
 * page can afford to make an *event* of: it draws itself from the first word
 * outward as the heading arrives, and that single half-second is what marks
 * "a new section has begun" on a phone, where only one section is ever in
 * view. `origin-left rtl:origin-right` rather than a logical utility because
 * `transform-origin` has no logical form in Tailwind — the rule has to grow
 * away from the start edge in both directions, which is the opposite pair. */
export function SectionHeader({
  title,
  lead,
  align = "start",
  onDark = false,
  flush = false,
  className,
}: {
  title: string;
  lead?: string;
  align?: "start" | "center";
  /** Set on the saturated and dark bands, where the copy inverts. */
  onDark?: boolean;
  /** Drops the bottom margin, for a header that sits in its own column
   * beside the section's content rather than above it.
   *
   * A prop rather than a `mb-0` passed through `className`, which is what
   * the two-column sections used to do and what never worked: `cn` is plain
   * `clsx` with no tailwind-merge, so both margins reach the stylesheet and
   * CSS source order decides. Tailwind emits `mb-0` before `mb-12`, so the
   * larger one wins no matter which argument it arrived in. */
  flush?: boolean;
  className?: string;
}) {
  const centered = align === "center";
  const rise = useReveal<HTMLDivElement>();

  return (
    <div
      ref={rise.ref}
      style={rise.style}
      className={cn(
        !flush && "mb-12 sm:mb-16",
        centered ? "mx-auto max-w-2xl text-center" : "max-w-3xl",
        rise.className,
        className,
      )}
    >
      <h2
        className={cn(
          "t-h2 text-balance",
          onDark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>

      <div
        aria-hidden="true"
        className={cn(
          "mt-5 h-1 w-10 rounded-full",
          centered ? "mx-auto origin-center" : "origin-left rtl:origin-right",
          // Held until the heading above has finished rising, so the two
          // read as one gesture rather than a race.
          rise.revealed && "animate-draw-rule [animation-delay:180ms]",
          onDark ? "bg-white/70" : "bg-primary",
        )}
      />

      {lead && (
        <p
          className={cn(
            "t-lead mt-6 text-pretty",
            onDark ? "text-brand-on-band" : "text-ink-muted",
            centered ? "mx-auto max-w-xl" : "max-w-2xl",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Slides a CTA's trailing arrow a hair further along on hover.
 *
 * Passed at the landing's call sites rather than folded into `ctaClasses`,
 * which the wizard and the sign-in page also spend — those are not in this
 * phase, and a shared primitive should not grow a behaviour on their behalf.
 *
 * The movement is toward the *end* of the line in both directions. The arrow
 * already carries `rtl:-scale-x-100`, and Tailwind composes translate before
 * scale, so a negative translate in RTL reads as forward on screen. */
export const ctaArrow =
  "[&>svg]:transition-transform [&>svg]:duration-200 motion-reduce:[&>svg]:transition-none hover:[&>svg]:translate-x-1 rtl:hover:[&>svg]:-translate-x-1";

/** The pointer language for a resting card: it lifts a hair and its hairline
 * firms up. One definition, so a testimonial, a step and a plan all answer
 * the pointer the same way.
 *
 * Belongs on the panel *inside* the revealing element, never on the element
 * `useReveal` is attached to. `animate-fade-up` fills forwards, animations
 * outrank normal declarations, and its closing `translateY(0)` would win
 * against this lift for good — the card would fade in and then sit there
 * refusing to move, with every class it needs present in the markup. */
export const cardHover =
  "transition-[transform,box-shadow,border-color] duration-200 motion-reduce:transition-none hover:-translate-y-1 hover:border-border-strong hover:shadow-lift";

/** Accent fill / outline / accent-on-dark, at hero or header size.
 *
 * The fill never assumes what colour its own label is: `primary.on` is a
 * token because the two themes disagree. Gold takes navy text (white on gold
 * is 2.96:1 and fails AA); violet takes white (6.28:1).
 *
 * Squared off to a small radius rather than a pill. The pill is the SaaS
 * default; this audience reads a well-made physical control, and every other
 * object on the page — the pass, the card, the receipt — is a rectangle with
 * the corner just taken off. */
export function ctaClasses(
  variant: "primary" | "secondary" | "onDark" | "gradient" | "warm" = "primary",
  size: "lg" | "sm" = "lg",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-body font-bold transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    focusRing,
    size === "lg" ? "px-7 py-4 text-base" : "px-4 py-2.5 text-sm",
    variant === "primary" &&
      "bg-primary text-primary-on shadow-[0_2px_0_0_theme(colors.primary.shadow)] hover:bg-primary-hover active:shadow-[0_1px_0_0_theme(colors.primary.shadow)]",
    variant === "secondary" &&
      "border border-border-strong bg-surface text-ink hover:border-ink-subtle hover:bg-background",
    variant === "onDark" &&
      "bg-primary text-primary-on shadow-[0_2px_0_0_theme(colors.primary.shadow)] hover:bg-primary-hover focus-visible:ring-white focus-visible:ring-offset-navy-deep active:shadow-[0_1px_0_0_theme(colors.primary.shadow)]",
    // The redesign's headline control: violet → blue, white label, and a
    // lift on hover rather than a colour change, because a gradient has no
    // single colour to darken.
    variant === "gradient" &&
      "grad-cta text-white shadow-[0_6px_20px_-6px_rgb(91_65_230/0.7)] hover:shadow-[0_10px_28px_-8px_rgb(91_65_230/0.85)] focus-visible:ring-brand-violet",
    // The pricing pair. Its own variant rather than `gradient` plus a
    // `grad-warm` override — that only worked because `.grad-warm` happens
    // to be declared after `.grad-cta` in the stylesheet, which is not a
    // thing to rely on.
    variant === "warm" &&
      "grad-warm text-white shadow-[0_6px_20px_-6px_rgb(194_65_12/0.7)] hover:shadow-[0_10px_28px_-8px_rgb(194_65_12/0.85)] focus-visible:ring-brand-warm",
    className,
  );
}

export { focusRing };
