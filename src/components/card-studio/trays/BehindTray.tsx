import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { groundFor } from "../brandColours";
import { PanelColourPicker, PatternPicker, type Sticker } from "../controls";
import {
  designOptions,
  patternChoice,
  patternShows,
  stampsDrawnInColour,
  withOption,
  withPatternChoice,
} from "../designOptions";
import { stampColourOf, type CardStudioValue } from "../studioDraft";

/**
 * "מאחורי החותמות", where the wallet draws the design options (brief §6.4): a
 * ground for the stamps, by name, with the one the business colour gives
 * first; and one faint pattern behind them, a texture or a sticker, which a
 * strip picture of one's own covers. Each says when what it makes will barely
 * show: a ground too close to the card, or stamps drawn in a colour that
 * barely shows on it.
 *
 * Where the wallet draws none of the options, "הרקע" and its texture, as
 * before (`BackgroundTray`).
 */
export function BehindTray({
  value,
  onChange,
  stickers,
  stripPicture,
  pictureInUse,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  stickers: readonly Sticker[];
  /** A strip picture of one's own is in use, held or saved. */
  stripPicture: boolean;
  /** The stamp is a picture, held or saved. */
  pictureInUse: boolean;
}) {
  const { t } = useTranslation();
  const chosen = designOptions(value.design);
  const stamps = stampColourOf(value);
  return (
    <div className="flex flex-col gap-6">
      <PanelColourPicker
        value={chosen.panelColor}
        onChange={(panel_color) => onChange(withOption(value, { panel_color }))}
        background={value.background_color}
        ruleGround={groundFor(value.background_color)}
        stamps={stampsDrawnInColour(value.design, pictureInUse) ? stamps : null}
      />
      {patternShows(stripPicture) ? (
        <PatternPicker
          value={patternChoice(value.design)}
          onChange={(choice) => onChange(withPatternChoice(value, choice))}
          stickers={stickers}
          stampSticker={chosen.sticker}
          background={chosen.panelColor || value.background_color}
          stampColour={stamps}
        />
      ) : (
        <p className="flex items-start gap-1.5 text-sm leading-snug text-ink-muted">
          <Info aria-hidden className="mt-px size-4 shrink-0" />
          <span>{t("cardControls.pattern.covered")}</span>
        </p>
      )}
    </div>
  );
}
