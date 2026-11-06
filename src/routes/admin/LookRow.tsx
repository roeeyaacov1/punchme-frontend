import { useTranslation } from "react-i18next";
import { CircleAlert, Ellipsis } from "lucide-react";
import { Badge, Button, LinkButton, useReducedMotion } from "../../components/kit";
import { cn } from "../../lib/cn";
import { LookPicture } from "./LookPicture";
import { reasonKey, rowName, type RowNote } from "./rows";
import type { ShelfRow } from "./shelf";

/**
 * One look in its trade (the brief's §7.4): its place, its picture, the
 * name owners read over the name staff typed, and its actions. A 56px row,
 * one layout whether the look is offered or not.
 *
 * The names never share a line with anything that can push them: each
 * wraps to two lines rather than being cut, and the id stays in the editor.
 * Staff's name is in whichever direction its own words run.
 *
 * A row just moved or unpublished comes up lit, Panel Light fading in
 * under it with no travel, and says what happened until the next action.
 * Done from a sheet or a dialog, the light waits for it to leave: lit
 * behind the scrim it was full by the time the page cleared, so nothing
 * showed which look had moved.
 */
export function LookRow({
  row,
  note,
  litKey,
  litAfterModal,
  busy,
  onActions,
  onPublishAgain,
  actionsRef,
  againRef,
}: {
  row: ShelfRow;
  note: RowNote | null;
  /** A new value lights the row again. */
  litKey: number | null;
  /** The light comes on once a sheet or a dialog has left. */
  litAfterModal: boolean;
  busy: boolean;
  onActions: () => void;
  onPublishAgain: () => void;
  actionsRef: (element: HTMLButtonElement | null) => void;
  againRef: (element: HTMLButtonElement | null) => void;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const name = rowName(row);
  const builtIn = row.id === null;

  return (
    // The row lays itself out by its own width, in rem, so large text is
    // measured too. Under 30rem its gaps and edges are 8px and 12px, so the
    // names keep as much of it as they can; under 16rem, which only large
    // text reaches, the names go under the picture, across the row.
    <li className="relative [container-type:inline-size]">
      {litKey !== null && (
        <span
          key={litKey}
          aria-hidden
          className={cn("absolute inset-0 bg-light", reduced ? "animate-gentle-in" : "animate-light-up")}
          // The kit's exit: its scrim fades for --duration-exit in either
          // motion setting. `both` keeps the row unlit while it waits.
          style={litAfterModal ? { animationDelay: "var(--duration-exit)" } : undefined}
        />
      )}
      <div className="relative grid min-h-14 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-3 py-2 [@container(min-width:30rem)]:gap-x-3 [@container(min-width:30rem)]:px-5">
        <span dir="ltr" className="w-5 text-center font-heading font-medium tabular-nums text-ink [@container(min-width:30rem)]:w-6">
          {row.place ?? ""}
        </span>
        <LookPicture picture={row.picture} />
        <div className="flex min-w-0 flex-col items-start gap-1 [@container(max-width:16rem)]:col-span-full [@container(max-width:16rem)]:row-start-2">
          <span dir="auto" className="line-clamp-2 font-heading font-medium leading-snug text-ink [overflow-wrap:anywhere]">
            {name}
          </span>
          {row.ownersName && row.staffName && (
            <span dir="auto" className="line-clamp-2 text-sm leading-snug text-ink-muted [overflow-wrap:anywhere]">
              {row.staffName}
            </span>
          )}
          {row.reason && <span className="text-sm leading-snug text-ink-muted">{t(reasonKey(row.reason))}</span>}
          {/* A tag here may wrap: the column can be narrower than its words. */}
          {row.place === 1 && <Badge className="!whitespace-normal">{t("admin.catalog.first")}</Badge>}
          {builtIn && <Badge className="!whitespace-normal">{t("admin.catalog.builtIn")}</Badge>}
          {note?.kind === "moved" && (
            <span className="text-sm font-semibold leading-snug text-ink">{t("admin.catalog.moved", { n: note.n })}</span>
          )}
          {note?.kind === "unpublished" && (
            <span className="flex flex-wrap items-center gap-x-3">
              <span className="text-sm font-semibold leading-snug text-ink">{t("admin.catalog.unpublished")}</span>
              <Button ref={againRef} variant="quiet" onClick={onPublishAgain} busy={busy} className="-ms-5 underline">
                {t("admin.catalog.publishAgain")}
              </Button>
            </span>
          )}
          {note?.kind === "failed" && (
            <span className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
              <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
              <span>{t("admin.catalog.writeFailed", { reason: note.message })}</span>
            </span>
          )}
        </div>
        {!builtIn && (
          <div className="col-start-4 row-start-1 flex items-center gap-2">
            {/* Beside the actions where the row is wide, as on a desktop. */}
            <LinkButton
              variant="secondary"
              to={`/admin/catalog/${row.id}`}
              aria-label={t("admin.catalog.editFor", { name })}
              className="hidden [@container(min-width:42rem)]:inline-flex"
            >
              {t("common.edit")}
            </LinkButton>
            <Button
              ref={actionsRef}
              variant="quiet"
              size="icon"
              aria-label={t("admin.catalog.actionsFor", { name })}
              aria-haspopup="dialog"
              icon={<Ellipsis aria-hidden />}
              onClick={onActions}
              className="-me-2.5"
            />
          </div>
        )}
      </div>
    </li>
  );
}
