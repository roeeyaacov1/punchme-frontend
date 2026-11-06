import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/cn";
import { CARD_PATTERNS, patternStyle } from "../../../lib/cardPatterns";
import { Button } from "../../kit/Button";
import type { PatternChoice } from "../designOptions";
import { PATTERN_MOTIFS } from "../stickerGroups";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";
import { stickerLabel, type Sticker } from "./controlRules";

/** A tile's piece of the strip: the ground, the pattern or the sticker repeated
 * faintly in the stamp colour, as the wallet draws a wallpaper (a silhouette,
 * never the sticker's own colours), and the choice's name on a chip. */
function PatternFace({
  background,
  stampColour,
  texture,
  sticker,
  name,
  chosen,
}: {
  background: string;
  stampColour: string;
  texture?: (typeof CARD_PATTERNS)[number];
  sticker?: Sticker;
  name: string;
  chosen: boolean;
}) {
  const mask = sticker ? `url("${sticker.image}")` : "";
  return (
    <span
      aria-hidden
      className="relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-field p-1"
      style={{ backgroundColor: background, ...(texture ? patternStyle(texture, stampColour) : {}) }}
    >
      {sticker && (
        <span
          className="absolute inset-0 opacity-40"
          style={{
            backgroundColor: stampColour,
            WebkitMaskImage: mask,
            maskImage: mask,
            WebkitMaskSize: "1.125rem",
            maskSize: "1.125rem",
            WebkitMaskRepeat: "repeat",
            maskRepeat: "repeat",
          }}
        />
      )}
      {/* A name that wraps keeps a two-line tag's ends, and the tile grows
          with it. */}
      <span
        className={cn(
          "type-tag relative rounded-[1.30625rem] bg-surface px-2 py-0.5 text-center",
          chosen ? "text-ink" : "text-ink-muted",
        )}
      >
        {name}
      </span>
    </span>
  );
}

/**
 * A faint pattern behind the stamps, as one choice (brief §6.4): none, the
 * three textures, the stamp's own sticker ("כמו החותמת"), wheat, leaves in
 * the wind and sparkles, and behind "עוד" every other sticker. A sticker
 * takes the texture's place, so the two are one choice here
 * (`withPatternChoice`). Its tiles are pieces of the strip, four to a row
 * while their names fit.
 */
export function PatternPicker({
  value,
  onChange,
  stickers,
  stampSticker,
  background,
  stampColour,
}: {
  value: PatternChoice;
  onChange: (next: PatternChoice) => void;
  stickers: readonly Sticker[];
  /** The sticker on the stamps, offered as "like the stamp". */
  stampSticker: string;
  /** What the pattern lies on: the ground, or the card. */
  background: string;
  stampColour: string;
}) {
  const { t } = useTranslation();
  const restId = useId();
  const byName = new Map(stickers.map((sticker) => [sticker.name, sticker]));
  const current = value.startsWith("sticker:") ? value.slice("sticker:".length) : "";
  const like = stampSticker && byName.has(stampSticker) ? [stampSticker] : [];
  const motifs = PATTERN_MOTIFS.filter((name) => byName.has(name) && !like.includes(name));
  const first = [...like, ...motifs];
  const rest = stickers.filter((sticker) => !first.includes(sticker.name));
  // A pattern the card already has among the rest opens them.
  const [more, setMore] = useState(() => !!current && !first.includes(current));

  const textureTiles: Tile<PatternChoice>[] = CARD_PATTERNS.map((kind) => ({
    value: kind,
    label: t(`studio.patterns.${kind}`),
    render: (chosen: boolean) => (
      <PatternFace
        background={background}
        stampColour={stampColour}
        texture={kind}
        name={t(`studio.patterns.${kind}`)}
        chosen={chosen}
      />
    ),
  }));
  const stickerTile = (name: string, label: string): Tile<PatternChoice> => ({
    value: `sticker:${name}`,
    label,
    render: (chosen: boolean) => (
      <PatternFace background={background} stampColour={stampColour} sticker={byName.get(name)} name={label} chosen={chosen} />
    ),
  });
  const firstTiles = first.map((name) =>
    stickerTile(name, name === stampSticker ? t("cardControls.pattern.likeStamp") : stickerLabel(name, t)),
  );
  const restTiles = rest.map((sticker) => stickerTile(sticker.name, stickerLabel(sticker.name, t)));
  const grid =
    "grid grid-cols-4 gap-2 [&>label]:w-full [@container(max-width:16.25rem)]:grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))]";

  return (
    <div className="flex flex-col gap-3">
      <ChoiceTiles
        legend={t("cardControls.pattern.legend")}
        tiles={[...textureTiles, ...firstTiles]}
        value={value}
        onChange={onChange}
        shape="rounded"
        className="[container-type:inline-size]"
        listClassName={grid}
      />
      <p className="text-sm leading-snug text-ink-muted">{t("cardControls.pattern.hint")}</p>
      {restTiles.length > 0 && (
        <Button
          variant={more ? "secondary" : "quiet"}
          aria-expanded={more}
          aria-controls={restId}
          onClick={() => setMore((open) => !open)}
          className="-ms-3 w-fit"
        >
          {t("cardControls.pattern.more")}
        </Button>
      )}
      {more && (
        <div id={restId}>
          <ChoiceTiles
            legend={t("cardControls.pattern.more")}
            hideLegend
            tiles={restTiles}
            value={value}
            onChange={onChange}
            shape="rounded"
            className="[container-type:inline-size]"
            listClassName={grid}
          />
        </div>
      )}
    </div>
  );
}
