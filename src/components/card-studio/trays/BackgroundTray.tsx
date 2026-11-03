import { useTranslation } from "react-i18next";
import type { CardPattern } from "../../../lib/cardPatterns";
import {
  PanelColourPicker,
  StickerPicker,
  TexturePicker,
  type Sticker,
  type StickersStatus,
} from "../controls";
import { designOptions, withOption } from "../designOptions";
import { stampColourOf, type CardStudioValue } from "../studioDraft";

/**
 * What stands behind the stamps: a panel in a colour of its own, a sticker
 * repeated faintly as a wallpaper, or one of the textures. The wallpaper
 * takes the texture's place, and both go inside the panel when there is one.
 * Where the wallet draws none of the design options, the texture alone.
 */
export function BackgroundTray({
  value,
  onChange,
  options,
  stickers,
  stickersStatus,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  /** The wallet draws the design options: the panel and the wallpaper. */
  options: boolean;
  stickers: readonly Sticker[];
  stickersStatus: StickersStatus;
}) {
  const { t } = useTranslation();
  const chosen = designOptions(value.design);
  return (
    <div className="flex flex-col gap-6">
      {options && (
        <>
          <PanelColourPicker
            value={chosen.panelColor}
            onChange={(panel_color) => onChange(withOption(value, { panel_color }))}
            background={value.background_color}
          />
          <StickerPicker
            legend={t("cardControls.wallpaper.legend")}
            hint={t("cardControls.wallpaper.hint")}
            noneLabel={t("cardControls.wallpaper.none")}
            stickers={stickers}
            status={stickersStatus}
            value={chosen.wallpaper}
            onChange={(wallpaper) => onChange(withOption(value, { wallpaper }))}
          />
        </>
      )}
      {!(options && chosen.wallpaper) && (
        <TexturePicker
          value={(value.design.pattern as CardPattern) || "none"}
          onChange={(pattern) => onChange(withOption(value, { pattern }))}
          background={(options && chosen.panelColor) || value.background_color}
          stampColour={stampColourOf(value)}
        />
      )}
    </div>
  );
}
