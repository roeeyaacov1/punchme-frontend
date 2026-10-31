import { useLayoutEffect, useRef, useState, type AnimationEvent } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { useReducedMotion } from "../kit";

/**
 * Where the owner is on the road, and what comes next: "Step 1 of 4 · Next:
 * Saving", over a hairline rule of as many parts as there are stops, ink up
 * to here. It is not a control: Back is the screen's own, so the Tab path
 * goes from the top bar straight to the question. A screen reader hears the
 * stop once, as the screen changes.
 *
 * Going on, the new stop's ink draws itself in from the start edge, in the
 * 240ms the screen takes to arrive; with reduced motion it fades in. Going
 * back, the ink just goes.
 */
export function ProgressLine({
  stop,
  total,
  here,
  next,
}: {
  /** 1-based. */
  stop: number;
  total: number;
  /** This stop's name. */
  here: string;
  /** The next stop's name, or null on the last. */
  next: string | null;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const was = useRef(stop);
  const [drawing, setDrawing] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (stop > was.current) setDrawing(stop);
    was.current = stop;
  }, [stop]);
  const drawn = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.target === event.currentTarget) setDrawing(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="type-label text-ink-muted">
        {t("onboarding.progress", { n: stop, total })} <span aria-hidden>·</span>{" "}
        {next ? t("onboarding.next", { step: next }) : t("onboarding.lastStop")}
      </p>
      <div aria-hidden className="flex gap-1">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-border-strong">
            {index < stop && (
              <span
                onAnimationEnd={drawn}
                className={cn(
                  "absolute inset-0 rounded-full bg-ink",
                  index === (drawing ?? 0) - 1 &&
                    (reduced
                      ? "animate-gentle-in"
                      : "origin-left animate-[draw-rule_var(--duration-lights)_var(--ease-out-strong)_both] rtl:origin-right"),
                )}
              />
            )}
          </span>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {t("onboarding.progressSpoken", { n: stop, total, step: here })}
      </p>
    </div>
  );
}
