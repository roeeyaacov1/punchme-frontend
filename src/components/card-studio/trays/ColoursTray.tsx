import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { CARD_PALETTES } from "../../../lib/cardPalettes";
import { cn } from "../../../lib/cn";
import { readableInk } from "../../../lib/color";
import { focusRing } from "../../kit/classes";
import {
  CardColourPicker,
  ColourPickerPanel,
  StampColourPicker,
  TextColourPicker,
  type ReadyLook,
} from "../controls";
import { stampColourOf, textColourChoice, withBackground, type CardStudioValue } from "../studioDraft";

/**
 * The card's colours: ready looks, the card colour, the stamp colour, and,
 * folded, the text and label colours an owner rarely needs.
 */
export function ColoursTray({
  value,
  onChange,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
}) {
  const { t } = useTranslation();
  const moreId = useId();
  const [more, setMore] = useState(false);
  const stamp = stampColourOf(value);
  const looks: ReadyLook[] = CARD_PALETTES.map((palette) => ({ ...palette, name: t(`studio.palettes.${palette.key}`) }));
  const setStamp = (color: string) =>
    onChange({ ...value, design: { ...value.design, stamp: { ...value.design.stamp, color } } });

  return (
    <div className="flex flex-col gap-6">
      <CardColourPicker
        colours={{ background: value.background_color, stamp, text: value.foreground_color, label: value.label_color }}
        looks={looks}
        glyph={value.design.stamp?.glyph ?? "check"}
        onLook={(look) =>
          onChange({
            ...value,
            background_color: look.background,
            foreground_color: look.text,
            label_color: look.label,
            design: { ...value.design, stamp: { ...value.design.stamp, color: look.stamp } },
          })
        }
        onBackground={(hex) => onChange(withBackground(value, hex))}
      />
      <StampColourPicker background={value.background_color} value={stamp} onChange={setStamp} />

      <div className="flex flex-col gap-4">
        <button
          type="button"
          aria-expanded={more}
          aria-controls={moreId}
          onClick={() => setMore((open) => !open)}
          className={cn(
            "-ms-3 flex min-h-11 w-fit touch-manipulation select-none items-center gap-1.5 rounded-full px-3 type-label text-ink",
            "transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5",
            focusRing,
          )}
        >
          {t("studio.moreColours")}
          <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-gentle", more && "rotate-180")} />
        </button>
        {more && (
          <div id={moreId} className="flex flex-col gap-6">
            <TextColourPicker
              background={value.background_color}
              value={textColourChoice(value)}
              onChange={(next) => onChange({ ...value, foreground_color: next ?? readableInk(value.background_color) })}
            />
            <div className="flex flex-col gap-2">
              <p className="type-label text-ink">{t("studio.labelColour")}</p>
              <p className="-mt-1 text-sm leading-snug text-ink-muted">{t("studio.labelColourHint")}</p>
              <ColourPickerPanel
                label={t("studio.labelColour")}
                value={value.label_color}
                onChange={(hex) => onChange({ ...value, label_color: hex })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
