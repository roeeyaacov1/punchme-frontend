import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * One chapter of the guide, on the wall. A heading and a sentence, then its
 * specimens: no label above the heading, no section numbers, and no panel
 * inside a panel.
 */
export function GuideSection({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-32 border-t border-border py-14"
    >
      <h2 id={`${id}-title`} className="type-title text-ink">
        {title}
      </h2>
      {lead && <p className="type-prose mt-3 text-ink-muted">{lead}</p>}
      <div className="mt-10 flex flex-col gap-14">{children}</div>
    </section>
  );
}

/** One thing being shown: its name, an optional line, and the thing. */
export function Specimen({
  title,
  lead,
  children,
  className,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="type-card-title text-ink">{title}</h3>
      {lead && <p className="type-body mt-1 max-w-2xl text-ink-muted">{lead}</p>}
      <div className={cn("mt-5")}>{children}</div>
    </div>
  );
}

/** A token's name, as code: identifiers aren't copy, and read left to right. */
export function TokenName({ children }: { children: ReactNode }) {
  return (
    <code dir="ltr" className="font-mono text-[0.8125rem] text-ink-muted">
      {children}
    </code>
  );
}
