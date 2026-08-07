import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "../../lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5 text-start">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-navy font-body"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-navy font-body placeholder:text-slate/60",
          "focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40",
          error && "border-red-400 focus:ring-red-200",
          className,
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
