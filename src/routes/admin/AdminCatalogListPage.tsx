import { useEffect, useMemo, useRef, useState, type MouseEvent, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Images, Info, Plus } from "lucide-react";
import {
  deleteCatalogEntry,
  getCatalogStickers,
  listCatalog,
  patchCatalogEntry,
  reorderCatalog,
} from "../../api/catalog";
import { getPresets } from "../../api/presets";
import {
  Button,
  LinkButton,
  LitPanel,
  Loading,
  Notice,
  Skeleton,
  focusRing,
} from "../../components/kit";
import { LOOK_PICTURES_POLL_MS } from "../../components/card-studio/lookPictures";
import { cn } from "../../lib/cn";
import { isolate, problemKey } from "../dashboard/problem";
import { useDocumentTitle } from "../public/useDocumentTitle";
import { DeleteLook } from "./DeleteLook";
import { LookActions, type LookAction } from "./LookActions";
import { reasonKey, rowName, type RowNote } from "./rows";
import { deleteFact, movedOrder, ranked, shelf as workOut, type Live, type ShelfRow, type TradeShelf } from "./shelf";
import { TradePanel, TradeStatusLine, type RowState } from "./TradePanel";

/** What the last action did, to light its row and say it. */
type Outcome =
  | {
      kind: "moved" | "published" | "unpublished";
      key: string;
      name: string;
      stamp: number;
      /** It was done from a sheet or a dialog, still on its way out. */
      fromModal: boolean;
    }
  | { kind: "deleted"; key: string; name: string; stamp: number }
  | {
      kind: "failed";
      key: string;
      name: string;
      message: string;
      stamp: number;
    };

/** Where focus belongs once a sheet or a dialog has closed. */
type FocusWish = { kind: "actions" | "again"; key: string } | { kind: "trade"; niche: string } | null;

/**
 * PunchMe's catalog of ready-made looks, as owners meet it (the brief's
 * structure A, ranked by trade): every trade on one page, each a lit panel
 * with its looks numbered in the order the wizard offers them, shown as
 * their pictures and named as owners read them, and the trade's other looks
 * set apart with why the wizard leaves each out.
 *
 * What the wizard offers is worked out by `shelf.ts` through the wizard's
 * own rules, from three reads: the catalog, the public presets (each
 * published look's pictures, in the wizard's order) and the sticker list
 * (whether the wallet draws the looks at all). A card made from a look is a
 * copy, so nothing here touches a business's card; the delete says so.
 *
 * Every write is one call and then both reads again, since the wizard's
 * order and pictures come from the presets. A move stays inside its trade.
 * Nothing is a toast: what happened stays on its row, lit, and is said once
 * to a screen reader.
 */
export function AdminCatalogListPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("admin.catalog.title"));
  const queryClient = useQueryClient();

  const catalog = useQuery({
    queryKey: ["admin-catalog"],
    queryFn: listCatalog,
  });
  const [drawing, setDrawing] = useState(false);
  const presets = useQuery({
    queryKey: ["presets"],
    queryFn: () => getPresets(),
    // A look just published is drawn by a task: its pictures are looked
    // for again, as the editor's shelf does, until they come or it fails.
    refetchInterval: drawing ? LOOK_PICTURES_POLL_MS : false,
  });
  const stickers = useQuery({
    queryKey: ["stickers"],
    queryFn: getCatalogStickers,
    staleTime: Infinity,
    retry: 1,
  });

  const now = Math.max(presets.dataUpdatedAt, catalog.dataUpdatedAt);
  const shelf = useMemo(
    () =>
      catalog.data && presets.data && !stickers.isPending
        ? workOut({
            entries: catalog.data,
            presets: presets.data,
            available: stickers.isError ? null : (stickers.data?.available ?? false),
            now,
            t,
          })
        : null,
    [catalog.data, presets.data, stickers.isPending, stickers.isError, stickers.data, now, t],
  );
  useEffect(() => setDrawing(!!shelf?.drawing), [shelf?.drawing]);

  // The look whose actions are open, and the one asked about deleting.
  const [sheetKey, setSheetKey] = useState<string | null>(null);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [busy, setBusy] = useState<LookAction | "again" | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const stamp = useRef(0);

  // Every row's actions button and "Publish again", and every trade's
  // heading, so focus can be put back where the look now stands.
  const actionButtons = useRef(new Map<string, HTMLButtonElement>());
  const againButtons = useRef(new Map<string, HTMLButtonElement>());
  const headings = useRef(new Map<string, HTMLHeadingElement>());
  const focusWish = useRef<FocusWish>(null);
  const deleted = useRef(false);
  const resolveFocus = (wish: FocusWish): HTMLElement | null => {
    if (!wish) return null;
    if (wish.kind === "trade") return headings.current.get(wish.niche) ?? null;
    if (wish.kind === "again") return againButtons.current.get(wish.key) ?? actionButtons.current.get(wish.key) ?? null;
    return actionButtons.current.get(wish.key) ?? null;
  };
  // Read by the kit when a sheet's or a dialog's exit ends, by which time
  // the list has its answer and the look stands where it now belongs.
  const sheetReturn = useMemo<RefObject<HTMLElement>>(
    () => ({
      get current() {
        return resolveFocus(focusWish.current);
      },
    }),
    [],
  );
  // A delete that didn't happen goes back into the sheet, to its own row.
  const dialogReturn = useMemo<RefObject<HTMLElement>>(
    () => ({
      get current() {
        return deleted.current ? resolveFocus(focusWish.current) : null;
      },
    }),
    [],
  );
  // Focus wanted with no sheet or dialog to bring it back: after the render
  // that puts the look in its new place.
  const [pendingFocus, setPendingFocus] = useState<FocusWish>(null);
  useEffect(() => {
    if (!pendingFocus) return;
    resolveFocus(pendingFocus)?.focus();
    setPendingFocus(null);
  }, [pendingFocus, shelf]);

  const find = (key: string | null): { row: ShelfRow; trade: TradeShelf } | null => {
    if (!key || !shelf) return null;
    for (const trade of shelf.trades) {
      const row = trade.shown.find((r) => r.key === key) ?? trade.notShown.find((r) => r.key === key);
      if (row) return { row, trade };
    }
    return null;
  };
  // A sheet or a dialog plays its exit after it is closed, and a deleted
  // look is gone from the list by then: each keeps the look it opened on.
  const sheetLook = useRef<{ row: ShelfRow; trade: TradeShelf } | null>(null);
  const deleteLook = useRef<{ row: ShelfRow; trade: TradeShelf } | null>(null);
  sheetLook.current = find(sheetKey) ?? sheetLook.current;
  deleteLook.current = find(deleteKey) ?? deleteLook.current;
  const open = sheetLook.current;
  const asked = deleteLook.current;

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] }),
      queryClient.invalidateQueries({ queryKey: ["presets"] }),
    ]);
  }

  /** One write, then the list again; the row says what happened. */
  async function run(row: ShelfRow, trade: TradeShelf, action: LookAction | "again") {
    if (busy || !row.id || !catalog.data) return;
    const id = row.id;
    const name = rowName(row);
    setBusy(action);
    setOutcome(null);
    deleted.current = false;
    try {
      let kind: Outcome["kind"];
      if (action === "first" || action === "up" || action === "down") {
        const order = ranked(trade);
        const from = order.indexOf(id);
        const to = action === "first" ? 0 : action === "up" ? from - 1 : from + 1;
        await reorderCatalog(
          movedOrder(
            catalog.data.map((e) => e.id!),
            order,
            from,
            to,
          ),
        );
        kind = "moved";
        focusWish.current = { kind: "actions", key: row.key };
      } else if (action === "publish" || action === "again") {
        await patchCatalogEntry(id, { is_published: true });
        kind = "published";
        focusWish.current = { kind: "actions", key: row.key };
      } else if (action === "unpublish") {
        await patchCatalogEntry(id, { is_published: false });
        kind = "unpublished";
        focusWish.current = { kind: "again", key: row.key };
      } else {
        await deleteCatalogEntry(id);
        kind = "deleted";
        deleted.current = true;
        focusWish.current = { kind: "trade", niche: trade.niche };
      }
      await refresh();
      stamp.current += 1;
      setOutcome(
        kind === "deleted"
          ? { kind, key: row.key, name, stamp: stamp.current }
          : { kind, key: row.key, name, stamp: stamp.current, fromModal: !!(sheetKey || deleteKey) },
      );
    } catch (error) {
      stamp.current += 1;
      setOutcome({
        kind: "failed",
        key: row.key,
        name,
        message: t(problemKey(error)),
        stamp: stamp.current,
      });
      focusWish.current = { kind: "actions", key: row.key };
      deleted.current = action === "delete";
    } finally {
      setBusy(null);
      if (sheetKey || deleteKey) {
        setSheetKey(null);
        setDeleteKey(null);
      } else {
        setPendingFocus(focusWish.current);
      }
    }
  }

  const rowState = (row: ShelfRow): RowState => {
    const unlit = { litKey: null, litAfterModal: false };
    if (!outcome || outcome.key !== row.key || outcome.kind === "deleted") return { note: null, ...unlit };
    if (outcome.kind === "failed") return { note: { kind: "failed", message: outcome.message }, ...unlit };
    const lit = { litKey: outcome.stamp, litAfterModal: outcome.fromModal };
    if (outcome.kind === "unpublished") return { note: { kind: "unpublished" }, ...lit };
    const note: RowNote | null = row.place !== null ? { kind: "moved", n: row.place } : null;
    return { note, ...lit };
  };

  // Said once to a screen reader. The same words twice in a row are still
  // said: an invisible mark tells them apart.
  const said = useMemo(() => {
    if (!outcome || !shelf) return "";
    // By the name it goes by now: one published again has its owners' name back.
    const placed = find(outcome.key);
    const name = isolate(placed ? rowName(placed.row) : outcome.name);
    let words: string;
    if (outcome.kind === "deleted") words = t("admin.catalog.deleted", { name });
    else if (outcome.kind === "failed")
      words = t("admin.catalog.saidAbout", {
        name,
        what: t("admin.catalog.writeFailed", { reason: outcome.message }),
      });
    else if (outcome.kind === "unpublished")
      words = t("admin.catalog.saidAbout", {
        name,
        what: t("admin.catalog.unpublished"),
      });
    else if (placed?.row.place != null)
      words = t("admin.catalog.movedSaid", {
        name,
        n: placed.row.place,
        total: placed.trade.shown.length,
      });
    else
      words = t("admin.catalog.saidAbout", {
        name,
        what: placed?.row.reason ? t(reasonKey(placed.row.reason)) : "",
      });
    return outcome.stamp % 2 ? words : words + String.fromCharCode(0x200b);
  }, [outcome, shelf, t]); // eslint-disable-line react-hooks/exhaustive-deps

  // A jump from the index lands at once, never a glide: staff use it many
  // times a day, by keyboard as often as not, and a glide across a trade of
  // twenty looks would take as long as the browser liked. Focus goes with it.
  const goToTrade = (niche: string) => (event: MouseEvent) => {
    const heading = headings.current.get(niche);
    if (!heading) return;
    event.preventDefault();
    heading.scrollIntoView({ block: "start", behavior: "instant" });
    heading.focus({ preventScroll: true });
  };

  const failed = catalog.isError || presets.isError;

  return (
    // The page lays itself out by the frame's width, in rem, so larger text
    // keeps one column. Under 60rem (from 1024px at the default text size)
    // one column of at most 640px; from there the trades' index stands at
    // the column's start and the head and the panels beside it, at most
    // 760px, the two centred in the frame.
    <>
      <div className="[container-type:inline-size]">
        <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-6 pt-2 [@container(min-width:60rem)]:grid [@container(min-width:60rem)]:max-w-none [@container(min-width:60rem)]:grid-cols-[15rem_minmax(0,47.5rem)] [@container(min-width:60rem)]:items-start [@container(min-width:60rem)]:justify-center [@container(min-width:60rem)]:gap-x-8">
          <header className="flex flex-col gap-3 [@container(min-width:60rem)]:col-start-2">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <h1 className="type-title text-ink">{t("admin.catalog.title")}</h1>
              <LinkButton to="/admin/catalog/new" icon={<Plus aria-hidden />}>
                {t("admin.catalog.create")}
              </LinkButton>
            </div>
            <p className="type-body text-pretty text-ink-muted">{t("admin.catalog.subtitle")}</p>
            {shelf && <LiveLine live={shelf.live} />}
          </header>

          {failed ? (
            <Notice
              tone="danger"
              role="alert"
              className="[@container(min-width:60rem)]:col-start-2"
              action={
                <Button variant="secondary" onClick={() => void Promise.all([catalog.refetch(), presets.refetch()])}>
                  {t("common.retry")}
                </Button>
              }
            >
              {t("admin.catalog.readFailed")}
            </Notice>
          ) : !shelf ? (
            <ListSkeleton />
          ) : (
            <>
              <nav
                aria-label={t("admin.catalog.trades")}
                className="hidden [@container(min-width:60rem)]:sticky [@container(min-width:60rem)]:top-6 [@container(min-width:60rem)]:col-start-1 [@container(min-width:60rem)]:row-start-2 [@container(min-width:60rem)]:block"
              >
                <ul className="flex flex-col gap-1">
                  {shelf.trades.map((trade) => (
                    <li key={trade.niche}>
                      <a
                        href={`#trade-${trade.niche}`}
                        onClick={goToTrade(trade.niche)}
                        // Hovered and pressed as the kit's rows are, so the
                        // index and the sheets beside it answer alike.
                        className={cn(
                          "flex min-h-11 touch-manipulation select-none flex-col justify-center gap-0.5 rounded-field px-3 py-1.5 transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5 [-webkit-touch-callout:none]",
                          focusRing,
                        )}
                      >
                        <span className="font-heading font-medium text-ink">
                          {t(`onboarding.business.niches.${trade.niche}`)}
                        </span>
                        <TradeStatusLine status={trade.status} />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="flex flex-col gap-4 [@container(min-width:60rem)]:col-start-2 [@container(min-width:60rem)]:row-start-2">
                {catalog.data!.length === 0 && (
                  <LitPanel className="p-5">
                    <p className="type-body text-ink">{t("admin.catalog.empty")}</p>
                  </LitPanel>
                )}
                {shelf.trades.map((trade) => (
                  <TradePanel
                    key={trade.niche}
                    trade={trade}
                    headingRef={(element) => {
                      if (element) headings.current.set(trade.niche, element);
                      else headings.current.delete(trade.niche);
                    }}
                    rowState={rowState}
                    busy={busy !== null}
                    onActions={(row) => {
                      if (busy) return;
                      setOutcome(null);
                      focusWish.current = { kind: "actions", key: row.key };
                      setSheetKey(row.key);
                    }}
                    onPublishAgain={(row) => void run(row, trade, "again")}
                    actionsRef={(key) => (element) => {
                      if (element) actionButtons.current.set(key, element);
                      else actionButtons.current.delete(key);
                    }}
                    againRef={(key) => (element) => {
                      if (element) againButtons.current.set(key, element);
                      else againButtons.current.delete(key);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {said}
      </p>

      {open && (
        <LookActions
          open={sheetKey !== null}
          onClose={() => {
            if (!busy) setSheetKey(null);
          }}
          title={<bdi>{rowName(open.row)}</bdi>}
          where={
            open.row.place !== null
              ? t("admin.catalog.place", {
                  trade: t(`onboarding.business.niches.${open.trade.niche}`),
                  n: open.row.place,
                  total: open.trade.shown.length,
                })
              : `${t(`onboarding.business.niches.${open.trade.niche}`)} · ${open.row.reason ? t(reasonKey(open.row.reason)) : ""}`
          }
          editTo={`/admin/catalog/${open.row.id}`}
          can={moves(open.row, open.trade)}
          published={open.row.published}
          busy={busy !== null}
          onAction={(action) => {
            if (action === "delete") setDeleteKey(open.row.key);
            else void run(open.row, open.trade, action);
          }}
          returnFocus={sheetReturn}
        />
      )}
      <DeleteLook
        open={deleteKey !== null}
        row={asked?.row ?? null}
        name={asked ? isolate(rowName(asked.row)) : ""}
        fact={asked ? deleteFact(asked.row, asked.trade) : null}
        busy={busy === "delete" ? "delete" : busy === "unpublish" && deleteKey ? "unpublish" : null}
        onClose={() => setDeleteKey(null)}
        onDelete={() => asked && void run(asked.row, asked.trade, "delete")}
        onUnpublish={() => asked && void run(asked.row, asked.trade, "unpublish")}
        returnFocus={dialogReturn}
      />
    </>
  );
}

/** The moves a look can make inside its trade: only what can happen. */
function moves(row: ShelfRow, trade: TradeShelf) {
  const order = ranked(trade);
  const at = row.id ? order.indexOf(row.id) : -1;
  if (at < 0) return { first: false, up: false, down: false };
  return { first: at > 1, up: at > 0, down: at < order.length - 1 };
}

/** Which wizard owners get right now, on a lit line under the lead. */
function LiveLine({ live }: { live: Live }) {
  const { t } = useTranslation();
  if (live === "unanswered") return <Notice tone="warn">{t("admin.catalog.live.unanswered")}</Notice>;
  return (
    <LitPanel light="lit" className="flex items-start gap-3 p-4 sm:px-5">
      {live === "looks" ? (
        <Images aria-hidden className="mt-0.5 size-5 shrink-0 text-ink" />
      ) : (
        <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-ink" />
      )}
      <p className="type-body text-ink">{t(`admin.catalog.live.${live}`)}</p>
    </LitPanel>
  );
}

/** The list's shape while it loads, said once as "Loading". */
function ListSkeleton() {
  return (
    <Loading className="flex flex-col gap-4 [@container(min-width:60rem)]:col-start-2">
      {[0, 1, 2].map((panel) => (
        <LitPanel key={panel} className="overflow-hidden">
          <div className="flex items-center justify-between px-4 pb-3 pt-5 sm:px-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="divide-y divide-border border-t border-border">
            {[0, 1].map((row) => (
              <div key={row} className="flex min-h-14 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5">
                <span className="w-5 shrink-0 sm:w-6" />
                <Skeleton className="aspect-[1125/432] w-[4.5rem] shrink-0 rounded-lg min-[22.5rem]:w-24 lg:w-40" />
                <span className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3.5 w-2/5" />
                  <Skeleton className="h-3 w-1/4" />
                </span>
              </div>
            ))}
          </div>
        </LitPanel>
      ))}
    </Loading>
  );
}
