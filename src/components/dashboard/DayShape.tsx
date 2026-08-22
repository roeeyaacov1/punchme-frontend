import { useTranslation } from "react-i18next";
import { PunchMark } from "../marketing/PunchMark";
import { Figure } from "./primitives";
import { cn } from "../../lib/cn";

/**
 * A day's trade, hour by hour.
 *
 * The activity feed answered "how many" and threw away "when" — every
 * timestamp was printed and none of them added up to anything. This is the
 * shape those timestamps already carried: one column per hour of the trading
 * day, one mark per stamp, stacked.
 *
 * It is drawn in the product's own material rather than in a chart library,
 * for the same reason `WeekLedger` is. The baseline row is the printed card —
 * an hour with nothing in it is the dashed guide circle, exactly what an
 * unstamped square looks like on paper — and the trade is ink pressed on top
 * of it. So the strip reads as a page of the stamp book whether the shop had
 * four customers or forty, and a quiet afternoon is a gap in the ink rather
 * than a bar of length zero.
 *
 * Dots rather than bars because a punch card's whole premise is that you can
 * count it: at four stamps you read the number off the column, and only when
 * counting stops working does the strip fall back to bars. There is no y
 * axis, because one mark is one stamp everywhere on the page — a taller
 * column is literally a busier hour, which a normalised bar can never be.
 *
 * The window (`startHour`, and the length of `hours`) is set once for the
 * whole page, not per day, so two days on one screen are the same chart.
 */

/** The mark and the space above it. Small: a phone is ~310px inside the
 * panel, and a 24-hour window has to fit in that. */
const MARK = 8;
const MARK_GAP = 2;
/** Above this in a single hour the marks stop being countable and start
 * being texture, so the strip switches to bars — the rule `WeekLedger` uses
 * on a week. Per strip, never per column: every hour in one day is always
 * drawn the same way. */
const MARK_CAP = 8;
const BAR_MAX = MARK_CAP * (MARK + MARK_GAP) - MARK_GAP;
/** Hour labels a 375px strip can carry without them touching. */
const MAX_TICKS = 4;
/** The widest an hour is allowed to get. Let loose in a desk-width panel an
 * eleven-hour day puts its columns a hundred and twenty pixels apart, and at
 * that spacing the marks stop being a shape and become eleven unrelated
 * specks — the same reason `WeekLedger` sizes its plot to the data rather
 * than to the panel. A phone is already at about this pitch, so the strip
 * ends up the same physical object on every screen. */
const MAX_PITCH = 26;
/** Enough of a stagger to read as the day filling up, short enough that the
 * whole strip has settled before the eye reaches the rows below. */
const COLUMN_MS = 22;
const STACK_MS = 30;

function hourLabel(hour: number, lang: string | undefined): string {
  // Locale decides 12- or 24-hour: "5 PM" in English, "17" in Hebrew.
  const label = new Date(2000, 0, 1, hour).toLocaleTimeString(lang, {
    hour: "numeric",
  });
  // A locale that writes an hour as a bare numeral needs its minutes to read
  // as a clock rather than as another count — "17" under a column of stamps
  // is a number, "17:00" is a time. One that already carries a meridiem
  // ("5 PM") says it without them, and stays shorter for it.
  return /^\d+$/.test(label) ? `${label}:00` : label;
}

export function DayShape({
  /** Stamps per hour, `hours[0]` being `startHour`. Already netted of
   * corrections and already clamped at zero — this draws trade, and an hour
   * that went below the line is an hour with nothing to show, not a shape
   * pointing down. */
  hours,
  startHour,
  className,
}: {
  hours: number[];
  startHour: number;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  const peak = Math.max(0, ...hours);
  // Nothing to distribute, so nothing to draw: a day whose every stamp was
  // gifted by a rule, and a day whose trade all landed inside one hour. In
  // the second case the strip would be one column and nine empty ones, and
  // the three rows underneath already say "just after five" faster than a
  // chart of it can.
  if (hours.filter((n) => n > 0).length < 2) return null;

  const asMarks = peak <= MARK_CAP;
  const peakHour = hours.indexOf(peak);
  const plotHeight = asMarks ? peak * (MARK + MARK_GAP) - MARK_GAP : BAR_MAX;

  // Regular ticks, except that the busiest hour always gets its own label and
  // clears a neighbour to keep it — naming the peak is most of why an owner
  // looks at this at all.
  const step = Math.max(1, Math.ceil(hours.length / MAX_TICKS));
  const ticks = new Set<number>();
  for (let i = 0; i < hours.length; i += step) ticks.add(i);
  for (const i of [...ticks]) if (Math.abs(i - peakHour) < 2) ticks.delete(i);
  ticks.add(peakHour);

  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      style={{ maxWidth: hours.length * MAX_PITCH }}
    >
      {/* Read one hour at a time this is seven "zero"s and a number; the
          rows below carry every timestamp in words already, so the strip
          says only the one thing they cannot say at a glance. */}
      <div
        aria-hidden="true"
        // The hairline is what turns a constellation of dots into a day: it
        // is the edge of the card the marks are pressed onto, and without it
        // an hour with nothing in it reads as blank page rather than as a
        // gap between two rushes.
        className="flex items-end border-b border-border pb-[3px]"
        style={{ height: plotHeight }}
      >
        {hours.map((stamps, i) => (
          <div
            key={i}
            className="flex min-w-0 flex-1 flex-col items-center justify-end"
            style={{ gap: MARK_GAP }}
          >
            {stamps === 0 ? (
              <PunchMark state="empty" size={MARK} />
            ) : asMarks ? (
              // Bottom-most lands first, so a tall hour builds upward.
              Array.from({ length: stamps }).map((_, row) => (
                <PunchMark
                  key={row}
                  state="stamped"
                  size={MARK}
                  className="animate-stamp-in"
                  style={{
                    animationDelay: `${i * COLUMN_MS + (stamps - 1 - row) * STACK_MS}ms`,
                  }}
                />
              ))
            ) : (
              // A stamp stretched, not a new object: same width as the mark
              // it replaces, so both densities read as one chart. Bars are
              // the only part of this that normalises — within the day it is
              // exact, and the total above the panel carries the scale.
              <span
                className="animate-fade-in rounded-full bg-primary"
                style={{
                  width: MARK,
                  height: Math.max(MARK, (stamps / peak) * BAR_MAX),
                  animationDelay: `${i * COLUMN_MS}ms`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Own row of the same columns, so a label is always centred under the
          hour it names in either writing direction — `flex-direction: row`
          is logical, so the whole strip mirrors in Hebrew and the day runs
          the way the page is read. */}
      <div aria-hidden="true" className="flex">
        {hours.map((_, i) => (
          <span key={i} className="min-w-0 flex-1 text-center">
            {ticks.has(i) && (
              <Figure
                dir="ltr"
                className={cn(
                  "whitespace-nowrap text-[0.625rem] leading-none",
                  i === peakHour
                    ? "font-semibold text-primary-text"
                    : "text-ink-subtle",
                )}
              >
                {hourLabel(startHour + i, lang)}
              </Figure>
            )}
          </span>
        ))}
      </div>

      <p className="sr-only">
        {t("dashboard.activity.busiest", {
          time: hourLabel(startHour + peakHour, lang),
        })}
      </p>
    </div>
  );
}
