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
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
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
  /** `background` is the default slate band, `surface` the white one. */
  tone?: "background" | "surface";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      // scroll-mt keeps an anchored heading clear of the 80px sticky header.
      className={cn(
        "py-16 scroll-mt-24 sm:py-24 lg:py-32",
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
    <p className={cn("t-eyebrow text-ink-subtle", className)}>{children}</p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="t-h2 mt-4 text-balance text-ink">{title}</h2>
      {lead && <p className="t-lead mt-5 text-pretty text-ink-muted">{lead}</p>}
    </div>
  );
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/** Gold fill / white outline / gold-on-navy, at hero or header size.
 *
 * Every gold fill carries navy text, never white: white on #c88a11 is
 * 2.96:1 and fails AA outright, while navy on it is 6.34:1. */
export function ctaClasses(
  variant: "primary" | "secondary" | "onDark" = "primary",
  size: "lg" | "sm" = "lg",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-body font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    focusRing,
    size === "lg" ? "px-8 py-4 text-base" : "px-4 py-2.5 text-sm",
    variant === "primary" &&
      "bg-primary text-navy-deep shadow-card hover:bg-primary-hover",
    variant === "secondary" &&
      "border border-border bg-surface text-ink hover:border-ink-subtle hover:bg-background",
    variant === "onDark" &&
      "bg-primary text-navy-deep shadow-lift hover:bg-gold focus-visible:ring-offset-navy-deep",
    className,
  );
}

export { focusRing };
