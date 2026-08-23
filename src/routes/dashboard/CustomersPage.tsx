import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Copy, Download, MessageSquare, Search, Trash2 } from "lucide-react";
import { StampAdjuster } from "../../components/customers/StampAdjuster";
import { Monogram } from "../../components/customers/Monogram";
import { RemoveCustomerConfirm } from "../../components/customers/RemoveCustomerConfirm";
import { RowMenu, type RowMenuItem } from "../../components/customers/RowMenu";
import { QuickMessage } from "../../components/customers/QuickMessage";
import { messagingErrorMessage } from "../../components/messaging/describe";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import { CardPunches } from "../../components/dashboard/CardPunches";
import {
  Figure,
  FilterChips,
  Notice,
  Panel,
  Tag,
  fieldClasses,
  type Tone,
} from "../../components/dashboard/primitives";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers, canManage } from "../../business/gating";
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
import { cn } from "../../lib/cn";

const PAGE_SIZE = 20;
/** A card longer than this is a progress bar; a shorter one is drawn as the
 * row of punches it actually is. */
const PUNCHABLE_CARD = 10;

/** `void` is read from the API's `status`, because a dead card is dead
 * whatever its counters say and no arithmetic on the stamps can express that.
 * The other three stay derived from the counts deliberately: they describe
 * progress, and deriving them keeps this badge from ever contradicting the
 * `n / m` rendered beside it should the server's own `reward_ready` flip lag
 * the count it is computed from. */
type Bucket = "void" | "ready" | "progress" | "new";
/** `oneAway` is a filter and deliberately *not* a bucket: it is a slice of
 * `progress`, not a fifth state, so it never reaches `bucketOf`, the status
 * tag, or the `status` column of the export. It earns a chip because it is
 * the most actionable question an owner asks of this list — the people
 * walking in this week — and it is defined exactly as `overviewBrief` defines
 * its own `oneAway`, so the two screens can never disagree about who counts. */
type Filter = Bucket | "all" | "oneAway";
type Sort = "progress" | "recent" | "name";

const FILTERS: Filter[] = ["all", "ready", "oneAway", "progress", "new", "void"];
const SORTS: Sort[] = ["progress", "recent", "name"];

const BUCKET_TONES: Record<Bucket, Tone> = {
  void: "warn",
  // Gold, not the brand violet — see `TAG_TONES`. A full card is the reward,
  // not a plan.
  ready: "reward",
  progress: "neutral",
  new: "neutral",
};

/** The backend answers 409 for two unrelated reasons — a lost race carries
 * `stamp_adjust_conflict`, a voided card carries no code at all — so matching
 * on the status alone would tell an owner their card was edited out from under
 * them when it was really just dead. */
function isStampConflict(error: unknown): boolean {
  return error instanceof ApiError && error.code === "stamp_adjust_conflict";
}

function bucketOf(c: CustomerListItem): Bucket {
  if (c.status === "void") return "void";
  if (c.stamps_required > 0 && c.stamp_count >= c.stamps_required) return "ready";
  return c.stamp_count > 0 ? "progress" : "new";
}

function progressOf(c: CustomerListItem): number {
  return c.stamps_required > 0 ? c.stamp_count / c.stamps_required : 0;
}

/** One stamp short of the reward. A voided card is not a customer, and a
 * template with no requirement has no such thing as "nearly full" — the same
 * two exclusions `overviewBrief.countable` makes. */
function isOneAway(c: CustomerListItem): boolean {
  return (
    c.status !== "void" &&
    c.stamps_required > 0 &&
    c.stamps_required - c.stamp_count === 1
  );
}

function matchesFilter(c: CustomerListItem, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "oneAway") return isOneAway(c);
  return bucketOf(c) === filter;
}

/** `digits` arrives already stripped: "050-123" and "0501234567" should find
 * the same person, so the phone is compared on digits alone once the typed
 * query actually contains some. The card is still searchable even though it
 * no longer has a column — the placeholder promises it, and a shop running
 * more than one template needs it. */
function matchesSearch(
  c: CustomerListItem,
  query: string,
  digits: string,
): boolean {
  if (!query) return true;
  if (c.customer_display_name.toLowerCase().includes(query)) return true;
  if (c.template_name.toLowerCase().includes(query)) return true;
  return (
    digits.length > 0 &&
    (c.customer_phone ?? "").replace(/\D/g, "").includes(digits)
  );
}

export function CustomersPage() {
  const { t, i18n } = useTranslation();
  const { business, role } = useBusiness();
  const queryClient = useQueryClient();
  const canEnroll = canEnrollRealCustomers(business);
  // Removing a customer is manager+ on the API (`get_managed_business_or_404`),
  // so a staff member is offered the rest of the menu and not that item —
  // the same rule the nav follows, for the same reason: never draw a door
  // that answers 403.
  const canRemove = canManage(role);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("progress");
  const [page, setPage] = useState(1);
  /** What one row has been opened up to do — confirm a removal, or compose
   * a message. One at a time and modelled as one value, so a row can never
   * be showing both, and opening either closes whatever was open. */
  const [action, setAction] = useState<
    { cardId: string; kind: "remove" | "message" } | null
  >(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  /** Shared cache key with the messages pages, so opening the roster
   * usually costs nothing. It answers whether real sends are possible at
   * all — Pro, on the pilot allowlist, dispatch not killed — which is what
   * decides whether the menu offers to send one. */
  const { data: messaging } = useQuery({
    queryKey: ["messaging", "summary", business?.id],
    queryFn: () => getMessagingSummary(business!.id!),
    enabled: !!business?.id && canRemove,
    staleTime: 60_000,
  });
  const canMessage = !!messaging?.can_send;

  const debouncedSearch = useDebounce(search, 200);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", "all", business?.id],
    queryFn: () => listAllCustomers(business!.id!),
    enabled: !!business?.id,
    staleTime: 5_000,
  });

  const all = useMemo(() => data?.items ?? [], [data]);

  const adjust = useMutation({
    mutationFn: ({
      cardId,
      delta,
      expected,
    }: {
      cardId: string;
      delta: number;
      expected: number;
    }) => adjustCardStamps(business!.id!, cardId, delta, expected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // A manual correction is a stamp event like any other, so the activity
      // feed and the overview's counters are stale the moment this lands.
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (error) => {
      // A conflict means the count we sent as `expected` was already stale, so
      // what's on screen is wrong too — refetch rather than leave the owner
      // looking at the number that just lost the race.
      if (isStampConflict(error)) {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
      }
    },
  });

  const message = useMutation({
    mutationFn: ({ cardId, body }: { cardId: string; body: string }) =>
      sendCustomerMessage(business!.id!, cardId, { body }),
    onSuccess: (_result, sent) => {
      const row = all.find((c) => c.card_id === sent.cardId);
      setSentTo(row ? nameOf(row) : null);
      setAction(null);
      // The send is queued, not delivered — the worker claims the row and
      // writes to her pass after this returns. What is already true is that
      // a message exists in the history and the gift (if any) is about to
      // land on the card, so both of those views are stale.
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({
        queryKey: ["messaging", "summary", business?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });

  const remove = useMutation({
    mutationFn: (cardId: string) => deleteCustomer(business!.id!, cardId),
    onSuccess: () => {
      setAction(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Their stamps leave the feed with them, and every audience a message
      // could reach is one person smaller.
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({
        queryKey: ["messaging", "summary", business?.id],
      });
    },
  });

  async function copyPhone(c: CustomerListItem) {
    if (!c.customer_phone) return;
    try {
      await navigator.clipboard.writeText(c.customer_phone);
      setCopied(c.card_id);
      window.setTimeout(() => setCopied(null), 2500);
    } catch {
      // A clipboard the browser won't hand over (an insecure origin, a
      // permission the owner declined) is not worth an error panel — the
      // number is on screen and selectable either way.
      setCopied(null);
    }
  }

  /** The search applied but not the bucket. This is what the chips count, so
   * each one reports what it would actually return from where the owner is
   * standing rather than from the whole roster. */
  const searched = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const digits = query.replace(/\D/g, "");
    return all.filter((c) => matchesSearch(c, query, digits));
  }, [all, debouncedSearch]);

  const counts = useMemo(() => {
    const tally = Object.fromEntries(FILTERS.map((f) => [f, 0])) as Record<
      Filter,
      number
    >;
    for (const c of searched) {
      for (const f of FILTERS) if (matchesFilter(c, f)) tally[f] += 1;
    }
    return tally;
  }, [searched]);

  const visible = useMemo(() => {
    const rows = searched.filter((c) => matchesFilter(c, filter));

    if (sort === "name") {
      rows.sort((a, b) =>
        a.customer_display_name.localeCompare(
          b.customer_display_name,
          i18n.resolvedLanguage,
        ),
      );
    } else if (sort === "recent") {
      rows.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    } else {
      rows.sort(
        (a, b) => progressOf(b) - progressOf(a) || b.stamp_count - a.stamp_count,
      );
    }
    return rows;
  }, [searched, filter, sort, i18n.resolvedLanguage]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  // Filtering can shrink the list under the current page; clamp on render so
  // narrowing a search never lands the owner on a blank page.
  const currentPage = Math.min(page, totalPages);
  const pageRows = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const isFiltered = debouncedSearch.trim() !== "" || filter !== "all";

  function resetTo(update: () => void) {
    update();
    setPage(1);
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
    const rows = visible.map((c) => [
      c.customer_display_name,
      csvText(c.customer_phone ?? ""),
      String(c.stamp_count),
      String(c.stamps_required),
      t(`dashboard.customers.status.${bucketOf(c)}`),
      c.template_name,
      new Date(c.created_at).toISOString().slice(0, 10),
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `${t("dashboard.customers.export.filename")}-${stamp}.csv`,
      toCsv([header, ...rows]),
    );
  }

  const stampsUnavailable = env.stampAdjustEnabled
    ? undefined
    : t("dashboard.customers.stamps.pendingBackend");

  /** A card's adjuster, with the reasons it might be refused. */
  function adjusterFor(c: CustomerListItem) {
    const bucket = bucketOf(c);
    const pending = adjust.isPending && adjust.variables?.cardId === c.card_id;
    // A voided card is refused server-side whatever the counts look like, so
    // offering live buttons here only promises something the next request
    // will take away.
    const unavailable =
      stampsUnavailable ??
      (bucket === "void" ? t("dashboard.customers.stamps.voided") : undefined);
    return (
      <StampAdjuster
        stampCount={c.stamp_count}
        stampsRequired={c.stamps_required}
        pending={pending}
        unavailableReason={unavailable}
        onAdjust={(delta) =>
          adjust.mutate({
            cardId: c.card_id,
            delta,
            expected: c.stamp_count,
          })
        }
      />
    );
  }

  /** How to refer to this person in a sentence — the menu's label and the
   * confirmation's title.
   *
   * The row itself can print an em dash for a customer who joined without a
   * name, but "Remove —?" is not a question, and a screen reader hearing
   * "More for" nine times learns nothing about which row it is on. So the
   * number stands in where the name is missing, and a phrase where both
   * are. */
  function nameOf(c: CustomerListItem): string {
    return (
      c.customer_display_name.trim() ||
      c.customer_phone ||
      t("dashboard.customers.menu.unnamed")
    );
  }

  /** The overflow menu for one row, or nothing if there is nothing in it.
   *
   * Copying the number is offered to everyone who can see the roster — it
   * reveals nothing the row is not already printing, and at a counter it is
   * the fastest way to get from a name to a phone call. Removal is the item
   * that is ranked. */
  function menuFor(c: CustomerListItem) {
    const items: RowMenuItem[] = [];
    if (c.customer_phone) {
      items.push({
        key: "copy",
        label: t("dashboard.customers.menu.copyPhone"),
        icon: Copy,
        onSelect: () => void copyPhone(c),
      });
    }
    if (canMessage) {
      items.push({
        key: "message",
        label: t("dashboard.customers.menu.message"),
        icon: MessageSquare,
        onSelect: () => setAction({ cardId: c.card_id, kind: "message" }),
      });
    }
    if (canRemove) {
      items.push({
        key: "remove",
        label: t("dashboard.customers.menu.remove"),
        icon: Trash2,
        danger: true,
        onSelect: () => setAction({ cardId: c.card_id, kind: "remove" }),
      });
    }
    if (items.length === 0) return null;
    return (
      <RowMenu
        label={t("dashboard.customers.menu.label", { name: nameOf(c) })}
        items={items}
        disabled={remove.isPending || message.isPending}
      />
    );
  }

  /** What stands in for a row while it is being acted on, or null when the
   * row should render itself as usual. */
  function actionFor(c: CustomerListItem) {
    if (action?.cardId !== c.card_id) return null;
    if (action.kind === "message") {
      return (
        <QuickMessage
          name={nameOf(c)}
          busy={message.isPending}
          onSend={(body) => message.mutate({ cardId: c.card_id, body })}
          onCancel={() => setAction(null)}
        />
      );
    }
    return (
      <RemoveCustomerConfirm
        name={nameOf(c)}
        busy={remove.isPending && remove.variables === c.card_id}
        onConfirm={() => remove.mutate(c.card_id)}
        onCancel={() => setAction(null)}
      />
    );
  }

  /** The person, not the row. The monogram and the name carry it, and the
   * phone drops to the mono voice the pass uses for a field label — so the
   * largest thing in a row is who it is, which is what an owner is scanning
   * for at the counter. */
  function personFor(c: CustomerListItem) {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <Monogram name={c.customer_display_name} />
        <div className="min-w-0">
          <p className="truncate font-heading font-semibold text-ink">
            {c.customer_display_name || "—"}
          </p>
          <p
            dir="ltr"
            className="truncate font-mono text-xs text-ink-subtle rtl:text-end"
          >
            {c.customer_phone || "—"}
          </p>
        </div>
      </div>
    );
  }

  /** Sorting by name or by join date scatters the full cards through the
   * list, where the status column only finds them by reading. The one row
   * that means "greet this person" is marked at its start edge instead, so it
   * is found by running an eye down the edge. Gold, and the only colour in
   * the list — see `TAG_TONES` for why the reward owns it. */
  function readyEdge(c: CustomerListItem) {
    if (bucketOf(c) !== "ready") return null;
    return (
      <span aria-hidden className="absolute inset-y-0 start-0 w-[3px] bg-reward" />
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* The export leaves the control row: it acts on the whole filtered
          list rather than on anything typed beside it, and standing among the
          filters it read as a fourth one. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="t-h3 text-ink">{t("dashboard.customers.title")}</h1>
        {all.length > 0 && (
          <button
            type="button"
            disabled={visible.length === 0}
            onClick={handleExport}
            className={ctaClasses("secondary", "sm")}
          >
            <Download className="h-4 w-4" aria-hidden />
            {t("dashboard.customers.export.cta")}
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
      ) : all.length === 0 ? (
        <Panel className="p-5 sm:p-6">
          {canEnroll ? (
            <p className="text-ink-muted">{t("dashboard.customers.emptyPro")}</p>
          ) : (
            <Link
              to="/dashboard/billing"
              className={cn(
                "inline-flex min-h-[44px] items-center font-semibold text-primary-text underline hover:no-underline",
                focusRing,
              )}
            >
              {t("dashboard.customers.emptyFree")}
            </Link>
          )}
        </Panel>
      ) : (
        <>
          {/* No readout strip here any more. It carried Customers / Reward
              ready / Joined in 30 days, and the chips below say the first two
              in the same words — in Hebrew "מוכנים לפרס 4" was printed twice
              fifteen pixels apart. The overview already spends `Readouts` on
              those same two figures and reports joins with a delta besides,
              so this page keeps the roster and the doing, and lets the
              overview keep the headline. */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[14rem] flex-1">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden
              />
              <input
                type="search"
                className={cn(fieldClasses, "ps-10")}
                value={search}
                aria-label={t("dashboard.customers.searchLabel")}
                placeholder={t("dashboard.customers.searchPlaceholder")}
                onChange={(e) => resetTo(() => setSearch(e.target.value))}
              />
            </div>

            {/* `!w-auto`, not `w-auto`: `cn` is plain clsx with no
                tailwind-merge, so `w-full` from `fieldClasses` and `w-auto`
                both survive into the class list and Tailwind's own source
                order decides — `w-full` is emitted after every other width,
                so it wins and the select swallows its whole row. Full width
                below `sm` is right for a thumb; above it, content width. */}
            <select
              className={cn(fieldClasses, "sm:!w-auto")}
              value={sort}
              aria-label={t("dashboard.customers.sort.label")}
              onChange={(e) => resetTo(() => setSort(e.target.value as Sort))}
            >
              {SORTS.map((key) => (
                <option key={key} value={key}>
                  {t(`dashboard.customers.sort.${key}`)}
                </option>
              ))}
            </select>
          </div>

          <FilterChips
            value={filter}
            label={t("dashboard.customers.filter.label")}
            onChange={(next) => resetTo(() => setFilter(next))}
            options={FILTERS.map((key) => ({
              value: key,
              label: t(`dashboard.customers.filter.${key}`),
              count: counts[key],
            }))}
          />

          {data?.truncated && (
            <Notice tone="warn">
              {/* `shown`, not `count` — i18next reserves `count` for plurals. */}
              {t("dashboard.customers.truncated", { shown: all.length })}
            </Notice>
          )}

          {copied && (
            <Notice tone="ok">{t("dashboard.customers.menu.copied")}</Notice>
          )}

          {sentTo && (
            <Notice tone="ok">
              {t("dashboard.customers.message.sent", { name: sentTo })}
            </Notice>
          )}

          {message.isError && (
            <Notice tone="danger">
              {t("dashboard.customers.message.failed", {
                reason: messagingErrorMessage(
                  message.error,
                  t,
                  i18n.resolvedLanguage ?? "en",
                ),
              })}
            </Notice>
          )}

          {remove.isError && (
            <Notice tone="danger">
              {t("dashboard.customers.remove.failed", {
                reason: remove.error.message,
              })}
            </Notice>
          )}

          {adjust.isError &&
            (isStampConflict(adjust.error) ? (
              // Not the owner's mistake, and already self-corrected by the
              // refetch in onError — reassuring, not alarming.
              <Notice tone="warn">
                {t("dashboard.customers.stamps.conflict")}
              </Notice>
            ) : (
              <Notice tone="danger">
                {t("dashboard.customers.stamps.failed", {
                  reason: adjust.error.message,
                })}
              </Notice>
            ))}

          {visible.length === 0 ? (
            <Panel className="flex flex-col items-start gap-3 p-5 sm:p-6">
              <p className="text-ink-muted">
                {t("dashboard.customers.noMatches")}
              </p>
              <button
                type="button"
                onClick={() =>
                  resetTo(() => {
                    setSearch("");
                    setFilter("all");
                  })
                }
                className={ctaClasses("secondary", "sm")}
              >
                {t("dashboard.customers.clearFilters")}
              </button>
            </Panel>
          ) : (
            <>
              {/* A table is unreadable on a 375px phone, and this is a page an
                  owner opens at the counter. Same rows, two shapes: a card
                  each below `lg`, the table above it. */}
              <ul className="flex flex-col gap-3 lg:hidden">
                {pageRows.map((c) => (
                  <li key={c.card_id}>
                    <Panel className="relative flex flex-col gap-3 overflow-hidden p-4">
                      {actionFor(c) ?? (
                        <>
                          {readyEdge(c)}
                          <div className="flex items-start justify-between gap-3">
                            {personFor(c)}
                            <div className="flex shrink-0 items-center gap-1">
                              <Tag tone={BUCKET_TONES[bucketOf(c)]}>
                                {t(`dashboard.customers.status.${bucketOf(c)}`)}
                              </Tag>
                              {menuFor(c)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <CardPunches
                              filled={c.stamp_count}
                              total={c.stamps_required}
                              maxMarks={PUNCHABLE_CARD}
                            />
                            {adjusterFor(c)}
                          </div>
                        </>
                      )}
                    </Panel>
                  </li>
                ))}
              </ul>

              {/* Four columns, not six. `phone` folded into the person it
                  belongs to, and `card` went entirely: it renders
                  `template_name`, which for a shop running one card is the
                  same string on every row. It is still searchable, and still
                  in the export for the shops that run more than one. */}
              <Panel className="hidden overflow-x-auto p-1 lg:block">
                <table className="w-full text-start text-sm">
                  <thead>
                    <tr className="border-b border-border text-ink-subtle">
                      {(["customer", "progress", "status", "stamps"] as const).map(
                        (key) => (
                          <th
                            key={key}
                            className="px-3 py-2.5 text-start font-medium"
                          >
                            {t(`dashboard.customers.columns.${key}`)}
                          </th>
                        ),
                      )}
                      {/* Unlabelled on screen — a column of three dots needs
                          no heading — but named for a screen reader, which
                          would otherwise meet a blank `th`. */}
                      <th className="w-px px-3 py-2.5">
                        <span className="sr-only">
                          {t("dashboard.customers.columns.actions")}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((c) => (
                      <tr
                        key={c.card_id}
                        className="border-b border-border last:border-0 transition-colors hover:bg-ink/[0.03]"
                      >
                        {actionFor(c) ? (
                          // One cell across the row rather than a second row
                          // below it: what is being done replaces the person
                          // it is about, so the roster never shows a customer
                          // and their own removal at the same time.
                          <td colSpan={5} className="px-3 py-3">
                            {actionFor(c)}
                          </td>
                        ) : (
                          <>
                            <td className="relative px-3 py-2.5">
                              {readyEdge(c)}
                              {personFor(c)}
                            </td>
                            <td className="px-3 py-2.5">
                              <CardPunches
                                filled={c.stamp_count}
                                total={c.stamps_required}
                                maxMarks={PUNCHABLE_CARD}
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <Tag tone={BUCKET_TONES[bucketOf(c)]}>
                                {t(`dashboard.customers.status.${bucketOf(c)}`)}
                              </Tag>
                            </td>
                            <td className="px-3 py-2.5">{adjusterFor(c)}</td>
                            <td className="px-3 py-2.5">{menuFor(c)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </>
          )}

          {visible.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-ink-subtle">
                {isFiltered
                  ? t("dashboard.customers.showingFiltered", {
                      shown: visible.length,
                      total: all.length,
                    })
                  : t("dashboard.customers.showing", { total: all.length })}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    className={ctaClasses("secondary", "sm")}
                  >
                    {t("common.back")}
                  </button>
                  <Figure dir="ltr" className="text-xs text-ink-subtle">
                    {currentPage} / {totalPages}
                  </Figure>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className={ctaClasses("secondary", "sm")}
                  >
                    {t("common.next")}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
