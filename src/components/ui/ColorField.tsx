import { useId } from "react";
import { cn } from "../../lib/cn";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Swatch + synced hex text input. The swatch drives the text field and vice
 * versa; an invalid hex typed by hand just doesn't update the swatch until
 * it's valid again, rather than blocking input. */
export function ColorField({ label, value, onChange, className }: ColorFieldProps) {
  const id = useId();

  return (
    <div className={cn("flex flex-col gap-1.5 text-start", className)}>
      <label htmlFor={id} className="text-sm font-medium text-navy font-body">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={HEX_RE.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-navy/15 bg-white p-1"
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-mono text-sm text-navy placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40"
        />
      </div>
    </div>
  );
}
