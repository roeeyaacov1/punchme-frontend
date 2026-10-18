import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useDebounce } from "../../hooks/useDebounce";
import { noTapFlash } from "./classes";

export interface SliderProps {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  /** The value in words, shown beside the label and given to screen readers: "8 stamps". */
  valueText: string;
  /** What is said once the drag settles, if it should say more than valueText. */
  spoken?: string;
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * A number chosen by dragging. The native range input, restyled by
 * `.kit-range` in src/index.css: a 44px target, an ink fill on a field-edge
 * rail, the fill turned round in Hebrew.
 *
 * Dragging must not read out every tick, so the live region below waits
 * 500ms after the value stops moving, the house pattern; the input's own
 * `aria-valuetext` still answers a screen reader that asks.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueText,
  spoken,
  hint,
  disabled,
  className,
}: SliderProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const settled = useDebounce(spoken ?? valueText, 500);
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="type-label text-ink">
          {label}
        </label>
        <span aria-hidden dir="auto" className="type-figure text-base text-ink">
          {valueText}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={valueText}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn("kit-range", noTapFlash)}
        style={{ "--kit-range-progress": `${progress}%` } as CSSProperties}
      />
      {hint && (
        <p id={hintId} className="text-sm leading-snug text-ink-muted">
          {hint}
        </p>
      )}
      <p className="sr-only" aria-live="polite">
        {settled}
      </p>
    </div>
  );
}
