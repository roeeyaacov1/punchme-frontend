import { Check } from "lucide-react";
import { cn } from "../../../lib/cn";
import { readableInk } from "../../../lib/color";

/** A round colour swatch for `ChoiceGrid`: the colour, a hairline so light
 * swatches still read on the paper, and a tick in whichever ink shows. */
export function swatch(hex: string, selected: boolean) {
  return (
    <span
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition-shadow",
        selected ? "ring-2 ring-ink" : "ring-1 ring-border-strong/70",
      )}
      style={{ backgroundColor: hex }}
    >
      {selected && <Check size={18} strokeWidth={3} color={readableInk(hex)} aria-hidden="true" />}
    </span>
  );
}
