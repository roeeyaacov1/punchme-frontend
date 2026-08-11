import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Download, Search } from "lucide-react";
import { Badge, Button, Input } from "../../components/ui";
import { StampAdjuster } from "../../components/customers/StampAdjuster";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import {
  adjustCardStamps,
  listAllCustomers,
  type CustomerListItem,
} from "../../api/loyalty";
import { useDebounce } from "../../hooks/useDebounce";
import { csvText, downloadCsv, toCsv } from "../../lib/csv";
import { env } from "../../lib/env";
import { cn } from "../../lib/cn";

const PAGE_SIZE = 20;
const RECENT_WINDOW_DAYS = 30;

/** Derived from the stamp counts rather than the API's `status` string: the
 * frontend has never consumed that field and its enum isn't documented
 * anywhere in the schema, whereas these two numbers are unambiguous. */
type Bucket = "ready" | "progress" | "new";
type Filter = Bucket | "all";
type Sort = "progress" | "recent" | "name";

const FILTERS: Filter[] = ["all", "ready", "progress", "new"];
const SORTS: Sort[] = ["progress", "recent", "name"];

function bucketOf(c: CustomerListItem): Bucket {
  if (c.stamps_required > 0 && c.stamp_count >= c.stamps_required) return "ready";
  return c.stamp_count > 0 ? "progress" : "new";
}

function progressOf(c: CustomerListItem): number {
  return c.stamps_required > 0 ? c.stamp_count / c.stamps_required : 0;
}

const SELECT_CLASSES =
  "rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy font-body focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40";

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
    mutationFn: ({ cardId, delta }: { cardId: string; delta: number }) =>
      adjustCardStamps(business!.id!, cardId, delta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // A manual correction is a stamp event like any other, so the activity
      // feed and the overview's counters are stale the moment this lands.
      queryClient.invalidateQueries({ queryKey: ["activity"] });
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-heading">{t("dashboard.customers.title")}</h1>

      {isLoading ? (
        <p className="text-slate font-mono text-sm">{t("common.loading")}</p>
      ) : all.length === 0 ? (
        <p className="text-slate font-body">
          {canEnroll ? (
            t("dashboard.customers.emptyPro")
          ) : (
            <Link to="/dashboard/billing" className="underline">
              {t("dashboard.customers.emptyFree")}
            </Link>
          )}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            {(["total", "ready", "recent"] as const).map((key) => (
              <div
                key={key}
                className={cn(
                  "min-w-[9rem] flex-1 rounded-2xl border px-4 py-3",
                  key === "ready" && stats.ready > 0
                    ? "border-gold/40 bg-gold/10"
                    : "border-navy/10 bg-white",
                )}
              >
                <p className="font-heading text-2xl tabular-nums">{stats[key]}</p>
                <p className="text-xs text-slate font-body">
                  {t(`dashboard.customers.stats.${key}`, {
                    days: RECENT_WINDOW_DAYS,
                  })}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="relative min-w-[16rem] flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate/60 start-3.5"
                aria-hidden
              />
              <Input
                type="search"
                className="ps-10"
                value={search}
                aria-label={t("dashboard.customers.searchLabel")}
                placeholder={t("dashboard.customers.searchPlaceholder")}
                onChange={(e) => resetTo(() => setSearch(e.target.value))}
              />
            </div>

            <select
              className={SELECT_CLASSES}
              value={filter}
              aria-label={t("dashboard.customers.filter.label")}
              onChange={(e) =>
                resetTo(() => setFilter(e.target.value as Filter))
              }
            >
              {FILTERS.map((key) => (
                <option key={key} value={key}>
                  {t(`dashboard.customers.filter.${key}`)}
                </option>
              ))}
            </select>

            <select
              className={SELECT_CLASSES}
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

            <Button
              variant="secondary"
              size="sm"
              disabled={visible.length === 0}
              onClick={handleExport}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("dashboard.customers.export.cta")}
            </Button>
          </div>

          {data?.truncated && (
            <p className="rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-800 font-body">
              {/* `shown`, not `count` — i18next reserves `count` for plurals. */}
              {t("dashboard.customers.truncated", { shown: all.length })}
            </p>
          )}

          {adjust.isError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-xs text-red-700 font-body">
              {t("dashboard.customers.stamps.failed", {
                reason: adjust.error.message,
              })}
            </p>
          )}

          {visible.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <p className="text-slate font-body">
                {t("dashboard.customers.noMatches")}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  resetTo(() => {
                    setSearch("");
                    setFilter("all");
                  })
                }
              >
                {t("dashboard.customers.clearFilters")}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm font-body">
                <thead>
                  <tr className="border-b border-navy/10 text-slate">
                    <th className="py-2 pe-4 text-start">
                      {t("dashboard.customers.columns.name")}
                    </th>
                    <th className="py-2 pe-4 text-start">
                      {t("dashboard.customers.columns.phone")}
                    </th>
                    <th className="py-2 pe-4 text-start">
                      {t("dashboard.customers.columns.progress")}
                    </th>
                    <th className="py-2 pe-4 text-start">
                      {t("dashboard.customers.columns.status")}
                    </th>
                    <th className="py-2 pe-4 text-start">
                      {t("dashboard.customers.columns.card")}
                    </th>
                    <th className="py-2 pe-4 text-start">
                      {t("dashboard.customers.columns.stamps")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((c) => {
                    const bucket = bucketOf(c);
                    const pending =
                      adjust.isPending && adjust.variables?.cardId === c.card_id;
                    return (
                      <tr key={c.card_id} className="border-b border-navy/5">
                        <td className="py-2 pe-4">
                          {c.customer_display_name || "—"}
                        </td>
                        <td className="py-2 pe-4" dir="ltr">
                          {c.customer_phone || "—"}
                        </td>
                        <td className="py-2 pe-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs tabular-nums">
                              {c.stamp_count} / {c.stamps_required}
                            </span>
                            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-navy/10">
                              <span
                                className={cn(
                                  "block h-full rounded-full",
                                  bucket === "ready" ? "bg-gold" : "bg-navy/40",
                                )}
                                style={{
                                  width: `${Math.min(1, progressOf(c)) * 100}%`,
                                }}
                              />
                            </span>
                          </div>
                        </td>
                        <td className="py-2 pe-4">
                          <Badge tone={bucket === "ready" ? "gold" : "neutral"}>
                            {t(`dashboard.customers.status.${bucket}`)}
                          </Badge>
                        </td>
                        <td className="py-2 pe-4">{c.template_name}</td>
                        <td className="py-2 pe-4">
                          <StampAdjuster
                            stampCount={c.stamp_count}
                            stampsRequired={c.stamps_required}
                            pending={pending}
                            unavailableReason={stampsUnavailable}
                            onAdjust={(delta) =>
                              adjust.mutate({ cardId: c.card_id, delta })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {visible.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate font-mono">
                {isFiltered
                  ? t("dashboard.customers.showingFiltered", {
                      shown: visible.length,
                      total: all.length,
                    })
                  : t("dashboard.customers.showing", { total: all.length })}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    {t("common.back")}
                  </Button>
                  <span className="text-xs text-slate font-mono tabular-nums">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    {t("common.next")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
