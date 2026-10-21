import type { HTMLAttributes, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/cn";
import { LitPanel } from "./LitPanel";

export type NoticeTone = "ok" | "warn" | "danger";

const ICONS: Record<NoticeTone, ReactNode> = {
  ok: <CircleCheck aria-hidden />,
  warn: <TriangleAlert aria-hidden />,
  danger: <CircleAlert aria-hidden />,
};

// The state's colour stays on its icon and its title; the sentence is ink
// (14.88:1). On a panel by day ok is 5.40:1, warn 6.98:1 and danger 6.37:1;
// at night 11.16, 11.80 and 8.96:1. A lit notice wears the day values.
const TONES: Record<NoticeTone, string> = {
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
};

export interface NoticeProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone: NoticeTone;
  /** A few words in the state's colour, said first. */
  title?: ReactNode;
  /** The sentence, in ink. */
  children?: ReactNode;
  /** What to do about it: a button or a link, under the words. */
  action?: ReactNode;
  /** Keeps its light at night, like the QR code. */
  lit?: boolean;
  /** Replaces the state's own icon. */
  icon?: ReactNode;
}

/**
 * Something a page has to say in place: done, worth knowing, or wrong. An
 * icon and words on a plain panel, never a warm fill, because Lightbox keeps
 * the warm fill for the one thing to press. The icon only repeats what the
 * words say, so the state is also named to a screen reader.
 *
 * Not a live region by itself: a page that needs one passes `role`.
 */
export function Notice({ tone, title, children, action, lit, icon, className, ...props }: NoticeProps) {
  const { t } = useTranslation();
  return (
    <LitPanel light={lit ? "lit" : "panel"} className={cn("flex items-start gap-3 p-4 sm:px-5", className)} {...props}>
      <span className={cn("flex h-6 shrink-0 items-center [&_svg]:size-5", TONES[tone])}>{icon ?? ICONS[tone]}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="sr-only">{t(`kit.notice.${tone}`)}</span>
        {title && <p className={cn("type-body font-semibold", TONES[tone])}>{title}</p>}
        {children && <div className="type-body text-ink">{children}</div>}
        {action && <div className="mt-2 flex flex-wrap items-center gap-2">{action}</div>}
      </div>
    </LitPanel>
  );
}
