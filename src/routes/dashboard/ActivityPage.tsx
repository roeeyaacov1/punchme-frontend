import { useMemo, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarX, Search, SlidersHorizontal, Stamp, X } from "lucide-react";
import {
  Button,
  EmptyState,
  Input,
  LinkButton,
  List,
  ListRow,
  LitPanel,
  Notice,
  SegmentedControl,
  Select,
  Sheet,
  Skeleton,
  SkeletonRows,
} from "../../components/kit";
import { DayChart, type ChartDay } from "../../components/dashboard/DayChart";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers, isOwner } from "../../business/gating";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/cn";
import { useLightboxPage } from "../../theme/lightboxPage";
import { fetchActivityWindow } from "./activityWindow";
import {
  AUTOMATIC,
  KINDS,
  NO_FILTERS,
  actorsOf,
  buildRows,
  dayTotals,
  hasAutomatic,
  markDayOpeners,
  matches,
  stampsByDay,
  startOfDay,
  wholeDaysFrom,
  type ActivityRow,
  type Filters,
  type Kind,
} from "./activityFilters";
import { formatCount, relativeDay, shortDate, timeOfDay, weekdayDate } from "./format";

/** How far back the page can look. The chart draws the whole window and the
 * filters run over it: everything in here, and nothing older. */
const PERIODS = ["7", "14", "30"] as const;
type Period = (typeof PERIODS)[number];
const DEFAULT_PERIOD: Period = "14";

/** Rows drawn at a time; the list grows by this much on request. */
const PAGE_SIZE = 50;

/** Local midnight `days` before today's: calendar days, so a clock change
 * can't shift the window by an hour. */
function midnightBefore(days: number): number {
  const d = new Date(startOfDay(Date.now()));
  d.setDate(d.getDate() - days);
  return d.getTime();
}

/**
 * The record: what happened at the counter, a day at a time.
 *
 * Filters sit in one row above everything they scope, the period first. The
 * chart is stamps a day, and the page's coarsest filter: picking a day
 * narrows the list to it and leaves the line whole. The list is grouped by
 * day under headings that count the day.
 *
 * Every filter runs in the browser, because `/activity` takes `page` and
 * `page_size` and nothing else: the page fetches a period and says which.
 * A new period keeps the last chart and list on screen, dimmed, until it
 * lands, and a day the walk didn't load whole is drawn as not loaded, never
 * as zero.
 */
export function ActivityPage() {
  useLightboxPage();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage;
  const { business, role } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const owns = isOwner(role);

  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchTerm = useDebounce(filters.search, 200);

  /** Anything that changes what is shown starts the list at its top. */
  function change(update: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...update }));
    setShown(PAGE_SIZE);
  }

  const days = Number(period);
  const since = midnightBefore(days - 1);
  const { data, isPending, isError, error, fetchStatus, isPlaceholderData, refetch } = useQuery({
    queryKey: ["activity", business?.id, "window", days],
    // The window carries the period it was fetched for, so a period still
    // loading keeps drawing the last one whole rather than mixing the two.
    queryFn: async () => ({ ...(await fetchActivityWindow(business!.id!, since)), days, since }),
    enabled: !!business?.id && canEnroll,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => buildRows(data?.items ?? []), [data]);
  const actors = useMemo(() => actorsOf(rows), [rows]);
  const automatic = useMemo(() => hasAutomatic(rows), [rows]);
  const people = actors.length > 1 || (actors.length === 1 && automatic);
  const active = useMemo(() => ({ ...filters, search: searchTerm }), [filters, searchTerm]);

  // The chart answers to every filter but the day, which is picked on it:
  // narrowing the line to one day would take away what was being read.
  const charted = useMemo(() => rows.filter((r) => matches(r, { ...active, day: null })), [rows, active]);
  const visible = useMemo(() => markDayOpeners(rows.filter((r) => matches(r, active))), [rows, active]);
  // A day's heading says what the chart says for that day: stamps, net
  // unless one kind is chosen.
  const perDay = useMemo(() => stampsByDay(visible, active.kind === "all"), [visible, active.kind]);
  // The day the walk's guard cut into, and every day before it, were not
  // loaded whole: the chart leaves them undrawn and their headings say
  // "at least".
  const firstWhole = useMemo(() => (data ? wholeDaysFrom(data.items, data.truncated) : null), [data]);

  const chart = useMemo(() => {
    if (!data) return null;
    // Signed only when no single kind is chosen: unfiltered, the line is the
    // net the shop handed out; with "taken off" picked, it is how many.
    const totals = dayTotals(charted, data.since, data.days, active.kind === "all");
    const series: ChartDay[] = totals.map((value, i) => {
      const d = new Date(data.since);
      d.setDate(d.getDate() + i);
      const day = d.getTime();
      return { day, value: firstWhole !== null && day < firstWhole ? null : value };
    });
    const total = totals.reduce((sum, n) => sum + n, 0);
    const loaded = series.filter((d): d is { day: number; value: number } => d.value !== null);
    const busiest = loaded.reduce<{ day: number; value: number } | null>(
      (best, d) => (!best || d.value > best.value ? d : best),
      null,
    );
    return { series, total, busiest, truncated: data.truncated, period: data.days };
  }, [data, charted, active.kind, firstWhole]);

  const words = { today: t("dashboard.activity.today"), yesterday: t("dashboard.activity.yesterday") };
  const dayName = (day: number) => relativeDay(day, language, words);
  const activeFilters = [active.kind !== "all", active.who !== "all", active.search.trim() !== ""].filter(Boolean).length;
  const list = visible.slice(0, shown);
  const more = Math.min(PAGE_SIZE, visible.length - list.length);
  const loadingNext = isPlaceholderData;
  // Offline: a read waits for the connection instead of failing.
  const held = fetchStatus === "paused";

  if (!canEnroll) {
    return (
      <Page>
        <EmptyState
          icon={<Stamp />}
          title={t("dashboard.plan.notLive")}
          body={t(owns ? "dashboard.activity.emptyFree" : "dashboard.activity.emptyFreeHire")}
          action={
            owns ? (
              <LinkButton to="/dashboard/billing" variant="primary">
                {t("billing.activateCta")}
              </LinkButton>
            ) : undefined
          }
        />
      </Page>
    );
  }

  const chartTitle = t(active.kind === "removed" ? "dashboard.activity.chartTitleRemoved" : "dashboard.activity.chartTitle");

  const filterFields = (inSheet: boolean) => (
    <>
      <Input
        type="search"
        label={t("dashboard.activity.searchLabel")}
        placeholder={t("dashboard.activity.searchPlaceholder")}
        leading={<Search />}
        value={filters.search}
        autoComplete="off"
        // A customer, a card's code or a member of staff: nothing for a
        // phone to correct.
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => change({ search: event.target.value })}
        // Typed text takes its own direction while the field keeps the
        // page's, so the magnifier's room stays on its side (Customers).
        className={cn("[&_input]:[unicode-bidi:plaintext]", !inSheet && "min-w-[min(10rem,100%)] flex-1")}
      />
      <Select
        label={t("dashboard.activity.columns.action")}
        value={filters.kind}
        onChange={(event) => change({ kind: event.target.value as Kind | "all" })}
        className={inSheet ? undefined : "w-40"}
      >
        <option value="all">{t("dashboard.activity.allActions")}</option>
        {KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {t(`dashboard.activity.action.${kind}`, { count: 1 })}
          </option>
        ))}
      </Select>
      {/* Only where there is more than one answer: on a one-person shop it
          would be the owner's own name, once. */}
      {people && (
        <Select
          label={t("dashboard.activity.columns.by")}
          value={filters.who}
          onChange={(event) => change({ who: event.target.value })}
          // The people are short local parts, "Anyone" and "Automatic":
          // a little narrower than the actions, so the search keeps room
          // for its hint in one row at a desk.
          className={inSheet ? undefined : "w-36"}
        >
          <option value="all">{t("dashboard.activity.allPeople")}</option>
          {actors.map((who) => (
            <option key={who} value={who}>
              {who}
            </option>
          ))}
          {automatic && <option value={AUTOMATIC}>{t("dashboard.activity.automatic")}</option>}
        </Select>
      )}
    </>
  );

  let body: ReactNode;
  if (isPending && !data && held) {
    body = <ReadProblem title={t("dashboard.activity.loadFailed")} paused onRetry={() => void refetch()} />;
  } else if (isPending && !data) {
    body = (
      <>
        <LitPanel className="flex flex-col gap-4 p-4 sm:p-5">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-36 w-full rounded-field" />
        </LitPanel>
        <LitPanel className="overflow-hidden">
          <SkeletonRows rows={5} />
        </LitPanel>
      </>
    );
  } else if (isError && !data) {
    body = <ReadProblem title={t("dashboard.activity.loadFailed")} error={error} onRetry={() => void refetch()} />;
  } else if (rows.length === 0) {
    body = (
      <EmptyState
        icon={<CalendarX />}
        title={t("dashboard.activity.emptyPeriod", { count: data?.days ?? days })}
        action={
          period !== "30" ? (
            <Button variant="secondary" onClick={() => setPeriod("30")}>
              {t("dashboard.activity.period.days", { count: 30 })}
            </Button>
          ) : undefined
        }
      />
    );
  } else {
    body = (
      <>
        {/* A new period asked for offline: the last one stays, dimmed, and
            this says why the next hasn't come. */}
        {loadingNext && held && <ReadProblem title={t("dashboard.activity.loadFailed")} paused onRetry={() => void refetch()} />}
        <div className={cn("flex flex-col gap-5 transition-opacity duration-gentle", loadingNext && "opacity-55")} aria-busy={loadingNext || undefined}>
          {chart?.truncated && (
            <Notice tone="warn">
              {t("dashboard.activity.truncated", {
                shown: formatCount(rows.length, language),
                since: shortDate(Date.parse(rows[rows.length - 1].event.created_at), language),
              })}
            </Notice>
          )}

          {chart && (
            <LitPanel className="flex flex-col gap-1 p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2 className="type-card-title text-ink">{chartTitle}</h2>
                <p className="type-label text-ink-muted">
                  {t(chart.truncated ? "dashboard.activity.totalAtLeast" : "dashboard.activity.stampsCount", { count: chart.total })}
                </p>
              </div>
              <p className="text-sm text-ink-muted">{t("dashboard.activity.chartHint")}</p>
              <DayChart
                className="mt-3"
                days={chart.series}
                label={chartTitle}
                summary={t("dashboard.activity.chartSummary", {
                  count: chart.series.length,
                  total: formatCount(chart.total, language),
                  peakDay: chart.busiest ? weekdayDate(chart.busiest.day, language) : "",
                  peak: chart.busiest ? formatCount(chart.busiest.value, language) : "",
                })}
                valueLabel={(value) => t("dashboard.activity.stampsCount", { count: value })}
                dayLabel={dayName}
                axisLabel={(day) => shortDate(day, language)}
                selectedDay={filters.day}
                onSelectDay={(day) => change({ day })}
                // The period the days were read for: a new one crossfades the
                // line, while a filter or a picked day redraws it at once.
                crossfade={chart.period}
              />
            </LitPanel>
          )}

          {visible.length === 0 ? (
            <EmptyState
              icon={<Search />}
              title={t("dashboard.activity.noMatches")}
              action={
                <Button variant="secondary" onClick={() => change(NO_FILTERS)}>
                  {t("dashboard.activity.clearAll")}
                </Button>
              }
            />
          ) : (
            <LitPanel className="overflow-hidden">
              {groupByDay(list).map((group) => (
                <section key={group.day} aria-labelledby={`day-${group.day}`}>
                  <h2 id={`day-${group.day}`} className="type-label border-b border-border bg-background/60 px-4 py-2 text-ink-muted">
                    {t(
                      firstWhole !== null && group.day < firstWhole
                        ? "dashboard.activity.dayHeadingAtLeast"
                        : "dashboard.activity.dayHeading",
                      { day: dayName(group.day), count: perDay.get(group.day) ?? 0 },
                    )}
                  </h2>
                  <List>
                    {group.rows.map((row, i) => (
                      <EventRow key={`${row.event.card_serial}-${row.event.created_at}-${i}`} row={row} />
                    ))}
                  </List>
                </section>
              ))}
            </LitPanel>
          )}

          {more > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-muted">
                {t("dashboard.activity.showing", {
                  shown: formatCount(list.length, language),
                  total: formatCount(visible.length, language),
                })}
              </p>
              <Button variant="secondary" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                {t("dashboard.activity.more", { count: more })}
              </Button>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <Page>
      {/* One row of filters above everything they scope, the period first.
          On a phone the rest wait in a sheet; from 1024px they sit here. */}
      <div className="flex flex-wrap items-end gap-3">
        <SegmentedControl
          label={t("dashboard.activity.period.label")}
          hideLabel
          value={period}
          onChange={(next) => {
            setPeriod(next);
            // A day outside the new window would empty the list for no
            // reason anyone could see.
            change({ day: null });
          }}
          options={PERIODS.map((value) => ({
            value,
            label: t("dashboard.activity.period.days", { count: Number(value) }),
          }))}
        />
        <Button variant="secondary" icon={<SlidersHorizontal aria-hidden />} onClick={() => setSheetOpen(true)} className="lg:hidden">
          {activeFilters ? t("dashboard.activity.filtersOn", { count: activeFilters }) : t("dashboard.activity.filters")}
        </Button>
        {/* Its own line when the period leaves it too little room, as text
            at 200% does; and the fields wrap inside it too. */}
        <div className="hidden min-w-[min(30rem,100%)] flex-1 flex-wrap items-end gap-3 lg:flex">{filterFields(false)}</div>
        {filters.day !== null && (
          <Button
            variant="secondary"
            iconEnd={<X aria-hidden />}
            aria-label={t("dashboard.activity.clearDay", { day: weekdayDate(filters.day, language) })}
            onClick={() => change({ day: null })}
          >
            {weekdayDate(filters.day, language)}
          </Button>
        )}
      </div>

      <p role="status" className="sr-only">
        {loadingNext ? t(held ? "dashboard.problem.paused" : "common.loading") : ""}
      </p>

      {body}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t("dashboard.activity.filters")}
        footer={
          <Button variant="quiet" onClick={() => change(NO_FILTERS)}>
            {t("dashboard.activity.clearAll")}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">{filterFields(true)}</div>
      </Sheet>
    </Page>
  );
}

function Page({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-5">
      <h1 className="type-title text-ink">{t("dashboard.activity.title")}</h1>
      {children}
    </div>
  );
}

type Row = ReturnType<typeof markDayOpeners>[number];

/** The rows on screen in runs of one day, newest first, as they arrive. */
function groupByDay(rows: Row[]): { day: number; rows: Row[] }[] {
  const groups: { day: number; rows: Row[] }[] = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.day === row.day) last.rows.push(row);
    else groups.push({ day: row.day, rows: [row] });
  }
  return groups;
}

/**
 * One event: who, what in one word, and when and by whom. The person is the
 * staff email's local part, because the feed carries nothing else; it is
 * set left to right and wraps rather than pushing the row.
 */
function EventRow({ row }: { row: ActivityRow }) {
  const { t, i18n } = useTranslation();
  const time = timeOfDay(Date.parse(row.event.created_at), i18n.resolvedLanguage);
  return (
    <ListRow
      title={
        row.name ? (
          // In its own direction and cut at its own end, aligned to the
          // row's start: the roster's rule (CustomersPage's Row).
          <span
            dir="auto"
            className="line-clamp-3 whitespace-normal [overflow-wrap:anywhere] [text-align:-webkit-match-parent] [text-align:match-parent] min-[360px]:line-clamp-2"
          >
            {row.name}
          </span>
        ) : (
          <span className="text-ink-muted">
            {t("dashboard.activity.cardSerial")} <bdi dir="ltr">{row.code || "—"}</bdi>
          </span>
        )
      }
      meta={
        <span className="whitespace-normal [overflow-wrap:anywhere]">
          {row.actor ? (
            <Trans
              i18nKey="dashboard.activity.meta"
              values={{ time, who: row.actor }}
              components={{ at: <bdi dir="ltr" className="type-figure" />, who: <bdi dir="ltr" /> }}
            />
          ) : (
            <Trans
              i18nKey="dashboard.activity.metaAutomatic"
              values={{ time }}
              components={{ at: <bdi dir="ltr" className="type-figure" /> }}
            />
          )}
        </span>
      }
      trailing={
        // One word at the size it was set; under large text it may take
        // two lines rather than squeeze the name to nothing (a px cap, so
        // it holds still while the text grows).
        <span className={cn("type-label block max-w-[128px] text-end", row.kind === "removed" ? "text-warn" : "text-ink")}>
          {t(`dashboard.activity.action.${row.kind}`, { count: Math.abs(row.event.stamps) })}
        </span>
      }
    />
  );
}
