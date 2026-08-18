import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/** Shared layout + button primitives for the public landing page.
 *
 * Deliberately local to this directory rather than added to
 * `components/ui`: the app's Button is pill-shaped and navy-filled, which is
 * right for the dashboard and wrong here. Nothing in this file is imported
 * by an app route. */

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

export function Section({
  id,
  tone = "background",
  className,
  children,
}: {
  id?: string;
  /** `background` is the oat card-stock ground, `surface` the white one. */
  tone?: "background" | "surface";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      // scroll-mt keeps an anchored heading clear of the 80px sticky header.
      className={cn(
        "py-16 scroll-mt-24 sm:py-20 lg:py-28",
        tone === "surface" ? "bg-surface" : "bg-background",
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

/** Section openers are set flush to the start edge and hung on a rule,
 * the way a printed sheet sets a heading — centring every one of them is
 * most of what made the old page read as a template. */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "start",
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-12 border-t border-border-strong pt-6 sm:mb-16",
        centered ? "mx-auto max-w-2xl text-center" : "max-w-3xl",
        className,
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="t-h2 mt-3 text-balance text-ink">{title}</h2>
      {lead && (
        <p
          className={cn(
            "t-lead mt-4 text-pretty text-ink-muted",
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

/** Gold fill / outline / gold-on-navy, at hero or header size.
 *
 * Every gold fill carries navy text, never white: white on #c88a11 is
 * 2.96:1 and fails AA, while navy on it is 6.30:1.
 *
 * Squared off to a small radius rather than a pill. The pill is the SaaS
 * default; this audience reads a well-made physical control, and every other
 * object on the page — the pass, the card, the receipt — is a rectangle with
 * the corner just taken off. */
export function ctaClasses(
  variant: "primary" | "secondary" | "onDark" = "primary",
  size: "lg" | "sm" = "lg",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-body font-bold transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    focusRing,
    size === "lg" ? "px-7 py-4 text-base" : "px-4 py-2.5 text-sm",
    variant === "primary" &&
      "bg-primary text-navy-deep shadow-[0_2px_0_0_#8a5d0b] hover:bg-primary-hover active:shadow-[0_1px_0_0_#8a5d0b]",
    variant === "secondary" &&
      "border border-border-strong bg-surface text-ink hover:border-ink-subtle hover:bg-background",
    variant === "onDark" &&
      "bg-primary text-navy-deep shadow-[0_2px_0_0_#8a5d0b] hover:bg-gold focus-visible:ring-primary focus-visible:ring-offset-navy-deep active:shadow-[0_1px_0_0_#8a5d0b]",
    className,
  );
}

export { focusRing };
