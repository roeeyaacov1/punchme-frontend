import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject, type SyntheticEvent } from "react";
import { lockScroll } from "./scrollLock";

/**
 * Drives a native <dialog> as a modal that can animate out.
 *
 * `showModal()` gives a real focus trap and makes the rest of the page
 * inert, which no hand-rolled trap matches. The rules it imposes:
 *
 * - Never the `open` attribute: React would write it and open the dialog as
 *   a non-modal one. `showModal()` only when it isn't open already, which
 *   also survives StrictMode running the effect twice.
 * - Escape is caught on keydown and stopped, so a dialog inside a dialog
 *   only closes itself, and it closes through `onClose`, so the exit can
 *   play. The browser's own `close` event is still the source of truth:
 *   Chrome won't always let `cancel` be held back, and Android's back
 *   gesture arrives that way, so whenever the dialog closes by itself the
 *   state follows it.
 * - Focus goes to `initialFocus` (or the heading) once it's open, and back
 *   to whatever opened it once it has closed, or to `returnFocus` when the
 *   caller names somewhere else. Until then the page is inert, so nothing
 *   outside the dialog could take it any earlier.
 */
export function useModal({
  open,
  onClose,
  exitMs,
  initialFocus,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  exitMs: number;
  initialFocus: RefObject<HTMLElement>;
  returnFocus?: RefObject<HTMLElement>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(open);
  // Mount as soon as it is asked to open; unmount only once the exit is over.
  if (open && !shown) setShown(true);
  const leaving = shown && !open;

  // The latest choice, read when the exit ends rather than when it began.
  const returnTo = useRef(returnFocus);
  useLayoutEffect(() => {
    returnTo.current = returnFocus;
  });

  const finish = useCallback(() => {
    const element = dialog.current;
    if (element?.open) element.close();
    setShown(false);
    const named = returnTo.current?.current;
    const back = named?.isConnected ? named : opener.current;
    opener.current = null;
    if (back?.isConnected) back.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    if (!shown) return;
    const element = dialog.current;
    if (!element || element.open) return;
    if (document.activeElement instanceof HTMLElement) opener.current = document.activeElement;
    element.showModal();
    initialFocus.current?.focus({ preventScroll: true });
  }, [shown, initialFocus]);

  useEffect(() => {
    if (!shown) return;
    return lockScroll();
  }, [shown]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(finish, exitMs + 40);
    return () => window.clearTimeout(timer);
  }, [leaving, exitMs, finish]);

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    if (open) onClose();
  };

  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (open) onClose();
  };

  // The browser closed it itself. Follow it, and tell the page.
  const onNativeClose = () => {
    if (!shown) return;
    finish();
    if (open) onClose();
  };

  return { dialog, shown, leaving, dialogProps: { ref: dialog, onKeyDown, onCancel, onClose: onNativeClose } };
}
