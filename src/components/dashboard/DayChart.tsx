import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

/** One day of the line: its local midnight, and its value, or null for a day
 * the walk didn't load whole. A missing day is never a zero. */
export interface ChartDay {
  day: number;
  value: number | null;
}

/** The plot, and the room above it for the labels on the peak and on today. */
const PLOT_H = 132;
const PAD_TOP = 30;
/** Enough that the first and last points aren't clipped by the panel's edge. */
const PAD_X = 10;
/** Dates a 320px axis carries without them touching. */
const MAX_LABELS = 4;
/** Closer than this to today, the peak's label would sit on today's. */
const LABEL_ROOM = 64;
/** --duration-gentle: one drawing crossfading into the next. */
const FADE_MS = 150;

/**
 * A value a day, as one line in ink, and the dataviz rules the counter brief
 * settled for it.
 *
 * Time runs like the numbers in both languages: oldest at the left, today at
 * the right. So the plot and its axis sit in a `dir="ltr"` box and never
 * mirror, while the readout above it and the panel around it follow the
 * page. Only two values are printed on the line, the peak once and today at
 * its end; the readout says any other day, leading with the value.
 *
 * One hit surface covers the plot and snaps to the nearest day, so no day is
 * a 14px target. With `onSelectDay` it is a control: a horizontal listbox
 * whose arrows move a day earlier or later (right is later, in Hebrew too,
 * because that is where later is drawn) and Enter picks it. Without, it is a
 * picture, focusable so the keyboard can read it the way a pointer does,
 * with the days as a list for a screen reader.
 *
 * A finger reads it by dragging across: the surface keeps sideways drags
 * for itself and leaves scrolling up and down, and pinch-zoom, to the
 * browser. A long press selects nothing on the plot.
 *
 * Nothing on it draws itself in. A new `crossfade` (Activity's period)
 * crossfades the last drawing into the next one in 150ms, opacity only, so
 * the same with reduced motion; anything else that changes the days, a
 * filter or a picked day, redraws at once.
 *
 * Drawn at its measured pixel size rather than scaled from a viewBox, so the
 * stroke and the points stay round at 320px.
 */
export function DayChart({
  days,
  label,
  summary,
  valueLabel,
  dayLabel,
  axisLabel,
  selectedDay = null,
  onSelectDay,
  crossfade,
  className,
}: {
  /** Oldest first. */
  days: ChartDay[];
  /** What the chart is: its title, for the focus stop. */
  label: string;
  /** One line said first to a screen reader: what the line shows. */
  summary: string;
  /** The value in words: "23 people", "1 stamp". */
  valueLabel: (value: number) => string;
  /** The day in words for the readout: "Today", "Tue, 14 Oct". */
  dayLabel: (day: number) => string;
  /** A short date for the axis: "14 Oct". */
  axisLabel: (day: number) => string;
  /** Local midnight of the picked day, or null. */
  selectedDay?: number | null;
  /** Called with a day, or null when the picked day is picked again. Omit
   * for a picture rather than a control. */
  onSelectDay?: (day: number | null) => void;
  /** A new value crossfades the last drawing into the next one: the period
   * the days were read for. Omit, and every change redraws at once. */
  crossfade?: string | number;
  className?: string;
}) {
  const { t } = useTranslation();
  const id = useId();

  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = box.current;
    if (!node) return;
    setWidth(node.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const [active, setActive] = useState<number | null>(null);

  // The days drawn under the current `crossfade`, and the drawing they
  // replaced, kept for as long as it takes to fade.
  const [drawn, setDrawn] = useState({ key: crossfade, days });
  const [fading, setFading] = useState<typeof drawn | null>(null);
  if (crossfade !== undefined && (drawn.key !== crossfade || drawn.days !== days)) {
    if (drawn.key !== crossfade) setFading(drawn);
    setDrawn({ key: crossfade, days });
  }
  useEffect(() => {
    if (!fading) return;
    const timer = window.setTimeout(() => setFading(null), FADE_MS + 40);
    return () => window.clearTimeout(timer);
  }, [fading]);

  const at = layOut(days, width);
  const { last, inner, drawable } = at;
  const selectedIndex = selectedDay === null ? -1 : days.findIndex((d) => d.day === selectedDay);
  const shown = active ?? (selectedIndex >= 0 ? selectedIndex : last);
  const shownDay = days[shown];

  const readout = (i: number) => {
    const d = days[i];
    const day = dayLabel(d.day);
    return d.value === null
      ? t("dashboard.chart.readout", { value: t("dashboard.chart.notLoaded"), day })
      : t("dashboard.chart.readout", { value: valueLabel(d.value), day });
  };

  const indexAt = (clientX: number) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect || last <= 0 || inner <= 0) return last;
    return Math.max(0, Math.min(last, Math.round(((clientX - rect.left - PAD_X) / inner) * last)));
  };

  const pick = (i: number) => {
    if (!onSelectDay || days[i]?.value === null) return;
    onSelectDay(days[i].day === selectedDay ? null : days[i].day);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = active ?? shown;
    // The plot runs left to right in both languages, so the arrows do too.
    const moves: Record<string, number> = {
      ArrowRight: from + 1,
      ArrowLeft: from - 1,
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      setActive(Math.max(0, Math.min(last, moves[event.key])));
    } else if (onSelectDay && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      pick(from);
    }
  };

  const surface = {
    tabIndex: 0,
    onFocus: () => setActive((current) => current ?? shown),
    onBlur: () => setActive(null),
    onKeyDown,
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => setActive(indexAt(event.clientX)),
    onPointerLeave: () => setActive(null),
    onClick: (event: MouseEvent<HTMLDivElement>) => pick(indexAt(event.clientX)),
  };

  // The drawing being replaced fades out under the new one fading in. Each
  // new drawing is a new layer, so a second change mid-fade starts its own.
  const leavingAt = fading && layOut(fading.days, width);
  const leaving = fading && leavingAt?.drawable ? { ...fading, at: leavingAt } : null;
  const arriving = leaving ? "animate-gentle-in" : undefined;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* The day under the pointer or the focus, leading with its value. For
          the eye: a screen reader reads the days themselves. */}
      <p aria-hidden className="type-label min-h-[1.4em] text-ink-muted">
        {shownDay && <span className="text-ink">{readout(shown)}</span>}
      </p>

      <div dir="ltr" className="flex select-none flex-col gap-2">
        <div ref={box} className="relative w-full" style={{ height: PLOT_H }}>
          {drawable && (
            <>
              {/* The baseline, one step off the panel. A flat fortnight
                  would float without it. It stays put under a crossfade. */}
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-border-strong" />
              {leaving && (
                <Drawing
                  key={`from-${leaving.key}`}
                  days={leaving.days}
                  at={leaving.at}
                  width={width}
                  dayLabel={dayLabel}
                  hidden
                  className="animate-gentle-out"
                />
              )}
              <Drawing
                key={String(crossfade)}
                days={days}
                at={at}
                width={width}
                selectedIndex={selectedIndex}
                active={active}
                dayLabel={dayLabel}
                className={arriving}
              />

              {onSelectDay ? (
                <div
                  {...surface}
                  role="listbox"
                  aria-orientation="horizontal"
                  aria-label={label}
                  aria-describedby={`${id}-summary`}
                  aria-activedescendant={`${id}-day-${active ?? shown}`}
                  className="absolute inset-0 cursor-pointer touch-pan-y touch-pinch-zoom rounded-field outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  {days.map((d, i) => (
                    <span
                      key={d.day}
                      id={`${id}-day-${i}`}
                      role="option"
                      aria-selected={i === selectedIndex}
                      aria-disabled={d.value === null || undefined}
                      className="sr-only"
                    >
                      {readout(i)}
                    </span>
                  ))}
                </div>
              ) : (
                <div
                  {...surface}
                  role="img"
                  aria-label={summary}
                  className="absolute inset-0 touch-pan-y touch-pinch-zoom rounded-field outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                />
              )}
            </>
          )}
        </div>

        {drawable && (
          <div aria-hidden className="relative h-5">
            {leaving && (
              <Axis
                key={`from-${leaving.key}`}
                days={leaving.days}
                at={leaving.at}
                width={width}
                dayLabel={dayLabel}
                axisLabel={axisLabel}
                className="animate-gentle-out"
              />
            )}
            <Axis
              key={String(crossfade)}
              days={days}
              at={at}
              width={width}
              dayLabel={dayLabel}
              axisLabel={axisLabel}
              className={arriving}
            />
          </div>
        )}
      </div>

      <p id={`${id}-summary`} className="sr-only">
        {summary}
      </p>
      {!onSelectDay && (
        <ul className="sr-only">
          {days.map((d, i) => (
            <li key={d.day}>{readout(i)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Where everything on the plot goes, for one series at one width. */
function layOut(days: ChartDay[], width: number) {
  const last = days.length - 1;
  const values = days.map((d) => d.value).filter((v): v is number => v !== null);
  // Floors at 1, so a fortnight of single stamps still has a scale.
  const peak = Math.max(1, ...values);
  const inner = Math.max(0, width - PAD_X * 2);
  const xAt = (i: number) => (last <= 0 ? width / 2 : PAD_X + (i / last) * inner);
  const yAt = (value: number) => PAD_TOP + (1 - value / peak) * (PLOT_H - PAD_TOP);

  // The line breaks where a day wasn't loaded, rather than bridging it.
  const runs: { from: number; to: number }[] = [];
  days.forEach((d, i) => {
    if (d.value === null) return;
    const run = runs[runs.length - 1];
    if (run && run.to === i - 1) run.to = i;
    else runs.push({ from: i, to: i });
  });
  const path = (from: number, to: number) =>
    days
      .slice(from, to + 1)
      .map((d, k) => `${k === 0 ? "M" : "L"}${xAt(from + k).toFixed(1)} ${yAt(d.value ?? 0).toFixed(1)}`)
      .join(" ");
  const lines = runs.map((r) => path(r.from, r.to));
  const areas = runs.map((r) => `${path(r.from, r.to)} L${xAt(r.to).toFixed(1)} ${PLOT_H} L${xAt(r.from).toFixed(1)} ${PLOT_H} Z`);

  // The days the walk didn't reach whole come first: a band says so.
  const firstLoaded = days.findIndex((d) => d.value !== null);
  const unloaded = firstLoaded === -1 ? days.length : firstLoaded;
  const bandEnd = unloaded === 0 ? 0 : unloaded >= days.length ? width : (xAt(unloaded - 1) + xAt(unloaded)) / 2;

  const todayValue = days[last]?.value ?? null;
  const peakIndex = values.length ? days.findIndex((d) => d.value === peak) : -1;
  const showPeak =
    peakIndex >= 0 && peakIndex !== last && (todayValue === null || xAt(last) - xAt(peakIndex) > LABEL_ROOM);

  const labels: number[] = [];
  for (let k = 0; k < MAX_LABELS; k += 1) {
    const i = Math.round((k * last) / (MAX_LABELS - 1));
    if (!labels.includes(i)) labels.push(i);
  }

  return {
    last,
    inner,
    peak,
    xAt,
    yAt,
    lines,
    areas,
    unloaded,
    bandEnd,
    todayValue,
    peakIndex,
    showPeak,
    labels,
    drawable: days.length >= 2 && width > 0,
  };
}

type Layout = ReturnType<typeof layOut>;

/**
 * One series, drawn: the band over the days that weren't loaded, the line
 * over its area, the picked and pointed days, today, and the labels on the
 * peak and on today. It fills the plot, so a drawing on its way out can fade
 * under the next one; that one is `hidden` from a screen reader.
 */
function Drawing({
  days,
  at,
  width,
  selectedIndex = -1,
  active = null,
  dayLabel,
  hidden,
  className,
}: {
  days: ChartDay[];
  at: Layout;
  width: number;
  selectedIndex?: number;
  active?: number | null;
  dayLabel: (day: number) => string;
  hidden?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);
  const dir = i18n.dir();
  const { last, inner, peak, xAt, yAt, lines, areas, unloaded, bandEnd, todayValue, peakIndex, showPeak } = at;

  return (
    <div aria-hidden={hidden || undefined} className={cn("pointer-events-none absolute inset-0", className)}>
      <svg width={width} height={PLOT_H} viewBox={`0 0 ${width} ${PLOT_H}`} aria-hidden className="block overflow-visible">
        {bandEnd > 0 && <rect x={0} y={0} width={bandEnd} height={PLOT_H} className="fill-ink/[0.05]" />}
        {selectedIndex >= 0 && (
          <rect
            x={xAt(selectedIndex) - Math.max(8, inner / Math.max(1, last) / 2)}
            y={0}
            width={Math.max(16, inner / Math.max(1, last))}
            height={PLOT_H}
            rx={6}
            className="fill-ink/[0.08]"
          />
        )}
        {areas.map((d) => (
          <path key={d} d={d} className="fill-ink/[0.08]" />
        ))}
        {lines.map((d) => (
          <path key={d} d={d} fill="none" className="stroke-ink" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {active !== null && (
          <line x1={xAt(active)} y1={0} x2={xAt(active)} y2={PLOT_H} className="stroke-ink-muted" strokeWidth={1} strokeDasharray="3 3" />
        )}
        {[selectedIndex, active].map(
          (i, k) =>
            i !== null &&
            i >= 0 &&
            i !== last &&
            days[i].value !== null && (
              <circle key={k} cx={xAt(i)} cy={yAt(days[i].value ?? 0)} r={4} className="fill-ink stroke-surface" strokeWidth={2} />
            ),
        )}
        {todayValue !== null && (
          // Today, lifted off the line: 8px inside a 2px ring of the panel.
          <circle cx={xAt(last)} cy={yAt(todayValue)} r={5} className="fill-ink stroke-surface" strokeWidth={2} />
        )}
      </svg>

      {/* Words inside the left-to-right plot: placed by the plot, read in
          the page's own direction. */}
      {unloaded > 0 && bandEnd > 56 && (
        <span
          className="type-tag pointer-events-none absolute bottom-2 text-center text-ink-muted"
          style={{ insetInlineStart: 4, width: bandEnd - 8 }}
        >
          <bdi dir={dir}>{t("dashboard.chart.notLoaded")}</bdi>
        </span>
      )}
      {showPeak && (
        <span
          className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap font-heading text-[0.8125rem] font-medium tabular-nums text-ink-muted"
          style={{ insetInlineStart: xAt(peakIndex), top: Math.max(0, yAt(peak) - 24) }}
        >
          {number.format(peak)}
        </span>
      )}
      {todayValue !== null && (
        <span
          className="pointer-events-none absolute end-0 whitespace-nowrap font-heading text-[0.8125rem] font-medium tabular-nums text-ink"
          style={{ top: Math.max(0, yAt(todayValue) - 26) }}
        >
          <bdi dir={dir}>{t("dashboard.chart.end", { day: dayLabel(days[last].day), value: number.format(todayValue) })}</bdi>
        </span>
      )}
    </div>
  );
}

/** The dates under the plot, as many as fit a 320px axis, today's by name. */
function Axis({
  days,
  at,
  width,
  dayLabel,
  axisLabel,
  className,
}: {
  days: ChartDay[];
  at: Layout;
  width: number;
  dayLabel: (day: number) => string;
  axisLabel: (day: number) => string;
  className?: string;
}) {
  const { i18n } = useTranslation();
  const dir = i18n.dir();
  const { labels, last, xAt } = at;

  return (
    <div className={cn("absolute inset-0", className)}>
      {labels.map((i, k) => (
        <span
          key={i}
          className={cn(
            "type-tag absolute top-0 whitespace-nowrap",
            k === 0 ? "" : i === last ? "-translate-x-full" : "-translate-x-1/2",
            i === last ? "text-ink" : "text-ink-muted",
          )}
          style={{ insetInlineStart: k === 0 ? 0 : i === last ? width : xAt(i) }}
        >
          <bdi dir={dir}>{i === last ? dayLabel(days[i].day) : axisLabel(days[i].day)}</bdi>
        </span>
      ))}
    </div>
  );
}
