import { Check, Palette } from "lucide-react";
import { readableInk } from "../../../lib/color";

/** A colour as a 44px disc, with a tick in whichever ink reads on it once chosen. */
export function SwatchFace({ hex, chosen }: { hex: string; chosen: boolean }) {
  return (
    <span aria-hidden className="flex size-11 items-center justify-center rounded-full" style={{ backgroundColor: hex }}>
      {chosen && <Check className="size-5" strokeWidth={3} color={readableInk(hex)} />}
    </span>
  );
}

/**
 * The tile that opens a colour of one's own: a palette on the panel until
 * it is chosen, then the colour itself with its tick, so the row shows what
 * the card has even when no offered swatch is it.
 */
export function OwnColourFace({ hex, chosen }: { hex: string; chosen: boolean }) {
  if (chosen) return <SwatchFace hex={hex} chosen />;
  return (
    <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-surface text-ink">
      <Palette className="size-5" />
    </span>
  );
}
