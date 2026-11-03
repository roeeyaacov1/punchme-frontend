import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { STAMP_GLYPHS } from "../../../lib/stampGlyphs";
import { Switch } from "../../kit/Switch";
import {
  StampPicker,
  StampStylePicker,
  StickerPicker,
  type StampPicture,
  type Sticker,
  type StickersStatus,
} from "../controls";
import { designOptions, withStamp } from "../designOptions";
import { stampColourOf, type CardStudioValue } from "../studioDraft";

/**
 * The stamp: how each one is drawn (in a circle or on its own), what it
 * shows (a sticker, a symbol, or a picture of one's own, in the renderer's
 * order: a picture first, then a sticker, then the symbol), and on a stamp on
 * its own, a check and the stamp colour. Where the wallet draws none of the
 * design options, the symbol or a picture, as before.
 */
export function StampTray({
  value,
  onChange,
  niche,
  picture,
  onPicture,
  note,
  locked,
  options,
  stickers,
  stickersStatus,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  niche?: string | null;
  picture: StampPicture;
  onPicture?: (dataUrl: string | null) => void;
  note?: ReactNode;
  locked?: ReactNode;
  /** The wallet draws the design options: the style, the stickers, the
   * check and the tint. */
  options: boolean;
  stickers: readonly Sticker[];
  stickersStatus: StickersStatus;
}) {
  const { t } = useTranslation();
  const lockedId = useId();
  const chosen = designOptions(value.design);
  const glyph = value.design.stamp?.glyph ?? "check";
  const icon = chosen.style === "icon";
  const sticker = stickers.find((candidate) => candidate.name === chosen.sticker);
  // The stamp as the style tiles show it: what the card's stamp is.
  const face = (ink: string) => {
    if (picture.inUse && picture.url) return <img src={picture.url} alt="" className="size-7 rounded-full object-cover" />;
    if (sticker) return <img src={sticker.image} alt="" className="size-7 object-contain" />;
    const Icon = STAMP_GLYPHS[glyph] ?? STAMP_GLYPHS.check;
    return <Icon className="size-5" strokeWidth={2.2} color={ink} />;
  };
  // A tint shades art; the symbol is drawn in the stamp colour already.
  const tintable = !!chosen.sticker || picture.inUse;
  // A picture the card keeps comes before any sticker: one saved (no way back
  // yet), or a catalog look's own art, which its art tray takes off.
  const pictureFirst = !!locked || (picture.inUse && !onPicture);

  return (
    <div className="flex flex-col gap-6">
      {options && (
        <>
          <StampStylePicker
            value={chosen.style}
            onChange={(style) => onChange(withStamp(value, { style }))}
            face={face}
            stampColour={stampColourOf(value)}
            background={chosen.panelColor || value.background_color}
          />
          <StickerPicker
            legend={t("cardControls.sticker.legend")}
            hint={pictureFirst ? undefined : t("cardControls.sticker.hint")}
            noneLabel={t("cardControls.sticker.none")}
            stickers={stickers}
            status={stickersStatus}
            value={chosen.sticker}
            onChange={(name) => {
              // A picture only held for Save would hide the sticker: it goes.
              if (name) onPicture?.(null);
              onChange(withStamp(value, { sticker: name }));
            }}
            disabled={pictureFirst}
            describedBy={pictureFirst ? lockedId : undefined}
          />
          {pictureFirst && (
            <p id={lockedId} className="-mt-4 text-sm leading-snug text-ink-muted">
              {t("cardControls.sticker.pictureFirst")}
            </p>
          )}
        </>
      )}
      <StampPicker
        glyph={glyph}
        glyphHidden={!!chosen.sticker}
        onGlyph={(name) => {
          // A picture only held for Save goes back to the symbol tapped, and
          // so does a sticker.
          onPicture?.(null);
          onChange(withStamp(value, chosen.sticker ? { glyph: name, sticker: "" } : { glyph: name }));
        }}
        niche={niche}
        picture={picture}
        onPicture={onPicture ? (dataUrl) => onPicture(dataUrl) : undefined}
        note={note}
        locked={locked}
      />
      {options && icon && (
        <div className="flex flex-col gap-4">
          <Switch
            checked={chosen.mark === "check"}
            onChange={(checked) => onChange(withStamp(value, { mark: checked ? "check" : "none" }))}
            label={t("cardControls.mark.label")}
            description={t("cardControls.mark.hint")}
          />
          {tintable && (
            <Switch
              checked={chosen.tint}
              onChange={(tint) => onChange(withStamp(value, { tint }))}
              label={t("cardControls.tint.label")}
              description={t("cardControls.tint.hint")}
            />
          )}
        </div>
      )}
    </div>
  );
}
