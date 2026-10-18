import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { fieldBox } from "./classes";
import { Field } from "./Field";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** The count beside the label, already worded — "12/200" — and read left to right. */
  count?: string;
}

/** Room to write: grows by hand, and can count what is written against its limit. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, count, className, rows = 4, ...props },
  ref,
) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      className={className}
      aside={
        count !== undefined && (
          <span aria-hidden dir="ltr" className="type-figure text-sm text-ink-muted">
            {count}
          </span>
        )
      }
    >
      {({ id, describedBy, invalid }) => (
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(fieldBox, "min-h-28 resize-y py-3 leading-relaxed")}
          {...props}
        />
      )}
    </Field>
  );
});
