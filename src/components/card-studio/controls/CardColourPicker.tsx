import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CARD_BACKGROUNDS } from "../../../lib/accentPalette";
import { STAMP_GLYPHS } from "../../../lib/stampGlyphs";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";
import { ColourPickerPanel } from "./ColourPickerPanel";
import { matchingLook, swatchIndex, type CardColours, type ReadyLook } from "./controlRules";
import { OwnColourFace, SwatchFace } from "./Swatch";

const OWN = "own";

/**
 * The card's colour: ready looks that paint all four colours at once, the
 * ten backgrounds onboarding offers, and a colour of one's own.
 *
 * A look is drawn as a scrap of the owner's own card, in its colours with
 * the owner's own glyph, so the row reads as "mine, in six colourways". It
 * stays chosen only while all four colours still match it.
 *
 * Controlled and blind to whose draft it edits: a look comes back whole
 * through `onLook`, a background alone through `onBackground`, and the page
 * decides what else follows (the text colour, when it is automatic).
 */
export function CardColourPicker({
  colours,
  looks = [],
  glyph,
  onLook,
  onBackground,
}: {
  colours: CardColours;
  /** Passed in as data: the studio's palettes, or onboarding's trade looks. */
  looks?: readonly ReadyLook[];
  glyph: string;
  onLook: (look: ReadyLook) => void;
  onBackground: (hex: string) => void;
}) {
  const { t } = useTranslation();
  const swatches = CARD_BACKGROUNDS.map((background) => background.hex);
  const offered = swatchIndex(colours.background, swatches) >= 0;
  // Open while it is the choice, so a drag through the pane that passes an
  // offered colour doesn't snatch the pane away mid-drag.
  const [ownOpen, setOwnOpen] = useState(!offered);
  const own = ownOpen || !offered;
  const Glyph = STAMP_GLYPHS[glyph] ?? STAMP_GLYPHS.check;

  const lookTiles: Tile<string>[] = looks.map((look) => ({
    value: look.key,
    label: look.name,
    render: () => (
      <span
        aria-hidden
        className="flex size-11 flex-col items-center justify-center gap-1 rounded-field"
        style={{ backgroundColor: look.background }}
      >
        <Glyph className="size-4" strokeWidth={2.4} color={look.stamp} />
        <span className="h-0.5 w-5 rounded-full" style={{ backgroundColor: look.label }} />
      </span>
    ),
  }));

  const backgroundTiles: Tile<string>[] = [
    ...CARD_BACKGROUNDS.map((background) => ({
      value: background.hex,
      label: t(`onboarding.color.names.${background.key}`),
      render: (chosen: boolean) => <SwatchFace hex={background.hex} chosen={chosen} />,
    })),
    {
      value: OWN,
      label: t("cardControls.own"),
      render: (chosen: boolean) => <OwnColourFace hex={colours.background} chosen={chosen} />,
    },
  ];

  const chosenBackground = own
    ? OWN
    : (swatches[swatchIndex(colours.background, swatches)] ?? null);

  return (
    <div className="flex flex-col gap-6">
      {lookTiles.length > 0 && (
        <ChoiceTiles
          legend={t("cardControls.looks")}
          tiles={lookTiles}
          value={matchingLook(colours, looks)}
          shape="rounded"
          onChange={(key) => {
            const look = looks.find((candidate) => candidate.key === key);
            if (!look) return;
            setOwnOpen(false);
            onLook(look);
          }}
        />
      )}

      <div className="flex flex-col gap-4">
        <ChoiceTiles
          legend={t("cardControls.cardColour")}
          tiles={backgroundTiles}
          value={chosenBackground}
          onChange={(next) => {
            if (next === OWN) {
              setOwnOpen(true);
              return;
            }
            setOwnOpen(false);
            onBackground(next);
          }}
        />
        {own && (
          <ColourPickerPanel label={t("cardControls.cardColour")} value={colours.background} onChange={onBackground} />
        )}
      </div>
    </div>
  );
}
