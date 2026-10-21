import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import type { Week } from "../../routes/dashboard/overviewBrief";
import { Badge } from "../kit/Badge";
import { Figure } from "../kit/Figure";
import { StampRow } from "../kit/StampRow";
import { cn } from "../../lib/cn";

/** The plot's height; the bars are measured against it. */
const PLOT_H = 96;

/**
 * The week, day by day: the total, against last week, and seven bars.
 *
 * Bars in ink, never coral, at most 24px wide with a 4px top and a square
 * base, today at the right in both languages: the plot sits in a `dir="ltr"`
 * box, like every chart on these pages, while the words around it follow the
 * page. The peak is labelled once, the weekdays at 13px. A day the walk
 * didn't load whole has a dashed slot, never an empty one that would read
 * as a quiet day.
 *
 * A week with nothing in it isn't seven empty bars: it is the owner's own
 * card, unfilled, the length of their reward. And a slow week is never red.
 */
export function WeekLedger({ week, cardLength }: { week: Week; cardLength: number }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage;
  const dir = i18n.dir();
  const number = new Intl.NumberFormat(language);
  // Hebrew writes its weekdays as letters, which also fit a 24px bar.
  const weekday = language === "he" ? ("narrow" as const) : ("short" as const);
  const peak = Math.max(0, ...week.days.filter((d) => d.loaded).map((d) => d.stamps));
  const peakIndex = peak > 0 ? week.days.findIndex((d) => d.loaded && d.stamps === peak) : -1;
  const last = week.days.length - 1;
  const empty = week.total === 0 && !week.capped && week.days.every((d) => d.loaded);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <span className="flex flex-col">
          {week.capped && <span className="type-tag text-ink-muted">{t("dashboard.overview.atLeast")}</span>}
          <Figure size="stat" value={number.format(week.total)} />
        </span>
        <span className="type-body pb-1 text-ink-muted">{t("dashboard.week.stamps", { count: week.total })}</span>
        {week.delta !== null && (
          <span className="pb-1">
            {week.delta > 0 ? (
              // A rise is said out loud; a fall or no change, quietly.
              <Badge tone="ok" icon={<TrendingUp aria-hidden />}>
                {t("dashboard.week.moreThanLast", { count: week.delta })}
              </Badge>
            ) : (
              <span className="text-sm text-ink-muted">
                {week.delta === 0
                  ? t("dashboard.week.sameAsLast")
                  : t("dashboard.week.fewerThanLast", { count: Math.abs(week.delta) })}
              </span>
            )}
          </span>
        )}
      </div>

      {empty ? (
        <div className="flex flex-col gap-3">
          <div className="w-full max-w-[18rem]">
            <StampRow total={Math.max(2, Math.min(cardLength, 12))} filled={0} />
          </div>
          <p className="text-sm text-ink-muted">{t("dashboard.activity.emptyPro")}</p>
        </div>
      ) : (
        <>
          <div dir="ltr" aria-hidden className="flex flex-col gap-2">
            <div className="flex gap-1" style={{ height: PLOT_H + 20 }}>
              {week.days.map((day, i) => (
                <div key={day.date.getTime()} className="flex flex-1 flex-col items-center justify-end gap-1">
                  {i === peakIndex && (
                    <span className="font-heading text-[0.8125rem] font-medium tabular-nums text-ink-muted">
                      {number.format(peak)}
                    </span>
                  )}
                  {day.loaded ? (
                    day.stamps > 0 && (
                      <span
                        className="w-full max-w-6 rounded-t bg-ink"
                        style={{ height: Math.max(4, (day.stamps / Math.max(1, peak)) * PLOT_H) }}
                      />
                    )
                  ) : (
                    <span className="h-full w-full max-w-6 rounded-t border border-dashed border-border-strong" />
                  )}
                </div>
              ))}
            </div>
            <div className="h-px bg-border-strong" />
            <div className="flex gap-1">
              {week.days.map((day, i) => (
                <span
                  key={day.date.getTime()}
                  className={cn("type-tag flex-1 whitespace-nowrap text-center", i === last ? "text-ink" : "text-ink-muted")}
                >
                  <bdi dir={dir}>
                    {i === last ? t("dashboard.activity.today") : day.date.toLocaleDateString(language, { weekday })}
                  </bdi>
                </span>
              ))}
            </div>
          </div>
          <ul className="sr-only">
            {week.days.map((day) => (
              <li key={day.date.getTime()}>
                {t("dashboard.chart.readout", {
                  value: day.loaded
                    ? t("dashboard.activity.stampsCount", { count: day.stamps })
                    : t("dashboard.chart.notLoaded"),
                  day: day.date.toLocaleDateString(language, { weekday: "long" }),
                })}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
