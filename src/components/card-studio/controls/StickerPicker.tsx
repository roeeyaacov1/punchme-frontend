import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Ban } from "lucide-react";
import { Skeleton } from "../../kit/Skeleton";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";
import { stickerLabel, type Sticker } from "./controlRules";

/** Where the list of stickers stands: on its way, there, or not to be had. */
export type StickersStatus = "loading" | "ready" | "unavailable";

/**
 * One of the wallet's built-in stickers (passbox-api's Fluent Emoji, drawn on
 * the server), or none. Each tile is the server's own thumbnail; nothing here
 * draws a sticker. Used twice: as the stamps, and faint behind them as a
 * wallpaper.
 *
 * `value` "" is none. A name the list doesn't hold (a sticker a newer server
 * has, or one this device couldn't load) leaves no tile chosen.
 */
export function StickerPicker({
  legend,
  hint,
  noneLabel,
  stickers,
  status,
  value,
  onChange,
  disabled,
  describedBy,
}: {
  legend: string;
  hint?: ReactNode;
  /** What the "none" tile is called: no sticker, or no wallpaper. */
  noneLabel: string;
  stickers: readonly Sticker[];
  status: StickersStatus;
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
  describedBy?: string;
}) {
  const { t } = useTranslation();
  if (status === "loading") {
    return (
      <div className="flex flex-col gap-2" aria-busy>
        <p className="type-label text-ink">{legend}</p>
        <Skeleton className="h-24 w-full rounded-field" />
      </div>
    );
  }
  const tiles: Tile<string>[] = [
    {
      value: "",
      label: noneLabel,
      render: () => (
        <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-surface text-ink-muted">
          <Ban className="size-5" />
        </span>
      ),
    },
    ...stickers.map((sticker) => ({
      value: sticker.name,
      label: stickerLabel(sticker.name, t),
      render: () => (
        <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-surface">
          <img src={sticker.image} alt="" draggable={false} className="size-9 object-contain" />
        </span>
      ),
    })),
  ];
  const known = value === "" || stickers.some((sticker) => sticker.name === value);
  return (
    <div className="flex flex-col gap-2">
      <ChoiceTiles
        legend={legend}
        tiles={tiles}
        value={known ? value : null}
        onChange={onChange}
        disabled={disabled}
        describedBy={describedBy}
        listClassName="grid grid-cols-[repeat(auto-fill,2.75rem)] justify-between gap-3"
      />
      {status === "unavailable" && (
        <p className="text-sm leading-snug text-ink-muted">{t("cardControls.stickers.unavailable")}</p>
      )}
      {hint && <p className="text-sm leading-snug text-ink-muted">{hint}</p>}
    </div>
  );
}
