import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PunchMark } from "../marketing/PunchMark";
import { ctaClasses, focusRing } from "../marketing/primitives";
import { GroupLabel } from "../dashboard/primitives";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { isStandalone } from "../../pwa/installPrompt";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { cn } from "../../lib/cn";
import { tourSteps, type TourStep } from "./steps";
import { hasSeenTour, markTourSeen, type TourContext } from "./seen";

/**
 * Meeting the dashboard, once.
 *
 * Two moments earn it, and they are the two where somebody has just arrived:
 * the redirect out of the wizard, and the first launch from the home-screen
 * icon. `seen.ts` remembers them separately.
 *
 * Only ever on the overview. The installed app also carries a "Scan a card"
 * shortcut, and a tour that opens over the scanner is a tour that opens with
 * a customer waiting — so if the first stop is somewhere else, it waits until
 * they come here. That also keeps it from landing on top of work in progress.
 *
 * Skip is on every card rather than only the first, and it is a word rather
 * than an ex in a corner: this is the first thing the product asks of someone
 * who has already given it five minutes, and the way out should not have to
 * be found. Escape and a click outside do the same thing, and all three count
 * as seen — being made to skip twice is worse than never being offered.
 */
export function DashboardTour({ replay = 0 }: { replay?: number }) {
  const { business, role } = useBusiness();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Read once. A page cannot stop being standalone while it is running, and
  // pinning it means the context that opened the tour is the context that
  // gets marked when it closes.
  const context = useRef<TourContext>(isStandalone() ? "app" : "web");
  const decided = useRef(false);

  const steps = useMemo(
    () => tourSteps(role, canEnrollRealCustomers(business)),
    [role, business],
  );

  useEffect(() => {
    if (decided.current) return;
    // `business` carries both the role and the plan the steps are filtered
    // on, so an early run would build the wrong tour.
    if (!business) return;
    if (location.pathname !== "/dashboard") return;
    decided.current = true;
    if (steps.length === 0) return;
    if (hasSeenTour(context.current)) return;
    setOpen(true);
  }, [business, location.pathname, steps.length]);

  // Asked for from the account menu. The count only ever goes up; its
  // starting value is whatever it was when this mounted, so the first render
  // is not itself a request.
  const asked = useRef(replay);
  useEffect(() => {
    if (replay === asked.current) return;
    asked.current = replay;
    decided.current = true;
    setOpen(true);
  }, [replay]);

  const close = useCallback(() => {
    setOpen(false);
    markTourSeen(context.current);
  }, []);

  if (!open || steps.length === 0) return null;
  return <Tour steps={steps} onClose={close} />;
}

function Tour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const [index, setIndex] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const reduced = usePrefersReducedMotion();
  const rtl = i18n.dir() === "rtl";

  const step = steps[index];
  const last = index === steps.length - 1;

  useEffect(() => {
    opener.current = document.activeElement;
    panel.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      // The arrows follow the reading direction, not the screen: in Hebrew
      // the cards run right to left and so does "next".
      const forward = rtl ? "ArrowLeft" : "ArrowRight";
      const backward = rtl ? "ArrowRight" : "ArrowLeft";
      if (event.key === forward || event.key === backward) {
        event.preventDefault();
        const move = event.key === forward ? 1 : -1;
        setIndex((i) => Math.min(steps.length - 1, Math.max(0, i + move)));
        return;
      }

      // Tab stays on the card. This one covers the whole screen the moment
      // the dashboard opens, and everything behind it is both invisible and
      // still reachable — a keyboard would walk straight off the tour into a
      // page it cannot see.
      if (event.key === "Tab") {
        const stops = panel.current?.querySelectorAll<HTMLElement>("button");
        if (!stops?.length) return;
        const first = stops[0];
        const final = stops[stops.length - 1];
        const active = document.activeElement;
        if (!panel.current?.contains(active)) {
          event.preventDefault();
          (event.shiftKey ? final : first).focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          final.focus();
        } else if (!event.shiftKey && active === final) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    // The card covers the page; letting the page scroll under it would leave
    // the owner somewhere else than where they were when it closes.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose, rtl, steps.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label={t("tour.skip")}
        onClick={onClose}
        className="absolute inset-0 bg-navy-deep/60 backdrop-blur-[2px]"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("tour.label")}
        tabIndex={-1}
        className={cn(
          "relative flex w-full max-w-md flex-col gap-5 rounded-t-3xl border border-border bg-surface p-5 shadow-panel-lift outline-none sm:rounded-3xl sm:p-6",
          !reduced && "animate-sheet-up",
        )}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <GroupLabel>{t("tour.title")}</GroupLabel>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "-me-2 inline-flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-ink-subtle transition-colors hover:text-ink",
              focusRing,
            )}
          >
            {t("tour.skip")}
          </button>
        </div>

        {/* One live region for the whole card, so moving between steps is
            announced as the sentence it is rather than as three unrelated
            changes — and the position is read first, because "how much of
            this is left" is the thing you cannot see without the marks. */}
        <div aria-live="polite" className="flex flex-col gap-3">
          <p className="sr-only">
            {t("tour.progress", { step: index + 1, total: steps.length })}
          </p>

          <span
            aria-hidden
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-text"
          >
            <step.Icon size={24} />
          </span>

          <div>
            <h2 className="t-card-title text-ink">{t(step.title)}</h2>
            {/* Where it lives, said in the rail's own words and off the
                rail's own keys. */}
            <GroupLabel className="mt-1.5">
              {t(`dashboard.groups.${step.group}`)} ·{" "}
              {t(`dashboard.nav.${step.nav}`)}
            </GroupLabel>
          </div>

          <p className="text-sm text-ink-muted">{t(step.body)}</p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          {/* The card filling up, which is the one form this product already
              means something by. Decorative — the line above says it in
              words. */}
          <span aria-hidden className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <PunchMark
                key={s.key}
                state={i <= index ? "stamped" : "empty"}
                size={14}
              />
            ))}
          </span>

          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className={ctaClasses("secondary", "sm")}
              >
                {t("common.back")}
              </button>
            )}
            <button
              type="button"
              onClick={
                last
                  ? onClose
                  : () => setIndex((i) => Math.min(steps.length - 1, i + 1))
              }
              className={ctaClasses("primary", "sm")}
            >
              {last ? t("tour.done") : t("common.next")}
              {!last && (
                <ArrowRight size={15} aria-hidden className="rtl:-scale-x-100" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
