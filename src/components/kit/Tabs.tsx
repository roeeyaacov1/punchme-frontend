import { useId, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { focusRing, focusRingInset, noTapFlash } from "./classes";
import { useReducedMotion } from "./motion";
import { nextRovingIndex } from "./roving";
import { TabsContext, useTabs } from "./tabs-context";

/**
 * Views of one thing, side by side. `Tabs` holds which one is open;
 * `TabList`, `Tab` and `TabPanel` sit inside it.
 */
export function Tabs({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const idBase = useId();
  return <TabsContext.Provider value={{ value, select: onChange, idBase }}>{children}</TabsContext.Provider>;
}

/**
 * The row of tabs: one tab stop, with the arrow keys moving along it the
 * way the language reads (in Hebrew, the left arrow is "next"), and Home and
 * End jumping to the ends. Choosing follows focus, as the pattern expects.
 */
export function TabList({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  const { i18n } = useTranslation();
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const current = tabs.findIndex((tab) => tab === document.activeElement);
    const next = nextRovingIndex(event.key, Math.max(0, current), tabs.length, i18n.dir() === "rtl");
    if (next === null) return;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  };
  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("flex gap-1 overflow-x-auto border-b border-border", className)}
    >
      {children}
    </div>
  );
}

/**
 * A tab. The open one is ink with an ink rule under it; the others are
 * ink-muted (7.27:1). The rule doesn't slide across to a new tab: it lights
 * up under it, because in this world things arrive by light, not by travel.
 */
export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { value: open, select, idBase } = useTabs();
  const reduced = useReducedMotion();
  const selected = value === open;
  return (
    <button
      type="button"
      role="tab"
      id={`${idBase}-tab-${value}`}
      aria-controls={`${idBase}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => select(value)}
      className={cn(
        "relative flex min-h-11 shrink-0 items-center rounded-t-field px-4 font-heading text-base font-medium leading-tight",
        selected ? "text-ink" : "text-ink-muted hover-fine:text-ink",
        noTapFlash,
        focusRingInset,
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-ink",
          selected ? "opacity-100" : "opacity-0",
          reduced ? "transition-opacity duration-gentle ease-out" : "transition-opacity duration-lights ease-out-strong",
        )}
      />
    </button>
  );
}

/** What a tab opens. Only the open one is rendered; it takes focus from the keyboard. */
export function TabPanel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: open, idBase } = useTabs();
  if (value !== open) return null;
  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${value}`}
      aria-labelledby={`${idBase}-tab-${value}`}
      tabIndex={0}
      className={cn("rounded-field", focusRing, className)}
    >
      {children}
    </div>
  );
}
