import { useId, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { focusRing, noTapFlash } from "./classes";

export interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Yes or no, when the answer waits for a submit. A native checkbox, so
 * Space, a screen reader and a form all work as they always have, restyled:
 * the field edge when empty (3.35:1), an ink box with a cream check when
 * ticked. The label is the 44px target.
 */
export function Checkbox({ checked, onChange, label, description, disabled, className }: CheckboxProps) {
  const descriptionId = useId();
  return (
    <label
      className={cn(
        "flex min-h-11 items-start gap-3 py-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        noTapFlash,
        className,
      )}
    >
      <span className="relative mt-px flex size-6 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          onChange={(event) => onChange(event.target.checked)}
          className={cn(
            "peer size-6 cursor-[inherit] appearance-none rounded-md border-2 border-field bg-surface transition-colors duration-gentle ease-out checked:border-ink checked:bg-ink disabled:opacity-50",
            focusRing,
          )}
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute size-4 text-surface opacity-0 transition-opacity duration-gentle ease-out peer-checked:opacity-100"
        />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn("type-body text-ink", disabled && "opacity-60")}>{label}</span>
        {description && (
          <span id={descriptionId} className="text-sm leading-snug text-ink-muted">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
