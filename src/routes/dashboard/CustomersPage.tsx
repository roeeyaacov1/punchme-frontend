import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Download, Search } from "lucide-react";
import { StampAdjuster } from "../../components/customers/StampAdjuster";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import { CardPunches } from "../../components/dashboard/CardPunches";
import {
  Figure,
  Notice,
  Panel,
  Tag,
  fieldClasses,
  type Tone,
} from "../../components/dashboard/primitives";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import {
  adjustCardStamps,
  listAllCustomers,
  type CustomerListItem,
} from "../../api/loyalty";
import { ApiError } from "../../api/errors";
import { useDebounce } from "../../hooks/useDebounce";
import { csvText, downloadCsv, toCsv } from "../../lib/csv";
import { env } from "../../lib/env";
import { cn } from "../../lib/cn";

const PAGE_SIZE = 20;
const RECENT_WINDOW_DAYS = 30;
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
type Filter = Bucket | "all";
type Sort = "progress" | "recent" | "name";

const FILTERS: Filter[] = ["all", "ready", "progress", "new", "void"];
const SORTS: Sort[] = ["progress", "recent", "name"];

const BUCKET_TONES: Record<Bucket, Tone> = {
  void: "warn",
  ready: "accent",
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

export function CustomersPage() {
  const { t, i18n } = useTranslation();
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const canEnroll = canEnrollRealCustomers(business);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("progress");
  const [page, setPage] = useState(1);

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

  const stats = useMemo(() => {
    const recentCutoff = Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return {
      total: all.length,
      ready: all.filter((c) => bucketOf(c) === "ready").length,
      recent: all.filter((c) => Date.parse(c.created_at) >= recentCutoff).length,
    };
  }, [all]);

  const visible = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    // "050-123" and "0501234567" should find the same person, so compare the
    // digits alone once the typed query actually contains some.
    const digits = query.replace(/\D/g, "");

    const rows = all.filter((c) => {
      if (filter !== "all" && bucketOf(c) !== filter) return false;
      if (!query) return true;
      if (c.customer_display_name.toLowerCase().includes(query)) return true;
      if (c.template_name.toLowerCase().includes(query)) return true;
      return (
        digits.length > 0 &&
        (c.customer_phone ?? "").replace(/\D/g, "").includes(digits)
      );
    });

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
  }, [all, debouncedSearch, filter, sort, i18n.resolvedLanguage]);

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

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <h1 className="t-h3 text-ink">{t("dashboard.customers.title")}</h1>

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
          {/* Three counts, and only the one that means "go and do something"
              is coloured. */}
          <dl className="grid grid-cols-3 gap-3">
            {(["total", "ready", "recent"] as const).map((key) => (
              <Panel key={key} className="px-4 py-3">
                <dd
                  className={cn(
                    "font-heading text-2xl font-bold tabular-nums",
                    key === "ready" && stats.ready > 0
                      ? "text-primary-text"
                      : "text-ink",
                  )}
                >
                  {stats[key]}
                </dd>
                <dt className="mt-0.5 text-xs text-ink-subtle">
                  {t(`dashboard.customers.stats.${key}`, {
                    days: RECENT_WINDOW_DAYS,
                  })}
                </dt>
              </Panel>
            ))}
          </dl>

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

            <select
              className={cn(fieldClasses, "w-auto")}
              value={filter}
              aria-label={t("dashboard.customers.filter.label")}
              onChange={(e) => resetTo(() => setFilter(e.target.value as Filter))}
            >
              {FILTERS.map((key) => (
                <option key={key} value={key}>
                  {t(`dashboard.customers.filter.${key}`)}
                </option>
              ))}
            </select>

            <select
              className={cn(fieldClasses, "w-auto")}
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

            <button
              type="button"
              disabled={visible.length === 0}
              onClick={handleExport}
              className={ctaClasses("secondary", "sm")}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("dashboard.customers.export.cta")}
            </button>
          </div>

          {data?.truncated && (
            <Notice tone="warn">
              {/* `shown`, not `count` — i18next reserves `count` for plurals. */}
              {t("dashboard.customers.truncated", { shown: all.length })}
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
              {/* A six-column table is unreadable on a 375px phone, and this
                  is a page an owner opens at the counter. Same rows, two
                  shapes: a card each below `lg`, the table above it. */}
              <ul className="flex flex-col gap-3 lg:hidden">
                {pageRows.map((c) => (
                  <Panel key={c.card_id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {c.customer_display_name || "—"}
                        </p>
                        <p
                          dir="ltr"
                          className="truncate font-mono text-xs text-ink-subtle rtl:text-end"
                        >
                          {c.customer_phone || "—"}
                        </p>
                      </div>
                      <Tag tone={BUCKET_TONES[bucketOf(c)]}>
                        {t(`dashboard.customers.status.${bucketOf(c)}`)}
                      </Tag>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <CardPunches filled={c.stamp_count} total={c.stamps_required} maxMarks={PUNCHABLE_CARD} />
                      {adjusterFor(c)}
                    </div>
                  </Panel>
                ))}
              </ul>

              <Panel className="hidden overflow-x-auto p-1 lg:block">
                <table className="w-full text-start text-sm">
                  <thead>
                    <tr className="border-b border-border text-ink-subtle">
                      {(
                        ["name", "phone", "progress", "status", "card", "stamps"] as const
                      ).map((key) => (
                        <th key={key} className="px-3 py-2.5 text-start font-medium">
                          {t(`dashboard.customers.columns.${key}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((c) => (
                      <tr
                        key={c.card_id}
                        className="border-b border-border last:border-0 transition-colors hover:bg-ink/[0.03]"
                      >
                        <td className="px-3 py-2.5 text-ink">
                          {c.customer_display_name || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-ink-muted" dir="ltr">
                          {c.customer_phone || "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <CardPunches filled={c.stamp_count} total={c.stamps_required} maxMarks={PUNCHABLE_CARD} />
                        </td>
                        <td className="px-3 py-2.5">
                          <Tag tone={BUCKET_TONES[bucketOf(c)]}>
                            {t(`dashboard.customers.status.${bucketOf(c)}`)}
                          </Tag>
                        </td>
                        <td className="px-3 py-2.5 text-ink-muted">
                          {c.template_name}
                        </td>
                        <td className="px-3 py-2.5">{adjusterFor(c)}</td>
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
