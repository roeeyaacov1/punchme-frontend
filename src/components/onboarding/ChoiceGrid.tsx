import { useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface Choice<T extends string> {
  value: T;
  /** The accessible name — a colour's name, a glyph's name, the emoji itself. */
  label: string;
  /** What the option looks like. */
  render: (selected: boolean) => ReactNode;
}

/**
 * A grid of things to pick one of — colours, glyphs, emoji.
 *
 * Built on native radio inputs rather than `role="radio"` buttons: the group
 * semantics, the arrow-key walk and the single Tab stop come free from the
 * browser, and every cell is a 44px target because the label is the target.
 * The input itself is visually hidden; the label draws the option and the
 * `:focus-visible` ring comes from the input's focus via `peer`.
 */
export function ChoiceGrid<T extends string>({
  name,
  legend,
  legendHidden = false,
  choices,
  value,
  onChange,
  columns = 5,
  smColumns,
  cellClassName,
  className,
}: {
  name: string;
  legend: string;
  legendHidden?: boolean;
  choices: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 4 | 5 | 6 | 8;
  /** Column count from the `sm` breakpoint up, when it differs. */
  smColumns?: 4 | 5 | 6 | 8;
  cellClassName?: string;
  className?: string;
}) {
  const id = useId();
  const cols = {
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    8: "grid-cols-8",
  }[columns];
  const smCols = smColumns
    ? {
        4: "sm:grid-cols-4",
        5: "sm:grid-cols-5",
        6: "sm:grid-cols-6",
        8: "sm:grid-cols-8",
      }[smColumns]
    : undefined;

  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={cn("mb-2 text-sm font-medium text-ink", legendHidden && "sr-only")}>
        {legend}
      </legend>
      <div className={cn("grid gap-2", cols, smCols)}>
        {choices.map((choice) => {
          const selected = choice.value === value;
          const inputId = `${id}-${choice.value}`;
          return (
            <label
              key={choice.value}
              htmlFor={inputId}
              className={cn(
                "group relative flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl",
                cellClassName,
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={choice.value}
                checked={selected}
                onChange={() => onChange(choice.value)}
                aria-label={choice.label}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex items-center justify-center rounded-xl transition-transform group-hover:scale-105 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary-text peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
              >
                {choice.render(selected)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
