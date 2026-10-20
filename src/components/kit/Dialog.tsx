import { useId, useRef, type MouseEvent, type ReactNode, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";
import { useReducedMotion } from "./motion";
import { useModal } from "./useModal";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** The actions, at the end edge: the main one last. */
  footer?: ReactNode;
  /** What takes focus on opening. The title, if nothing is given, so it is read first. */
  initialFocus?: RefObject<HTMLElement>;
  /**
   * Where focus goes once it has closed, when not back to what opened it:
   * the page, after a row inside it went somewhere, or another control when
   * the opener has gone. Read when the exit ends, so it can be chosen as the
   * close begins.
   */
  returnFocus?: RefObject<HTMLElement>;
}

/** 180ms out, or the 150ms gentle fade; the hook waits this long before closing. */
const EXIT_MS = 180;
const GENTLE_MS = 150;

/**
 * A question that has to be answered before anything else: a confirmation,
 * a send that can't be undone. Centred, rising from 0.96 to full size, on a
 * scrim; with reduced motion, a 150ms crossfade in place.
 *
 * Rendered where it is written, so it keeps the theme and the direction of
 * the page — which means it belongs at page level, never inside a row, a
 * form or a stage that is hidden from screen readers. Its content is only
 * mounted while it is open.
 */
export function Dialog(props: ModalProps) {
  return <Modal {...props} kind="dialog" />;
}

/**
 * Work beside the page: a filter, a short form, a choice. On a phone it
 * rises from the bottom on the drawer curve; from 768px up it comes in from
 * the end edge, the left in Hebrew. With reduced motion, a crossfade.
 */
export function Sheet(props: ModalProps) {
  return <Modal {...props} kind="sheet" />;
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  initialFocus,
  returnFocus,
  kind,
}: ModalProps & { kind: "dialog" | "sheet" }) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const { shown, leaving, dialogProps } = useModal({
    open,
    onClose,
    exitMs: reduced ? GENTLE_MS : EXIT_MS,
    initialFocus: initialFocus ?? heading,
    returnFocus,
  });
  if (!shown) return null;

  // A press outside the panel closes it, as the scrim promises.
  const onBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const sheet = kind === "sheet";
  let panelMotion: string;
  if (reduced) panelMotion = leaving ? "animate-gentle-out" : "animate-gentle-in";
  else if (sheet) panelMotion = leaving ? "animate-sheet-fall md:animate-drawer-out" : "animate-sheet-rise md:animate-drawer-in";
  else panelMotion = leaving ? "animate-dialog-out" : "animate-dialog-in";

  return (
    <dialog
      {...dialogProps}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-ink backdrop:bg-transparent"
    >
      <div
        aria-hidden
        className={cn("fixed inset-0 bg-scrim", leaving ? "animate-exit-fade" : "animate-gentle-in")}
      />
      <div
        onClick={onBackdrop}
        className={cn(
          "relative flex h-full overflow-y-auto overscroll-contain",
          sheet ? "items-end justify-center md:items-stretch md:justify-end" : "items-center justify-center p-4",
        )}
      >
        <div
          className={cn(
            "relative flex w-full flex-col bg-surface shadow-panel-lift",
            sheet
              ? "max-h-[90dvh] max-w-lg rounded-t-glass border border-b-0 border-border pb-[max(1.5rem,env(safe-area-inset-bottom))] md:h-full md:max-h-none md:max-w-md md:rounded-none md:rounded-s-panel md:border-y-0 md:border-e-0 md:pb-6"
              : "max-w-md rounded-panel border border-border pb-6",
            panelMotion,
          )}
        >
          {sheet && <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border-strong md:hidden" />}
          <div className="flex items-start gap-4 px-6 pt-5">
            <h2
              ref={heading}
              id={titleId}
              tabIndex={-1}
              className="type-card-title min-w-0 flex-1 pt-2.5 text-ink outline-none"
            >
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
          <div className={cn("flex flex-col px-6", sheet && "min-h-0 flex-1 overflow-y-auto")}>
            {description && (
              <p id={descriptionId} className="type-body mt-1 text-ink-muted">
                {description}
              </p>
            )}
            {children && <div className="mt-5">{children}</div>}
          </div>
          {footer && <div className="mt-6 flex flex-wrap justify-end gap-3 px-6">{footer}</div>}
        </div>
      </div>
    </dialog>
  );
}
