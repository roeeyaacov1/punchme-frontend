import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { useReducedMotion } from "./motion";

/**
 * A placeholder in the shape of what is coming, in the hairline colour. It
 * breathes slowly while it waits — status, like the scanner's sweep — and
 * holds still under reduced motion. Only while something is loading; never
 * standing in for content that doesn't exist.
 */
export function Skeleton({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return <span aria-hidden className={cn("block rounded-md bg-border", !reduced && "animate-skeleton", className)} />;
}

/**
 * Wraps placeholders so a screen reader hears "Loading" once instead of a
 * list of nothing.
 */
export function Loading({ children, className }: { children: ReactNode; className?: string }) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{t("common.loading")}</span>
      {children}
    </div>
  );
}

/** Rows shaped like a list's, while the list loads. */
export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <Loading>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex min-h-14 items-center gap-3 px-4 py-2">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <span className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </span>
          </div>
        ))}
      </div>
    </Loading>
  );
}
