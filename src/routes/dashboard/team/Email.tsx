import { cn } from "../../../lib/cn";

/**
 * A person, who here is an email. It reads left to right in its own block,
 * so a long one is cut at its own end ("dana.levi@kafe-ba…") rather than
 * losing its start at the Hebrew line's, and `match-parent` still sets it
 * at the start edge with the names around it (Chrome and Safari know it
 * only as `-webkit-match-parent`). `whole` wraps it instead, for a sheet's
 * heading, where it reads in full.
 */
export function Email({ value, whole }: { value: string; whole?: boolean }) {
  return (
    <span
      dir="ltr"
      className={cn(
        "block [text-align:-webkit-match-parent] [text-align:match-parent]",
        whole ? "[overflow-wrap:anywhere]" : "truncate",
      )}
    >
      {value}
    </span>
  );
}
