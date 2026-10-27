import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../kit/Button";
import { useReducedMotion } from "../kit/motion";
import { useSheetDrag } from "../kit/useSheetDrag";

/** 180ms out, or the 150ms gentle fade; 300ms when a drag let it go. */
const EXIT_MS = 180;
const GENTLE_MS = 150;
const SHEET_MS = 300;

/**
 * One of the studio's trays, rising over the lower half of a phone so every
 * choice in it lands on the card still in view above it.
 *
 * Not a modal, which is the point: no scrim over the card, and the page
 * stays live. It is a region named by its heading. Focus goes to the heading
 * as it opens; Escape, the close button, a drag down by its head or another
 * chip closes it, and the studio puts focus back on the chip that opened it.
 * It is as tall as what it holds, up to half the screen, and scrolls inside
 * past that; the save bar sits at its foot.
 *
 * It rises and falls on the kit's sheet motion, a crossfade with reduced
 * motion, and drags with the kit's `useSheetDrag`, used as it is: the hook
 * lightens a scrim as the tray goes down, so the tray gives it an empty
 * layer of its own, and it only drags under 768px.
 */
export function StudioTray({
  open,
  title,
  trayKey,
  onClose,
  onHeight,
  children,
  foot,
}: {
  open: boolean;
  title: ReactNode;
  /** Which tray it is: a new one takes focus to its heading. */
  trayKey: string;
  onClose: () => void;
  onHeight?: (height: number) => void;
  children: ReactNode;
  foot?: ReactNode;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const headingId = useId();
  const panel = useRef<HTMLElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const drag = useSheetDrag({ panel, scrim: ghost, enabled: open, reduced, onClose });
  const [shown, setShown] = useState(open);

  useEffect(() => {
    if (open) {
      setShown(true);
      return;
    }
    const id = window.setTimeout(() => setShown(false), drag.draggedOut ? SHEET_MS : reduced ? GENTLE_MS : EXIT_MS);
    return () => window.clearTimeout(id);
  }, [open, reduced, drag.draggedOut]);

  // A new tray, or the same one opened again: its heading is read first,
  // once the tray is there to hold it.
  useLayoutEffect(() => {
    if (open && shown) heading.current?.focus({ preventScroll: true });
  }, [open, shown, trayKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      // A dialog over the tray (removing a field) takes its own Escape.
      if (event.key !== "Escape" || event.defaultPrevented || document.querySelector("dialog[open]")) return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useLayoutEffect(() => {
    const element = panel.current;
    if (!shown || !element || !onHeight) return;
    onHeight(element.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => onHeight(element.offsetHeight));
    observer.observe(element);
    return () => {
      observer.disconnect();
      onHeight(0);
    };
  }, [shown, onHeight]);

  if (!shown) return null;
  const leaving = !open;
  let motion: string;
  if (reduced) motion = leaving ? "animate-gentle-out" : "animate-gentle-in";
  else if (leaving && drag.draggedOut) motion = "";
  else motion = leaving ? "animate-sheet-fall" : "animate-sheet-rise";

  return (
    <section
      ref={panel}
      aria-labelledby={headingId}
      className={cn(
        // Over the phone bar, as a sheet is: the card keeps the height.
        "fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[50dvh] w-full max-w-2xl touch-manipulation flex-col",
        "rounded-t-glass border border-b-0 border-border bg-surface text-ink shadow-panel-lift",
        motion,
      )}
    >
      <span ref={ghost} aria-hidden className="pointer-events-none absolute size-0" />
      <div {...drag.handlers} className="shrink-0 max-md:touch-none max-md:select-none">
        <span aria-hidden className="mx-auto mt-2.5 block h-1 w-10 rounded-full bg-border-strong md:hidden" />
        <div className="flex items-center gap-3 px-4 pt-2 sm:px-5">
          <h2 ref={heading} id={headingId} tabIndex={-1} className="type-card-title min-w-0 flex-1 text-ink outline-none">
            {title}
          </h2>
          <Button
            variant="quiet"
            size="icon"
            aria-label={t("common.close")}
            icon={<X aria-hidden />}
            onClick={onClose}
            className="-me-2.5"
          />
        </div>
      </div>
      {/* With no bar at its foot, its own last row keeps clear of the home
          indicator. */}
      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 sm:px-5",
          foot ? "pb-5" : "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        )}
      >
        {children}
      </div>
      {foot && (
        <div className="shrink-0 border-t border-border px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
          {foot}
        </div>
      )}
    </section>
  );
}
