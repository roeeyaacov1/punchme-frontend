import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

/**
 * Stamps a day, as a line.
 *
 * The question this answers is the only one an owner has about a fortnight of
 * trade — is it going up — and a line is the one shape that answers it before
 * you have read a single number. The table underneath carries the detail; this
 * carries the direction.
 *
 * Drawn at a measured pixel size rather than scaled from a fixed viewBox: a
 * scaled SVG turns the dots into ellipses and thins the stroke on a phone, and
 * this has to read at 320px. `WeekLedger` measures for the same reason.
 *
 * The window mirrors in Hebrew. Every other surface in this dashboard is built
 * from logical properties, and a chart hard-coded to run left-to-right would be
 * the single place the page stops following the direction it is read in — so
 * the x positions are flipped and the labels ride `inset-inline-start`, which
 * flips itself.
 */

/** Plot box, and the room kept above it for the peak's own label. */
const PLOT_H = 124;
const PAD_TOP = 20;
/** Enough that the first and last dot are not clipped by the panel edge. */
const PAD_X = 9;
/** Date labels a 320px axis carries without them touching. */
const MAX_LABELS = 4;
const DOT_R = 3;

export interface ChartDay {
  /** Local midnight of the day this point counts. */
  date: Date;
  stamps: number;
}

export function ActivityChart({
  /** Oldest first — a line reads in one direction and it is not the feed's. */
  days,
  className,
}: {
  days: ChartDay[];
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

  // Two points make a line; one makes a dot with nothing to say.
  const drawable = days.length >= 2 && width > 0;

  // `peak` floors at 1 so a fortnight of single stamps still has a scale to
  // sit on instead of dividing by zero.
  const peak = Math.max(1, ...days.map((d) => d.stamps));
  const inner = Math.max(0, width - PAD_X * 2);
  /** Fraction of the container, before any mirroring. */
  const fracAt = (i: number) =>
    days.length < 2 ? 0.5 : (PAD_X + (i / (days.length - 1)) * inner) / width;
  const xAt = (i: number) => (rtl ? width : 0) + (rtl ? -1 : 1) * fracAt(i) * width;
  const yAt = (stamps: number) =>
    PAD_TOP + (1 - stamps / peak) * (PLOT_H - PAD_TOP);

  const peakIndex = days.findIndex((d) => d.stamps === peak);
  const lastIndex = days.length - 1;

  const line = days
    .map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)} ${yAt(d.stamps).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${xAt(lastIndex).toFixed(1)} ${PLOT_H} L${xAt(0).toFixed(1)} ${PLOT_H} Z`;

  // Always both ends, evenly spaced between: the axis has to say where the
  // fortnight starts and that it ends today.
  const labels: number[] = [];
  for (let k = 0; k < MAX_LABELS; k += 1) {
    const i = Math.round((k * lastIndex) / (MAX_LABELS - 1));
    if (!labels.includes(i)) labels.push(i);
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div ref={box} className="relative w-full">
        {drawable && (
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
            {days.map((day, i) => (
              <circle
                key={i}
                cx={xAt(i)}
                cy={yAt(day.stamps)}
                r={i === lastIndex ? DOT_R + 1 : DOT_R}
                className={cn(
                  "fill-primary",
                  // Today is the point an owner opened the page for, so it is
                  // the one lifted off the line.
                  i === lastIndex && "stroke-surface",
                )}
                strokeWidth={i === lastIndex ? 2.5 : 0}
              />
            ))}
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
              {i === lastIndex
                ? t("dashboard.activity.today")
                : days[i].date.toLocaleDateString(lang, {
                    day: "numeric",
                    month: "short",
                  })}
            </span>
          ))}
        </div>
      )}

      {/* The line in words. Fourteen readings is a long listen, but it is the
          only way this panel exists at all for a screen reader. */}
      <ul className="sr-only">
        {days.map((day) => (
          <li key={day.date.toISOString()}>
            {`${day.date.toLocaleDateString(lang, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}: ${day.stamps} ${t("dashboard.week.stamps", {
              count: day.stamps,
            })}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
