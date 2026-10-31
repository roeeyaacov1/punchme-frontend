import { useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { focusRing, noTapFlash } from "./classes";

export interface RadioOption<T extends string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
}

export interface RadioGroupProps<T extends string> {
  legend: string;
  hideLegend?: boolean;
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}

/**
 * One of several, in a list. A fieldset with native radios: the arrow keys
 * move the choice, Tab leaves the group, and a screen reader says "2 of 3".
 * Chosen is an ink ring with an ink dot; not chosen, the field edge.
 *
 * The words stand beside the ring while their longest word fits there. With
 * large text on a phone, where it doesn't, they go under it at the option's
 * full width, as a switch's do.
 */
export function RadioGroup<T extends string>({
  legend,
  hideLegend,
  options,
  value,
  onChange,
  className,
}: RadioGroupProps<T>) {
  const name = useId();
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={hideLegend ? "sr-only" : "type-label mb-1 text-ink"}>{legend}</legend>
      <div className="flex flex-col">
        {options.map((option) => {
          const descriptionId = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              className={cn("flex min-h-11 cursor-pointer flex-wrap items-start gap-3 py-2", noTapFlash)}
            >
              <span className="relative mt-px flex size-6 shrink-0 items-center justify-center">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={option.value === value}
                  aria-describedby={option.description ? descriptionId : undefined}
                  onChange={() => onChange(option.value)}
                  className={cn(
                    "peer size-6 cursor-pointer appearance-none rounded-full border-2 border-field bg-surface transition-colors duration-gentle ease-out checked:border-ink",
                    focusRing,
                  )}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute size-2.5 rounded-full bg-ink opacity-0 transition-opacity duration-gentle ease-out peer-checked:opacity-100"
                />
              </span>
              {/* Grows from nothing to its own width, never below its longest
                  word: only a word that can't fit beside the ring sends it under. */}
              <span className="flex min-w-min max-w-max flex-1 flex-col gap-0.5">
                <span className="type-body text-ink">{option.label}</span>
                {option.description && (
                  <span id={descriptionId} className="text-sm leading-snug text-ink-muted">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
