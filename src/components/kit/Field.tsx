import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "../../lib/cn";

export interface FieldControl {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  /** What is wrong and how to put it right. Turns the edge red and is read with the field. */
  error?: ReactNode;
  /** Beside the label, at the end of its line: a character count, say. */
  aside?: ReactNode;
  className?: string;
  children: (control: FieldControl) => ReactNode;
}

/**
 * A label, the control, a hint and an error, wired together: the label
 * names the control, and the hint and the error are read with it through
 * `aria-describedby`. An error is its words and its icon in red (6.37:1 on
 * a panel) under a red edge, never a pink fill. It isn't an alert: a page
 * that finds errors on submit moves focus to the first one instead, so the
 * error is read where it is.
 */
export function Field({ label, hint, error, aside, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="type-label text-ink">
          {label}
        </label>
        {aside}
      </div>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && (
        <p id={hintId} className="text-sm leading-snug text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
          <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
