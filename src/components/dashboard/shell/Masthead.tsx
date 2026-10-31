import { useLayoutEffect, useRef, type RefObject } from "react";
import { cn } from "../../../lib/cn";
import { Identity } from "./Identity";

/**
 * The masthead, under the full rail's breakpoint: who the shop is, and
 * nothing at its end, since the person lives in the bar's fifth slot or at
 * the rail's foot. 56px, sticky, on a solid wall with a hairline under it,
 * and no blur: the page scrolls under a wall, not under frosted glass. Every
 * page carries its own h1 a few pixels below, so the masthead doesn't
 * repeat the title.
 *
 * With large text on a phone the plan's state takes a second line rather
 * than push the page wider than the screen, and the masthead grows to hold
 * it. The page keeps clear of its real height, through `--masthead-height`.
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
  const header = useRef<HTMLElement>(null);
  usePublishedHeight(header);
  return (
    <header
      ref={header}
      className={cn(
        frame,
        // 56px below the top inset rather than including it, or a status bar
        // drawn over the page would eat the row the shop's name sits in. The
        // 4px above and below fit inside the 56 around a one-line row and
        // the hairline, and only show around two lines.
        "sticky top-0 z-20 flex min-h-[calc(3.5rem+env(safe-area-inset-top))] items-center border-b border-border bg-background px-4 pb-1 pt-[calc(0.25rem+env(safe-area-inset-top))] text-ink sm:px-6",
        className,
      )}
    >
      <Identity layout="line" switchOn={switchOn} />
    </header>
  );
}

/**
 * The masthead's height, its top inset and hairline included, as
 * `--masthead-height` on <html> while it is mounted: 0 while the full rail
 * hides it.
 */
function usePublishedHeight(ref: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--masthead-height", `${element.getBoundingClientRect().height}px`);
    set();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(set);
    observer?.observe(element, { box: "border-box" });
    return () => {
      observer?.disconnect();
      root.style.removeProperty("--masthead-height");
    };
  }, [ref]);
}
