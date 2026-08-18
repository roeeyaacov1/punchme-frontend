import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * One iOS-style notification, at life size.
 *
 * The banner is the product's whole second act — the card gets into the
 * wallet, and then this is what brings the customer back — so it is drawn as
 * the thing itself rather than as a feature bullet with an icon.
 *
 * Deliberately not a device mockup: the banners sit on the band unattached,
 * slightly overlapping and each turned a degree or so, the way a stack of
 * them actually looks when three arrive on a locked phone. The rotation is
 * static, not animated, so it costs nothing under reduced motion.
 */
export function NotificationBanner({
  icon: Icon,
  app,
  when,
  message,
  tone,
  className,
}: {
  icon: LucideIcon;
  app: string;
  when: string;
  message: string;
  tone: "violet" | "magenta" | "blue";
  className?: string;
}) {
  const iconTone = {
    violet: "bg-brand-violet",
    magenta: "bg-brand-magenta",
    blue: "bg-brand-blue",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-3 shadow-[0_12px_32px_-12px_rgb(15_15_35/0.45)]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg",
            iconTone,
          )}
        >
          <Icon size={15} className="text-white" aria-hidden="true" />
        </span>

        {/* The app name is the sender, so it reads as a label rather than a
            heading — uppercase in Latin, and untouched in Hebrew, which has
            no case for `uppercase` to act on. */}
        <p className="t-eyebrow min-w-0 flex-1 truncate text-ink">{app}</p>

        <span className="shrink-0 text-xs text-ink-subtle">{when}</span>
      </div>

      <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-muted">
        {message}
      </p>
    </div>
  );
}
