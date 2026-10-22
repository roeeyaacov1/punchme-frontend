import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search, Users } from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  FilterChips,
  Figure,
  Input,
  LinkButton,
  List,
  ListRow,
  LitPanel,
  Notice,
  Select,
  SkeletonRows,
  useToast,
} from "../../components/kit";
import { CustomerSheet, type SheetProblem } from "../../components/customers/CustomerSheet";
import { Monogram } from "../../components/customers/Monogram";
import { RemoveCustomerConfirm } from "../../components/customers/RemoveCustomerConfirm";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { messagingErrorMessage } from "../../components/messaging/describe";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers, canManage, isOwner } from "../../business/gating";
import {
  adjustCardStamps,
  deleteCustomer,
  listAllCustomers,
  type CustomerListItem,
} from "../../api/loyalty";
import { getMessagingSummary, sendCustomerMessage } from "../../api/messaging";
import { ApiError } from "../../api/errors";
import { useDebounce } from "../../hooks/useDebounce";
import { csvText, downloadCsv, toCsv } from "../../lib/csv";
import { env } from "../../lib/env";
import { useLightboxPage } from "../../theme/lightboxPage";
import { matchesSearch, phoneForDisplay } from "./customerSearch";
import { formatCount } from "./format";
import { isolate, problemKey } from "./problem";

/** Rows drawn at a time. A long roster grows by this much on request rather
 * than paging, so nobody hunts for "Back" at the foot of a long list. */
const PAGE_SIZE = 20;

/** `void` is read from the API's `status`, because a dead card is dead
 * whatever its counters say. The other three stay derived from the counts, so
 * a row's badge can never contradict the count printed beside it. */
type Bucket = "void" | "ready" | "progress" | "new";

/** `oneAway` is a filter and deliberately not a bucket: it is a slice of
 * `progress`, defined exactly as `overviewBrief` defines its own, so the two
 * screens can never disagree about who is one stamp away. "In progress" left
 * the chips: it is everyone else, and the default sort already puts the
 * closest first. */
type Filter = "all" | "ready" | "oneAway" | "new" | "void";
type Sort = "progress" | "recent" | "name";

const FILTERS: readonly Filter[] = ["all", "ready", "oneAway", "new", "void"];
const SORTS: readonly Sort[] = ["progress", "recent", "name"];

function bucketOf(c: CustomerListItem): Bucket {
  if (c.status === "void") return "void";
  if (c.stamps_required > 0 && c.stamp_count >= c.stamps_required) return "ready";
  return c.stamp_count > 0 ? "progress" : "new";
}

function isOneAway(c: CustomerListItem): boolean {
  return c.status !== "void" && c.stamps_required > 0 && c.stamps_required - c.stamp_count === 1;
}

function matchesFilter(c: CustomerListItem, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "oneAway") return isOneAway(c);
  return bucketOf(c) === filter;
}

function progressOf(c: CustomerListItem): number {
  return c.stamps_required > 0 ? c.stamp_count / c.stamps_required : 0;
}

/** The Overview's tiles arrive with `?filter=ready`, `?filter=oneAway` or
 * `?sort=recent`; anything else is the list as it opens. */
function arrival(params: URLSearchParams): { filter: Filter; sort: Sort } {
  const filter = params.get("filter");
  const sort = params.get("sort");
  return {
    filter: FILTERS.includes(filter as Filter) ? (filter as Filter) : "all",
    sort: SORTS.includes(sort as Sort) ? (sort as Sort) : "progress",
  };
}

/** The backend answers 409 for two unrelated reasons: a lost race carries
 * `stamp_adjust_conflict`, a cancelled card carries no code. */
function isStampConflict(error: unknown): boolean {
  return error instanceof ApiError && error.code === "stamp_adjust_conflict";
}

export function CustomersPage() {
  useLightboxPage();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage;
  const { business, role } = useBusiness();
  const queryClient = useQueryClient();
  const toast = useToast();
  const canEnroll = canEnrollRealCustomers(business);
  // Removing, messaging and the export are manager and up: the API refuses
  // the first two to staff, and the export is every customer's name and
  // number (Roee, 21 Oct). Never draw a door that answers 403.
  const manages = canManage(role);
  const owns = isOwner(role);

  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>(() => arrival(params).filter);
  const [sort, setSort] = useState<Sort>(() => arrival(params).sort);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [problem, setProblem] = useState<SheetProblem | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [removedRef, setRemovedRef] = useState<typeof headingRef | undefined>(undefined);

  // A tile on the Overview can bring the page here again with a new filter.
  const arrivalKey = params.toString();
  useEffect(() => {
    const next = arrival(new URLSearchParams(arrivalKey));
    setFilter(next.filter);
    setSort(next.sort);
    setShown(PAGE_SIZE);
  }, [arrivalKey]);

  const businessId = business?.id;
  const rosterKey = ["customers", "all", businessId] as const;

  /** Shared with the messages pages, so it usually costs nothing. It decides
   * whether a real send is possible at all. */
  const { data: messagingSummary } = useQuery({
    queryKey: ["messaging", "summary", businessId],
    queryFn: () => getMessagingSummary(businessId!),
    enabled: !!businessId && manages,
    staleTime: 60_000,
  });
  const canMessage = manages && !!messagingSummary?.can_send;

  const { data, isLoading, isError, error, fetchStatus, refetch } = useQuery({
    queryKey: rosterKey,
    queryFn: () => listAllCustomers(businessId!),
    enabled: !!businessId,
    staleTime: 5_000,
  });
  const all = useMemo(() => data?.items ?? [], [data]);
  const open = openId ? all.find((c) => c.card_id === openId) ?? null : null;
  // Kept while the sheet closes, so its content doesn't vanish mid-exit.
  const lastOpen = useRef<CustomerListItem | null>(null);
  if (open) lastOpen.current = open;
  const sheetCustomer = open ?? lastOpen.current;

  const nameOf = (c: CustomerListItem) =>
    c.customer_display_name.trim() ||
    (c.customer_phone ? phoneForDisplay(c.customer_phone) : t("dashboard.customers.menu.unnamed"));
  /** The same, for a sentence that is only a string: a toast's. */
  const namedIn = (c: CustomerListItem | undefined) => (c ? isolate(nameOf(c)) : "");

  const causeOf = (error: unknown) => t(problemKey(error));

  /** The latest count the page knows for a card, read when it is needed:
   * an Undo pressed after another change sends the count as it is now. */
  const countNow = (cardId: string) =>
    queryClient.getQueryData<{ items: CustomerListItem[] }>(rosterKey)?.items.find((c) => c.card_id === cardId)
      ?.stamp_count;

  const adjust = useMutation({
    mutationFn: ({ cardId, delta, expected }: { cardId: string; delta: number; expected: number; undo?: boolean }) =>
      adjustCardStamps(businessId!, cardId, delta, expected),
    onSuccess: (out, sent) => {
      // The answer carries the new count: put it on screen now rather than
      // after the refetch, so a second press sends the right expected count.
      queryClient.setQueryData<{ items: CustomerListItem[]; count: number; truncated: boolean }>(rosterKey, (old) =>
        old && {
          ...old,
          items: old.items.map((c) =>
            c.card_id === out.card_id
              ? { ...c, stamp_count: out.stamp_count, status: out.status as CustomerListItem["status"] }
              : c,
          ),
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      // A correction is a stamp event like any other, so the feed and the
      // Overview are stale the moment it lands.
      void queryClient.invalidateQueries({ queryKey: ["activity"] });
      setProblem(null);
      if (sent.undo) return;
      const row = all.find((c) => c.card_id === sent.cardId);
      toast.show({
        tone: "ok",
        title: t(sent.delta > 0 ? "dashboard.customers.stamps.added" : "dashboard.customers.stamps.removed"),
        body: t("dashboard.customers.stamps.now", {
          name: namedIn(row),
          count: out.stamp_count,
          total: out.stamps_required,
        }),
        action: {
          label: t("dashboard.customers.stamps.undo"),
          onClick: () =>
            adjust.mutate({
              cardId: sent.cardId,
              delta: -sent.delta,
              expected: countNow(sent.cardId) ?? out.stamp_count,
              undo: true,
            }),
        },
      });
    },
    onError: (error, sent) => {
      if (isStampConflict(error)) {
        // The count sent as `expected` was already stale, so what's on
        // screen is too: refetch, and say so, without alarm.
        void queryClient.invalidateQueries({ queryKey: ["customers"] });
        setProblem({ tone: "warn", title: t("dashboard.customers.stamps.conflict") });
        return;
      }
      const next = { tone: "danger" as const, title: t("dashboard.customers.stamps.failed"), body: causeOf(error) };
      if (openId === sent.cardId) setProblem(next);
      else toast.show({ tone: "danger", title: next.title, body: next.body });
    },
  });

  const message = useMutation({
    mutationFn: ({ cardId, body }: { cardId: string; body: string; done: () => void }) =>
      sendCustomerMessage(businessId!, cardId, { body }),
    onSuccess: (_out, sent) => {
      const row = all.find((c) => c.card_id === sent.cardId);
      toast.show({ tone: "ok", title: t("dashboard.customers.message.sent", { name: namedIn(row) }) });
      setProblem(null);
      sent.done();
      // Queued, not delivered: the worker writes to the pass after this
      // returns. The history and the summary are already stale.
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      void queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
      void queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
    onError: (error) => {
      setProblem({
        tone: "danger",
        title: t("dashboard.customers.message.failed", {
          reason: messagingErrorMessage(error, t, language ?? "en"),
        }),
      });
    },
  });

  const remove = useMutation({
    mutationFn: (cardId: string) => deleteCustomer(businessId!, cardId),
    onSuccess: (_out, cardId) => {
      const row = all.find((c) => c.card_id === cardId);
      // The row and its sheet are gone with the customer, so focus comes
      // back to the page's heading rather than to nowhere.
      setRemovedRef(headingRef);
      setRemoving(false);
      setOpenId(null);
      toast.show({ tone: "ok", title: t("dashboard.customers.remove.done", { name: namedIn(row) }) });
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Their stamps leave the feed with them, and every audience a message
      // could reach is one person smaller.
      void queryClient.invalidateQueries({ queryKey: ["activity"] });
      void queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
    },
    onError: (error, cardId) => {
      const row = all.find((c) => c.card_id === cardId);
      setRemoving(false);
      setProblem({
        tone: "danger",
        title: t("dashboard.customers.remove.failed", { name: namedIn(row) }),
        body: causeOf(error),
      });
    },
  });

  const openCustomer = (cardId: string) => {
    setProblem(null);
    setRemovedRef(undefined);
    setOpenId(cardId);
  };

  async function copyPhone(c: CustomerListItem) {
    if (!c.customer_phone) return;
    try {
      await navigator.clipboard.writeText(c.customer_phone);
      toast.show({ tone: "ok", title: t("dashboard.customers.menu.copied") });
    } catch {
      // A clipboard the browser won't hand over is not worth an error: the
      // number is on screen and selectable either way.
    }
  }

  const debouncedSearch = useDebounce(search, 200);

  /** The search applied but not the chip: what each chip counts, so it says
   * what it would return from where the owner stands. */
  const searched = useMemo(() => all.filter((c) => matchesSearch(c, debouncedSearch)), [all, debouncedSearch]);

  const counts = useMemo(() => {
    const tally = Object.fromEntries(FILTERS.map((f) => [f, 0])) as Record<Filter, number>;
    for (const c of searched) for (const f of FILTERS) if (matchesFilter(c, f)) tally[f] += 1;
    return tally;
  }, [searched]);

  // A chip with nothing behind it in the whole roster isn't offered at all:
  // "no stamps yet" when there is anyone at zero, "cancelled" only when a
  // card was. The chip being shown stays, whatever its count.
  const offered = useMemo(() => {
    const anyNew = all.some((c) => bucketOf(c) === "new");
    const anyVoid = all.some((c) => c.status === "void");
    return FILTERS.filter((f) => f === filter || (f !== "new" && f !== "void") || (f === "new" ? anyNew : anyVoid));
  }, [all, filter]);

  const visible = useMemo(() => {
    const rows = searched.filter((c) => matchesFilter(c, filter));
    if (sort === "name") {
      rows.sort((a, b) => nameSortKey(a).localeCompare(nameSortKey(b), language));
    } else if (sort === "recent") {
      rows.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    } else {
      rows.sort((a, b) => progressOf(b) - progressOf(a) || b.stamp_count - a.stamp_count);
    }
    return rows;
  }, [searched, filter, sort, language]);

  const rows = visible.slice(0, shown);
  const more = Math.min(PAGE_SIZE, visible.length - rows.length);
  const searchedDigits = /\d/.test(debouncedSearch);

  function narrow(update: () => void) {
    update();
    setShown(PAGE_SIZE);
  }

  function handleExport() {
    const header = [
      t("dashboard.customers.columns.name"),
      t("dashboard.customers.columns.phone"),
      t("dashboard.customers.columns.stamps"),
      t("dashboard.customers.columns.required"),
      t("dashboard.customers.columns.status"),
      t("dashboard.customers.columns.card"),
      t("dashboard.customers.columns.joined"),
    ];
    const lines = visible.map((c) => [
      c.customer_display_name,
      csvText(c.customer_phone ?? ""),
      String(c.stamp_count),
      String(c.stamps_required),
      t(`dashboard.customers.status.${bucketOf(c)}`),
      c.template_name,
      new Date(c.created_at).toISOString().slice(0, 10),
    ]);
    const day = new Date().toISOString().slice(0, 10);
    downloadCsv(`${t("dashboard.customers.export.filename")}-${day}.csv`, toCsv([header, ...lines]));
  }

  const activate = (
    <LinkButton to="/dashboard/billing" variant="primary">
      {t("billing.activateCta")}
    </LinkButton>
  );

  let body;
  if (!data && (isError || fetchStatus === "paused")) {
    body = (
      <ReadProblem
        data-tour="customers-roster"
        title={t("dashboard.customers.loadFailed")}
        error={error}
        paused={!isError}
        onRetry={() => void refetch()}
      />
    );
  } else if (isLoading || !data) {
    body = (
      <LitPanel data-tour="customers-roster" className="overflow-hidden">
        <SkeletonRows rows={6} />
      </LitPanel>
    );
  } else if (all.length === 0) {
    body = (
      <div data-tour="customers-roster">
        {canEnroll ? (
          <EmptyState
            icon={<Users />}
            title={t("dashboard.customers.emptyProTitle")}
            body={t("dashboard.customers.emptyPro")}
            action={
              manages ? (
                <LinkButton to="/dashboard/standee" variant="secondary">
                  {t("dashboard.nav.standee")}
                </LinkButton>
              ) : (
                <LinkButton to="/dashboard" variant="secondary">
                  {t("dashboard.qr.title")}
                </LinkButton>
              )
            }
          />
        ) : (
          <EmptyState
            icon={<Users />}
            title={t("dashboard.plan.notLive")}
            body={t(owns ? "dashboard.customers.emptyFree" : "dashboard.customers.emptyFreeHire")}
            action={owns ? activate : undefined}
          />
        )}
      </div>
    );
  } else {
    body = (
      <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <FilterChips
            label={t("dashboard.customers.filter.label")}
            hideLabel
            value={filter}
            onChange={(next) => narrow(() => setFilter(next))}
            options={offered.map((key) => ({
              value: key,
              label: t(`dashboard.customers.filter.${key}`),
              count: counts[key],
            }))}
            className="min-w-0 flex-1"
          />
          <Select
            label={t("dashboard.customers.sort.label")}
            value={sort}
            onChange={(event) => narrow(() => setSort(event.target.value as Sort))}
            className="sm:w-60"
          >
            {SORTS.map((key) => (
              <option key={key} value={key}>
                {t(`dashboard.customers.sort.${key}`)}
              </option>
            ))}
          </Select>
        </div>

        {!canEnroll && (
          // A shop that dropped back to Free keeps its customers and their
          // cards; only joining stops.
          <Notice tone="warn" action={owns ? activate : undefined}>
            {t("dashboard.customers.freeAfterPro")}
          </Notice>
        )}

        {data.truncated && (
          <Notice tone="warn">{t("dashboard.customers.truncated", { shown: formatCount(all.length, language) })}</Notice>
        )}

        {visible.length === 0 ? (
          <div data-tour="customers-roster">
            <EmptyState
              icon={<Search />}
              title={t("dashboard.customers.noMatches")}
              body={searchedDigits ? t("dashboard.customers.noMatchesNumber") : undefined}
              action={
                <Button
                  variant="secondary"
                  onClick={() =>
                    narrow(() => {
                      setSearch("");
                      setFilter("all");
                    })
                  }
                >
                  {t("dashboard.customers.clearFilters")}
                </Button>
              }
            />
          </div>
        ) : (
          <LitPanel data-tour="customers-roster" className="overflow-hidden">
            <List>
              {rows.map((c) => (
                <Row key={c.card_id} customer={c} onOpen={() => openCustomer(c.card_id)} />
              ))}
            </List>
          </LitPanel>
        )}

        {more > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {t("dashboard.customers.shown", {
                shown: formatCount(rows.length, language),
                total: formatCount(visible.length, language),
              })}
            </p>
            <Button variant="secondary" onClick={() => setShown((n) => n + PAGE_SIZE)}>
              {t("dashboard.customers.more", { count: more })}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h1 ref={headingRef} tabIndex={-1} className="type-title text-ink outline-none">
            {t("dashboard.customers.title")}
          </h1>
          {all.length > 0 && (
            // Where the roster stopped at its guard, the count is the least
            // it holds, said in words as the Overview says it.
            <span className="flex items-baseline gap-2">
              {data?.truncated && <span className="type-label text-ink-muted">{t("dashboard.overview.atLeast")}</span>}
              <Figure value={formatCount(all.length, language)} className="type-title text-ink-muted" />
            </span>
          )}
        </div>
        {manages && all.length > 0 && (
          <Button variant="secondary" icon={<Download aria-hidden />} disabled={visible.length === 0} onClick={handleExport} className="max-w-full">
            <span className="whitespace-normal">{t("dashboard.customers.export.cta")}</span>
          </Button>
        )}
      </div>

      {all.length > 0 && (
        <Input
          type="search"
          label={t("dashboard.customers.searchLabel")}
          placeholder={t("dashboard.customers.searchPlaceholder")}
          leading={<Search />}
          value={search}
          // Typed text takes its own direction, a name in Latin letters
          // from the left, while the field keeps the page's, so the room
          // kept for the magnifier stays on the magnifier's side. `dir="auto"`
          // turned the whole field round, empty and Hebrew placeholder too.
          className="[&_input]:[unicode-bidi:plaintext]"
          autoComplete="off"
          // A name or a number, neither of them a dictionary word: a phone
          // that "corrected" one would search for someone else.
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          onChange={(event) => narrow(() => setSearch(event.target.value))}
        />
      )}

      {body}

      <CustomerSheet
        customer={sheetCustomer}
        name={sheetCustomer ? nameOf(sheetCustomer) : ""}
        phone={sheetCustomer?.customer_phone ? phoneForDisplay(sheetCustomer.customer_phone) : null}
        open={!!open}
        onClose={() => setOpenId(null)}
        returnFocus={removedRef}
        adjustable={env.stampAdjustEnabled}
        adjusting={adjust.isPending}
        onAdjust={(delta) => {
          if (!open) return;
          adjust.mutate({ cardId: open.card_id, delta, expected: open.stamp_count });
        }}
        messageable={canMessage}
        messaging={message.isPending}
        onMessage={(text, done) => open && message.mutate({ cardId: open.card_id, body: text, done })}
        removable={manages}
        onRemove={() => setRemoving(true)}
        onCopy={() => open && void copyPhone(open)}
        problem={problem}
      />

      <RemoveCustomerConfirm
        open={removing}
        name={sheetCustomer ? nameOf(sheetCustomer) : ""}
        busy={remove.isPending}
        onConfirm={() => open && remove.mutate(open.card_id)}
        onCancel={() => setRemoving(false)}
      />
    </div>
  );
}

/** Nameless customers sort by their number, after the named ones. */
function nameSortKey(c: CustomerListItem): string {
  return c.customer_display_name.trim() || `￿${c.customer_phone ?? ""}`;
}

/**
 * One customer, one button that opens them. The name wraps to two lines
 * before an ellipsis (three under 360px, where the column is two thirds as
 * wide, so the same name fits on every phone), in its own direction, so "Bartholomew
 * Fitzgerald-Montgomery III" reads left to right and is cut at its own end,
 * not at the Hebrew line's, which took "Fit" off the surname. `match-parent`
 * still lines it up with the Hebrew names around it (Chrome and Safari know
 * it only as `-webkit-match-parent`). With no name, the number is the
 * title. The count stands over the badge, so a name gets the width.
 */
function Row({ customer: c, onOpen }: { customer: CustomerListItem; onOpen: () => void }) {
  const { t } = useTranslation();
  const named = c.customer_display_name.trim();
  const phone = c.customer_phone ? phoneForDisplay(c.customer_phone) : null;
  const ready = c.status !== "void" && c.stamps_required > 0 && c.stamp_count >= c.stamps_required;
  // A badge's words may take two lines under large text, where one line
  // would take the name's room: the column's cap is in px, so it holds
  // still while the text grows.
  const words = (key: string) => <span className="whitespace-normal text-center">{t(key)}</span>;
  let badge = null;
  if (c.status === "void") badge = <Badge tone="warn">{words("dashboard.customers.status.void")}</Badge>;
  else if (ready) badge = <Badge tone="reward">{words("dashboard.customers.status.ready")}</Badge>;
  else if (isOneAway(c)) badge = <Badge>{words("dashboard.customers.status.oneAway")}</Badge>;

  return (
    <ListRow
      onClick={onOpen}
      className="[&>button]:min-h-[3.75rem]"
      leading={<Monogram name={c.customer_display_name} />}
      title={
        <span
          dir={named ? "auto" : "ltr"}
          className="line-clamp-3 whitespace-normal [overflow-wrap:anywhere] [text-align:-webkit-match-parent] [text-align:match-parent] min-[360px]:line-clamp-2"
        >
          {named || phone || t("dashboard.customers.menu.unnamed")}
        </span>
      }
      meta={named && phone ? <bdi dir="ltr">{phone}</bdi> : undefined}
      trailing={
        <span className="flex max-w-[128px] flex-col items-end gap-1">
          <span aria-hidden>
            <Figure value={`${c.stamp_count}/${c.stamps_required}`} />
          </span>
          <span className="sr-only">
            {t("dashboard.customers.countSpoken", { count: c.stamps_required, filled: c.stamp_count })}
          </span>
          {badge}
        </span>
      }
    />
  );
}
