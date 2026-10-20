import { useEffect, useLayoutEffect, useRef, type MouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

/** A drag starts past this many pixels, so a tap on the close button stays a tap. */
const SLOP = 6;
/** Let go past this share of its height and the sheet closes... */
const CLOSE_SHARE = 0.25;
/** ...or flicked down faster than this, in px per ms over the last 100ms.
 * Both are vaul's, Emil Kowalski's own drawer. */
const FLICK = 0.4;
const FLICK_WINDOW_MS = 100;
/** The most a pull upward lifts it: the ground the sheet carries below its
 * edge on a phone (`Dialog`), so lifting it never shows a gap. */
const GIVE = 48;
/** A click this soon after a drag ended belongs to the drag. */
const CLICK_AFTER_DRAG_MS = 400;

interface Drag {
  id: number;
  head: HTMLElement;
  /** Where the pointer went down. The sheet follows from here once the
   * pointer has moved past the slop, so a fast flick loses none of its
   * first frame. */
  downY: number;
  /** The sheet's offset when it was caught. */
  from: number;
  offset: number;
  height: number;
  moving: boolean;
  /** The pointer's last 100ms, for the flick. */
  trail: { y: number; t: number }[];
}

/** How far the sheet sits below where it rests, even halfway back from a let-go. */
function offsetOf(element: HTMLElement): number {
  const value = getComputedStyle(element).translate;
  if (!value || value === "none") return 0;
  const y = value.split(" ")[1];
  return y ? parseFloat(y) : 0;
}

/**
 * Drag a bottom sheet down to close it, by its handle and its title row.
 *
 * The panel follows the finger through `translate`, which composes with the
 * `transform` its keyframes animate, so a drag never fights the sheet rising
 * and the exit carries on from wherever the finger let go: `sheet-fall` runs
 * on top of the drag's offset. The scrim lightens as it goes, through a layer
 * of its own whose opacity multiplies the scrim's fade. Neither is set
 * through a variable on a parent, so nothing but those two restyles.
 *
 * Let go past a quarter of its height, or flicked, and it closes the way it
 * would have anyway. Otherwise it goes back on the drawer curve, and can be
 * caught again on the way. Pulled up, it gives a little, less the further it
 * goes, rather than stopping at a wall.
 *
 * Only the head drags: the body keeps its own scroll and its rows their
 * taps. Once pressed, the window hears the pointer, so a mouse that leaves
 * the head before the drag begins is still followed. One finger at a time,
 * and only on a phone, where the sheet rises from the bottom and draws the
 * handle. Escape, the close button, the scrim and the back gesture are
 * unchanged, so nobody needs this to close it.
 */
export function useSheetDrag({
  panel,
  scrim,
  enabled,
  reduced,
  onClose,
}: {
  panel: RefObject<HTMLElement>;
  scrim: RefObject<HTMLElement>;
  enabled: boolean;
  reduced: boolean;
  onClose: () => void;
}) {
  const drag = useRef<Drag | null>(null);
  const endedAt = useRef(-Infinity);
  const settling = useRef(0);
  const stopListening = useRef<(() => void) | null>(null);
  // Read when the pointer moves, so a render mid-drag can't leave it stale.
  const latest = useRef({ reduced, onClose });
  useLayoutEffect(() => {
    latest.current = { reduced, onClose };
  });
  useEffect(
    () => () => {
      window.clearTimeout(settling.current);
      stopListening.current?.();
    },
    [],
  );

  const place = (offset: number, height: number) => {
    const y = offset < 0 ? -Math.min(GIVE, 2 * Math.sqrt(-offset)) : offset;
    if (panel.current) panel.current.style.translate = `0 ${y}px`;
    if (scrim.current) scrim.current.style.opacity = String(1 - Math.min(1, Math.max(0, y) / height));
  };

  // Back where it rests: 300ms on the drawer curve, or 150ms with reduced
  // motion. A transition rather than a keyframe, so a finger can catch it.
  const settle = () => {
    const element = panel.current;
    const layer = scrim.current;
    if (!element || !layer) return;
    const gentle = latest.current.reduced;
    const timing = gentle
      ? "var(--duration-gentle) var(--ease-out-strong)"
      : "var(--duration-sheet) var(--ease-drawer)";
    element.style.transition = `translate ${timing}`;
    element.style.translate = "0 0";
    layer.style.transition = `opacity ${timing}`;
    layer.style.opacity = "1";
    settling.current = window.setTimeout(
      () => {
        element.style.transition = "";
        element.style.translate = "";
        layer.style.transition = "";
        layer.style.opacity = "";
      },
      (gentle ? 150 : 300) + 40,
    );
  };

  const onMove = (event: PointerEvent) => {
    const current = drag.current;
    const element = panel.current;
    if (!current || event.pointerId !== current.id || !element) return;
    if (!current.moving) {
      if (Math.abs(event.clientY - current.downY) < SLOP) return;
      // Caught where it is, even halfway back from a let-go.
      window.clearTimeout(settling.current);
      current.from = Math.max(0, offsetOf(element));
      current.height = Math.max(1, element.offsetHeight);
      current.moving = true;
      element.style.transition = "none";
      if (scrim.current) scrim.current.style.transition = "none";
      // Captured, so the click that ends a drag lands on the head rather
      // than on the close button it began on.
      try {
        current.head.setPointerCapture(event.pointerId);
      } catch {
        /* the window still hears it */
      }
    }
    current.offset = current.from + event.clientY - current.downY;
    current.trail.push({ y: event.clientY, t: event.timeStamp });
    while (current.trail.length > 2 && event.timeStamp - current.trail[0].t > FLICK_WINDOW_MS) {
      current.trail.shift();
    }
    place(current.offset, current.height);
  };

  const onUp = (event: PointerEvent) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    drag.current = null;
    stopListening.current?.();
    if (!current.moving) return;
    endedAt.current = event.timeStamp;
    const first = current.trail[0];
    const velocity =
      first && event.timeStamp > first.t ? (event.clientY - first.y) / (event.timeStamp - first.t) : 0;
    if (current.offset > 0 && (current.offset >= current.height * CLOSE_SHARE || velocity > FLICK)) {
      latest.current.onClose();
    } else {
      settle();
    }
  };

  const onCancel = (event: PointerEvent) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    drag.current = null;
    stopListening.current?.();
    if (current.moving) settle();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    // A second finger landing mid-drag would make it jump.
    if (!enabled || drag.current || !event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // From 768px the sheet comes in from the end edge and has no handle.
    if (window.matchMedia("(min-width: 768px)").matches) return;
    drag.current = {
      id: event.pointerId,
      head: event.currentTarget,
      downY: event.clientY,
      from: 0,
      offset: 0,
      height: 1,
      moving: false,
      trail: [{ y: event.clientY, t: event.timeStamp }],
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    stopListening.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      stopListening.current = null;
    };
  };

  // A drag that began on the close button doesn't also press it.
  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (event.timeStamp - endedAt.current > CLICK_AFTER_DRAG_MS) return;
    endedAt.current = -Infinity;
    event.preventDefault();
    event.stopPropagation();
  };

  return { onPointerDown, onClickCapture };
}
