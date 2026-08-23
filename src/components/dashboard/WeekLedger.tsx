import { useTranslation } from "react-i18next";
import { TrendingDown, TrendingUp } from "lucide-react";
import { PunchMark } from "../marketing/PunchMark";
import { cn } from "../../lib/cn";

/**
 * The week, day by day.
 *
 * A total is half the question: the one an owner is really asking at ₪99 a
 * month is *is it going up*, and after that *which days*. Both are in the
 * activity window the page already fetches.
 *
 * **Why bars and not the punch mark.** This drew one mark per stamp, in the
 * product's own material — a page of a stamp book rather than a chart. That
 * is the idiom Roee turned down on the Activity tab: on a working surface it
 * costs a decode before it says anything, and it had to keep measuring itself
 * and fall back to bars anyway whenever a busy Friday would not fit. Seven
 * discrete days is what a bar chart is *for*. The mark stays where it belongs
 * — the landing page, the card previews, and the empty state below, which is
 * an illustration of the product rather than a reading of it.
 *
 * Three charts on this dashboard, three forms, each fitting its data: the
 * brief band's thirty days are a smoothed area, the activity page's fortnight
 * is a line, and the week is bars. Nobody has to learn any of them.
 *
 * Two things it deliberately does not do. It draws no guide track out to some
 * target: the only target this product has is the reward. And a slow week is
 * never red — `danger` is for a request that failed, not for a quiet Tuesday.
 */

/** Plot height. Read against `PLOT_MAX` below: seven bars in 300px are about
 * 36px each, and 36 × 96 is a bar. At 416px wide they came out 53px across and
 * read as seven doors. */
const PLOT_H = 96;
/** The smallest a non-zero day is allowed to draw, so one stamp against a
 * peak of forty is still a mark rather than a hairline. A day with *nothing*
 * in it draws nothing — it is the empty track that says the day was there. */
const MIN_BAR = 4;
/** The plot is as wide as the data needs and no wider — allowed to fill a
 * desk-width panel, a seven-bar week turns into a fence. Narrow enough that
 * the bars stay bars, and `w-full` under it so a 375px phone simply gets a
 * smaller one. */
const PLOT_MAX = 300;

export interface WeekDay {
  /** Local midnight of the day this bar counts. */
  date: Date;
  stamps: number;
}

export function WeekLedger({
  /** Oldest first — the same direction `ActivityChart` and `buildBrief` use.
   * The bars are laid out with flexbox rather than drawn into an SVG, so
   * Hebrew mirrors them for free and today stays at the reading end. */
  days,
  total,
  /** The sample could not see far enough back to be sure of the total. */
  capped,
  /** Stamps this week minus stamps the week before, or null when the sample
   * could not prove what the previous week held. Never guessed. */
  delta,
  /** The owner's own reward length — how long an unfilled card is drawn on a
   * week with nothing in it. */
  cardLength,
}: {
  days: WeekDay[];
  total: number;
  capped?: boolean;
  delta: number | null;
  cardLength: number;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  // "Fri" reads; its Hebrew equivalent at `short` is "יום ו׳", three times the
  // width, which pushes seven labels off a phone. Hebrew writes its weekdays
  // as letters anyway, so `narrow` is both shorter and more native.
  const weekday = lang === "he" ? ("narrow" as const) : ("short" as const);

  const peak = Math.max(0, ...days.map((d) => d.stamps));
  const peakIndex = days.findIndex((d) => d.stamps === peak);
  const todayKey = new Date().toDateString();
  const isToday = (day: WeekDay) => day.date.toDateString() === todayKey;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        {/* `t-stat` bare, not wrapped in `Figure`: the two disagree on the
            face and `Figure` wins, which quietly set the one display number on
            the page in mono — slashed zero and all. `t-stat` already carries
            tabular figures. Matches `ProofBand` and `ScanResult`. */}
        <span className="t-stat text-ink">
          {total}
          {capped ? "+" : ""}
        </span>
        <p className="text-ink-muted">
          {t("dashboard.week.stamps", { count: total })}
        </p>
        {delta !== null && <Delta value={delta} />}
      </div>

      {total === 0 ? (
        <EmptyWeek cardLength={cardLength} />
      ) : (
        <>
          {/* Decoration to a screen reader: seven day names and seven counts
              read one bar at a time is the worst version of this panel. The
              list below says the same thing in words. */}
          <div
            aria-hidden="true"
            className="flex w-full flex-col gap-2"
            style={{ maxWidth: PLOT_MAX }}
          >
            {/* The scale, said once where it is true, over the day it is true
                of, instead of a y axis nobody reads. Same call as
                `ActivityChart`. Its own row, so it cannot push a bar down. */}
            <div className="flex h-4 gap-1.5 sm:gap-2">
              {days.map((day, i) => (
                <span
                  key={day.date.toISOString()}
                  className="flex-1 text-center font-mono text-[11px] tabular-nums text-ink-muted"
                >
                  {i === peakIndex ? peak : null}
                </span>
              ))}
            </div>

            <div className="flex gap-1.5 sm:gap-2" style={{ height: PLOT_H }}>
              {days.map((day) => (
                // Every day gets its track, whether or not anything happened
                // in it. Without one a shut Saturday is a gap in the row and
                // the week silently becomes six days long — which is exactly
                // what a quiet day should *not* look like.
                <div
                  key={day.date.toISOString()}
                  className="relative h-full flex-1 rounded-md bg-ink/[0.06]"
                >
                  {day.stamps > 0 && (
                    <span
                      className="absolute inset-x-0 bottom-0 rounded-md bg-primary"
                      style={{
                        height: Math.max(MIN_BAR, (day.stamps / peak) * PLOT_H),
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 sm:gap-2">
              {days.map((day) => (
                <span
                  key={day.date.toISOString()}
                  className={cn(
                    "flex-1 text-center font-mono text-[11px]",
                    isToday(day)
                      ? "font-semibold text-primary-text"
                      : "text-ink-subtle",
                  )}
                >
                  {isToday(day)
                    ? t("dashboard.activity.today")
                    : day.date.toLocaleDateString(lang, { weekday })}
                </span>
              ))}
            </div>
          </div>

          <ul className="sr-only">
            {days.map((day) => (
              <li key={day.date.toISOString()}>
                {`${day.date.toLocaleDateString(lang, {
                  weekday: "long",
                })}: ${day.stamps} ${t("dashboard.week.stamps", {
                  count: day.stamps,
                })}`}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** A week with nothing in it is not seven empty bars. It is an unfilled card
 * the length of the owner's own reward — what a new paper card looks like —
 * and it says what filling up means without drawing a chart of zero. This is
 * the one punch mark left on this panel, and it is an illustration of the
 * product rather than a reading of it. */
function EmptyWeek({ cardLength }: { cardLength: number }) {
  const { t } = useTranslation();
  const marks = Math.max(3, Math.min(cardLength, 12));
  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: marks }).map((_, i) => (
          <PunchMark
            key={i}
            state={i === marks - 1 ? "reward" : "empty"}
            size={16}
          />
        ))}
      </div>
      <p className="text-sm text-ink-muted">
        {t("dashboard.activity.emptyPro")}
      </p>
    </>
  );
}

/** Up is worth saying out loud; down and level are said quietly. A slow week
 * is not the owner's mistake, and colouring it like a failure is the one thing
 * this page must never do. */
function Delta({ value }: { value: number }) {
  const { t } = useTranslation();
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        // `ok-bg`, not `ok/15`: the accent over a 15% wash of itself measures
        // 4.43:1 on the light panel and misses AA at 13px. `ok-bg` is the
        // ground this colour was measured against — 5.21:1 light, 10.44:1
        // dark — and it is the pair `Notice` already spends.
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem] font-semibold",
        up ? "bg-ok-bg text-ok" : "bg-ink/[0.07] text-ink-muted",
      )}
    >
      {value !== 0 && <Icon size={14} aria-hidden className="shrink-0" />}
      {value === 0
        ? t("dashboard.week.sameAsLast")
        : up
          ? t("dashboard.week.moreThanLast", { count: value })
          : t("dashboard.week.fewerThanLast", { count: Math.abs(value) })}
    </span>
  );
}
