import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { fieldBox } from "./classes";
import { Field } from "./Field";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

/**
 * The phone's own picker, which no custom list beats with one thumb. Only
 * the closed box is drawn, with the chevron at the end edge; the list is the
 * system's, and `color-scheme` on the scope keeps it dark at night.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, children, ...props },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={cn(fieldBox, "min-h-12 cursor-pointer appearance-none pe-11")}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
          />
        </div>
      )}
    </Field>
  );
});
