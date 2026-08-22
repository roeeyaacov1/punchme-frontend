import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PunchMark } from "../../components/marketing/PunchMark";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  Figure,
  GroupLabel,
  Panel,
  Tag,
} from "../../components/dashboard/primitives";
import { DayShape } from "../../components/dashboard/DayShape";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listActivity, type ActivityItem } from "../../api/loyalty";
import { cn } from "../../lib/cn";

/** Deep enough that a day is nearly always whole inside one page, which is
 * what lets each day be drawn as a shape — half a day's stamps make an
 * honest list and a dishonest chart. A shop filling more than this in a
 * single day is doing better than the plan this product is priced for, and
 * that day degrades to a `+` and no strip rather than to a wrong one. */
const PAGE_SIZE = 50;
/** Above this a single event stops being a row of marks and becomes a
 * number — an import or a big correction, not a visit. */
const PUNCHABLE_EVENT = 6;
/** Characters of the card serial kept, and how far that is allowed to grow
 * before two cards on one page would wear the same tag. */
const TAG_LENGTH = 4;
const TAG_MAX_LENGTH = 8;
/** The narrowest window the day strip is drawn in. A shop whose whole trade
 * happens between 17:00 and 19:00 still gets a strip you can read a shape
 * off, instead of three columns. */
const MIN_SPAN_HOURS = 6;

type Kind = "stamp" | "gift" | "manual" | "correction" | "bulk";

function kindOf(event: ActivityItem): Kind {
  if (event.stamps < 0) return "correction";
  if (event.source === "automation") return "gift";
  if (event.stamps > PUNCHABLE_EVENT) return "bulk";
  // `scan`, `adjust` and `automation` are the only three the backend writes
  // (StampEvent.Source in apps/loyalty/models.py). A positive `adjust` is
  // the owner typing a stamp in from the customers table rather than a
  // customer presenting a card, and it earns the same word its negative
  // twin already gets — otherwise a hand-entered stamp is indistinguishable
  // from a scan that actually happened at the counter.
  return event.source === "adjust" ? "manual" : "stamp";
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * The last few characters of each serial, upper-cased.
 *
 * The full serial used to be the widest thing on every row and the least
 * use: an owner cannot match one to a person, and there is nowhere in the
 * product to paste one. It is also a credential — `/api/cards/{serial}` and
 * `/redeem` authenticate on it, which is exactly why `CustomerListItemOut`
 * was built to return `card_id` instead (docs/customers-backend-issues.md),
 * and printing it at full width on forty rows was the worst of both.
 *
 * The one job it can still do is tell two rows apart, and four characters do
 * that. Widened for the whole page if any two serials on it would collide,
 * so a tag never quietly claims that two cards are one.
 */
function tagsFor(items: ActivityItem[]): Map<string, string> {
  const serials = [...new Set(items.map((e) => e.card_serial))];
  let length = TAG_LENGTH;
  const short = (serial: string) =>
    serial
      .replace(/[^0-9a-z]/gi, "")
      .slice(-length)
      .toUpperCase();
  while (
    length < TAG_MAX_LENGTH &&
    new Set(serials.map(short)).size < serials.length
  ) {
    length += 1;
  }
  return new Map(serials.map((serial) => [serial, short(serial)]));
}

interface Day {
  key: string;
  label: string;
  rows: ActivityItem[];
  /** Net stamps given: what the shop handed out, less what it took back. */
  stamps: number;
  /** Visits per hour, `hours[0]` being the page window's first hour. */
  hours: number[];
  /** Serials that appear more than once in this day. */
  repeats: Set<string>;
  /** More than one person stamped today, so saying who is worth the room. */
  staffNamed: boolean;
  /** Paging cut this day in half, so the count is a floor and there is no
   * honest shape to draw. */
  truncated: boolean;
}

/**
 * The stamp book.
 *
 * Two levels, because an owner opens this asking two different questions.
 * *Was today busy, and when?* is answered by `DayShape` — the day's stamps
 * placed at the hour they happened — before a single row is read. *Did that
 * scan register, and what was that correction?* is answered by the rows,
 * which are still every event, in order, with nothing hidden.
 *
 * What the rows no longer do is shout a card serial. That was the widest
 * element on the page and the one an owner can do least with; it is now four
 * quiet characters at the end of the row, lifted out of the background only
 * when the same card comes back within the day — which is the one fact about
 * identity this endpoint can actually support, and the one worth catching (a
 * customer who came back, or a double scan).
 *
 * The week's shape belongs to the overview and is not repeated here. This
 * page owns the hours and the exceptions.
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

  // Memoised because the day grouping below depends on it, and `?? []`
  // would hand that a new array on every render.
  const items = useMemo(() => data?.items ?? [], [data]);
  const count = data?.count ?? 0;
  const hasNext = page * PAGE_SIZE < count;

  const lang = i18n.resolvedLanguage;

  const tags = useMemo(() => tagsFor(items), [items]);

  // One window for the page, not one per day: two days on one screen have to
  // be the same chart or their shapes cannot be compared. It is fitted to the
  // shop's own trading hours rather than fixed at midnight-to-midnight, so a
  // barber who opens at nine never draws nine empty columns.
  const window = useMemo(() => {
    if (items.length === 0) return { start: 0, length: 0 };
    let start = 23;
    let end = 0;
    for (const event of items) {
      const hour = new Date(event.created_at).getHours();
      if (hour < start) start = hour;
      if (hour > end) end = hour;
    }
    while (end - start + 1 < MIN_SPAN_HOURS && (start > 0 || end < 23)) {
      if (end < 23) end += 1;
      if (end - start + 1 < MIN_SPAN_HOURS && start > 0) start -= 1;
    }
    return { start, length: end - start + 1 };
  }, [items]);

  const days = useMemo(() => {
    const today = dayKey(new Date().toISOString());
    const yesterday = dayKey(
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    );
    const groups: (Day & { seen: Map<string, number>; staff: Set<string> })[] =
      [];

    for (const event of items) {
      const key = dayKey(event.created_at);
      let group = groups.find((g) => g.key === key);
      if (!group) {
        const label =
          key === today
            ? t("dashboard.activity.today")
            : key === yesterday
              ? t("dashboard.activity.yesterday")
              : new Date(event.created_at).toLocaleDateString(lang, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });
        group = {
          key,
          label,
          rows: [],
          stamps: 0,
          hours: new Array(window.length).fill(0),
          repeats: new Set(),
          seen: new Map(),
          staff: new Set(),
          staffNamed: false,
          truncated: false,
        };
        groups.push(group);
      }

      group.rows.push(event);
      group.stamps += event.stamps;

      // The strip is visits only. A stamp gifted by a messaging rule lands
      // at whatever hour the rule ran, and a phantom customer at three in
      // the morning is worse than a gap — the same call `DashboardOverview`
      // makes for the week. The count above the panel still counts it,
      // because a gifted stamp was genuinely given.
      if (event.source !== "automation") {
        const index = new Date(event.created_at).getHours() - window.start;
        if (index >= 0 && index < window.length) {
          group.hours[index] += event.stamps;
        }
      }

      const seen = (group.seen.get(event.card_serial) ?? 0) + 1;
      group.seen.set(event.card_serial, seen);
      if (seen > 1) group.repeats.add(event.card_serial);
      if (event.business_user_email) group.staff.add(event.business_user_email);
    }

    for (const group of groups) {
      // An hour that netted out below the line is an hour with nothing to
      // show, not a shape pointing down.
      group.hours = group.hours.map((n) => Math.max(0, n));
      group.staffNamed = group.staff.size > 1;
    }
    // The groups at the page's edges are the ones paging can have cut: the
    // first is missing anything newer that sits on the previous page, the
    // last anything older on the next one.
    if (groups.length > 0) {
      if (page > 1) groups[0].truncated = true;
      if (hasNext) groups[groups.length - 1].truncated = true;
    }
    return groups as Day[];
  }, [items, t, lang, window, page, hasNext]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div>
        <h1 className="t-h3 text-ink">{t("dashboard.activity.title")}</h1>
        {/* One line of orientation, because the strip is a shape an owner
            has not been shown before and a chart nobody can name is worth
            nothing. It says what is on the screen and stops — which is also
            why it is not said above an empty page, where it would be
            describing a strip that is not there. */}
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
        <div className="flex flex-col gap-6">
          {days.map((day) => (
            <section key={day.key} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <GroupLabel>{day.label}</GroupLabel>
                {/* Figures stay inside `Figure` and words stay outside it —
                    Plex Mono carries no Hebrew, so a noun set in it drops to
                    whatever face the OS picks. */}
                <p className="text-xs text-ink-subtle">
                  {/* `dir` and not only `Figure`'s isolation: a trailing "+"
                      is a neutral, so in a Hebrew line it resolves to the
                      paragraph's direction and lands in front of the digits,
                      turning "23 or more" into "plus 23". */}
                  <Figure dir="ltr">
                    {day.stamps}
                    {day.truncated ? "+" : ""}
                  </Figure>{" "}
                  {t("dashboard.week.stamps", { count: day.stamps })}
                </p>
              </div>

              <Panel>
                {/* `empty:hidden` so the frame goes when the strip does —
                    whether a day has a shape worth drawing is `DayShape`'s
                    call to make, and this keeps a day it declines from
                    leaving a band of padding above its rows. */}
                {!day.truncated && window.length > 0 && (
                  <div className="border-b border-border px-4 pb-3 pt-4 empty:hidden sm:px-5">
                    <DayShape hours={day.hours} startHour={window.start} />
                  </div>
                )}

                <ul className="divide-y divide-border px-4 sm:px-5">
                  {day.rows.map((event, i) => (
                    <ActivityRow
                      key={`${event.card_serial}-${event.created_at}-${i}`}
                      event={event}
                      tag={tags.get(event.card_serial) ?? ""}
                      repeat={day.repeats.has(event.card_serial)}
                      staffNamed={day.staffNamed}
                      lang={lang}
                    />
                  ))}
                </ul>
              </Panel>
            </section>
          ))}
        </div>
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
 * One event, read as a sentence: when, what, whose card.
 *
 * The common case says nothing out loud. A plain stamp is the mark itself and
 * a time, because forty rows that each spell out "stamp" is the wall this
 * page was. Everything that is *not* a plain stamp gets a word — a gift, a
 * correction, an import — so the exceptions are the only things that speak,
 * and finding them no longer means reading the whole day.
 */
function ActivityRow({
  event,
  tag,
  repeat,
  staffNamed,
  lang,
}: {
  event: ActivityItem;
  tag: string;
  repeat: boolean;
  staffNamed: boolean;
  lang: string | undefined;
}) {
  const { t } = useTranslation();
  const kind = kindOf(event);
  const size = Math.abs(event.stamps);
  // The local part only. On a one-person shop this never appears at all; on
  // a two-person shop "dana" is the whole answer, and the domain is forty
  // characters of the same string repeated down the page.
  const who =
    staffNamed && event.business_user_email
      ? event.business_user_email.split("@")[0]
      : null;

  return (
    <li className="flex items-center gap-3 py-2.5">
      <time
        dateTime={event.created_at}
        className="shrink-0 font-mono text-xs tabular-nums text-ink-subtle"
      >
        {new Date(event.created_at).toLocaleTimeString(lang, {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </time>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
        {kind === "bulk" ? (
          <Tag tone="neutral">{`+${size}`}</Tag>
        ) : (
          <>
            <span className="flex items-center gap-1" aria-hidden>
              {/* A correction is the ink coming off: the mark goes back to
                  the guide circle printed on the card. */}
              {kind === "correction" ? (
                <PunchMark state="empty" size={13} />
              ) : (
                Array.from({ length: size }).map((_, n) => (
                  <PunchMark key={n} state="stamped" size={13} />
                ))
              )}
            </span>
            {(kind === "stamp" || kind === "manual") && (
              <span className="sr-only">
                {size} {t("dashboard.week.stamps", { count: size })}
              </span>
            )}
            {kind === "gift" && (
              <Tag tone="accent">{t("messaging.activity.gift")}</Tag>
            )}
            {kind === "manual" && (
              <Tag tone="neutral">{t("dashboard.activity.manual")}</Tag>
            )}
            {kind === "correction" && (
              <Tag tone="warn">
                {t("dashboard.activity.removed", { count: size })}
              </Tag>
            )}
          </>
        )}

        {who && (
          <span className="truncate text-xs text-ink-subtle">
            {t("dashboard.activity.by", { who })}
          </span>
        )}
      </div>

      <Figure
        dir="ltr"
        className={cn(
          "shrink-0 text-[0.6875rem]",
          // Presence is constant so the column never looks arbitrary; weight
          // is what carries the meaning. A card that came back inside the
          // day is the one pair of rows worth spotting.
          repeat ? "font-semibold text-ink-muted" : "text-ink-subtle",
        )}
      >
        <span className="sr-only">{t("dashboard.activity.cardSerial")} </span>
        {tag}
      </Figure>
    </li>
  );
}
