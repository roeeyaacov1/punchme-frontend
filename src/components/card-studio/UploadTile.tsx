import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Check, CircleAlert, ImagePlus, Trash2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../kit/Button";
import { noTapFlash } from "../kit/classes";

/**
 * A picture for the card: what it is, what it does, and the picture itself at
 * the shape the renderer will use, over the card colour so a transparent PNG
 * reads as it will on the card. The whole row is one native file input in
 * its label, so the browser keeps its own keyboard path.
 *
 * Its failure is said here, at the tile, never at the foot of the page.
 */
export function UploadTile({
  title,
  hint,
  src,
  onCard,
  aspect = "1 / 1",
  ground,
  busy,
  error,
  disabled,
  onFile,
  onRemove,
  chooseLabel,
}: {
  title: string;
  hint?: ReactNode;
  /** The picture in use or held, if any. */
  src?: string;
  /** The card has a picture here that this device can't draw (sent from
   * another one): said, so the tile never offers "Upload" over it. */
  onCard?: boolean;
  /** The renderer's shape: "1 / 1", or "1125 / 432" for the strip. */
  aspect?: string;
  /** The card colour behind the picture. */
  ground: string;
  busy?: boolean;
  error?: string | null;
  disabled?: boolean;
  onFile: (file: File) => void;
  /** Where a picture can be taken away (the catalog's art). */
  onRemove?: () => void;
  chooseLabel?: string;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const errorId = useId();
  const wide = aspect !== "1 / 1";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          aria-busy={busy || undefined}
          className={cn(
            "flex min-h-14 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-field p-1.5 pe-4 touch-manipulation select-none",
            "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
            "transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5",
            (disabled || busy) && "pointer-events-none opacity-50",
            noTapFlash,
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex shrink-0 items-center justify-center overflow-hidden ring-1 ring-inset ring-field",
              wide ? "h-12 rounded-md" : "size-12 rounded-field",
            )}
            style={{ aspectRatio: aspect, backgroundColor: ground }}
          >
            {src ? (
              <img src={src} alt="" className="size-full object-cover" />
            ) : onCard ? (
              <span className="flex size-9 items-center justify-center rounded-full bg-surface text-ink">
                <Check className="size-5" />
              </span>
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-surface text-ink">
                <ImagePlus className="size-5" />
              </span>
            )}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="type-body font-semibold text-ink">{title}</span>
            <span className="text-sm leading-snug text-ink-muted">
              {busy
                ? t("common.loading")
                : (chooseLabel ??
                  (src ? t("cardControls.pictureReplace") : onCard ? t("studio.picture.onCard") : t("onboarding.stamp.uploadCta")))}
            </span>
          </span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={disabled || busy}
            aria-describedby={error ? errorId : undefined}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              // Cleared, so choosing the same file again after a crop still counts.
              event.target.value = "";
              if (file) onFile(file);
            }}
          />
        </label>
        {onRemove && src && (
          <Button
            variant="quiet"
            icon={<Trash2 aria-hidden />}
            disabled={disabled || busy}
            onClick={onRemove}
            aria-label={t("admin.catalog.art.removeNamed", { name: title })}
          >
            {t("common.remove")}
          </Button>
        )}
      </div>
      {hint && <p className="text-sm leading-snug text-ink-muted">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
          <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
