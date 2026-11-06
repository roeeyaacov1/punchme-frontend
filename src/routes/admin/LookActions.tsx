import type { ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, ArrowUpToLine, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { List, ListRow, Sheet } from "../../components/kit";
import { cn } from "../../lib/cn";

export type LookAction = "first" | "up" | "down" | "publish" | "unpublish" | "delete";

/**
 * A row's words, free to wrap: the kit's row keeps one line and cuts the
 * rest, and with large text on a phone "Unpublish" in Hebrew is wider than
 * the sheet.
 */
function rowWords(text: string, className?: string) {
  return <span className={cn("whitespace-normal [overflow-wrap:anywhere]", className)}>{text}</span>;
}

/**
 * A look's actions, in the kit's sheet (the brief's §7.7): titled with its
 * name and where it stands, then edit, the moves it can make, publishing,
 * and delete. A move that can't happen isn't offered. While a write runs
 * the sheet stays, busy, and closes once the list has its answer, so focus
 * lands on the look where it now stands.
 */
export function LookActions({
  open,
  onClose,
  title,
  where,
  editTo,
  can,
  published,
  busy,
  onAction,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  where: ReactNode;
  editTo: string;
  can: { first: boolean; up: boolean; down: boolean };
  published: boolean;
  busy: boolean;
  onAction: (action: LookAction) => void;
  returnFocus: RefObject<HTMLElement>;
}) {
  const { t } = useTranslation();
  const icon = "size-5 text-ink-muted";
  const act = (action: LookAction) => () => {
    if (!busy) onAction(action);
  };
  return (
    <Sheet open={open} onClose={onClose} title={title} description={where} returnFocus={returnFocus}>
      <div aria-busy={busy || undefined} className={cn(busy && "pointer-events-none opacity-60")}>
        <List className="-mx-6 border-y border-border">
          <ListRow to={editTo} leading={<Pencil aria-hidden className={icon} />} title={rowWords(t("common.edit"))} chevron />
          {can.first && (
            <ListRow
              onClick={act("first")}
              leading={<ArrowUpToLine aria-hidden className={icon} />}
              title={rowWords(t("admin.catalog.actions.first"))}
            />
          )}
          {can.up && (
            <ListRow onClick={act("up")} leading={<ArrowUp aria-hidden className={icon} />} title={rowWords(t("admin.catalog.actions.up"))} />
          )}
          {can.down && (
            <ListRow
              onClick={act("down")}
              leading={<ArrowDown aria-hidden className={icon} />}
              title={rowWords(t("admin.catalog.actions.down"))}
            />
          )}
          {published ? (
            <ListRow
              onClick={act("unpublish")}
              leading={<EyeOff aria-hidden className={icon} />}
              title={rowWords(t("admin.catalog.actions.unpublish"))}
            />
          ) : (
            <ListRow
              onClick={act("publish")}
              leading={<Eye aria-hidden className={icon} />}
              title={rowWords(t("admin.catalog.actions.publish"))}
            />
          )}
          <ListRow
            onClick={act("delete")}
            leading={<Trash2 aria-hidden className="size-5 text-danger" />}
            title={rowWords(t("admin.catalog.actions.delete"), "text-danger")}
          />
        </List>
      </div>
    </Sheet>
  );
}
