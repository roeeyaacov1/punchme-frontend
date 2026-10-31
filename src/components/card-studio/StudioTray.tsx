import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
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

/** The edge rises with the bar in its 240ms and comes down with it in 180ms. */
const EDGE_IN = "translate var(--duration-lights) var(--ease-drawer)";
const EDGE_OUT = "translate var(--duration-exit) var(--ease-drawer)";
const EDGE_IN_MS = 240;

function clearEdge(element: HTMLElement) {
  element.style.removeProperty("transition");
  element.style.removeProperty("translate");
}

/**
 * One of the studio's trays, rising over the lower half of a phone so every
 * choice in it lands on the card still in view above it.
 *
 * Not a modal, which is the point: no scrim over the card, and the page
 * stays live. It is a region named by its heading. Focus goes to the heading
 * as it opens, or to where the studio asks (`start`); Escape, the close
 * button, a drag down by its head or another chip closes it, and the studio
 * puts focus back on the chip that opened it.
 * It is as tall as what it holds, up to half the screen (more where half
 * would hold little past its heading and foot), and scrolls inside past
 * that; the save bar sits at its foot, and the edge goes with it.
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
  footLeaving,
  busy = false,
  start,
}: {
  open: boolean;
  title: ReactNode;
  /** Which tray it is: a new one takes focus to its heading. */
  trayKey: string;
  /** `false` when the tray holds open: a drag that let it go then brings it back. */
  onClose: () => boolean | void;
  onHeight?: (height: number) => void;
  children: ReactNode;
  foot?: ReactNode;
  /** The foot is on its way out: the edge comes down as it goes. */
  footLeaving?: boolean;
  /** A save is running: the tray holds still, open, with Save at its foot,
   * so what it sends is what the owner sees and focus stays on Save. */
  busy?: boolean;
  /** Where focus goes as it opens, instead of its heading: the card's name,
   * after a Save that found none. */
  start?: RefObject<HTMLElement>;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const headingId = useId();
  const panel = useRef<HTMLElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const headBox = useRef<HTMLDivElement>(null);
  const bodyBox = useRef<HTMLDivElement>(null);
  const footBox = useRef<HTMLDivElement>(null);
  // The panel's height as last laid out, before whatever changes it now.
  const height = useRef(0);
  const drag = useSheetDrag({ panel, scrim: ghost, enabled: open && !busy, reduced, onClose });

  // `inert` set on the element: React 18 doesn't know the attribute.
  useLayoutEffect(() => {
    if (headBox.current) headBox.current.inert = busy;
    if (bodyBox.current) bodyBox.current.inert = busy;
  });
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
  // once the tray is there to hold it, unless the studio asked for a field.
  useLayoutEffect(() => {
    if (open && shown) (start?.current ?? heading.current)?.focus({ preventScroll: true });
  }, [open, shown, trayKey, start]);

  useEffect(() => {
    if (!open || busy) return;
    const onKey = (event: KeyboardEvent) => {
      // A dialog over the tray (removing a field) takes its own Escape.
      if (event.key !== "Escape" || event.defaultPrevented || document.querySelector("dialog[open]")) return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  useLayoutEffect(() => {
    const element = panel.current;
    if (!shown || !element) return;
    const report = () => {
      height.current = element.offsetHeight;
      onHeight?.(height.current);
    };
    report();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(report);
    observer.observe(element);
    return () => {
      observer.disconnect();
      onHeight?.(0);
    };
  }, [shown, onHeight]);

  // The edge goes with the bar on the drawer curve, so nothing jumps under
  // the hand. As the bar arrives the tray is taller at once, and is shown
  // growing from where its edge was, in 240ms; as it leaves, the edge comes
  // down by what the tray will lose, in the bar's own 180ms, and the offset
  // goes with the bar. A tray already at half the screen keeps its edge. Set
  // through `translate`, as a drag moves it, since the tray's keyframes hold
  // `transform`, and only taken off again while still its own: a drag that
  // caught the tray meanwhile owns it. With reduced motion it moves at once.
  const hasFoot = !!foot;
  const edge = useRef({ foot: hasFoot, leaving: !!footLeaving });
  const edgeTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(edgeTimer.current), []);
  useLayoutEffect(() => {
    const element = panel.current;
    const was = edge.current;
    edge.current = { foot: hasFoot, leaving: !!footLeaving };
    if (!element) return;
    const ours = () => element.style.transition === EDGE_IN || element.style.transition === EDGE_OUT;
    const move = (y: number, transition: string) => {
      window.clearTimeout(edgeTimer.current);
      // A timed move starts from wherever the edge is now.
      void getComputedStyle(element).translate;
      element.style.transition = transition;
      element.style.translate = `0 ${y}px`;
    };
    const rise = () => {
      move(0, EDGE_IN);
      edgeTimer.current = window.setTimeout(() => ours() && clearEdge(element), EDGE_IN_MS + 40);
    };
    if (was.foot && !hasFoot) {
      // Gone, and the tray shorter by just what the edge came down.
      if (ours()) clearEdge(element);
      return;
    }
    if (!open || reduced) return;
    if (!was.foot && hasFoot) {
      const grew = element.offsetHeight - height.current;
      if (grew < 1) return;
      move(grew, "none");
      rise();
    } else if (hasFoot && footLeaving && !was.leaving) {
      // Worked out, never tried: hiding the foot to measure would cut the
      // bar's own fade. Without it, the body takes back what it scrolls,
      // up to half the screen.
      const box = footBox.current;
      const body = bodyBox.current;
      if (!box || !body) return;
      const whole = element.offsetHeight;
      const cap = parseFloat(getComputedStyle(element).maxHeight) || Infinity;
      const loses = whole - Math.min(cap, whole - box.offsetHeight + body.scrollHeight - body.clientHeight);
      if (loses >= 1) move(loses, EDGE_OUT);
    } else if (hasFoot && was.leaving && !footLeaving && ours()) {
      // Turned round before it went: back up.
      rise();
    }
  }, [hasFoot, footLeaving, open, reduced]);

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
        // Over the phone bar, as a sheet is: the card keeps the height. Half
        // the screen, unless that leaves no room past its heading and foot
        // (large text, a short screen, a phone on its side): then 18rem,
        // but never more than 85% of the screen.
        "fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[min(85dvh,max(50dvh,18rem))] w-full max-w-2xl touch-manipulation flex-col",
        "rounded-t-glass border border-b-0 border-border bg-surface text-ink shadow-panel-lift",
        motion,
      )}
    >
      <span ref={ghost} aria-hidden className="pointer-events-none absolute size-0" />
      <div ref={headBox} {...drag.handlers} className="shrink-0 max-md:touch-none max-md:select-none">
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
      {/* Its last row keeps clear of the home indicator. The same with a bar
          under it, so what the bar's going takes away is measured true. */}
      <div
        ref={bodyBox}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 sm:px-5"
      >
        {children}
      </div>
      {foot && (
        <div
          ref={footBox}
          className="shrink-0 border-t border-border px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5"
        >
          {foot}
        </div>
      )}
    </section>
  );
}
