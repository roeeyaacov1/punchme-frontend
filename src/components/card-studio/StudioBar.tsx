import { forwardRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../kit/Button";
import { linkText } from "../kit/classes";

export interface StudioBarProps {
  /** How many kinds of thing changed. */
  changes: number;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  /** A save that failed, in words, said under Save. */
  problem?: ReactNode;
  /** The draft came back from an earlier visit. */
  kept?: boolean;
  /** Fields in Wallet details the layout can't place. */
  fieldProblems?: number;
  onFieldProblems?: () => void;
  /** Passes in wallets were built by an older version: one save updates
   * them, even with nothing changed. */
  stale?: boolean;
  /** What the changes are, when the page says it otherwise: a catalog look
   * is on no customer's card. */
  sentence?: string;
}

/**
 * Save, always in reach and saying what it does: "2 changes · not on
 * customers' cards yet", the one coral button, and a quiet "Discard changes"
 * that asks nothing, since the saved card is still there to go back to.
 *
 * Save goes busy in place (the kit's `busy`: same width, focus kept), and
 * the line over it says it is saving, once, to a screen reader too; the
 * studio holds still meanwhile. A failure is said under it, in words and an
 * icon, and announced where it happened; focus stays on Save.
 */
export const StudioBar = forwardRef<HTMLButtonElement, StudioBarProps>(function StudioBar(
  { changes, saving, onSave, onDiscard, problem, kept, fieldProblems = 0, onFieldProblems, stale, sentence },
  saveRef,
) {
  const { t } = useTranslation();
  const updateOnly = changes === 0 && !!stale;
  return (
    <div className="flex flex-col gap-2">
      {/* There before it speaks, so the words are read when they come. */}
      <p role="status" className="sr-only">
        {saving ? t("studio.bar.saving") : ""}
      </p>
      {kept && changes > 0 && <p className="text-sm leading-snug text-ink-muted">{t("studio.kept")}</p>}
      {saving ? (
        <p className="type-label text-ink">{t("studio.bar.saving")}</p>
      ) : changes > 0 ? (
        <p className="type-label text-ink">{sentence ?? t("studio.bar.changes", { count: changes })}</p>
      ) : (
        updateOnly && <p className="type-label text-ink">{t("studio.sync.stale")}</p>
      )}
      {fieldProblems > 0 && onFieldProblems && (
        <button
          type="button"
          onClick={onFieldProblems}
          disabled={saving}
          className={cn(linkText, "w-fit text-start text-sm")}
        >
          {t("studio.check.fieldsBar", { count: fieldProblems })}
        </button>
      )}
      {(changes > 0 || updateOnly || problem) && (
        <div className="flex items-center gap-2">
          {changes > 0 && (
            <Button variant="quiet" onClick={onDiscard} disabled={saving} className="shrink">
              {t("studio.bar.discard")}
            </Button>
          )}
          <Button ref={saveRef} busy={saving} onClick={onSave} className="ms-auto min-w-[7rem]">
            {updateOnly ? t("studio.sync.update") : t("studio.save")}
          </Button>
        </div>
      )}
      {problem && (
        <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
          <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
          <span>{problem}</span>
        </p>
      )}
    </div>
  );
});
