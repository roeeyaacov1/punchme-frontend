import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { ctaClasses, focusRing } from "../marketing/primitives";

/**
 * One wizard screen: a way back, the question, the choice, and one big Next.
 * The title takes focus when the step mounts — the layout around it does not
 * change between steps, so without this a keyboard or screen-reader user is
 * left wherever the last click was.
 */
export function StepShell({
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  nextBusy = false,
  hideNext = false,
  error,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Submitting the form (Enter in a field, or the button). */
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextBusy?: boolean;
  hideNext?: boolean;
  error?: string | null;
  children?: ReactNode;
  /** Below the CTA — secondary links. */
  footer?: ReactNode;
}) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (nextDisabled || nextBusy) return;
    onNext?.();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex min-h-[28px] items-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={cn(
              "-ms-2 inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-medium text-ink-muted hover:text-ink",
              focusRing,
            )}
          >
            <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
            {t("common.back")}
          </button>
        )}
      </div>

      <div>
        <h1
          ref={heading}
          tabIndex={-1}
          className="t-h3 text-balance text-ink outline-none"
        >
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-pretty text-ink-muted">{subtitle}</p>}
      </div>

      {children}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {!hideNext && (
        <button
          type="submit"
          disabled={nextDisabled || nextBusy}
          aria-busy={nextBusy || undefined}
          className={ctaClasses("primary", "lg", "w-full")}
        >
          {nextLabel ?? t("common.next")}
          {!nextBusy && <ArrowRight size={18} aria-hidden="true" className="rtl:-scale-x-100" />}
        </button>
      )}

      {footer}
    </form>
  );
}
