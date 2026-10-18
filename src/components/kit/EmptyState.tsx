import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { LitPanel } from "./LitPanel";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  /** The one thing to do about it. */
  action?: ReactNode;
  /** A heading when it stands for a whole section; plain text by default. */
  titleAs?: "h2" | "h3" | "h4" | "p";
  /** Drawn as its own lit panel, or bare when it already sits inside one. */
  framed?: boolean;
  className?: string;
}

/**
 * Nothing here yet, said plainly, with what to do about it. A lit panel
 * holding one line and one action, and the rest of the light left empty.
 * No illustration standing in for content.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
  titleAs: Title = "p",
  framed = true,
  className,
}: EmptyStateProps) {
  const inside = (
    <>
      {icon && (
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-full bg-background text-ink-subtle [&_svg]:size-6"
        >
          {icon}
        </span>
      )}
      <Title className="type-card-title text-ink">{title}</Title>
      {body && <p className="type-body max-w-sm text-ink-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </>
  );
  const layout = "flex flex-col items-center gap-3 px-6 py-10 text-center";
  return framed ? (
    <LitPanel className={cn(layout, className)}>{inside}</LitPanel>
  ) : (
    <div className={cn(layout, className)}>{inside}</div>
  );
}
