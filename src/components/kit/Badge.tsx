import type { ReactNode } from "react";
import { CircleAlert, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/cn";

export type BadgeTone = "neutral" | "brand" | "reward" | "ok" | "warn" | "danger";

const TONES: Record<BadgeTone, string> = {
  // ink-muted with a soft edge: 7.27:1 on the wall, 7.99:1 on a panel.
  neutral: "border border-border-strong text-ink-muted",
  // A brand tag is solid coral with ink on it (5.50:1), never a 15% wash
  // that could pass for a warning.
  brand: "border border-transparent bg-primary text-primary-on",
  // Gold is the reward's one fill, and it carries ink (8.10:1) in either
  // theme, so it is lit.
  reward: "theme-lit border border-transparent bg-gold text-ink",
  // Green is cool, so it is the one state that keeps its wash:
  // #065f46 on it, 6.11:1 over a panel.
  ok: "border border-transparent bg-ok/15 text-ok-tag",
  // A warning and an error are their words and their icon. No warm fill.
  warn: "border border-border-strong text-warn",
  danger: "border border-border-strong text-danger",
};

const ICONS: Partial<Record<BadgeTone, ReactNode>> = {
  warn: <TriangleAlert aria-hidden />,
  danger: <CircleAlert aria-hidden />,
};

/**
 * A short word about something: a plan, a state, a reward waiting. Not a
 * control. The text says what it means; the colour and the icon only repeat
 * it, so a tag means the same to someone who can't see the colour.
 */
export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: BadgeTone;
  /** Replaces the warning's or the error's own icon, or gives the others one. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const glyph = icon ?? ICONS[tone];
  return (
    <span
      className={cn(
        "type-tag inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 [&_svg]:size-3.5 [&_svg]:shrink-0",
        TONES[tone],
        className,
      )}
    >
      {glyph}
      {children}
    </span>
  );
}
