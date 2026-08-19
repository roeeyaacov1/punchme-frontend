import type { HTMLAttributes, ReactNode } from "react";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/cn";

/** The dashboard's own primitives.
 *
 * Local to this directory for the same reason the marketing ones are: the
 * app's `components/ui` Card and Badge are hard-coded white-and-navy, and
 * they are still worn by the admin screens and the public join flow, which
 * this phase is not allowed to repaint. Everything here is expressed in
 * tokens instead, so one class on <html> turns the whole dashboard dark.
 *
 * Buttons are not redeclared — the dashboard spends `ctaClasses` from
 * `components/marketing/primitives`, the same control the landing page and
 * the wizard use, so an owner meets one button across the whole product. */

/** A sheet of the book: hairline, panel ground, seated with a shadow that
 * each theme defines for its own ground. */
export function Panel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-panel",
        className,
      )}
      {...props}
    />
  );
}

/** A panel's opening line: what it is, and — at the end of the row — the one
 * thing you can do about it. */
export function PanelHeader({
  title,
  hint,
  action,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="t-card-title text-ink">{title}</h2>
        {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/** A small label above a group of panels. Not numbered: these are places to
 * look, not steps to take, and numbering them would promise an order the
 * owner does not have to follow. */
export function GroupLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("t-eyebrow text-ink-subtle", className)}>{children}</p>
  );
}

export type Tone = "neutral" | "accent" | "ok" | "warn" | "danger";

const TAG_TONES: Record<Tone, string> = {
  neutral: "bg-ink/[0.07] text-ink-muted",
  accent: "bg-primary-text/15 text-primary-text",
  ok: "bg-ok/15 text-ok",
  warn: "bg-warn/15 text-warn",
  danger: "bg-danger/15 text-danger",
};

/** A state, said in one word. Mono and tracked out, like the field labels on
 * the pass itself. */
export function Tag({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-wide",
        TAG_TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

const NOTICE_TONES: Record<"ok" | "warn" | "danger", string> = {
  ok: "bg-ok-bg text-ok",
  warn: "bg-warn-bg text-warn",
  danger: "bg-danger-bg text-danger",
};

const NOTICE_ICONS = {
  ok: CircleCheck,
  warn: Info,
  danger: TriangleAlert,
} as const;

/**
 * Something the page has to say out loud.
 *
 * `warn` is the one that carries most of the traffic here, and it is
 * deliberately not alarming: a stamp that lost a race or a card waiting on
 * activation is not the owner's mistake. `danger` is kept for a request that
 * actually failed.
 */
export function Notice({
  tone,
  children,
  className,
}: {
  tone: "ok" | "warn" | "danger";
  children: ReactNode;
  className?: string;
}) {
  const Icon = NOTICE_ICONS[tone];
  return (
    <p
      role={tone === "danger" ? "alert" : undefined}
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm",
        NOTICE_TONES[tone],
        className,
      )}
    >
      <Icon size={16} aria-hidden className="mt-0.5 shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/**
 * A thing that is not a screen.
 *
 * The QR code has to be dark-on-light to scan, the standee is paper, and the
 * pass and the Card Studio are a spec match to what the two wallets actually
 * draw — all of them white by definition. Rather than repaint any of that
 * (the studio and the previews are off limits, and a dark QR code is a broken
 * QR code), the dark page stages them: an object set down on a lit surface,
 * with the frame built from `theme-lit`'s light tokens so it agrees with what
 * it holds.
 *
 * In light mode this is simply a white panel, which is what it already was.
 */
export function LitStage({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        // The rim is the light that falls on it, and it only reads as light
        // when there is a dark page behind it.
        "theme-lit rounded-2xl bg-background p-4 text-ink shadow-panel-lift ring-1 ring-black/5 sm:p-6",
        className,
      )}
    >
      <div className={innerClassName}>{children}</div>
    </div>
  );
}

/** Text fields and selects. Token-built, so the same control reads as paper
 * by day and as a well on the panel at night — and `color-scheme` on <html>
 * is what makes the native select popup and the caret follow it. */
export const fieldClasses =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-ink placeholder:text-ink-subtle transition-colors hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-text focus:ring-offset-2 focus:ring-offset-background";

/** A figure: mono, tabular, and bidi-isolated so "12 / 8" inside a Hebrew
 * row keeps its own direction instead of reordering against the label. */
export function Figure({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("t-figure", className)} {...props} />;
}

/**
 * On or off, said once. A real switch (role, aria-checked, space/enter) so a
 * screen reader calls it what it is, 44px tall so a thumb can hit it, and the
 * label is part of the control — tapping the words flips it too.
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="relative mt-2.5 inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            "block h-6 w-11 rounded-full border border-transparent transition-colors",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-text peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            checked ? "bg-primary" : "bg-ink/20",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            // Logical start edge; the knob slides toward the end edge in
            // either writing direction.
            "start-0.5",
            checked && "ltr:translate-x-5 rtl:-translate-x-5",
          )}
        />
      </span>
      <span className="min-w-0 py-2.5">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-ink-muted">{description}</span>
        )}
      </span>
    </label>
  );
}

/**
 * A few mutually exclusive choices in one row — the theme picker's shape,
 * generalised. `aria-pressed` per option, one group label for the lot.
 */
export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex max-w-full flex-wrap rounded-xl border border-border bg-background p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-on" : "text-ink-muted hover:text-ink",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
