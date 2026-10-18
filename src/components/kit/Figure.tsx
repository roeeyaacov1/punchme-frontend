import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { linkText } from "./classes";

export type FigureSize = "inline" | "stat" | "count";

const SIZES: Record<FigureSize, string> = {
  inline: "type-figure",
  stat: "type-figure text-[2.75rem] leading-none",
  count: "type-count",
};

export interface FigureProps {
  value: ReactNode;
  size?: FigureSize;
  /** What the number is. */
  label?: ReactNode;
  /** What the reader should know before trusting it. */
  caveat?: ReactNode;
  /** Where it comes from. A sourced figure always shows it, as a link. */
  source?: { label: ReactNode; href: string };
  className?: string;
}

/**
 * A number, set in Rubik's tabular figures so a column of them lines up.
 *
 * `dir="auto"` isolates it: a number on its own reads left to right inside
 * Hebrew ("12 / 8", "₪99", a phone number), and a Hebrew word in it ("פי 6")
 * still reads right to left. It is printed, never counted up, and a figure
 * that makes a claim carries its source under it.
 */
export function Figure({ value, size = "inline", label, caveat, source, className }: FigureProps) {
  const number = (
    <span dir="auto" className={cn(SIZES[size], "text-ink")}>
      {value}
    </span>
  );
  if (!label && !caveat && !source) {
    return <span className={className}>{number}</span>;
  }
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      {number}
      <figcaption className="flex flex-col gap-1.5">
        {label && <span className="type-body text-ink">{label}</span>}
        {caveat && <span className="text-sm leading-snug text-ink-muted">{caveat}</span>}
        {source && (
          <a
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className={cn(linkText, "inline-flex min-h-11 items-center self-start text-sm")}
          >
            {source.label}
          </a>
        )}
      </figcaption>
    </figure>
  );
}
