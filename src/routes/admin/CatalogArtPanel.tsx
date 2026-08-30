import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Trash2 } from "lucide-react";
import { StudioPanel } from "../../components/card-studio/studio-primitives";
import { focusRing } from "../../components/marketing/primitives";
import { CATALOG_ART_USES, type CatalogArtUse } from "../../api/catalog";
import { cn } from "../../lib/cn";

/**
 * The pictures a catalog template is made of.
 *
 * The owner's Card Studio hides its artwork controls three clicks deep under
 * "Wallet details", which is right for a barber who wants a colour and a
 * glyph and to be done. Authoring the catalog is the opposite job: the whole
 * reason to open this page is that a solid colour will not do, and the four
 * slots below are most of what separates a template that looks designed from
 * one that looks generated. So they are a panel of their own, at full size,
 * each saying what it will do to the card.
 *
 * Every slot here is *design*. The logo is deliberately absent even though
 * the owner's studio offers it: that one is the business's own mark, and a
 * ready-made look that shipped one would print a stranger's brand on a
 * barber's card. `CATALOG_ART_USES` is the same list, and the API refuses
 * anything outside it.
 *
 * Each upload is immediate and its own transaction — there is no draft of a
 * picture. That is why the panel is closed until the entry exists: the
 * pictures are stored against a catalog id, and a template being typed for
 * the first time does not have one yet.
 */

/** Preview shape per slot: the strip is a strip, the stamps are square.
 * Drawn at the aspect the renderer will actually use, because a background
 * that reads well square can be cropped to nothing at 2.6:1. */
const ART_SHAPE: Record<CatalogArtUse, { aspect: string; width: string }> = {
  strip_base: { aspect: "1125 / 432", width: "w-44 sm:w-64" },
  stamp_art: { aspect: "1 / 1", width: "w-16" },
  stamped_art: { aspect: "1 / 1", width: "w-16" },
  unstamped_art: { aspect: "1 / 1", width: "w-16" },
};

export interface CatalogArtPanelProps {
  /** Data URLs, keyed by use, as the detail endpoint returns them. */
  art: Partial<Record<CatalogArtUse, string>>;
  /** Null until the entry has been saved once and has an id. */
  onUpload: ((use: CatalogArtUse, file: File) => Promise<void>) | null;
  onRemove: (use: CatalogArtUse) => Promise<void>;
  /** The card colour, so an empty slot is previewed against the ground the
   * image would sit on rather than against the page. */
  backgroundColor: string;
}

export function CatalogArtPanel({
  art,
  onUpload,
  onRemove,
  backgroundColor,
}: CatalogArtPanelProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<CatalogArtUse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(use: CatalogArtUse, action: () => Promise<void>) {
    setError(null);
    setBusy(use);
    try {
      await action();
    } catch (err) {
      // The server's own words: it is the one that knows a strip is
      // 900x300 and needs to be 1125x432, and "upload failed" would send
      // staff back to a cropping tool with nothing to go on.
      setError(err instanceof Error ? err.message : t("studio.uploadError"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <StudioPanel title={t("admin.catalog.art.title")} hint={t("admin.catalog.art.hint")}>
      {!onUpload && (
        <p className="rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn">
          {t("admin.catalog.art.lockedNew")}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {CATALOG_ART_USES.map((use) => (
          <ArtSlot
            key={use}
            use={use}
            src={art[use]}
            backgroundColor={backgroundColor}
            busy={busy === use}
            disabled={!onUpload || busy !== null}
            onFile={(file) => void run(use, () => onUpload!(use, file))}
            onRemove={() => void run(use, () => onRemove(use))}
          />
        ))}
      </div>

      {error && (
        <p role="alert" dir="auto" className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </StudioPanel>
  );
}

function ArtSlot({
  use,
  src,
  backgroundColor,
  busy,
  disabled,
  onFile,
  onRemove,
}: {
  use: CatalogArtUse;
  src?: string;
  backgroundColor: string;
  busy: boolean;
  disabled: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const shape = ART_SHAPE[use];
  const name = t(`admin.catalog.art.uses.${use}.label`);

  return (
    <div className="flex flex-wrap items-start gap-4 border-t border-border pt-4 first:border-0 first:pt-0">
      {/* The picture itself, at the aspect the strip renderer will crop it
          to, over the card colour so a transparent PNG reads the way it
          will on the card rather than over the page. */}
      <span
        aria-hidden="true"
        className={cn(
          "block shrink-0 overflow-hidden rounded-xl ring-1 ring-border-strong",
          shape.width,
        )}
        style={{ aspectRatio: shape.aspect, backgroundColor }}
      >
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <ImagePlus size={18} className="text-ink-subtle" />
          </span>
        )}
      </span>

      <div className="flex min-w-[12rem] flex-1 flex-col gap-2">
        <p className="text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-ink-subtle">{t(`admin.catalog.art.uses.${use}.hint`)}</p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <label
            className={cn(
              "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-3 py-2",
              "border-border-strong bg-background text-sm font-semibold text-ink transition-colors",
              "hover:border-primary hover:bg-surface",
              "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-text focus-within:ring-offset-2 focus-within:ring-offset-surface",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {busy
              ? t("common.loading")
              : src
                ? t("admin.catalog.art.replace")
                : t("admin.catalog.art.upload")}
            <input
              type="file"
              accept="image/*"
              disabled={disabled}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
                // Cleared so re-picking the same file after a crop still
                // fires a change event.
                e.target.value = "";
              }}
            />
          </label>

          {src && (
            <button
              type="button"
              disabled={disabled}
              onClick={onRemove}
              // Named for a screen reader, short on screen: four "Remove"
              // buttons down a panel are four identical announcements.
              aria-label={t("admin.catalog.art.removeNamed", { name })}
              className={cn(
                "inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 py-2",
                "text-sm font-semibold text-ink-muted transition-colors hover:text-danger",
                "disabled:opacity-50",
                focusRing,
              )}
            >
              <Trash2 size={15} aria-hidden="true" />
              {t("common.remove")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
