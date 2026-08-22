import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  Figure,
  Panel,
  PanelHeader,
} from "../../components/dashboard/primitives";
import { ActivityChart, type ChartDay } from "../../components/dashboard/ActivityChart";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listActivity, type ActivityItem } from "../../api/loyalty";
import { cn } from "../../lib/cn";

const PAGE_SIZE = 50;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Two weeks: long enough that a slow Tuesday is obviously a Tuesday and not
 * a decline, short enough that fourteen points still have room to breathe on
 * a 320px axis. */
const CHART_DAYS = 14;
/** One request deep enough to cover that fortnight for any shop this product
 * is priced for. Where it does not reach, the chart starts later rather than
 * drawing days it cannot prove — see `chart` below. */
const CHART_SAMPLE = 400;
/** Above this a single event stops being a stamp and is an import. */
const BULK_EVENT = 6;
/** Characters of the card serial kept when there is no name to show, and how
 * far that is allowed to grow before two cards would wear the same code. */
const CODE_LENGTH = 4;
const CODE_MAX_LENGTH = 8;

/**
 * `customer_display_name` is not in `schema.d.ts` yet.
 *
 * The activity endpoint returns `card_serial` and no name, and nothing in the
 * API joins a serial to a customer — `CustomerListItemOut` is keyed by
 * `card_id` and deliberately carries no serial, because a serial is a
 * credential (`/api/cards/{serial}` and `/redeem` authenticate on it). So the
 * name has to come from the endpoint itself, and until the backend adds it
 * this reads `undefined` and the row falls back to a short card code rather
 * than to a broken column.
 *
 * Declared here rather than in `src/api/loyalty.ts` because that directory is
 * off limits to a redesign, and because `CardPublicArt` there is the same
 * pattern: a field newer than the generated schema, hand-written, optional,
 * with the frontend safe to ship first.
 */
type ActivityRowData = ActivityItem & {
  customer_display_name?: string | null;
};

type Kind = "stamp" | "gift" | "manual" | "removed" | "import";

function kindOf(event: ActivityItem): Kind {
  if (event.stamps < 0) return "removed";
  if (event.source === "automation") return "gift";
  if (event.stamps > BULK_EVENT) return "import";
  // `scan`, `adjust` and `automation` are the only three the backend writes
  // (StampEvent.Source in apps/loyalty/models.py). A positive `adjust` is the
  // owner typing a stamp in from the customers table, not a customer at the
  // counter, and the action column is the place that difference shows.
  return event.source === "adjust" ? "manual" : "stamp";
}

/** How each action is coloured. The word carries the meaning on its own —
 * colour only reinforces it, so nothing here is said in colour alone. */
const KIND_TONES: Record<Kind, string> = {
  stamp: "text-ink",
  gift: "text-primary-text",
  manual: "text-ink",
  removed: "text-warn",
  import: "text-ink-muted",
};

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * A short code per card, for the rows that have no name to show.
 *
 * Four characters is enough to tell two rows apart, which is the only job a
 * serial can do on this screen. Widened for the whole page if any two serials
 * on it would collide, so a code never quietly claims two cards are one.
 */
function codesFor(items: ActivityItem[]): Map<string, string> {
  const serials = [...new Set(items.map((e) => e.card_serial))];
  let length = CODE_LENGTH;
  const short = (serial: string) =>
    serial
      .replace(/[^0-9a-z]/gi, "")
      .slice(-length)
      .toUpperCase();
  while (
    length < CODE_MAX_LENGTH &&
    new Set(serials.map(short)).size < serials.length
  ) {
    length += 1;
  }
  return new Map(serials.map((serial) => [serial, short(serial)]));
}

/**
 * The activity page.
 *
 * A line and a table. The line is the fortnight — the only question an owner
 * has about a run of days is whether it is going up, and that is a shape, not
 * a number. The table is the record: one row per event, four labelled
 * columns, nothing derived and nothing hidden.
 *
 * The chart reads from its own deeper sample rather than from the page being
 * shown, because a paged feed cannot see a fortnight; and it draws only the
 * days that sample can actually prove.
 */
export function ActivityPage() {
  const { t, i18n } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["activity", business?.id, page],
    queryFn: () => listActivity(business!.id!, page, PAGE_SIZE),
    enabled: !!business?.id,
    staleTime: 5_000,
  });

  // Its own key rather than the table's `["activity", id, page]`: same
  // endpoint, different depth, and sharing one cache entry would hand the
  // table four hundred rows and break its paging. The same split
  // `DashboardOverview` already makes for the week.
  const { data: sample } = useQuery({
    queryKey: ["activity", business?.id, "chart", CHART_SAMPLE],
    queryFn: () => listActivity(business!.id!, 1, CHART_SAMPLE),
    enabled: !!business?.id,
    staleTime: 30_000,
  });

  // Memoised because the table below depends on it, and `?? []` would hand
  // that a new array on every render.
  const items = useMemo(() => (data?.items ?? []) as ActivityRowData[], [data]);
  const count = data?.count ?? 0;
  const hasNext = page * PAGE_SIZE < count;
  const lang = i18n.resolvedLanguage;

  const codes = useMemo(() => codesFor(items), [items]);

  // A date repeated down twenty-five rows is the noise this page had in the
  // first place. Printed once where it changes, the column becomes the thing
  // it should be — the marker for where one day ends and the next begins.
  const rows = useMemo(() => {
    let previous = "";
    return items.map((event) => {
      const at = new Date(event.created_at);
      const key = `${at.getFullYear()}-${at.getMonth()}-${at.getDate()}`;
      const opensDay = key !== previous;
      previous = key;
      return { event, opensDay };
    });
  }, [items]);

  const chart = useMemo(() => {
    const events = sample?.items ?? [];
    if (events.length === 0) return { days: [] as ChartDay[], total: 0 };

    const today = startOfDay(Date.now());
    let start = today - (CHART_DAYS - 1) * DAY_MS;

    // Where the line is allowed to begin. Two different reasons to move it,
    // and both of them are about not drawing a zero that means nothing.
    const oldest = Math.min(...events.map((e) => Date.parse(e.created_at)));
    const sawEverything = events.length < CHART_SAMPLE;
    start = sawEverything
      ? // Nothing older exists, so the days before the first stamp are days
        // this shop had no customers yet — not quiet days. A shop a week old
        // would otherwise open on a week of flat zero and read as a business
        // that died and came back.
        Math.max(start, startOfDay(oldest))
      : // The sample ran out mid-fortnight. The day it stops on is itself
        // half-counted, so the first day worth drawing is the one after it —
        // better a shorter line than one that dips because the data did.
        Math.max(start, startOfDay(oldest) + DAY_MS);

    const length = Math.round((today - start) / DAY_MS) + 1;
    const buckets = new Array<number>(Math.max(0, length)).fill(0);
    for (const event of events) {
      const at = Date.parse(event.created_at);
      const index = Math.round((startOfDay(at) - start) / DAY_MS);
      if (index >= 0 && index < buckets.length) buckets[index] += event.stamps;
    }

    return {
      days: buckets.map((stamps, i) => ({
        date: new Date(start + i * DAY_MS),
        // A day that netted out below zero is a day with nothing to show,
        // not a line dipping under its own axis.
        stamps: Math.max(0, stamps),
      })),
      total: buckets.reduce((sum, n) => sum + Math.max(0, n), 0),
    };
  }, [sample]);

  const columns = ["date", "customer", "action", "by"] as const;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div>
        <h1 className="t-h3 text-ink">{t("dashboard.activity.title")}</h1>
        {items.length > 0 && (
          <p className="mt-1 max-w-prose text-sm text-ink-muted">
            {t("dashboard.activity.body")}
          </p>
        )}
      </div>

      {isLoading ? (
        <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
      ) : items.length === 0 ? (
        <Panel className="p-5 sm:p-6">
          {canEnroll ? (
            <p className="text-ink-muted">{t("dashboard.activity.emptyPro")}</p>
          ) : (
            <Link
              to="/dashboard/billing"
              className={cn(
                "inline-flex min-h-[44px] items-center font-semibold text-primary-text underline hover:no-underline",
                focusRing,
              )}
            >
              {t("dashboard.activity.emptyFree")}
            </Link>
          )}
        </Panel>
      ) : (
        <>
          {chart.days.length >= 2 && (
            <Panel className="p-4 sm:p-6">
              <PanelHeader
                title={t("dashboard.activity.chartTitle")}
                action={
                  <p className="text-sm text-ink-muted">
                    <Figure className="text-ink">{chart.total}</Figure>{" "}
                    {t("dashboard.activity.inDays", {
                      count: chart.days.length,
                    })}
                  </p>
                }
              />
              <ActivityChart days={chart.days} className="mt-5" />
            </Panel>
          )}

          <Panel className="overflow-hidden">
            {/* Four columns will not fit a 375px phone as a table, so below
                `sm` each event is two lines instead — the name and what
                happened on the first, when and by whom on the second. The
                same four facts, in the same order. */}
            <ul className="divide-y divide-border sm:hidden">
              {rows.map(({ event, opensDay }, i) => (
                <li
                  key={`${event.card_serial}-${event.created_at}-${i}`}
                  className={cn(
                    "flex flex-col gap-1 px-4 py-3",
                    // No column to align against here, so the date stays on
                    // every row; the day still gets a heavier rule so a
                    // thumb can find where yesterday started.
                    opensDay && i > 0 && "border-t border-border-strong",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <Who event={event} code={codes.get(event.card_serial)} />
                    <Action event={event} />
                  </div>
                  <p className="text-xs text-ink-subtle">
                    <When event={event} lang={lang} />
                    {event.business_user_email && (
                      <>
                        {" · "}
                        {t("dashboard.activity.by", {
                          who: event.business_user_email.split("@")[0],
                        })}
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
                      <th key={key} className="px-4 py-2.5 text-start font-medium">
                        {t(`dashboard.activity.columns.${key}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ event, opensDay }, i) => (
                    <tr
                      key={`${event.card_serial}-${event.created_at}-${i}`}
                      className={cn(
                        i === 0
                          ? "border-t-0"
                          : opensDay
                            ? "border-t border-border-strong"
                            : "border-t border-border",
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-muted">
                        <When event={event} lang={lang} showDate={opensDay} />
                      </td>
                      <td className="px-4 py-2.5">
                        <Who event={event} code={codes.get(event.card_serial)} />
                      </td>
                      <td className="px-4 py-2.5">
                        <Action event={event} />
                      </td>
                      <td className="px-4 py-2.5 text-ink-muted">
                        {event.business_user_email ? (
                          event.business_user_email.split("@")[0]
                        ) : (
                          <span className="text-ink-subtle">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      {count > PAGE_SIZE && (
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
  );
}

/**
 * The date column.
 *
 * The day is words and the time is a figure, kept apart because Plex Mono
 * carries no Hebrew and a month set in it drops to whatever face the OS
 * picks. "Today" and "Yesterday" over a numeral for the two days an owner is
 * actually looking at — a barber checking the counter at closing time knows
 * what today's date is.
 *
 * `showDate` hides the day where the table has already said it one row above.
 * The `<time>` element still carries the full timestamp, so a screen reader
 * and anything parsing the page read every row in full.
 */
function When({
  event,
  lang,
  showDate = true,
}: {
  event: ActivityItem;
  lang: string | undefined;
  showDate?: boolean;
}) {
  const { t } = useTranslation();
  const at = new Date(event.created_at);
  const dayOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const key = dayOf(at);
  const day =
    key === dayOf(new Date())
      ? t("dashboard.activity.today")
      : key === dayOf(new Date(Date.now() - DAY_MS))
        ? t("dashboard.activity.yesterday")
        : at.toLocaleDateString(lang, { day: "numeric", month: "short" });

  return (
    <time dateTime={event.created_at}>
      {showDate ? (
        day
      ) : (
        <span className="sr-only">{day}</span>
      )}
      <Figure className={showDate ? "ms-2" : undefined}>
        {at.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}
      </Figure>
    </time>
  );
}

/** The customer column, or the nearest thing the endpoint can support. */
function Who({
  event,
  code,
}: {
  event: ActivityRowData;
  code: string | undefined;
}) {
  const { t } = useTranslation();
  const name = event.customer_display_name?.trim();
  if (name) return <span className="font-medium text-ink">{name}</span>;
  return (
    <Figure dir="ltr" className="text-ink-subtle">
      <span className="sr-only">{t("dashboard.activity.cardSerial")} </span>
      {code ?? "—"}
    </Figure>
  );
}

/** The action column, in one plain word. */
function Action({ event }: { event: ActivityItem }) {
  const { t } = useTranslation();
  const kind = kindOf(event);
  const size = Math.abs(event.stamps);
  return (
    <span className={cn("whitespace-nowrap", KIND_TONES[kind])}>
      {t(`dashboard.activity.action.${kind}`, { count: size })}
    </span>
  );
}
