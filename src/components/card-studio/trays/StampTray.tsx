import type { ReactNode } from "react";
import type { CardPattern } from "../../../lib/cardPatterns";
import { StampPicker, TexturePicker, type StampPicture } from "../controls";
import { stampColourOf, type CardStudioValue } from "../studioDraft";

/** The stamp: its symbol or a picture of one's own, and the texture behind it. */
export function StampTray({
  value,
  onChange,
  niche,
  picture,
  onPicture,
  note,
  locked,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  niche?: string | null;
  picture: StampPicture;
  onPicture?: (dataUrl: string | null) => void;
  note?: ReactNode;
  locked?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <StampPicker
        glyph={value.design.stamp?.glyph ?? "check"}
        onGlyph={(glyph) => {
          // A picture only held for Save goes back to the symbol tapped.
          onPicture?.(null);
          onChange({ ...value, design: { ...value.design, stamp: { ...value.design.stamp, glyph } } });
        }}
        niche={niche}
        picture={picture}
        onPicture={onPicture ? (dataUrl) => onPicture(dataUrl) : undefined}
        note={note}
        locked={locked}
      />
      <TexturePicker
        value={(value.design.pattern as CardPattern) || "none"}
        onChange={(pattern) => onChange({ ...value, design: { ...value.design, pattern } })}
        background={value.background_color}
        stampColour={stampColourOf(value)}
      />
    </div>
  );
}
