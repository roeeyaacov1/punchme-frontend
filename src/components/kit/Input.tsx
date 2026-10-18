import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { fieldBox } from "./classes";
import { Field } from "./Field";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** An icon at the start of the field, such as a magnifier on a search. */
  leading?: ReactNode;
}

/**
 * A text field, 48px tall. What the owner types sets its own direction
 * (`dir="auto"` is up to the page); a phone number, an email or a code is
 * passed `dir="ltr"` so it reads left to right inside Hebrew.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leading, className, ...props },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          {leading && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-ink-subtle [&_svg]:size-5"
            >
              {leading}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={cn(fieldBox, "min-h-12", leading && "ps-11")}
            {...props}
          />
        </div>
      )}
    </Field>
  );
});
