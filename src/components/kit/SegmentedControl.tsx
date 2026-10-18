import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { noTapFlash } from "./classes";
import { useReducedMotion } from "./motion";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  /** What is being chosen. Always said to a screen reader; shown unless `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}

/**
 * One of a few, side by side. Native radios in a fieldset, so the arrow keys
 * move the choice and a screen reader says "2 of 3", where buttons with
 * `aria-pressed` would make every option its own tab stop.
 *
 * The chosen option is an ink pill with a cream label (14.88:1). Every
 * segment is as wide as the widest, so the pill can slide by its own width:
 * on the in-out, mirrored in Hebrew. With reduced motion there is no pill to
 * slide; the chosen segment's own colour crosses over instead.
 */
export function SegmentedControl<T extends string>({
  label,
  hideLabel,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const reduced = useReducedMotion();
  const name = useId();
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const pill: CSSProperties = {
    width: `calc((100% - 0.5rem) / ${options.length})`,
    transform: `translateX(calc(var(--kit-dir) * ${index} * 100%))`,
  };
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={hideLabel ? "sr-only" : "type-label mb-2 text-ink"}>{label}</legend>
      <div className="relative inline-grid grid-flow-col auto-cols-fr rounded-full border border-border bg-background p-1">
        {!reduced && (
          <span
            aria-hidden
            className="absolute inset-y-1 start-1 rounded-full bg-ink transition-transform duration-move ease-in-out-strong"
            style={pill}
          />
        )}
        {options.map((option) => {
          const chosen = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex min-h-11 cursor-pointer items-center justify-center rounded-full px-4 text-center font-heading text-base font-medium leading-tight has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                noTapFlash,
                chosen ? "text-surface" : "text-ink-muted hover-fine:text-ink",
                reduced
                  ? cn("transition-colors duration-gentle ease-out", chosen && "bg-ink")
                  : "transition-colors duration-move ease-in-out-strong",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={chosen}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
