import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, ImagePlus } from "lucide-react";
import { cn } from "../../../lib/cn";
import { fileToStampDataUrl } from "../../../lib/stampArt";
import { STAMP_GLYPHS } from "../../../lib/stampGlyphs";
import { noTapFlash } from "../../kit/classes";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";
import { glyphsForTrade } from "./controlRules";

export interface StampPicture {
  /** What to show of it here: the cropped picture, or nothing when this
   * device doesn't have it. */
  url: string | null;
  /** The card's stamp is a picture, whether or not this device can draw it. */
  inUse: boolean;
}

/**
 * The stamp: one of the sixteen glyphs the wallet renderer knows, the trade's
 * own first, or a picture of one's own. A chosen glyph is an ink disc with a
 * cream glyph.
 *
 * The picture is cropped square in the browser (`fileToStampDataUrl`, at most
 * 512px) and handed up as a data URL; nothing is sent from here. While a
 * picture is the stamp, no glyph is chosen, because the renderer uses the
 * picture. Without `onPicture` (a catalog look, whose picture lives with its
 * art) the picture tile only shows that one is in use.
 */
export function StampPicker({
  glyph,
  onGlyph,
  niche,
  picture,
  onPicture,
  note,
  locked,
}: {
  glyph: string;
  onGlyph: (name: string) => void;
  /** The business's trade, whose glyph leads. */
  niche?: string | null;
  picture: StampPicture;
  onPicture?: (dataUrl: string) => void;
  /** Said before a picture is chosen, such as that it can't be taken back. */
  note?: ReactNode;
  /** Why no glyph can be chosen now (a saved picture with no way back yet). */
  locked?: ReactNode;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const errorId = useId();
  const lockedId = useId();
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);

  const tiles: Tile<string>[] = glyphsForTrade(niche).map((name) => {
    const Icon = STAMP_GLYPHS[name];
    return {
      value: name,
      label: t(`onboarding.stamp.glyphs.${name}`),
      render: (chosen: boolean) => (
        <span
          aria-hidden
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            chosen ? "bg-ink text-surface" : "bg-surface text-ink",
          )}
        >
          <Icon className="size-5" strokeWidth={2.2} />
        </span>
      ),
    };
  });

  async function choose(file: File) {
    setError(null);
    setReading(true);
    try {
      onPicture?.(await fileToStampDataUrl(file));
    } catch (err) {
      setError(
        err instanceof Error && err.message === "too large"
          ? t("onboarding.stamp.uploadTooLarge")
          : t("onboarding.stamp.uploadUnreadable"),
      );
    } finally {
      setReading(false);
    }
  }

  const face = (
    <span
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-ink ring-offset-2 ring-offset-surface",
        picture.inUse ? "ring-2 ring-ink" : "ring-1 ring-field",
      )}
    >
      {picture.url ? <img src={picture.url} alt="" className="size-full object-cover" /> : <ImagePlus className="size-5" />}
    </span>
  );

  return (
    <div className="flex flex-col gap-5">
      <ChoiceTiles
        legend={t("cardControls.glyph")}
        tiles={tiles}
        value={picture.inUse ? null : glyph}
        onChange={onGlyph}
        disabled={!!locked}
        describedBy={locked ? lockedId : undefined}
        listClassName="grid grid-cols-[repeat(4,2.75rem)] justify-between gap-y-3 sm:flex sm:justify-start"
      />
      {locked && (
        <p id={lockedId} className="-mt-2 text-sm leading-snug text-ink-muted">
          {locked}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {note && <p className="text-sm leading-snug text-ink-muted">{note}</p>}
        {onPicture ? (
          <label
            htmlFor={inputId}
            aria-busy={reading || undefined}
            className={cn(
              "flex min-h-14 w-fit max-w-full cursor-pointer items-center gap-3 rounded-full pe-5 ps-1.5 touch-manipulation select-none",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
              "active:bg-ink/[0.06] hover-fine:bg-ink/5 transition-colors duration-gentle ease-out",
              noTapFlash,
            )}
          >
            {face}
            <span className="flex min-w-0 flex-col">
              <span className="type-body font-semibold text-ink">
                {picture.inUse ? t("cardControls.pictureReplace") : t("cardControls.picture")}
              </span>
              <span className="text-sm leading-snug text-ink-muted">{t("onboarding.stamp.uploadHint")}</span>
            </span>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => {
                const file = event.target.files?.[0];
                // Cleared, so choosing the same file again still counts.
                event.target.value = "";
                if (file) void choose(file);
              }}
            />
          </label>
        ) : (
          picture.inUse && (
            <p className="flex items-center gap-3">
              {face}
              <span className="type-body font-semibold text-ink">{t("cardControls.pictureInUse")}</span>
            </p>
          )
        )}
        {error && (
          <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
            <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
}
