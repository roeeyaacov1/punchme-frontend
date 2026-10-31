import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

/**
 * Where the owner is on the road, and what comes next: "Step 1 of 4 · Next:
 * Saving", over a hairline rule of as many parts as there are stops, ink up
 * to here. It is not a control: Back is the screen's own, so the Tab path
 * goes from the top bar straight to the question. A screen reader hears the
 * stop once, as the screen changes.
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
  return (
    <div className="flex flex-col gap-2">
      <p className="type-label text-ink-muted">
        {t("onboarding.progress", { n: stop, total })} <span aria-hidden>·</span>{" "}
        {next ? t("onboarding.next", { step: next }) : t("onboarding.lastStop")}
      </p>
      <div aria-hidden className="flex gap-1">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={cn("h-0.5 flex-1 rounded-full", index < stop ? "bg-ink" : "bg-border-strong")} />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {t("onboarding.progressSpoken", { n: stop, total, step: here })}
      </p>
    </div>
  );
}
