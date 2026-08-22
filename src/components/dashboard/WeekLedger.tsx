import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingDown, TrendingUp } from "lucide-react";
import { PunchMark } from "../marketing/PunchMark";
import { Figure } from "./primitives";
import { cn } from "../../lib/cn";

/**
 * The week, day by day.
 *
 * This replaces a single wrapped row of marks that answered only "how many".
 * A total is half the question: the one an owner is really asking at ₪59 a
 * month is *is it going up*, and after that *which days*. Both were already in
 * the activity sample the page fetches — the old panel reduced every timestamp
 * to one number and threw the shape away.
 *
 * It is still drawn in the product's own material rather than in a chart
 * library. Each row is one day and each mark is one stamp, the same mark the
 * card carries, so the row's length *is* the bar — no axis, no gridlines, and
 * a shut Saturday is a line with nothing on it. It reads as a page of a stamp
 * book, which is the object this replaces.
 *
 * Two things it deliberately does not do. It draws no empty guide circles out
 * to the busiest day: that would make the peak look like a target, and the
 * only target this product has is the reward. And a slow week is never red —
 * `danger` is for a request that failed, not for a quiet Tuesday.
 */

/** Above this many stamps in a day the marks stop being countable and start
 * being texture, so the whole week switches to bars — the same rule
 * `CardPunches` uses on one card. A busier shop is better served by length it
 * can compare than by forty circles it cannot count. The switch is per-week,
 * never per-row, so every day in one panel is always drawn the same way. */
const MARK_CAP = 14;

/** The mark and the space after it, and what the row spends on everything
 * that is not marks — the `w-14` day label, the `w-7` count, and the two
 * `gap-3`s between them. Kept beside the classes they mirror. */
const MARK_SIZE = 11;
const MARK_GAP = 3;
const ROW_CHROME = 56 + 12 + 12 + 28;

export interface WeekDay {
  /** Local midnight of the day this row counts. */
  date: Date;
  stamps: number;
}

export function WeekLedger({
  /** Newest first — today is the row an owner opened the page for. */
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
  // width, which pushes the marks off a phone. Hebrew writes its weekdays as
  // letters anyway, so `narrow` is both shorter and more native.
  const weekday = lang === "he" ? ("narrow" as const) : ("short" as const);
  const peak = Math.max(0, ...days.map((d) => d.stamps));

  // Whether the marks fit is a question about the space, not only about the
  // shop: a busy Friday that sits comfortably on a 390px phone runs straight
  // through the count column on a 320px one, and `PunchMark` does not shrink.
  // So the row is measured and the week falls back to bars when its widest
  // day would not fit. Bars ask for more room than marks, and the parent is
  // what caps both, so this settles rather than oscillates.
  const rowsRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  useLayoutEffect(() => {
    const node = rowsRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setMeasured(entry.contentRect.width),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const marksNeed = peak * (MARK_SIZE + MARK_GAP) - MARK_GAP;
  // Before the first measurement, assume the width this was drawn for. On
  // anything narrower the correction lands in the same paint.
  const marksFit = (measured ?? 375) - ROW_CHROME >= marksNeed;
  const asMarks = peak > 0 && peak <= MARK_CAP && marksFit;

  // The plot is as wide as the data needs and no wider. Allowed to fill a
  // desk-width panel, a four-mark row puts its count the better part of a
  // metre from its last mark, and a column that far away has stopped being an
  // axis. In mark mode that width is arithmetic — label, the busiest day's
  // marks, the count — with a floor so a very quiet week still reads as a
  // chart. Bars are proportional and set their own measure.
  const plotWidth = asMarks ? Math.max(240, marksNeed + ROW_CHROME) : 416;

  const todayKey = new Date().toDateString();
  const isToday = (day: WeekDay) => day.date.toDateString() === todayKey;

  return (
    <div className="flex flex-col gap-4">
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
          {/* The rows are decoration to a screen reader — seven day names and
              seven counts read one mark at a time is the worst version of
              this panel. The list below says the same thing in words. */}
          <div
            ref={rowsRef}
            aria-hidden="true"
            className="flex w-full flex-col"
            style={{ maxWidth: plotWidth }}
          >
            {days.map((day) => (
              <div
                key={day.date.toISOString()}
                className="flex min-h-[26px] items-center gap-3 py-1"
              >
                <span
                  className={cn(
                    "w-14 shrink-0 font-mono text-xs",
                    isToday(day)
                      ? "font-semibold text-primary-text"
                      : "text-ink-subtle",
                  )}
                >
                  {isToday(day)
                    ? t("dashboard.activity.today")
                    : day.date.toLocaleDateString(lang, { weekday })}
                </span>

                {day.stamps === 0 ? (
                  // A day with nothing on it is the printed guide circle, not
                  // blank space — what an unstamped square on a paper card
                  // looks like.
                  <span className="flex min-w-0 flex-1 items-center">
                    <PunchMark state="empty" size={MARK_SIZE} />
                  </span>
                ) : asMarks ? (
                  <span
                    className="flex min-w-0 flex-1 items-center"
                    style={{ gap: MARK_GAP }}
                  >
                    {Array.from({ length: day.stamps }).map((_, i) => (
                      <PunchMark key={i} state="stamped" size={MARK_SIZE} />
                    ))}
                  </span>
                ) : (
                  <span className="relative flex min-w-0 flex-1 items-center">
                    <span className="h-2 w-full rounded-full bg-ink/[0.06]" />
                    <span
                      className="absolute inset-y-0 start-0 my-auto h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.max(3, (day.stamps / peak) * 100)}%`,
                      }}
                    />
                  </span>
                )}

                <Figure className="w-7 shrink-0 text-end text-xs text-ink-muted">
                  {day.stamps}
                </Figure>
              </div>
            ))}
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

/** A week with nothing in it is not seven rows of zero. It is an unfilled card
 * the length of the owner's own reward — what a new paper card looks like —
 * and it says what filling up means without repeating one number seven
 * times. */
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
