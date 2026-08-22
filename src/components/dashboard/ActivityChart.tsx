import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

/**
 * Stamps a day, as a line — and the page's coarsest filter.
 *
 * The question this answers is the only one an owner has about a fortnight of
 * trade: is it going up. The table underneath carries the detail, and picking
 * a day here narrows that table to it, which is the fastest way into "what
 * happened on the Tuesday that spike is".
 *
 * Drawn at a measured pixel size rather than scaled from a fixed viewBox: a
 * scaled SVG turns the dots into ellipses and thins the stroke, and this has
 * to read at 320px. `WeekLedger` measures for the same reason.
 *
 * The window mirrors in Hebrew. Every other surface in this dashboard is
 * built from logical properties, and a chart hard-coded to run left-to-right
 * would be the single place the page stops following the direction it is read
 * in — so the SVG x positions are flipped and the overlaid controls ride
 * `inset-inline-start`, which flips itself.
 */

/** Plot box, and the room kept above it for the peak's own label. */
const PLOT_H = 124;
const PAD_TOP = 20;
/** Enough that the first and last dot are not clipped by the panel edge. */
const PAD_X = 9;
/** Date labels a 320px axis carries without them touching. */
const MAX_LABELS = 4;
/** Past this many days the dots start touching at 320px, so the line carries
 * the shape alone and only the chosen day keeps a marker. */
const MAX_DOTS = 20;
const DOT_R = 3;
/** The widest an hour of plot is allowed to get. Let loose in a desk-width
 * panel a fortnight puts its points a hundred pixels apart, which stops being
 * a line and becomes a row of unrelated marks. */
const MAX_PITCH = 46;

export interface ChartDay {
  /** Local midnight of the day this point counts. */
  date: Date;
  stamps: number;
}

export function ActivityChart({
  /** Oldest first — a line reads in one direction and it is not the feed's. */
  days,
  /** Local midnight of the day currently isolated, or null. */
  selectedDay = null,
  /** Called with a day's midnight, or null when the same day is picked again.
   * Omit to render the chart as a picture rather than as a control. */
  onSelectDay,
  /** What the line counts, for the screen-reader summary. */
  unitLabel,
  className,
}: {
  days: ChartDay[];
  selectedDay?: number | null;
  onSelectDay?: (day: number | null) => void;
  unitLabel: string;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const rtl = i18n.dir() === "rtl";

  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = box.current;
    if (!node) return;
    setWidth(node.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // One tab stop for the whole series, arrows within it — fourteen stops
  // before the table (thirty on a month) is not a keyboard path anyone would
  // use. Standard roving tabindex.
  const [roving, setRoving] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // Two points make a line; one makes a dot with nothing to say.
  const drawable = days.length >= 2 && width > 0;

  // `peak` floors at 1 so a fortnight of single stamps still has a scale to
  // sit on instead of dividing by zero.
  const peak = Math.max(1, ...days.map((d) => d.stamps));
  const inner = Math.max(0, width - PAD_X * 2);
  /** Fraction of the container, before any mirroring. */
  const fracAt = (i: number) =>
    days.length < 2 ? 0.5 : (PAD_X + (i / (days.length - 1)) * inner) / width;
  const xAt = (i: number) =>
    (rtl ? width : 0) + (rtl ? -1 : 1) * fracAt(i) * width;
  const yAt = (stamps: number) =>
    PAD_TOP + (1 - stamps / peak) * (PLOT_H - PAD_TOP);
  /** Where one day's hit area ends and the next begins: the midpoint between
   * their points, so clicking nearest-the-dot does what it looks like. */
  const edge = (i: number) =>
    i <= 0 ? 0 : i >= days.length ? 1 : (fracAt(i - 1) + fracAt(i)) / 2;

  const peakIndex = days.findIndex((d) => d.stamps === peak);
  const lastIndex = days.length - 1;
  const selectedIndex = days.findIndex((d) => d.date.getTime() === selectedDay);
  const withDots = days.length <= MAX_DOTS;

  const line = days
    .map(
      (d, i) =>
        `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)} ${yAt(d.stamps).toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${xAt(lastIndex).toFixed(1)} ${PLOT_H} L${xAt(0).toFixed(1)} ${PLOT_H} Z`;

  // Always both ends, evenly spaced between: the axis has to say where the
  // window starts and that it ends today.
  const labels: number[] = [];
  for (let k = 0; k < MAX_LABELS; k += 1) {
    const i = Math.round((k * lastIndex) / (MAX_LABELS - 1));
    if (!labels.includes(i)) labels.push(i);
  }

  const dayLabel = (i: number) =>
    days[i].date.toLocaleDateString(lang, { day: "numeric", month: "short" });

  function focusDay(next: number) {
    const clamped = Math.max(0, Math.min(lastIndex, next));
    setRoving(clamped);
    buttons.current[clamped]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent, i: number) {
    // Arrows move the way the key points, which in Hebrew is the opposite
    // way through the array — the axis is mirrored, and a reader pressing
    // "right" means the thing on their right.
    const forward = rtl ? -1 : 1;
    const moves: Record<string, number> = {
      ArrowRight: i + forward,
      ArrowLeft: i - forward,
      ArrowUp: i + 1,
      ArrowDown: i - 1,
      Home: 0,
      End: lastIndex,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    focusDay(moves[event.key]);
  }

  return (
    <div
      className={cn("flex flex-col", className)}
      style={{ maxWidth: days.length * MAX_PITCH }}
    >
      <div ref={box} className="relative w-full" style={{ height: PLOT_H }}>
        {drawable && (
          <>
            <svg
              width={width}
              height={PLOT_H}
              viewBox={`0 0 ${width} ${PLOT_H}`}
              aria-hidden="true"
              className="animate-fade-in block overflow-visible"
            >
              {/* The zero line. Without it a flat fortnight floats. */}
              <line
                x1={0}
                y1={PLOT_H}
                x2={width}
                y2={PLOT_H}
                className="stroke-border"
                strokeWidth={1}
              />
              <path d={area} className="fill-primary/[0.09]" />
              <path
                d={line}
                fill="none"
                className="stroke-primary"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {days.map((day, i) => {
                const chosen = i === selectedIndex;
                if (!withDots && !chosen && i !== lastIndex) return null;
                return (
                  <circle
                    key={i}
                    cx={xAt(i)}
                    cy={yAt(day.stamps)}
                    r={chosen ? DOT_R + 2 : i === lastIndex ? DOT_R + 1 : DOT_R}
                    className={cn(
                      "fill-primary",
                      // The chosen day and today are the two points lifted
                      // off the line — one because it is what the table is
                      // showing, the other because it is why the page was
                      // opened.
                      (chosen || i === lastIndex) && "stroke-surface",
                    )}
                    strokeWidth={chosen || i === lastIndex ? 2.5 : 0}
                  />
                );
              })}
              {/* The scale, said once where it is true, instead of a y axis
                  nobody reads. */}
              <text
                x={xAt(peakIndex)}
                y={yAt(peak) - 9}
                textAnchor="middle"
                className="fill-ink-muted font-mono text-[11px] tabular-nums"
              >
                {peak}
              </text>
            </svg>

            {onSelectDay && (
              <div className="absolute inset-0">
                {days.map((day, i) => {
                  const chosen = i === selectedIndex;
                  return (
                    <button
                      key={i}
                      ref={(node) => {
                        buttons.current[i] = node;
                      }}
                      type="button"
                      // One stop for the series; arrows move inside it.
                      tabIndex={i === roving ? 0 : -1}
                      aria-pressed={chosen}
                      aria-label={`${day.date.toLocaleDateString(lang, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}: ${day.stamps} ${unitLabel}`}
                      onFocus={() => setRoving(i)}
                      onKeyDown={(e) => onKeyDown(e, i)}
                      onClick={() =>
                        onSelectDay(chosen ? null : day.date.getTime())
                      }
                      className={cn(
                        "absolute inset-y-0 rounded-md transition-colors",
                        // The band is the affordance: nothing until the
                        // pointer or the focus ring arrives, so the chart
                        // reads as a chart until it is used as a control.
                        chosen ? "bg-primary/[0.10]" : "hover:bg-ink/[0.05]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                      )}
                      style={{
                        insetInlineStart: `${edge(i) * 100}%`,
                        width: `${(edge(i + 1) - edge(i)) * 100}%`,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {drawable && (
        <div aria-hidden="true" className="relative mt-2 h-4">
          {labels.map((i) => (
            <span
              key={i}
              className={cn(
                "absolute top-0 whitespace-nowrap text-[0.6875rem] ltr:-translate-x-1/2 rtl:translate-x-1/2",
                i === lastIndex
                  ? "font-semibold text-primary-text"
                  : "text-ink-subtle",
              )}
              style={{ insetInlineStart: `${fracAt(i) * 100}%` }}
            >
              {i === lastIndex ? t("dashboard.activity.today") : dayLabel(i)}
            </span>
          ))}
        </div>
      )}
      {/* Where the chart is a picture rather than a control there are no
          buttons carrying the readings, so the series is said in words
          instead. With `onSelectDay` the buttons are both the control and
          the better accessible rendering, and repeating them here would read
          the fortnight twice. */}
      {!onSelectDay && (
        <ul className="sr-only">
          {days.map((day) => (
            <li key={day.date.toISOString()}>
              {`${day.date.toLocaleDateString(lang, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}: ${day.stamps} ${unitLabel}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
