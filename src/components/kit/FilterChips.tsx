import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { noTapFlash, pressWell } from "./classes";

export interface FilterChip<T extends string> {
  value: T;
  label: ReactNode;
  /** How many it would show. A chip with none can't be picked unless it already is. */
  count?: number;
}

export interface FilterChipsProps<T extends string> {
  /** What the chips filter. Always said to a screen reader; shown unless `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  options: readonly FilterChip<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}

/**
 * One of several ways to narrow a list, each with its count. Native radios
 * in a fieldset, like `SegmentedControl`, so the arrow keys move the choice
 * and a screen reader says "2 of 5"; unlike it, the chips wrap onto a second
 * line rather than scroll sideways under the edge of a phone.
 *
 * The chosen chip is an ink pill with a cream label (14.88:1, 14.92:1 at
 * night); the others are ink on a panel, their count in ink-muted (7.99:1,
 * 9.43:1 at night). Every chip is 44px tall. A chip is a control: it
 * presses with the kit's 6% ink well, takes a tap without waiting for a
 * double tap, and never selects its words on a long press.
 */
export function FilterChips<T extends string>({
  label,
  hideLabel,
  options,
  value,
  onChange,
  className,
}: FilterChipsProps<T>) {
  const { i18n } = useTranslation();
  const name = useId();
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={hideLabel ? "sr-only" : "type-label mb-2 text-ink"}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const chosen = option.value === value;
          const empty = option.count === 0 && !chosen;
          return (
            <label
              key={option.value}
              className={cn(
                "inline-flex min-h-11 touch-manipulation select-none items-center gap-2 rounded-full border px-4 font-heading text-base font-medium leading-tight transition-[color,background-color,border-color,box-shadow] duration-gentle ease-out has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                noTapFlash,
                chosen
                  ? "cursor-pointer border-ink bg-ink text-surface"
                  : empty
                    ? "cursor-not-allowed border-border bg-surface text-ink opacity-50"
                    : cn("cursor-pointer border-border-strong bg-surface text-ink hover-fine:bg-background", pressWell),
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={chosen}
                disabled={empty}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
              {option.count !== undefined && (
                <span dir="ltr" className={cn("type-figure text-sm", chosen ? "text-surface" : "text-ink-muted")}>
                  {number.format(option.count)}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
