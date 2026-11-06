import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { STAMP_GLYPHS } from "../../../lib/stampGlyphs";
import { Button } from "../../kit/Button";
import { Switch } from "../../kit/Switch";
import {
  StampPicker,
  StampStylePicker,
  type StampPicture,
  type StampStyle,
  type Sticker,
  type StickersStatus,
} from "../controls";
import { GlyphPicker, StampPictureField } from "../controls/StampPicker";
import { StickerFirst, StickerMore } from "../controls/StampStickerPicker";
import { inTradeFirst } from "../stickerGroups";
import { stickerLabel } from "../controls/controlRules";
import { stampsInCardColour, tintBringsGround, withTint } from "../brandColours";
import {
  designOptions,
  markShows,
  stampSummary,
  stampUsesOptions,
  tintDrawn,
  tintShows,
  withStamp,
  type StudioMode,
} from "../designOptions";
import type { DesignDoc } from "../../../api/designs";
import { stampColourOf, type CardStudioValue } from "../studioDraft";

type Opened = "more" | "symbol" | "picture";

/** A sticker or a picture in shades of the stamp colour, as the tint draws it:
 * the art in grey, the colour multiplied over its own shape. A face for a
 * tile, never the card. */
function TintedArt({ src, colour, round }: { src: string; colour: string; round: boolean }) {
  const mask = `url("${src}")`;
  return (
    <span className={round ? "relative size-7 overflow-hidden rounded-full" : "relative size-7"}>
      <img src={src} alt="" className={round ? "size-7 object-cover grayscale" : "size-7 object-contain grayscale"} />
      <span
        className="absolute inset-0"
        style={{
          backgroundColor: colour,
          mixBlendMode: "multiply",
          ...(round
            ? {}
            : {
                WebkitMaskImage: mask,
                maskImage: mask,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }),
        }}
      />
    </span>
  );
}

/**
 * The stamp. Where the wallet draws the design options (brief §6.3), what is
 * on each stamp comes first: the trade's stickers with their names, then
 * "עוד מדבקות" (every other one, by group, with a search), "סמל פשוט" (the
 * sixteen glyphs) and "תמונה משלכם", each opened in place. Right under them
 * the tint, "בצבע הכרטיס", while a sticker or a picture is chosen; then how
 * each stamp is framed, "בתוך עיגול" or "לבד"; and on a stamp on its own the
 * check, only for a card that has it. In the renderer's order a picture
 * comes first, then a sticker, then the glyph: a saved picture keeps
 * today's line in place of the stickers.
 *
 * Where it draws none of the options, the symbol or a picture, exactly as
 * before.
 */
export function StampTray({
  value,
  onChange,
  niche,
  picture,
  onPicture,
  note,
  locked,
  mode,
  stickers,
  stickersStatus,
  savedDesign,
  markAlways = false,
  wide = false,
  onTakeOff,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  niche?: string | null;
  picture: StampPicture;
  onPicture?: (dataUrl: string | null) => void;
  note?: ReactNode;
  locked?: ReactNode;
  mode: StudioMode;
  stickers: readonly Sticker[];
  stickersStatus: StickersStatus;
  /** The card as saved: the check stays offered until a save leaves none. */
  savedDesign: DesignDoc;
  /** The catalog editor offers the check on any stamp on its own. */
  markAlways?: boolean;
  /** The studio's wide layout, where the page scrolls under its masthead. */
  wide?: boolean;
  /** Takes every option off the card, where the wallet draws none of them
   * (`studioMode` "off"). */
  onTakeOff?: () => void;
}) {
  const glyph = value.design.stamp?.glyph ?? "check";
  const glyphAt = (name: string) => {
    // A picture only held for Save goes back to the symbol tapped, and so
    // does a sticker.
    onPicture?.(null);
    const chosen = designOptions(value.design);
    onChange(withStamp(value, chosen.sticker ? { glyph: name, sticker: "" } : { glyph: name }));
  };

  if (mode === "outage") {
    return <OutageStamp value={value} niche={niche} picture={picture} onGlyph={glyphAt} />;
  }
  if (mode === "off" && stampUsesOptions(value.design)) {
    return <OptionsOff value={value} onTakeOff={onTakeOff} />;
  }
  if (mode !== "options") {
    return (
      <div className="flex flex-col gap-6">
        <StampPicker
          glyph={glyph}
          glyphHidden={!!designOptions(value.design).sticker}
          onGlyph={glyphAt}
          niche={niche}
          picture={picture}
          onPicture={onPicture ? (dataUrl) => onPicture(dataUrl) : undefined}
          note={note}
          locked={locked}
        />
      </div>
    );
  }
  return (
    <OptionsStamp
      value={value}
      onChange={onChange}
      niche={niche}
      picture={picture}
      onPicture={onPicture}
      note={note}
      locked={locked}
      stickers={stickers}
      stickersStatus={stickersStatus}
      savedDesign={savedDesign}
      markAlways={markAlways}
      wide={wide}
      onGlyph={glyphAt}
    />
  );
}

/** What the stamps have, in words: "קרואסון, בצבע הכרטיס, לבד". English sets
 * the names in the sentence's own case: "croissant, in the card's colour, on
 * its own". */
function useStampSummary(value: CardStudioValue): string {
  const { t, i18n } = useTranslation();
  const word = (text: string) => (i18n.language.startsWith("he") ? text : text.toLocaleLowerCase(i18n.language));
  return stampSummary(value.design, {
    sticker: (name) => word(stickerLabel(name, t)),
    tinted: word(t("cardControls.tint.label")),
    badge: word(t("cardControls.style.badge")),
    icon: word(t("cardControls.style.icon")),
  });
}

/**
 * A styled card while the sticker list can't be read (§6.7): it says so and
 * what the stamps have ("קרואסון, בצבע הכרטיס, לבד"), and offers nothing that
 * would drop them unasked. The glyphs wait behind "סמל פשוט", which says that
 * a symbol takes the sticker's place.
 */
function OutageStamp({
  value,
  niche,
  picture,
  onGlyph,
}: {
  value: CardStudioValue;
  niche?: string | null;
  picture: StampPicture;
  onGlyph: (name: string) => void;
}) {
  const { t } = useTranslation();
  const symbolId = useId();
  const [open, setOpen] = useState(false);
  const chosen = designOptions(value.design);
  const summary = useStampSummary(value);
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-1.5 text-sm leading-snug text-ink-muted">
        <Info aria-hidden className="mt-px size-4 shrink-0" />
        <span>{t("studio.stickers.outage")}</span>
      </p>
      <p className="type-body text-ink">
        <b className="font-semibold">{t("studio.stickers.has")}</b> {summary}
      </p>
      <Button
        variant={open ? "secondary" : "quiet"}
        aria-expanded={open}
        aria-controls={symbolId}
        onClick={() => setOpen((was) => !was)}
        className="-ms-3 w-fit"
      >
        {t("cardControls.sticker.symbol")}
      </Button>
      {open && (
        <div id={symbolId} className="flex flex-col gap-5">
          {chosen.sticker && <p className="text-sm leading-snug text-ink-muted">{t("studio.stickers.symbolDrops")}</p>}
          <GlyphPicker glyph={value.design.stamp?.glyph ?? "check"} glyphHidden={!!chosen.sticker} onGlyph={onGlyph} niche={niche} picture={picture} />
        </div>
      )}
    </div>
  );
}

/**
 * A card whose options the wallet draws none of (a server before v0.1.1,
 * `studioMode` "off"): it refuses every save of the card as it is. Said, with
 * what the stamps have, and the one way on: taking the options off, which
 * stands the stamps in circles again, as "מאחורי החותמות" offers too.
 */
function OptionsOff({ value, onTakeOff }: { value: CardStudioValue; onTakeOff?: () => void }) {
  const { t } = useTranslation();
  const summary = useStampSummary(value);
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-1.5 text-sm leading-snug text-ink-muted">
        <Info aria-hidden className="mt-px size-4 shrink-0" />
        <span>{t("studio.stickers.off")}</span>
      </p>
      <p className="type-body text-ink">
        <b className="font-semibold">{t("studio.stickers.has")}</b> {summary}
      </p>
      {onTakeOff && (
        <Button variant="secondary" onClick={onTakeOff} className="w-fit max-w-full !whitespace-normal text-center">
          {t("studio.options.takeOff")}
        </Button>
      )}
    </div>
  );
}

function OptionsStamp({
  value,
  onChange,
  niche,
  picture,
  onPicture,
  note,
  locked,
  stickers,
  stickersStatus,
  savedDesign,
  markAlways,
  wide,
  onGlyph,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  niche?: string | null;
  picture: StampPicture;
  onPicture?: (dataUrl: string | null) => void;
  note?: ReactNode;
  locked?: ReactNode;
  stickers: readonly Sticker[];
  stickersStatus: StickersStatus;
  savedDesign: DesignDoc;
  markAlways: boolean;
  wide: boolean;
  onGlyph: (name: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const name = useId();
  const moreId = useId();
  const symbolId = useId();
  const pictureId = useId();
  const chosen = designOptions(value.design);
  const glyph = value.design.stamp?.glyph ?? "check";
  const sticker = stickers.find((candidate) => candidate.name === chosen.sticker);
  // A picture the card keeps comes before any sticker: one saved (no way back
  // yet), or a catalog look's own art, which its art tray takes off.
  const pictureFirst = !!locked || (picture.inUse && !onPicture);
  // Open on what the card already has: its sticker among the others, its
  // glyph, or its held picture.
  const [opened, setOpened] = useState<Opened | null>(() => {
    if (pictureFirst) return null;
    if (picture.inUse) return "picture";
    if (chosen.sticker) return inTradeFirst(stickers, niche, chosen.sticker) ? null : "more";
    return "symbol";
  });
  const toggle = (which: Opened) => setOpened((was) => (was === which ? null : which));

  const tinted = tintDrawn(value.design);
  const stampColour = stampColourOf(value);
  const art = picture.inUse && picture.url ? picture.url : sticker?.image;
  // The stamp as the style tiles show it: what the card's stamp is, in shades
  // of its colour on its own once the tint is on.
  const face = (ink: string, style: StampStyle) => {
    const round = picture.inUse && !!picture.url;
    if (art && tinted && style === "icon") return <TintedArt src={art} colour={stampColour} round={round} />;
    if (art) return <img src={art} alt="" className={round ? "size-7 rounded-full object-cover" : "size-7 object-contain"} />;
    const Icon = STAMP_GLYPHS[glyph] ?? STAMP_GLYPHS.check;
    return <Icon className="size-5" strokeWidth={2.2} color={ink} />;
  };

  const onSticker = (next: string) => {
    // A picture only held for Save would hide the sticker: it goes.
    onPicture?.(null);
    onChange(withStamp(value, { sticker: next }));
  };

  // The tint's words: what it shades, and the ground it brings to a card with
  // none. English sets the sticker's name in the sentence's own case.
  const artName = sticker
    ? i18n.language.startsWith("he")
      ? stickerLabel(sticker.name, t)
      : stickerLabel(sticker.name, t).toLocaleLowerCase(i18n.language)
    : "";
  const tintHint = (
    <>
      {picture.inUse ? t("cardControls.tint.picture") : t("cardControls.tint.hint", { sticker: artName })}
      {!tinted && tintBringsGround(value) && <> {t("cardControls.tint.ground")}</>}
    </>
  );

  const buttons: { which: Opened; label: string; id: string }[] = [
    { which: "more", label: t("cardControls.sticker.more"), id: moreId },
    { which: "symbol", label: t("cardControls.sticker.symbol"), id: symbolId },
    ...(onPicture ? [{ which: "picture" as const, label: t("cardControls.sticker.picture"), id: pictureId }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      {pictureFirst ? (
        <div className="flex flex-col gap-2">
          <p className="type-label text-ink">{t("cardControls.sticker.legend")}</p>
          <StampPictureField picture={picture} onPicture={onPicture ? (dataUrl) => onPicture(dataUrl) : undefined} />
          <p className="text-sm leading-snug text-ink-muted">{locked ?? t("cardControls.sticker.pictureFirst")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <StickerFirst
            name={name}
            stickers={stickers}
            loading={stickersStatus === "loading"}
            niche={niche}
            value={chosen.sticker}
            onChange={onSticker}
          />
          {/* Wrapping, never scrolling, at large text. */}
          <div className="-ms-3 flex flex-wrap">
            {buttons.map(({ which, label, id }) => (
              <Button
                key={which}
                variant={opened === which ? "secondary" : "quiet"}
                aria-expanded={opened === which}
                aria-controls={id}
                onClick={() => toggle(which)}
                className="max-w-full !whitespace-normal text-start"
              >
                {label}
              </Button>
            ))}
          </div>
          {opened === "more" && (
            <StickerMore
              id={moreId}
              name={name}
              stickers={stickers}
              niche={niche}
              value={chosen.sticker}
              onChange={onSticker}
              stickySearch={wide ? "sticky top-[calc(5.5rem+env(safe-area-inset-top))] xl:top-0" : "sticky top-0"}
            />
          )}
          {opened === "symbol" && (
            <div id={symbolId} className="flex flex-col gap-5">
              <GlyphPicker
                glyph={glyph}
                glyphHidden={!!chosen.sticker}
                onGlyph={onGlyph}
                niche={niche}
                picture={picture}
              />
            </div>
          )}
          {opened === "picture" && onPicture && (
            <div id={pictureId}>
              <StampPictureField picture={picture} onPicture={(dataUrl) => onPicture(dataUrl)} note={note} />
            </div>
          )}
        </div>
      )}

      {tintShows(value.design, picture.inUse) && (
        <Switch
          checked={tinted}
          onChange={(on) => onChange(withTint(value, on))}
          label={tinted && !stampsInCardColour(value) ? t("cardControls.tint.labelStamps") : t("cardControls.tint.label")}
          description={tintHint}
        />
      )}

      <StampStylePicker
        value={chosen.style}
        onChange={(style) => onChange(withStamp(value, { style }))}
        face={face}
        stampColour={stampColour}
        background={chosen.panelColor || value.background_color}
      />

      {markShows(value.design, savedDesign, markAlways) && (
        <Switch
          checked={chosen.mark === "check"}
          onChange={(checked) => onChange(withStamp(value, { mark: checked ? "check" : "none" }))}
          label={t("cardControls.mark.label")}
          description={markAlways ? t("cardControls.mark.hint") : t("cardControls.mark.offHint")}
        />
      )}
    </div>
  );
}
