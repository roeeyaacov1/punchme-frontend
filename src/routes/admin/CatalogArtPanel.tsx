import { useState } from "react";
import { useTranslation } from "react-i18next";
import { uploadProblem } from "../../components/card-studio/studioProblems";
import { UploadTile } from "../../components/card-studio/UploadTile";
import { CATALOG_ART_USES, type CatalogArtUse } from "../../api/catalog";
import { problemKey } from "../dashboard/problem";

/**
 * The pictures a catalog look is made of, as the studio's "art" tray.
 *
 * Authoring the catalog is the opposite job to the owner's: the whole reason
 * to open this page is that a solid colour will not do, and these four slots
 * are most of what separates a look that seems designed from one that seems
 * generated. So each says what it will do to the card, at the shape the
 * renderer will use.
 *
 * Every slot here is design. The logo is deliberately absent: that one is
 * the business's own mark, and a ready-made look that shipped one would print
 * a stranger's brand on a barber's card. `CATALOG_ART_USES` is the same list,
 * and the API refuses anything outside it.
 *
 * Each upload and removal happens at once and is its own transaction (there
 * is no draft of a catalog picture), and the tray says so. That is also why
 * the slots wait until the look exists: pictures are stored against its id.
 */

/** The shape the renderer uses: the strip is a strip, the stamps are square. */
const ASPECT: Record<CatalogArtUse, string> = {
  strip_base: "1125 / 432",
  stamp_art: "1 / 1",
  stamped_art: "1 / 1",
  unstamped_art: "1 / 1",
};

export interface CatalogArtPanelProps {
  /** Data URLs, keyed by use, as the detail endpoint returns them. */
  art: Partial<Record<CatalogArtUse, string>>;
  /** Null until the look has been saved once and has an id. */
  onUpload: ((use: CatalogArtUse, file: File) => Promise<void>) | null;
  onRemove: (use: CatalogArtUse) => Promise<void>;
  /** The card colour, so a picture is shown over the ground it will sit on. */
  backgroundColor: string;
}

export function CatalogArtPanel({ art, onUpload, onRemove, backgroundColor }: CatalogArtPanelProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<CatalogArtUse | null>(null);
  const [errors, setErrors] = useState<Partial<Record<CatalogArtUse, string>>>({});

  async function run(use: CatalogArtUse, action: () => Promise<void>, removing: boolean) {
    setErrors((current) => ({ ...current, [use]: undefined }));
    setBusy(use);
    try {
      await action();
    } catch (error) {
      const picture = t(`studio.pictures.${use}`);
      let words: string;
      if (removing) {
        words = t(problemKey(error));
      } else {
        const problem = uploadProblem(use, error);
        words = t(problem.key, { ...problem.values, picture });
      }
      setErrors((current) => ({ ...current, [use]: words }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-snug text-ink-muted">
        {onUpload ? t("admin.catalog.art.atOnce") : t("admin.catalog.art.lockedNew")}
      </p>
      {CATALOG_ART_USES.map((use) => (
        <UploadTile
          key={use}
          title={t(`admin.catalog.art.uses.${use}.label`)}
          hint={t(`admin.catalog.art.uses.${use}.hint`)}
          src={art[use]}
          aspect={ASPECT[use]}
          ground={backgroundColor}
          busy={busy === use}
          disabled={!onUpload || (busy !== null && busy !== use)}
          error={errors[use]}
          onFile={(file) => onUpload && void run(use, () => onUpload(use, file), false)}
          onRemove={() => void run(use, () => onRemove(use), true)}
        />
      ))}
    </div>
  );
}
