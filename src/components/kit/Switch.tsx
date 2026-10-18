import { useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { noTapFlash } from "./classes";
import { useReducedMotion } from "./motion";

export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * On or off, said at once. A native checkbox with `role="switch"`, so Space
 * toggles it and a screen reader says "on" and "off", inside a label that is
 * the 44px target.
 *
 * "On" is ink, not coral: coral is 2.45:1 on the wall and can't show a state
 * on its own. The track is ink with a cream knob when on (13.54:1 against the
 * wall) and the field edge when off (3.35:1). The knob slides on the in-out,
 * mirrored in Hebrew; with reduced motion it doesn't travel, the colours just
 * cross over.
 */
export function Switch({ checked, onChange, label, description, disabled, className }: SwitchProps) {
  const reduced = useReducedMotion();
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
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden
        className={cn(
          "relative mt-px inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:opacity-50",
          reduced ? "transition-colors duration-gentle ease-out" : "transition-colors duration-move ease-in-out-strong",
          checked ? "border-ink bg-ink" : "border-field bg-surface",
        )}
      >
        <span
          className={cn(
            "absolute start-0.5 size-5 rounded-full",
            reduced
              ? "transition-colors duration-gentle ease-out"
              : "transition-[transform,background-color] duration-move ease-in-out-strong",
            checked ? "translate-x-5 bg-surface rtl:-translate-x-5" : "bg-field",
          )}
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
