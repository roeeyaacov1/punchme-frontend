import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/cn";
import { CARD_PATTERNS, patternStyle, type CardPattern } from "../../../lib/cardPatterns";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";

/**
 * The texture behind the stamps, each tile a piece of the strip: the card
 * colour with the pattern in the stamp colour, as the renderer bakes it.
 * Its name sits on a chip of the panel at 13px, so it reads on any card.
 * Four to a row while each name fits its tile (16.25rem); with large text
 * on a phone, as many as fit, rather than names that run out of their tiles.
 */
export function TexturePicker({
  value,
  onChange,
  background,
  stampColour,
}: {
  value: CardPattern;
  onChange: (next: CardPattern) => void;
  background: string;
  stampColour: string;
}) {
  const { t } = useTranslation();
  const tiles: Tile<CardPattern>[] = CARD_PATTERNS.map((kind) => ({
    value: kind,
    label: t(`studio.patterns.${kind}`),
    render: (chosen: boolean) => (
      <span
        aria-hidden
        className="flex h-12 w-full items-center justify-center rounded-field"
        style={{ backgroundColor: background, ...patternStyle(kind, stampColour) }}
      >
        <span className={cn("type-tag rounded-full bg-surface px-2 py-0.5", chosen ? "text-ink" : "text-ink-muted")}>
          {t(`studio.patterns.${kind}`)}
        </span>
      </span>
    ),
  }));
  return (
    <ChoiceTiles
      legend={t("studio.patternLabel")}
      tiles={tiles}
      value={value}
      onChange={onChange}
      shape="rounded"
      className="[container-type:inline-size]"
      listClassName="grid grid-cols-4 gap-2 [&>label]:w-full [@container(max-width:16.25rem)]:grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))]"
    />
  );
}
