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

export type Tone = "neutral" | "accent" | "reward" | "ok" | "warn" | "danger";

/** What kind of number a readout is holding. The rule above it is the only
 * place the category is said in colour; the label says it in words. */
export type ReadoutHue = "roster" | "growth" | "activity" | "reward" | "risk";

export interface ReadoutItem {
  label: string;
  value: number | string;
  hue: ReadoutHue;
  /** The figure takes its own hue once there is something in it — for the
   * one or two that mean "go and do something". Panels only: on the band
   * every figure is white, because a hue measured against a page ground
   * cannot be trusted against a gradient. */
  emphasis?: boolean;
  /** The sample fell short, so this figure is a floor. */
  capped?: boolean;
}

/** The rules, on a panel (tokens, which flip with the theme) and on the brief
 * band (fixed lights, because that ground never flips). */
const RULE_ON_PANEL: Record<ReadoutHue, string> = {
  roster: "bg-ink/25",
  growth: "bg-ok",
  activity: "bg-primary",
  reward: "bg-reward",
  risk: "bg-warn",
};
const RULE_ON_BAND: Record<ReadoutHue, string> = {
  roster: "bg-white/45",
  growth: "bg-[#6ee7b7]",
  activity: "bg-[#a78bfa]",
  reward: "bg-[#ffd875]",
  risk: "bg-[#fcd34d]",
};
/** Figures that carry their own hue. Every one measured on both panel
 * grounds: ok 5.48/10.77, primary-text 6.14/6.03, reward 6.58/11.98,
 * warn 7.09/11.38. */
const FIGURE_HUE: Record<ReadoutHue, string> = {
  roster: "text-ink",
  growth: "text-ok",
  activity: "text-primary-text",
  reward: "text-reward",
  risk: "text-warn",
};

/**
 * A row of readouts — an instrument strip, not a row of stat cards.
 *
 * Four identical boxes each holding one number is the shape every dashboard
 * reaches for, and it says nothing about what the numbers are. Here the
 * category is a 2px rule above the label, in one of five colours that mean
 * the same thing everywhere in the product: emerald is growth, violet is
 * activity, gold is the reward, amber is something slipping, neutral is the
 * roster. The overview's band, the customers table and the messages page all
 * spend this one component, so the same figure looks the same wherever the
 * owner meets it.
 */
export function Readouts({
  items,
  on = "panel",
  className,
}: {
  items: ReadoutItem[];
  on?: "panel" | "band";
  className?: string;
}) {
  const band = on === "band";
  const rules = band ? RULE_ON_BAND : RULE_ON_PANEL;
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-4",
        items.length >= 4 ? "sm:grid-cols-4" : "sm:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5">
          <span
            aria-hidden
            className={cn("h-[3px] w-7 rounded-full", rules[item.hue])}
          />
          <dt
            className={cn(
              "font-mono text-[0.625rem] uppercase tracking-[0.12em]",
              band ? "text-brand-on-band" : "text-ink-subtle",
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              "font-heading text-2xl font-bold tabular-nums",
              band
                ? "text-white"
                : item.emphasis && item.value !== 0
                  ? FIGURE_HUE[item.hue]
                  : "text-ink",
            )}
          >
            {item.value}
            {item.capped ? "+" : ""}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const TAG_TONES: Record<Tone, string> = {
  neutral: "bg-ink/[0.07] text-ink-muted",
  // `accent` is the brand — a plan badge, a thing that is switched on.
  accent: "bg-primary-text/15 text-primary-text",
  // The one filled tag in the product. Every other tone is a wash of itself,
  // which is right for a state; a full card is not a state, it is the thing
  // the customer has been collecting towards, and it gets to look like an
  // event. Filled also settles a collision the gold introduced: `warn` is
  // #fcd34d on the night panel and `reward` #ffd875, so VOID and REWARD READY
  // were two near-identical yellows meaning opposite things. One is now a
  // solid pill and the other a faint tint, which no longer reads alike.
  // Fixed colours, not tokens: gold is gold in both themes, and navy on it
  // measures 10.06:1 either way. (`gold` alone would be 2.96:1 as text on
  // white — it is only ever a fill, and this is the fill.)
  reward: "bg-gold text-navy",
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
  id,
}: {
  tone: "ok" | "warn" | "danger";
  children: ReactNode;
  className?: string;
  /** So a control this notice explains can point at it with
   * `aria-describedby` — a disabled button owes the reason it is disabled. */
  id?: string;
}) {
  const Icon = NOTICE_ICONS[tone];
  return (
    <p
      id={id}
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
