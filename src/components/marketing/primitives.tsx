import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

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
 * agrees with the text. */
export function SectionHeader({
  title,
  lead,
  align = "start",
  onDark = false,
  className,
}: {
  title: string;
  lead?: string;
  align?: "start" | "center";
  /** Set on the saturated and dark bands, where the copy inverts. */
  onDark?: boolean;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-12 sm:mb-16",
        centered ? "mx-auto max-w-2xl text-center" : "max-w-3xl",
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
          centered && "mx-auto",
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
