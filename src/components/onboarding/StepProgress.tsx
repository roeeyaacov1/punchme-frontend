import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PunchMark } from "../marketing/PunchMark";
import { focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";

/**
 * The wizard's progress, drawn as a row of punches — the landing page's one
 * ornament, meaning here exactly what it means there: a thing done. Steps
 * already taken are inked and can be walked back to; the current one is the
 * gold ring; the rest are printed guides waiting.
 */
export function StepProgress({
  steps,
  current,
  reachable,
  hrefFor,
  labelFor,
  className,
}: {
  steps: readonly string[];
  current: string;
  /** Steps the owner may jump back to (everything they have completed). */
  reachable: (step: string) => boolean;
  hrefFor: (step: string) => string;
  labelFor: (step: string) => string;
  className?: string;
}) {
  const { t } = useTranslation();
  const index = steps.indexOf(current);
  return (
    <nav aria-label={t("onboarding.progress", { n: index + 1, total: steps.length })} className={className}>
      <ol className="flex items-center justify-center gap-1.5">
        {steps.map((step, i) => {
          const state = i < index ? "stamped" : i === index ? "reward" : "empty";
          const canGo = i < index && reachable(step);
          const mark = <PunchMark state={state} size={16} />;
          return (
            <li key={step} className="flex items-center">
              {canGo ? (
                <Link
                  to={hrefFor(step)}
                  aria-label={labelFor(step)}
                  className={cn(
                    "inline-flex h-11 w-7 items-center justify-center rounded-md transition-transform hover:scale-110",
                    focusRing,
                  )}
                >
                  {mark}
                </Link>
              ) : (
                <span
                  className="inline-flex h-11 w-7 items-center justify-center"
                  aria-current={i === index ? "step" : undefined}
                  aria-label={labelFor(step)}
                >
                  {mark}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {t("onboarding.progress", { n: index + 1, total: steps.length })}: {labelFor(current)}
      </p>
    </nav>
  );
}
