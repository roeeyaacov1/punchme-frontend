import { UserRound } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * A customer, at the size of a letter: a 40px circle in no colour at all,
 * because on a roster row the only colour is the one that means somebody is
 * owed a reward. Intl-aware, so a Hebrew name gives a Hebrew letter and an
 * emoji stays whole. A customer who joined without a name gets a person
 * rather than a stray dot.
 */
export function Monogram({ name, className }: { name: string; className?: string }) {
  const initial = Array.from(name.trim())[0];
  return (
    <span
      // The name it is drawn from is beside it in the same row, so to a
      // screen reader this would be the same letter read twice.
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-background font-heading text-base font-medium uppercase leading-none text-ink-muted [&_svg]:size-5",
        className,
      )}
    >
      {initial ?? <UserRound />}
    </span>
  );
}
