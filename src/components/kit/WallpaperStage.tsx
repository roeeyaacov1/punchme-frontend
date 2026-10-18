import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { readableInk } from "../../lib/color";
import { cn } from "../../lib/cn";
import { wallpaperFor } from "./wallpaper";

/** The message a pass brings, as the lock screen would show it. */
export interface LockNotification {
  /** Who it's from: the business, as the pass names it. */
  sender: string;
  title?: string;
  body: string;
}

export interface WallpaperStageProps {
  cardColor: string;
  /** The stamp's colour lives in the card's design, not in its preview value. */
  stampColor: string;
  /** The colour the card sets its own text in, for the app icon's letter. */
  foregroundColor?: string;
  notification?: LockNotification;
  /** What a screen reader hears instead of the picture. */
  summary: string;
  /** The pass itself: `AppleCardPreview` or `GoogleCardPreview`, untouched. */
  children: ReactNode;
  className?: string;
}

/**
 * The owner's card on the customer's phone: standing on a wallpaper made
 * from its own colours, under the message it brings, with "Roughly how it
 * looks on the lock screen" beneath it. The pass is the hero and is never
 * redrawn; this only frames it, in its 300px slot.
 *
 * It is the customer's phone, so it looks the same at night: its root is a
 * nested day scope. The wallpaper is gradients with no blur at runtime
 * (wallpaper.ts), so the stage costs nothing to scroll past. Text styles are
 * reset around the slot, so a type class on the page can't leak into the
 * frozen preview, whose own root sets its face but not its leading.
 *
 * The slot is exactly 300px, never squeezed: Apple's type is sized for it.
 * So the stage wants 340px; on a screen narrower than that, the stage clips
 * the edges of the pass rather than shrink it.
 */
export function WallpaperStage({
  cardColor,
  stampColor,
  foregroundColor,
  notification,
  summary,
  children,
  className,
}: WallpaperStageProps) {
  const { t } = useTranslation();
  const paper = useMemo(() => wallpaperFor(cardColor, stampColor), [cardColor, stampColor]);
  const initial = notification ? (Array.from(notification.sender.trim())[0] ?? "") : "";
  return (
    <figure className={cn("theme-lightbox relative w-[340px] max-w-full overflow-hidden rounded-glass", className)}>
      <div aria-hidden className="flex flex-col items-center gap-3 px-5 pb-5 pt-6" style={paper}>
        {notification && (
          <div className="theme-lit w-[300px] max-w-full rounded-[1.25rem] bg-surface/95 p-3 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)]">
            <div className="flex items-center gap-2.5">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-[0.4375rem] font-heading text-[0.8125rem] font-medium ring-1 ring-inset ring-rim/10"
                style={{ backgroundColor: cardColor, color: foregroundColor ?? readableInk(cardColor) }}
              >
                {initial}
              </span>
              <span dir="auto" className="type-tag min-w-0 flex-1 truncate text-ink">
                {notification.sender}
              </span>
              <span className="shrink-0 text-xs text-ink-subtle">{t("messaging.editor.previewNow")}</span>
            </div>
            {notification.title && (
              <p dir="auto" className="mt-2 text-sm font-semibold text-ink">
                {notification.title}
              </p>
            )}
            <p dir="auto" className={cn("text-sm leading-snug text-ink-muted", notification.title ? "mt-0.5" : "mt-2")}>
              {notification.body}
            </p>
          </div>
        )}
        <div className="w-[300px] shrink-0 font-normal not-italic leading-normal tracking-normal">{children}</div>
        <span className="theme-lit type-tag rounded-full bg-surface/95 px-3 py-1 text-ink-muted">
          {t("messaging.editor.previewLabel")}
        </span>
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
