import type { ReactNode } from "react";
import { Link, type To } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { focusRingInset, noTapFlash } from "./classes";

/** A list of rows with a hairline between them. */
export function List({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("divide-y divide-border", className)}>{children}</ul>;
}

export interface ListRowProps {
  /** An avatar, an icon or the card's own chip. */
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  /** A figure, a tag, a time. */
  trailing?: ReactNode;
  /** Points where the row goes, toward the reading end; only on a row that goes somewhere. */
  chevron?: boolean;
  /** The whole row is the link... */
  to?: To;
  /** ...or the whole row is the button. Never a button inside a link. */
  onClick?: () => void;
  className?: string;
}

/**
 * A 56px row: leading, title and meta, trailing. When it does something, the
 * whole row is the one link or button, its ring drawn inside the edge so a
 * panel's rounded corner can't clip it.
 */
export function ListRow({ leading, title, meta, trailing, chevron, to, onClick, className }: ListRowProps) {
  const content = (
    <>
      {leading && <span className="flex shrink-0 items-center">{leading}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
        <span className="type-body truncate font-semibold text-ink">{title}</span>
        {meta && <span className="truncate text-sm text-ink-muted">{meta}</span>}
      </span>
      {trailing && <span className="flex shrink-0 items-center gap-2">{trailing}</span>}
      {chevron && <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-subtle rtl:-scale-x-100" />}
    </>
  );
  const row = "flex min-h-14 w-full items-center gap-3 px-4 py-2";
  const active = cn(row, "transition-colors duration-gentle ease-out hover-fine:bg-ink/5", noTapFlash, focusRingInset);
  return (
    <li className={className}>
      {to !== undefined ? (
        <Link to={to} className={active}>
          {content}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={active}>
          {content}
        </button>
      ) : (
        <div className={row}>{content}</div>
      )}
    </li>
  );
}
