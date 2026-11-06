import type { CardPattern } from "../../../lib/cardPatterns";
import { TexturePicker } from "../controls";
import { withOption } from "../designOptions";
import { stampColourOf, type CardStudioValue } from "../studioDraft";

/**
 * "הרקע": the texture behind the stamps, where the wallet draws none of the
 * design options. Where it does, "מאחורי החותמות" takes its place
 * (`BehindTray`).
 */
export function BackgroundTray({
  value,
  onChange,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <TexturePicker
        value={(value.design.pattern as CardPattern) || "none"}
        onChange={(pattern) => onChange(withOption(value, { pattern }))}
        background={value.background_color}
        stampColour={stampColourOf(value)}
      />
    </div>
  );
}
