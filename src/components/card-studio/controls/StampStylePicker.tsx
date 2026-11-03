import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/cn";
import { readableInk } from "../../../lib/color";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";
import type { StampStyle } from "./controlRules";

/**
 * How a stamp is drawn: in a filled circle (the badge, as every card was
 * until now), or the art on its own, faded where the stamp is still to come.
 * Each tile shows the stamp it makes, the art in `face`.
 */
export function StampStylePicker({
  value,
  onChange,
  face,
  stampColour,
  background,
}: {
  value: StampStyle;
  onChange: (next: StampStyle) => void;
  /** The stamp's art at tile size: a sticker's thumbnail, a glyph, a picture. */
  face: (ink: string) => ReactNode;
  stampColour: string;
  /** What the stamp stands on: the panel, or the card. */
  background: string;
}) {
  const { t } = useTranslation();
  const tile = (style: StampStyle): Tile<StampStyle> => ({
    value: style,
    label: t(`cardControls.style.${style}`),
    render: (chosen: boolean) => (
      <span aria-hidden className="flex w-full items-center gap-3 px-3 py-2">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-field"
          style={{ backgroundColor: background }}
        >
          {style === "badge" ? (
            <span
              className="flex size-9 items-center justify-center rounded-full"
              style={{ backgroundColor: stampColour, color: readableInk(stampColour) }}
            >
              {face(readableInk(stampColour))}
            </span>
          ) : (
            <span className="flex size-9 items-center justify-center" style={{ color: stampColour }}>
              {face(stampColour)}
            </span>
          )}
        </span>
        <span className={cn("type-body text-start", chosen ? "font-semibold text-ink" : "text-ink-muted")}>
          {t(`cardControls.style.${style}`)}
        </span>
      </span>
    ),
  });
  return (
    <ChoiceTiles
      legend={t("cardControls.style.legend")}
      tiles={[tile("badge"), tile("icon")]}
      value={value}
      onChange={onChange}
      shape="rounded"
      listClassName="grid grid-cols-2 gap-2 [&>label]:w-full"
    />
  );
}
