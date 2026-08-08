import { useId } from "react";
import { cn } from "../../lib/cn";

interface SliderProps {
  label?: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({ label, hint, value, min, max, onChange, className }: SliderProps) {
  const id = useId();

  return (
    <div className={cn("flex flex-col gap-1.5 text-start", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-navy font-body">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-navy"
        />
        <span className="w-8 text-end text-sm font-mono text-navy">{value}</span>
      </div>
      {hint && <p className="text-xs text-slate">{hint}</p>}
    </div>
  );
}
