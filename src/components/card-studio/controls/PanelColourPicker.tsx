import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ban, TriangleAlert } from "lucide-react";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";
import { ColourPickerPanel } from "./ColourPickerPanel";
import { PANEL_SWATCHES, PANEL_SWATCH_NAMES, isFaint, panelFaint, swatchIndex } from "./controlRules";
import { OwnColourFace, SwatchFace } from "./Swatch";

const NONE = "none";
const OWN = "own";

/**
 * A ground for the stamps: a rounded panel inside the strip, in a colour of
 * its own, with the stamps on it (and the pattern inside it). None, the
 * ground one business colour gives (when it isn't one of the six), the six by
 * name (white, cream, sand, mint, blush, navy), or a colour of one's own.
 * A ground too close to the card to show is allowed, and said, and so are
 * stamps drawn in a colour that barely shows on it.
 */
export function PanelColourPicker({
  value,
  onChange,
  background,
  ruleGround,
  stamps,
}: {
  /** "" is no ground. */
  value: string;
  onChange: (hex: string) => void;
  /** The card colour the ground stands on. */
  background: string;
  /** The ground the business colour gives, offered first after none. */
  ruleGround?: string;
  /** The stamps' colour, where they are drawn in it, to judge on the ground;
   * none for a sticker or photo in its own colours. */
  stamps?: string | null;
}) {
  const { t } = useTranslation();
  const named = !!ruleGround && swatchIndex(ruleGround, PANEL_SWATCHES) < 0 ? [ruleGround] : [];
  const offered = !value || swatchIndex(value, [...named, ...PANEL_SWATCHES]) >= 0;
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
    ...named.map((hex) => ({
      value: hex,
      label: t("cardControls.panel.names.shade"),
      render: (chosen: boolean) => <SwatchFace hex={hex} chosen={chosen} />,
    })),
    ...PANEL_SWATCHES.map((hex, index) => ({
      value: hex,
      label: t(`cardControls.panel.names.${PANEL_SWATCH_NAMES[index]}`),
      render: (chosen: boolean) => <SwatchFace hex={hex} chosen={chosen} />,
    })),
    {
      value: OWN,
      label: t("cardControls.own"),
      render: (chosen: boolean) => <OwnColourFace hex={value || "#FFFFFF"} chosen={chosen} />,
    },
  ];

  const offeredHexes = [...named, ...PANEL_SWATCHES];
  const chosen = own ? OWN : value ? (offeredHexes[swatchIndex(value, offeredHexes)] ?? null) : NONE;
  const warnings = [
    value && panelFaint(value, background) ? t("cardControls.panel.faint") : "",
    value && stamps && isFaint(stamps, value) ? t("cardControls.panel.stampsFaint") : "",
  ].filter(Boolean);
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
      {warnings.map((warning) => (
        <p key={warning} className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-ink">
          <TriangleAlert aria-hidden className="mt-px size-4 shrink-0 text-warn" />
          <span>{warning}</span>
        </p>
      ))}
      {own && value && (
        <ColourPickerPanel label={t("cardControls.panel.legend")} value={value} onChange={onChange} />
      )}
    </div>
  );
}
