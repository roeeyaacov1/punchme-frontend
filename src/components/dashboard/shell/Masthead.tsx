import { cn } from "../../../lib/cn";
import { Identity } from "./Identity";

/**
 * The masthead, under the full rail's breakpoint: who the shop is, and
 * nothing at its end, since the person lives in the bar's fifth slot or at
 * the rail's foot. 56px, sticky, on a solid wall with a hairline under it,
 * and no blur: the page scrolls under a wall, not under frosted glass. Every
 * page carries its own h1 a few pixels below, so the masthead doesn't
 * repeat the title.
 */
export function Masthead({
  frame,
  switchOn,
  className,
}: {
  frame: string;
  switchOn: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        frame,
        // 56px below the top inset rather than including it, or a status bar
        // drawn over the page would eat the row the shop's name sits in.
        "sticky top-0 z-20 flex min-h-[calc(3.5rem+env(safe-area-inset-top))] items-center border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] text-ink sm:px-6",
        className,
      )}
    >
      <Identity layout="line" switchOn={switchOn} />
    </header>
  );
}
