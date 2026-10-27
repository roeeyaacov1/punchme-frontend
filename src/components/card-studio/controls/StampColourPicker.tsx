import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { relatedAccents } from "../../../lib/accentPalette";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";
import { ColourPickerPanel } from "./ColourPickerPanel";
import { isFaint, swatchIndex } from "./controlRules";
import { OwnColourFace, SwatchFace } from "./Swatch";

const OWN = "own";

/**
 * The stamp's colour: the accents that clear 3:1 on this card, then a colour
 * of one's own. One of one's own may be fainter than that, and is allowed;
 * it says so under the swatches, in words and an icon, never in a warm fill.
 */
export function StampColourPicker({
  background,
  value,
  onChange,
}: {
  /** The card colour the stamp has to read against. */
  background: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const { t } = useTranslation();
  const accents = useMemo(() => relatedAccents(background), [background]);
  const offered = swatchIndex(value, accents) >= 0;
  const [ownOpen, setOwnOpen] = useState(!offered);
  const own = ownOpen || !offered;

  const tiles: Tile<string>[] = [
    ...accents.map((hex, index) => ({
      value: hex,
      label: t("onboarding.accent.swatchLabel", { n: index + 1, hex }),
      render: (chosen: boolean) => <SwatchFace hex={hex} chosen={chosen} />,
    })),
    {
      value: OWN,
      label: t("cardControls.own"),
      render: (chosen: boolean) => <OwnColourFace hex={value} chosen={chosen} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ChoiceTiles
        legend={t("cardControls.stampColour")}
        tiles={tiles}
        value={own ? OWN : (accents[swatchIndex(value, accents)] ?? null)}
        onChange={(next) => {
          if (next === OWN) {
            setOwnOpen(true);
            return;
          }
          setOwnOpen(false);
          onChange(next);
        }}
      />
      {isFaint(value, background) && (
        <p className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-ink">
          <TriangleAlert aria-hidden className="mt-px size-4 shrink-0 text-warn" />
          <span>{t("cardControls.faint")}</span>
        </p>
      )}
      {own && <ColourPickerPanel label={t("cardControls.stampColour")} value={value} onChange={onChange} />}
    </div>
  );
}
