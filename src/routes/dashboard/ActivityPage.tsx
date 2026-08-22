import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  Figure,
  Notice,
  Panel,
  PanelHeader,
  SegmentedControl,
  fieldClasses,
} from "../../components/dashboard/primitives";
import {
  ActivityChart,
  type ChartDay,
} from "../../components/dashboard/ActivityChart";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listActivity } from "../../api/loyalty";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/cn";
import {
  AUTOMATIC,
  KINDS,
  NO_FILTERS,
  actorsOf,
  buildRows,
  dayTotals,
  hasAutomatic,
  isFiltered,
  markDayOpeners,
  matches,
  startOfDay,
  type ActivityItemWithName,
  type Filters,
  type Kind,
} from "./activityFilters";

const DAY_MS = 24 * 60 * 60 * 1000;
/** How far back the page can look. The chart draws the whole window and the
 * filters run over it, so this is the page's contract: everything in here,
 * and nothing older. */
const PERIODS = [7, 14, 30] as const;
type Period = (typeof PERIODS)[number];
const DEFAULT_PERIOD: Period = 14;

/** django-ninja's `PageNumberPagination` caps `page_size` at 100 and says
 * nothing about it — asking for more is silently answered with a hundred. So
 * the window is paged rather than requested in one lump, the same way
 * `listAllCustomers` does it. */
const FETCH_PAGE_SIZE = 100;
/** Safety stop, so a shop with an unexpectedly busy month cannot turn one
 * screen into a hundred sequential requests. Hitting it sets `truncated`,
 * which the page says out loud rather than quietly filtering half a window. */
const MAX_FETCH_PAGES = 15;
/** Rows per page of the table, applied after filtering. */
const PAGE_SIZE = 50;

/** How each action is coloured. The word carries the meaning on its own —
 * colour only reinforces it, so nothing here is said in colour alone. */
const KIND_TONES: Record<Kind, string> = {
  stamp: "text-ink",
  gift: "text-primary-text",
  manual: "text-ink",
  removed: "text-warn",
  import: "text-ink-muted",
};

/**
 * Everything from `since` to now.
 *
 * The endpoint has no date parameter, so "since" is done by walking back from
 * the newest event and stopping at the first page that reaches past the
 * window — two or three requests for a fortnight, not a download of the
 * shop's whole history.
 */
async function fetchActivityWindow(businessId: string, since: number) {
  const items: ActivityItemWithName[] = [];
  let count = 0;
  let truncated = false;
  let page = 1;

  for (;;) {
    const res = await listActivity(businessId, page, FETCH_PAGE_SIZE);
    count = res.count;
    items.push(...(res.items as ActivityItemWithName[]));

    // Nothing came back, or we hold every row the server says exists.
    // Checked against `count` rather than the page length so a server that
    // caps `page_size` below what we asked for still terminates on the right
    // row instead of stopping after the first short page.
    if (res.items.length === 0 || items.length >= count) break;
    // This page's oldest row is already past the edge we care about.
    const oldest = Date.parse(res.items[res.items.length - 1].created_at);
    if (oldest < since) break;

    if (page >= MAX_FETCH_PAGES) {
      truncated = true;
      break;
    }
    page += 1;
  }

  return {
    items: items.filter((e) => Date.parse(e.created_at) >= since),
    truncated,
  };
}

/**
 * The activity page.
 *
 * A line, a filter bar, and a table. The line is the period — the only
 * question an owner has about a run of days is whether it is going up, and
 * that is a shape rather than a number. The table is the record: one row per
 * event, four labelled columns, nothing derived and nothing hidden.
 *
 * Every filter runs client-side, because `/activity` takes `page` and
 * `page_size` and nothing else. That is what fixes the window: filtering one
 * server page of fifty would quietly mean "gifts among the last fifty
 * events", which looks identical to "gifts" and is not it. So the page fetches
 * a period, and the period is stated on the screen.
 *
 * The chart is also the coarsest filter. Picking a day narrows the table to
 * it and leaves the line whole, so the shape you clicked into stays on screen
 * beside what it was made of.
 */
export function ActivityPage() {
  const { t, i18n } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const lang = i18n.resolvedLanguage;

  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [page, setPage] = useState(1);
  const searchTerm = useDebounce(filters.search, 200);

  /** Every change to what is being shown puts the table back on page one —
   * page four of an unfiltered week is not page four of anything else. */
  function change(update: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...update }));
    setPage(1);
  }

  // Local midnight, so a day on the chart is the day an owner means and the
  // window is a whole number of days rather than a rolling 336 hours.
  const windowStart = useMemo(
    () => startOfDay(Date.now()) - (period - 1) * DAY_MS,
    [period],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["activity", business?.id, "window", period],
    queryFn: () => fetchActivityWindow(business!.id!, windowStart),
    enabled: !!business?.id && canEnroll,
    staleTime: 15_000,
  });

  const rows = useMemo(() => buildRows(data?.items ?? []), [data]);
  const actors = useMemo(() => actorsOf(rows), [rows]);
  const automatic = useMemo(() => hasAutomatic(rows), [rows]);

  const active = useMemo(
    () => ({ ...filters, search: searchTerm }),
    [filters, searchTerm],
  );

  // The chart answers to every filter except the day, which is expressed *on*
  // it — narrowing the line to the day you picked would collapse it to a
  // single point and take away the thing you were reading.
  const charted = useMemo(
    () => rows.filter((r) => matches(r, { ...active, day: null })),
    [rows, active],
  );
  const visible = useMemo(
    () => markDayOpeners(rows.filter((r) => matches(r, active))),
    [rows, active],
  );

  const chart = useMemo(() => {
    // Signed only when no single kind is chosen: unfiltered the line is the
    // net a shop handed out, so a removal subtracts; with "removed" picked it
    // is how many were taken back, which signed would draw as a flat zero.
    const totals = dayTotals(charted, windowStart, period, active.kind === "all");
    const days: ChartDay[] = totals.map((stamps, i) => ({
      date: new Date(windowStart + i * DAY_MS),
      stamps,
    }));
    return { days, total: totals.reduce((sum, n) => sum + n, 0) };
  }, [charted, windowStart, period, active.kind]);

  const pageRows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasNext = page * PAGE_SIZE < visible.length;
  const columns = ["date", "customer", "action", "by"] as const;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="t-h3 text-ink">{t("dashboard.activity.title")}</h1>
          {rows.length > 0 && (
            <p className="mt-1 max-w-prose text-sm text-ink-muted">
              {t("dashboard.activity.body")}
            </p>
          )}
        </div>
        {canEnroll && (
          <SegmentedControl
            value={period}
            onChange={(next) => {
              setPeriod(next);
              // A day outside the new window would filter the table to
              // nothing with no visible cause.
              change({ day: null });
            }}
            label={t("dashboard.activity.period.label")}
            options={PERIODS.map((days) => ({
              value: days,
              label: t("dashboard.activity.period.days", { count: days }),
            }))}
          />
        )}
      </div>

      {!canEnroll ? (
        <Panel className="p-5 sm:p-6">
          <Link
            to="/dashboard/billing"
            className={cn(
              "inline-flex min-h-[44px] items-center font-semibold text-primary-text underline hover:no-underline",
              focusRing,
            )}
          >
            {t("dashboard.activity.emptyFree")}
          </Link>
        </Panel>
      ) : isLoading ? (
        <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
      ) : rows.length === 0 ? (
        <Panel className="p-5 sm:p-6">
          <p className="text-ink-muted">
            {t("dashboard.activity.emptyPeriod", { count: period })}
          </p>
        </Panel>
      ) : (
        <>
          {data?.truncated && (
            <Notice tone="warn">
              {/* `shown`, not `count` — i18next reserves `count` for plurals. */}
              {t("dashboard.activity.truncated", { shown: rows.length })}
            </Notice>
          )}

          <Panel className="p-4 sm:p-6">
            <PanelHeader
              title={
                active.kind === "removed"
                  ? t("dashboard.activity.chartTitleRemoved")
                  : t("dashboard.activity.chartTitle")
              }
              hint={t("dashboard.activity.chartHint")}
              action={
                <p className="text-sm text-ink-muted">
                  <Figure className="text-ink">{chart.total}</Figure>{" "}
                  {t("dashboard.week.stamps", { count: chart.total })}
                </p>
              }
            />
            <ActivityChart
              days={chart.days}
              selectedDay={filters.day}
              onSelectDay={(day) => change({ day })}
              unitLabel={t("dashboard.week.stamps", { count: 2 })}
              className="mt-5"
            />
          </Panel>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[13rem] flex-1 sm:max-w-sm">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden
              />
              <input
                type="search"
                className={cn(fieldClasses, "ps-10")}
                value={filters.search}
                aria-label={t("dashboard.activity.searchLabel")}
                placeholder={t("dashboard.activity.searchPlaceholder")}
                onChange={(e) => change({ search: e.target.value })}
              />
            </div>

            <select
              className={cn(fieldClasses, "sm:!w-auto")}
              value={filters.kind}
              aria-label={t("dashboard.activity.columns.action")}
              onChange={(e) =>
                change({ kind: e.target.value as Filters["kind"] })
              }
            >
              <option value="all">{t("dashboard.activity.allActions")}</option>
              {KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {t(`dashboard.activity.action.${kind}`, { count: 1 })}
                </option>
              ))}
            </select>

            {/* Only where there is more than one answer. On a one-person shop
                this select is the owner's own name, once. */}
            {(actors.length > 1 || (actors.length === 1 && automatic)) && (
              <select
                className={cn(fieldClasses, "sm:!w-auto")}
                value={filters.who}
                aria-label={t("dashboard.activity.columns.by")}
                onChange={(e) => change({ who: e.target.value })}
              >
                <option value="all">{t("dashboard.activity.allPeople")}</option>
                {actors.map((who) => (
                  <option key={who} value={who}>
                    {who}
                  </option>
                ))}
                {automatic && (
                  <option value={AUTOMATIC}>
                    {t("dashboard.activity.automatic")}
                  </option>
                )}
              </select>
            )}

            {/* The chart's selection, wearing the same shape as the other
                filters so it is obviously one of them and obviously
                removable. */}
            {filters.day !== null && (
              <button
                type="button"
                onClick={() => change({ day: null })}
                // Named rather than described: an `sr-only` span inside the
                // button would run into the date and make the accessible
                // name "19 AugClear this day".
                aria-label={t("dashboard.activity.clearDay", {
                  day: new Date(filters.day).toLocaleDateString(lang, {
                    day: "numeric",
                    month: "long",
                  }),
                })}
                className={ctaClasses("secondary", "sm")}
              >
                {new Date(filters.day).toLocaleDateString(lang, {
                  day: "numeric",
                  month: "short",
                })}
                <X size={15} aria-hidden />
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <Panel className="flex flex-col items-start gap-3 p-5 sm:p-6">
              <p className="text-ink-muted">
                {t("dashboard.activity.noMatches")}
              </p>
              <button
                type="button"
                onClick={() => change(NO_FILTERS)}
                className={ctaClasses("secondary", "sm")}
              >
                {t("dashboard.customers.clearFilters")}
              </button>
            </Panel>
          ) : (
            <Panel className="overflow-hidden">
              {/* Four columns will not fit a 375px phone as a table, so below
                  `sm` each event is two lines instead — the name and what
                  happened on the first, when and by whom on the second. The
                  same four facts, in the same order. */}
              <ul className="divide-y divide-border sm:hidden">
                {pageRows.map((row, i) => (
                  <li
                    key={`${row.event.card_serial}-${row.event.created_at}-${i}`}
                    className={cn(
                      "flex flex-col gap-1 px-4 py-3",
                      // No column to align against here, so the date stays on
                      // every row; the day still gets a heavier rule so a
                      // thumb can find where yesterday started.
                      row.opensDay && i > 0 && "border-t border-border-strong",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <Who row={row} />
                      <Action row={row} />
                    </div>
                    <p className="text-xs text-ink-subtle">
                      <When row={row} lang={lang} />
                      {row.actor && (
                        <>
                          {" · "}
                          {t("dashboard.activity.by", { who: row.actor })}
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-start text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-ink-subtle">
                      {columns.map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2.5 text-start font-medium"
                        >
                          {t(`dashboard.activity.columns.${key}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row, i) => (
                      <tr
                        key={`${row.event.card_serial}-${row.event.created_at}-${i}`}
                        className={cn(
                          i === 0
                            ? "border-t-0"
                            : row.opensDay
                              ? "border-t border-border-strong"
                              : "border-t border-border",
                        )}
                      >
                        <td className="whitespace-nowrap px-4 py-2.5 text-ink-muted">
                          <When row={row} lang={lang} showDate={row.opensDay} />
                        </td>
                        <td className="px-4 py-2.5">
                          <Who row={row} />
                        </td>
                        <td className="px-4 py-2.5">
                          <Action row={row} />
                        </td>
                        <td className="px-4 py-2.5 text-ink-muted">
                          {row.actor ?? (
                            <span className="text-ink-subtle">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            {/* What the filters left, against what the window holds. Without
                it a narrowed table looks like a quiet fortnight. Silent when
                nothing is narrowed and it all fits — "430 of 430" is noise. */}
            {(isFiltered(active) || visible.length > PAGE_SIZE) && (
              <p className="text-sm text-ink-subtle">
                {t("dashboard.activity.showing", {
                  shown: visible.length,
                  total: rows.length,
                })}
              </p>
            )}
            {visible.length > PAGE_SIZE && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className={ctaClasses("secondary", "sm")}
                >
                  {t("common.back")}
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className={ctaClasses("secondary", "sm")}
                >
                  {t("common.next")}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

type Row = ReturnType<typeof markDayOpeners>[number];

/**
 * The date column.
 *
 * The day is words and the time is a figure, kept apart because Plex Mono
 * carries no Hebrew and a month set in it drops to whatever face the OS
 * picks. "Today" and "Yesterday" over a numeral for the two days an owner is
 * actually looking at.
 *
 * `showDate` hides the day where the table has already said it one row above.
 * The `<time>` element still carries every row's full timestamp.
 */
function When({
  row,
  lang,
  showDate = true,
}: {
  row: Row;
  lang: string | undefined;
  showDate?: boolean;
}) {
  const { t } = useTranslation();
  const at = new Date(row.event.created_at);
  const today = startOfDay(Date.now());
  const day =
    row.day === today
      ? t("dashboard.activity.today")
      : row.day === today - DAY_MS
        ? t("dashboard.activity.yesterday")
        : at.toLocaleDateString(lang, { day: "numeric", month: "short" });

  return (
    <time dateTime={row.event.created_at}>
      {showDate ? day : <span className="sr-only">{day}</span>}
      <Figure className={showDate ? "ms-2" : undefined}>
        {at.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}
      </Figure>
    </time>
  );
}

/** The customer column, or the nearest thing the endpoint can support. */
function Who({ row }: { row: Row }) {
  const { t } = useTranslation();
  if (row.name) return <span className="font-medium text-ink">{row.name}</span>;
  return (
    <Figure dir="ltr" className="text-ink-subtle">
      <span className="sr-only">{t("dashboard.activity.cardSerial")} </span>
      {row.code || "—"}
    </Figure>
  );
}

/** The action column, in one plain word. */
function Action({ row }: { row: Row }) {
  const { t } = useTranslation();
  return (
    <span className={cn("whitespace-nowrap", KIND_TONES[row.kind])}>
      {t(`dashboard.activity.action.${row.kind}`, {
        count: Math.abs(row.event.stamps),
      })}
    </span>
  );
}
