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
 *
 * Back sits in the same block as the title rather than in a row of its own:
 * the phone above already spends most of a small screen, and every row
 * between the question and Next is a row the owner has to scroll past.
 * `subtitle` is for what the screen cannot show by itself — most steps don't
 * pass one, because the control underneath already answers the question.
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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:gap-5">
      {/* Back sits *beside* the question, not above it. It had a row of its
          own — 44px to hold one word — and on a 375px screen that row was the
          difference between reaching the button and scrolling for it. Beside
          the title it costs nothing: the title is already at least that tall,
          and a back arrow at the start of a heading is the one place a reader
          looks for one.

          The word goes with the row. That is a real trade — an icon alone is
          less plain than an icon and a label, and this audience is not a
          technical one — so the button keeps its accessible name, keeps the
          44px box, and keeps a `title` for anyone who hovers to check. The
          progress row above is the other way back and it is still there. */}
      <div className={cn(!onBack && "pt-1")}>
        <div className="flex items-start gap-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={t("common.back")}
              title={t("common.back")}
              className={cn(
                // Pulled up and out so the arrow's box does not indent the
                // title or push the block down: the glyph optically lines up
                // with the first line of the heading, the box overhangs.
                "-ms-3 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:text-ink",
                focusRing,
              )}
            >
              <ArrowLeft size={20} aria-hidden="true" className="rtl:-scale-x-100" />
            </button>
          )}
          <h1
            ref={heading}
            tabIndex={-1}
            className="t-h3 min-w-0 text-balance text-ink outline-none"
          >
            {title}
          </h1>
        </div>
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
