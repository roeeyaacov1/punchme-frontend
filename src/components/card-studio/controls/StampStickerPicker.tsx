import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Input } from "../../kit/Input";
import { Skeleton } from "../../kit/Skeleton";
import { noTapFlash } from "../../kit/classes";
import { searchStickers, stickerShelves } from "../stickerGroups";
import { stickerLabel, type Sticker } from "./controlRules";

/**
 * The stickers as a stamp (brief §6.3): the trade's own first, each with its
 * name under it, and in place, behind "עוד מדבקות", every other one under its
 * group with a search over the Hebrew and English names. The tiles are the
 * server's own thumbnails; nothing here draws a sticker.
 *
 * One choice across both, so their radios share a `name`, and the arrow keys
 * walk every tile in view. There is no "none": a plain symbol (the glyphs)
 * is how a stamp goes back to having no sticker.
 */

/** A grid of sticker tiles: a 48px circle with the sticker, its name under
 * it at 12px. As many to a row as fit, six on a phone, fewer at large text. */
function StickerTiles({
  name,
  stickers,
  value,
  onChange,
}: {
  name: string;
  stickers: readonly Sticker[];
  value: string;
  onChange: (name: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-x-1 gap-y-3">
      {stickers.map((sticker) => {
        const chosen = sticker.name === value;
        return (
          <label
            key={sticker.name}
            className={cn(
              // Held, it raises no "save image" callout over the sticker.
              "flex min-h-11 cursor-pointer touch-manipulation select-none flex-col items-center gap-1 has-[:disabled]:cursor-not-allowed [-webkit-touch-callout:none]",
              noTapFlash,
            )}
          >
            <input
              type="radio"
              name={name}
              value={sticker.name}
              checked={chosen}
              onChange={() => onChange(sticker.name)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "flex size-12 items-center justify-center rounded-full bg-background ring-offset-surface transition-shadow duration-gentle ease-out",
                chosen ? "ring-2 ring-ink ring-offset-2" : "ring-1 ring-field",
                "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ink",
              )}
            >
              <img src={sticker.image} alt="" draggable={false} className="size-9 object-contain" />
            </span>
            <span className={cn("text-center text-xs leading-tight", chosen ? "font-semibold text-ink" : "text-ink-muted")}>
              {stickerLabel(sticker.name, t)}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** "מה על כל חותמת · לבית קפה" and the trade's own stickers. */
export function StickerFirst({
  name,
  stickers,
  loading,
  niche,
  value,
  onChange,
}: {
  /** The radios' name, shared with `StickerMore`. */
  name: string;
  stickers: readonly Sticker[];
  loading: boolean;
  niche?: string | null;
  value: string;
  onChange: (name: string) => void;
}) {
  const { t } = useTranslation();
  const shelves = useMemo(() => stickerShelves(stickers, niche), [stickers, niche]);
  const legend = `${t("cardControls.sticker.legend")} · ${t(`cardControls.sticker.trade.${shelves.trade}`)}`;
  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy>
        <p className="type-label text-ink">{legend}</p>
        <Skeleton className="h-28 w-full rounded-field" />
      </div>
    );
  }
  return (
    <fieldset className="min-w-0">
      <legend className="type-label mb-3 text-ink">{legend}</legend>
      <StickerTiles name={name} stickers={shelves.first} value={value} onChange={onChange} />
    </fieldset>
  );
}

/** "עוד מדבקות", opened: the search, and the other stickers by group. A search
 * that finds nothing says so over the groups, never a blank tray. */
export function StickerMore({
  id,
  name,
  stickers,
  niche,
  value,
  onChange,
  stickySearch,
}: {
  id?: string;
  name: string;
  stickers: readonly Sticker[];
  niche?: string | null;
  value: string;
  onChange: (name: string) => void;
  /** Where the search holds while the groups scroll under it. */
  stickySearch: string;
}) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const noneId = useId();
  const shelves = useMemo(() => stickerShelves(stickers, niche), [stickers, niche]);
  const namesOf = useMemo(() => {
    const languages = ["he", "en"].map((lng) => i18n.getFixedT(lng));
    return (sticker: string) => languages.map((fixed) => fixed(`stickers.${sticker}`, { defaultValue: "" }));
  }, [i18n]);
  const found = useMemo(() => searchStickers(stickers, query, namesOf), [stickers, query, namesOf]);
  const searching = query.trim().length > 0;

  return (
    <div id={id} className="flex flex-col gap-4">
      <div className={cn("z-[1] -mx-1 bg-surface px-1 pb-1 pt-1", stickySearch)}>
        <Input
          label={t("cardControls.sticker.search")}
          placeholder={t("cardControls.sticker.searchHint")}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          leading={<Search aria-hidden className="size-4" />}
          // Half a name is not a misspelling: no autocorrect swapping "cupc"
          // for a word on Search, no red underline, no capital to start.
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="search"
          aria-describedby={searching && found.length === 0 ? noneId : undefined}
          dir="auto"
        />
      </div>
      {searching && found.length > 0 ? (
        <fieldset className="min-w-0">
          <legend className="sr-only">{t("cardControls.sticker.search")}</legend>
          <StickerTiles name={name} stickers={found} value={value} onChange={onChange} />
        </fieldset>
      ) : (
        <>
          {searching && (
            <p id={noneId} role="status" className="text-sm leading-snug text-ink-muted">
              {t("cardControls.sticker.noResults")}
            </p>
          )}
          {shelves.groups.map((group) => (
            <fieldset key={group.key} className="min-w-0">
              <legend className="type-label mb-3 text-ink-muted">{t(`cardControls.sticker.groups.${group.key}`)}</legend>
              <StickerTiles name={name} stickers={group.stickers} value={value} onChange={onChange} />
            </fieldset>
          ))}
        </>
      )}
    </div>
  );
}
