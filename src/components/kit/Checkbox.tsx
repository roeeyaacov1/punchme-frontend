import { forwardRef, useId, type ReactNode } from "react";
import { Check, CircleAlert } from "lucide-react";
import { cn } from "../../lib/cn";
import { focusRing, noTapFlash } from "./classes";

export interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  /** What is wrong and how to put it right, said under the words as a
   * Field's is: the edge goes red and the box is read with it. */
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Yes or no, when the answer waits for a submit. A native checkbox, so
 * Space, a screen reader and a form all work as they always have, restyled:
 * the field edge when empty (3.35:1), an ink box with a cream check when
 * ticked. The label is the 44px target.
 *
 * The words stand beside the box while their longest word fits there. With
 * large text on a phone, where it doesn't, they go under it at the label's
 * full width, as a switch's do.
 *
 * An error stands outside the label, so it isn't part of the box's name and
 * a tap on it doesn't tick the box; the ref is the box's, for a form that
 * moves focus to its first error on submit.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, onChange, label, description, error, disabled, className },
  ref,
) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy =
    [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label
        className={cn(
          "flex min-h-11 flex-wrap items-start gap-3 py-2",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          noTapFlash,
        )}
      >
        <span className="relative mt-px flex size-6 shrink-0 items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            onChange={(event) => onChange(event.target.checked)}
            className={cn(
              "peer size-6 cursor-[inherit] appearance-none rounded-md border-2 border-field bg-surface transition-colors duration-gentle ease-out checked:border-ink checked:bg-ink disabled:opacity-50 aria-[invalid=true]:border-danger",
              focusRing,
            )}
          />
          <Check
            aria-hidden
            strokeWidth={3}
            className="pointer-events-none absolute size-4 text-surface opacity-0 transition-opacity duration-gentle ease-out peer-checked:opacity-100"
          />
        </span>
        {/* Grows from nothing to its own width, never below its longest word:
            only a word that can't fit beside the box sends it under. */}
        <span className="flex min-w-min max-w-max flex-1 flex-col gap-0.5">
          <span className={cn("type-body", disabled ? "text-ink-subtle" : "text-ink")}>{label}</span>
          {description && (
            <span id={descriptionId} className="text-sm leading-snug text-ink-muted">
              {description}
            </span>
          )}
        </span>
      </label>
      {/* Under the words, past the box (its 24px and the 12px gap). */}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 ps-9 text-sm font-semibold leading-snug text-danger">
          <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});
