import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";
import { useReducedMotion } from "./motion";
import { ToastContext, type ToastApi, type ToastInput } from "./toast-context";

/** How long a confirmation stays, counted only while someone could be reading it. */
const STAY_MS = 4000;
const TICK_MS = 250;
/** More than this and the oldest confirmation makes way. */
const MAX_TOASTS = 3;

interface LiveToast extends ToastInput {
  id: number;
  remaining: number;
  leaving: boolean;
}

/**
 * Where toasts appear: fixed at the foot of the screen (at the end edge on a
 * wide one), above the offset a page sets in `--toast-offset`, which is how
 * the dashboard will lift them over its phone bar.
 *
 * A toast confirms what the owner just did — "Copied", "Saved". It is never
 * how a scan's result, a refusal or a loss is said: those stay on the record
 * where they happened, because in this world nothing that matters
 * disappears. A confirmation stays 4 seconds, counted only while it can be
 * read: not while it is hovered or focused, not while the tab is hidden, and
 * not while a dialog has made it unreachable. An error stays until it is
 * dismissed, and is said as an alert.
 *
 * Both live regions are there, empty, for the provider's whole life, so a
 * screen reader is listening before the first toast arrives.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const held = useRef(new Set<number>());
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
  }, []);

  const show = useCallback((input: ToastInput) => {
    const id = nextId.current++;
    setToasts((all) => {
      const next = [...all, { ...input, id, remaining: STAY_MS, leaving: false }];
      const waiting = next.filter((toast) => !toast.leaving);
      if (waiting.length <= MAX_TOASTS) return next;
      const oldest = waiting.find((toast) => toast.tone !== "danger");
      return next.map((toast) => (toast === oldest ? { ...toast, leaving: true } : toast));
    });
  }, []);

  // One clock for every toast, paused whenever nobody could be reading.
  const counting = toasts.some((toast) => !toast.leaving && toast.tone !== "danger");
  useEffect(() => {
    if (!counting) return;
    const clock = window.setInterval(() => {
      if (document.hidden || document.querySelector("dialog:modal")) return;
      setToasts((all) =>
        all.map((toast) => {
          if (toast.leaving || toast.tone === "danger" || held.current.has(toast.id)) return toast;
          const remaining = toast.remaining - TICK_MS;
          return remaining > 0 ? { ...toast, remaining } : { ...toast, remaining: 0, leaving: true };
        }),
      );
    }, TICK_MS);
    return () => window.clearInterval(clock);
  }, [counting]);

  const remove = useCallback((id: number) => {
    held.current.delete(id);
    setToasts((all) => all.filter((toast) => toast.id !== id));
  }, []);

  const hold = useCallback((id: number, on: boolean) => {
    if (on) held.current.add(id);
    else held.current.delete(id);
  }, []);

  const api = useMemo<ToastApi>(() => ({ show }), [show]);
  const polite = toasts.filter((toast) => toast.tone !== "danger");
  const urgent = toasts.filter((toast) => toast.tone === "danger");
  const item = (toast: LiveToast) => (
    <ToastItem
      key={toast.id}
      toast={toast}
      reduced={reduced}
      closeLabel={t("common.close")}
      onHold={hold}
      onDismiss={dismiss}
      onGone={remove}
    />
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section
        aria-label={t("kit.toast.region")}
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--toast-offset,1rem)_+_env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        <div role="status" aria-live="polite" className="flex w-full flex-col items-center gap-2 sm:items-end">
          {polite.map(item)}
        </div>
        <div role="alert" aria-live="assertive" className="flex w-full flex-col items-center gap-2 sm:items-end">
          {urgent.map(item)}
        </div>
      </section>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  reduced,
  closeLabel,
  onHold,
  onDismiss,
  onGone,
}: {
  toast: LiveToast;
  reduced: boolean;
  closeLabel: string;
  onHold: (id: number, held: boolean) => void;
  onDismiss: (id: number) => void;
  onGone: (id: number) => void;
}) {
  const { id, leaving } = toast;
  const tone = toast.tone ?? "neutral";
  // Gone once the exit has played: 180ms, or the 150ms gentle fade.
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => onGone(id), reduced ? 190 : 220);
    return () => window.clearTimeout(timer);
  }, [leaving, id, reduced, onGone]);

  let motion: string;
  if (leaving) motion = reduced ? "animate-gentle-out" : "animate-exit-fade";
  else motion = reduced ? "animate-gentle-in" : "animate-lights-on";

  return (
    <div
      onMouseEnter={() => onHold(id, true)}
      onMouseLeave={() => onHold(id, false)}
      onFocus={() => onHold(id, true)}
      onBlur={() => onHold(id, false)}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-panel border border-border bg-surface py-3 pe-2 ps-4 text-ink shadow-panel-lift",
        motion,
      )}
    >
      {tone === "ok" && <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-ok" />}
      {tone === "danger" && <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
        <p className="type-body font-semibold text-ink">{toast.title}</p>
        {toast.body && <p className="text-sm leading-snug text-ink-muted">{toast.body}</p>}
        {toast.action && (
          <Button
            variant="quiet"
            onClick={() => {
              toast.action?.onClick();
              onDismiss(id);
            }}
            className="-ms-3 self-start underline underline-offset-[3px]"
          >
            {toast.action.label}
          </Button>
        )}
      </div>
      <Button variant="quiet" size="icon" aria-label={closeLabel} icon={<X aria-hidden />} onClick={() => onDismiss(id)} />
    </div>
  );
}
