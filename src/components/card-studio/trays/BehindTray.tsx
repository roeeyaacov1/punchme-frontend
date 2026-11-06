import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { Button } from "../../kit/Button";
import { groundFor } from "../brandColours";
import { PanelColourPicker, PatternPicker, type Sticker } from "../controls";
import { PANEL_SWATCHES, PANEL_SWATCH_NAMES, stickerLabel, swatchIndex } from "../controls/controlRules";
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
  outage,
  onTakeOff,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  stickers: readonly Sticker[];
  /** A strip picture of one's own is in use, held or saved. */
  stripPicture: boolean;
  /** The stamp is a picture, held or saved. */
  pictureInUse: boolean;
  /** Say what is behind the stamps, and offer nothing that would drop it:
   * the sticker list can't be read on a card that has the options
   * (`unread`), or the wallet draws none of them (`off`), where the one way
   * on is to take them off. */
  outage?: "unread" | "off";
  onTakeOff?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const chosen = designOptions(value.design);
  const stamps = stampColourOf(value);
  if (outage) {
    // English sets the names in the sentence's own case: "a cream ground".
    const word = (text: string) => (i18n.language.startsWith("he") ? text : text.toLocaleLowerCase(i18n.language));
    const index = swatchIndex(chosen.panelColor, PANEL_SWATCHES);
    const ground = !chosen.panelColor
      ? t("studio.stickers.noGround")
      : t("studio.stickers.ground", {
          name: word(
            index >= 0
              ? t(`cardControls.panel.names.${PANEL_SWATCH_NAMES[index]}`)
              : chosen.panelColor.toUpperCase() === groundFor(value.background_color)
                ? t("cardControls.panel.names.shade")
                : t("cardControls.own"),
          ),
        });
    const choice = patternChoice(value.design);
    const pattern =
      choice === "none"
        ? t("studio.stickers.noPattern")
        : t("studio.stickers.pattern", {
            name: word(
              choice.startsWith("sticker:")
                ? stickerLabel(choice.slice("sticker:".length), t)
                : t(`studio.patterns.${choice}`),
            ),
          });
    return (
      <div className="flex flex-col gap-4">
        <p className="flex items-start gap-1.5 text-sm leading-snug text-ink-muted">
          <Info aria-hidden className="mt-px size-4 shrink-0" />
          <span>{t(outage === "off" ? "studio.stickers.offBehind" : "studio.stickers.outageBehind")}</span>
        </p>
        <p className="type-body text-ink">
          <b className="font-semibold">{t("studio.stickers.has")}</b> {ground}, {pattern}
        </p>
        {outage === "off" && onTakeOff && (
          <Button variant="secondary" onClick={onTakeOff} className="w-fit max-w-full !whitespace-normal text-center">
            {t("studio.options.takeOff")}
          </Button>
        )}
      </div>
    );
  }
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
