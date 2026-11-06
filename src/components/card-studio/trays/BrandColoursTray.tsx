import { useId, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../lib/cn";
import { normalizeHex } from "../../../lib/color";
import { Button } from "../../kit/Button";
import { focusRing } from "../../kit/classes";
import { readableInk } from "../../../lib/color";
import {
  CREAM,
  following,
  textFor,
  withBusinessColour,
  withRuleColour,
  type ColourBase,
  type Follower,
} from "../brandColours";
import {
  CardColourPicker,
  ColourPickerPanel,
  PanelColourPicker,
  StampColourPicker,
  TextColourPicker,
} from "../controls";
import { designOptions, withOption } from "../designOptions";
import { stampColourOf, type CardStudioValue } from "../studioDraft";

/** The words a following colour is said in, by its role. */
function groundName(hex: string): string {
  const colour = normalizeHex(hex) ?? hex;
  if (colour === CREAM) return "studio.colours.names.cream";
  if (colour === "#FFFFFF") return "studio.colours.names.white";
  return "studio.colours.names.shade";
}

/**
 * One row of what follows the business colour: its dot, its words, and
 * "שינוי", which opens that colour's own swatches in place. A colour changed
 * by hand says so, with the way back to the business colour.
 */
function FollowRow({
  dot,
  words,
  byHand,
  onBack,
  children,
}: {
  dot: string;
  words: ReactNode;
  byHand: boolean;
  onBack: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col border-b border-border">
      {/* At large text the words wrap beside the dot, and "שינוי" stays at
          the row's end. */}
      <div className="flex min-h-[3.25rem] items-center gap-3 py-1">
        <span
          aria-hidden
          className="size-6 shrink-0 rounded-full ring-1 ring-inset ring-field"
          style={{ backgroundColor: dot }}
        />
        <p className="type-body min-w-0 flex-1 text-ink">
          {words}
          {byHand && <span className="text-ink-muted"> · {t("studio.colours.changed")}</span>}
        </p>
        <Button variant="quiet" aria-expanded={open} aria-controls={id} onClick={() => setOpen((was) => !was)}>
          {t("studio.colours.change")}
        </Button>
      </div>
      {byHand && (
        <Button variant="quiet" onClick={onBack} className="-ms-3 -mt-1 mb-2 w-fit max-w-full !whitespace-normal text-start">
          {t("studio.colours.back")}
        </Button>
      )}
      {open && (
        <div id={id} className="pb-5 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * The card's colours where the wallet draws the design options (brief §6.2):
 * the business colour, then what follows it (the stamps, their ground while
 * there is one, and the text), each with "שינוי", and folded, the label
 * colour Apple alone shows. A new business colour moves every colour that
 * still follows it (`brandColours.ts`); one changed by hand stays.
 *
 * Today's tray, with its ready palettes, stays for a wallet that draws none
 * of the options (`ColoursTray`).
 *
 * The onboarding wizard passes the look the card started from as `base`:
 * its own colours follow too while the card is still its colour, so a look
 * just picked never says it was changed by hand.
 */
export function BrandColoursTray({
  value,
  onChange,
  base,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  base?: ColourBase;
}) {
  const { t } = useTranslation();
  const moreId = useId();
  const [more, setMore] = useState(false);
  const card = value.background_color;
  const follows = following(value, base);
  const stamps = stampColourOf(value);
  const ground = designOptions(value.design).panelColor;
  const back = (which: Exclude<Follower, "label">) => onChange(withRuleColour(value, which, base));
  const bold = { b: <b className="font-semibold" /> };
  // A following colour is said by name: the rule's where it is the rule's,
  // as it always was, and otherwise the base's own colour as it is.
  const text = value.foreground_color;
  const textWords =
    normalizeHex(text) === normalizeHex(readableInk(card)) || normalizeHex(text) === normalizeHex(textFor(card))
      ? textFor(card)
      : text;

  const setStamps = (color: string) =>
    onChange({ ...value, design: { ...value.design, stamp: { ...value.design.stamp, color } } });
  const setText = (text: string) =>
    onChange({ ...value, foreground_color: text, label_color: follows.label ? text : value.label_color });

  return (
    <div className="flex flex-col gap-6">
      <CardColourPicker
        legend={t("studio.colours.brand")}
        colours={{ background: card, stamp: stamps, text: value.foreground_color, label: value.label_color }}
        glyph={value.design.stamp?.glyph ?? "check"}
        onLook={() => {}}
        onBackground={(hex) => onChange(withBusinessColour(value, hex, base))}
      />

      <div className="flex flex-col">
        <p className="type-label text-ink">{t("studio.colours.follow")}</p>
        <div className="mt-2 border-t border-border">
          <FollowRow
            dot={stamps}
            byHand={!follows.stamps}
            onBack={() => back("stamps")}
            words={
              follows.stamps ? (
                <Trans
                  i18nKey={
                    normalizeHex(stamps) === normalizeHex(card) ? "studio.colours.rows.stamps" : "studio.colours.rows.stampsAccent"
                  }
                  components={bold}
                />
              ) : (
                <b className="font-semibold">{t("studio.colours.parts.stamps")}</b>
              )
            }
          >
            {/* The stamps stand on their ground when there is one, as the
                renderer judges them. */}
            <StampColourPicker background={ground || card} value={stamps} onChange={setStamps} />
          </FollowRow>
          {ground && (
            <FollowRow
              dot={ground}
              byHand={!follows.ground}
              onBack={() => back("ground")}
              words={
                follows.ground ? (
                  <Trans
                    i18nKey="studio.colours.rows.ground"
                    values={{ colour: t(groundName(ground)) }}
                    components={bold}
                  />
                ) : (
                  <b className="font-semibold">{t("studio.colours.parts.ground")}</b>
                )
              }
            >
              <PanelColourPicker
                value={ground}
                onChange={(panel_color) => onChange(withOption(value, { panel_color }))}
                background={card}
              />
            </FollowRow>
          )}
          <FollowRow
            dot={value.foreground_color}
            byHand={!follows.text}
            onBack={() => back("text")}
            words={
              follows.text ? (
                <Trans
                  i18nKey="studio.colours.rows.text"
                  values={{
                    colour: t(
                      normalizeHex(textWords) === "#FFFFFF" ? "studio.colours.names.white" : "studio.colours.names.dark",
                    ),
                  }}
                  components={bold}
                />
              ) : (
                <b className="font-semibold">{t("studio.colours.parts.text")}</b>
              )
            }
          >
            <TextColourPicker
              background={card}
              value={follows.text ? null : value.foreground_color}
              onChange={(next) => (next === null ? back("text") : setText(next))}
            />
          </FollowRow>
        </div>
      </div>

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
          <div id={moreId} className="flex flex-col gap-2">
            <p className="type-label text-ink">{t("studio.labelColour")}</p>
            <p className="-mt-1 text-sm leading-snug text-ink-muted">{t("studio.labelColourHint")}</p>
            <ColourPickerPanel
              label={t("studio.labelColour")}
              value={value.label_color}
              onChange={(hex) => onChange({ ...value, label_color: hex })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
