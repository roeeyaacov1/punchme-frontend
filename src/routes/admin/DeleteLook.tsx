import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Check, Info } from "lucide-react";
import { Button, Dialog } from "../../components/kit";
import { LookPicture } from "./LookPicture";
import type { DeleteFact, ShelfRow } from "./shelf";

/**
 * The question a delete asks, in the page (the brief's §7.2), never the
 * browser's own confirm: the look's picture, then the two facts that matter
 * at that moment. Cards made from it stay as they are, because each is a
 * copy; and what owners lose, with where it stands now. A published look
 * offers the gentler way out under them, taking it off the wizard and
 * keeping it; the footer holds only Cancel and the delete, the danger
 * button, so on a phone the two stand on one line.
 */
export function DeleteLook({
  row,
  name,
  fact,
  open,
  busy,
  onClose,
  onDelete,
  onUnpublish,
  returnFocus,
}: {
  row: ShelfRow | null;
  /** Isolated already, so its words keep their order inside the sentence. */
  name: string;
  fact: DeleteFact | null;
  open: boolean;
  busy: "delete" | "unpublish" | null;
  onClose: () => void;
  onDelete: () => void;
  onUnpublish: () => void;
  returnFocus: RefObject<HTMLElement>;
}) {
  const { t } = useTranslation();
  const second =
    fact?.kind === "placed"
      ? t("admin.catalog.delete.placed", { n: fact.n, total: fact.total })
      : fact?.kind === "draft"
        ? t("admin.catalog.delete.draft")
        : t("admin.catalog.delete.notShown");
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      // A name of one long unbroken word breaks anywhere rather than run
      // out of the dialog.
      title={<span className="[overflow-wrap:anywhere]">{t("admin.catalog.delete.title", { name })}</span>}
      returnFocus={returnFocus}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy !== null}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={onDelete} busy={busy === "delete"} disabled={busy === "unpublish"}>
            {t("admin.catalog.actions.delete")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {row && <LookPicture picture={row.picture} size="large" />}
        <ul className="flex flex-col gap-3 text-ink">
          <li className="flex items-start gap-2">
            <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-ok" />
            <span className="type-body">{t("admin.catalog.delete.copies")}</span>
          </li>
          <li className="flex items-start gap-2">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-muted" />
            <span className="type-body">{second}</span>
          </li>
        </ul>
        {/* The gentler way out, beside what it spares: off the wizard, kept. */}
        {row?.published && (
          <Button
            variant="secondary"
            onClick={onUnpublish}
            busy={busy === "unpublish"}
            disabled={busy === "delete"}
            // Its words wrap with large text rather than leave the dialog.
            className="self-start !whitespace-normal text-start"
          >
            {t("admin.catalog.delete.justUnpublish")}
          </Button>
        )}
      </div>
    </Dialog>
  );
}
