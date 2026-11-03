import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ban, TriangleAlert } from "lucide-react";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";
import { ColourPickerPanel } from "./ColourPickerPanel";
import { PANEL_SWATCHES, panelFaint, swatchIndex } from "./controlRules";
import { OwnColourFace, SwatchFace } from "./Swatch";

const NONE = "none";
const OWN = "own";

/**
 * A rounded panel inside the strip, in a colour of its own, with the stamps
 * on it (and the texture or wallpaper inside it): none, one of a few light
 * and dark grounds, or a colour of one's own. A panel too close to the card
 * to show is allowed, and said, as a faint stamp is.
 */
export function PanelColourPicker({
  value,
  onChange,
  background,
}: {
  /** "" is no panel. */
  value: string;
  onChange: (hex: string) => void;
  /** The card colour the panel stands on. */
  background: string;
}) {
  const { t } = useTranslation();
  const offered = !value || swatchIndex(value, PANEL_SWATCHES) >= 0;
  const [ownOpen, setOwnOpen] = useState(!offered);
  const own = ownOpen || !offered;

  const tiles: Tile<string>[] = [
    {
      value: NONE,
      label: t("cardControls.panel.none"),
      render: () => (
        <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-surface text-ink-muted">
          <Ban className="size-5" />
        </span>
      ),
    },
    ...PANEL_SWATCHES.map((hex, index) => ({
      value: hex,
      label: t("cardControls.panel.swatch", { n: index + 1, hex }),
      render: (chosen: boolean) => <SwatchFace hex={hex} chosen={chosen} />,
    })),
    {
      value: OWN,
      label: t("cardControls.own"),
      render: (chosen: boolean) => <OwnColourFace hex={value || "#FFFFFF"} chosen={chosen} />,
    },
  ];

  const chosen = own ? OWN : value ? (PANEL_SWATCHES[swatchIndex(value, PANEL_SWATCHES)] ?? null) : NONE;
  return (
    <div className="flex flex-col gap-4">
      <ChoiceTiles
        legend={t("cardControls.panel.legend")}
        tiles={tiles}
        value={chosen}
        onChange={(next) => {
          if (next === OWN) {
            setOwnOpen(true);
            if (!value) onChange("#FFFFFF");
            return;
          }
          setOwnOpen(false);
          onChange(next === NONE ? "" : next);
        }}
      />
      <p className="-mt-2 text-sm leading-snug text-ink-muted">{t("cardControls.panel.hint")}</p>
      {value && panelFaint(value, background) && (
        <p className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-ink">
          <TriangleAlert aria-hidden className="mt-px size-4 shrink-0 text-warn" />
          <span>{t("cardControls.panel.faint")}</span>
        </p>
      )}
      {own && value && (
        <ColourPickerPanel label={t("cardControls.panel.legend")} value={value} onChange={onChange} />
      )}
    </div>
  );
}
