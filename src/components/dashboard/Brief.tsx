import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { focusRing } from "../marketing/primitives";
import { Panel, PanelHeader } from "./primitives";
import { cn } from "../../lib/cn";

/**
 * The brief — the two panels at the top of the overview.
 *
 * The owner's question at ₪99 a month is never "how many stamps", it is "are
 * people coming back". `BriefPanel` answers it in one sentence and then shows
 * its working; `WorthDoing` turns what is left into the two or three things
 * that are actually worth their morning.
 *
 * Both are ordinary forms — a figure, a sentence, a list of rows — rather
 * than anything drawn in punch marks. The punch mark is the landing page's
 * material and the card's; on a working surface it costs a decode before it
 * says anything. See `ActivityChart` for the same call.
 */

/** The headline figure and its sentence. Mirrors the week ledger's header so
 * the two panels read as the same instrument at two zoom levels. */
export function BriefPanel({
  days,
  returned,
  delta,
  capped,
  stats,
}: {
  days: number;
  returned: number;
  /** Against the window before it, or null when the sample could not prove
   * what that window held. Never guessed. */
  delta: number | null;
  capped: boolean;
  /** `capped` per figure, not per panel: the roster figures are exact even
   * when the activity walk fell short, and putting a `+` on a number we can
   * prove would be the same lie in the other direction. */
  stats: {
    label: string;
    value: number;
    accent?: boolean;
    capped?: boolean;
  }[];
}) {
  const { t } = useTranslation();

  return (
    <Panel className="p-5 sm:p-6">
      <PanelHeader
        title={t("dashboard.brief.title", { days })}
        hint={t("dashboard.brief.hint")}
      />

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
        {returned === 0 ? (
          // A bare 0 beside "nobody came back" says the same thing twice, and
          // the digit is the harsher half. The sentence alone is enough.
          <p className="t-card-title text-ink">
            {t("dashboard.brief.verdictNone")}
          </p>
        ) : (
          <>
            {/* `t-stat` bare — it already carries tabular figures, and
                wrapping it in `Figure` would quietly set it in mono. */}
            <span className="t-stat text-ink">
              {returned}
              {capped ? "+" : ""}
            </span>
            <p className="text-ink-muted">
              {t("dashboard.brief.verdict", { count: returned })}
            </p>
          </>
        )}
        {delta !== null && <Delta value={delta} days={days} />}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-xs text-ink-subtle">{stat.label}</dt>
            <dd
              className={cn(
                "font-heading text-xl font-bold tabular-nums",
                stat.accent && stat.value > 0 ? "text-primary-text" : "text-ink",
              )}
            >
              {stat.value}
              {stat.capped ? "+" : ""}
            </dd>
          </div>
        ))}
      </dl>

      {capped && (
        <p className="mt-3 text-xs text-ink-subtle">
          {t("dashboard.brief.capped")}
        </p>
      )}
    </Panel>
  );
}

/** Up is worth saying out loud; down and level are said quietly. A slow month
 * is not the owner's mistake, and colouring it like a failure is the one
 * thing this page must never do. Same rule as the week ledger. */
function Delta({ value, days }: { value: number; days: number }) {
  const { t } = useTranslation();
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        // `ok-bg`, not `ok/15`: the accent over a 15% wash of itself misses
        // AA at this size. `ok-bg` is the ground this colour was measured on.
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem] font-semibold",
        up ? "bg-ok-bg text-ok" : "bg-ink/[0.07] text-ink-muted",
      )}
    >
      {value !== 0 && <Icon size={14} aria-hidden className="shrink-0" />}
      {value === 0
        ? t("dashboard.brief.sameAsBefore", { days })
        : up
          ? t("dashboard.brief.moreThanBefore", { count: value, days })
          : t("dashboard.brief.fewerThanBefore", { count: Math.abs(value), days })}
    </span>
  );
}

export interface TodoRow {
  key: string;
  /** The whole point, in one sentence an owner reads without decoding. */
  body: string;
  /** Where the sentence leads, and what to call it. Omitted for a row that
   * is a heads-up rather than a job. */
  to?: string;
  cta?: string;
  icon: ReactNode;
  /** A quiet till is the one row here that is closer to a fault than to an
   * opportunity, so it is the only one allowed to warn. */
  tone?: "neutral" | "warn";
}

/**
 * The short list of things that are worth the owner's morning.
 *
 * Every row is something no other panel says: who has drifted away, whose
 * birthday is coming, whether anything is being scanned at all. Who is close
 * to a reward is deliberately *not* here — the panel below names them, and a
 * count of the same people higher up the page is a second thing to read for
 * no second piece of information.
 *
 * An empty list is a real answer and gets said out loud, because "nothing
 * needs you" is worth more to a solo operator than a panel that quietly
 * disappears and leaves them wondering whether it failed to load.
 */
export function WorthDoing({ rows }: { rows: TodoRow[] }) {
  const { t } = useTranslation();

  return (
    <Panel className="p-5 sm:p-6">
      <PanelHeader title={t("dashboard.today.title")} />
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">{t("dashboard.today.clear")}</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.key}
              className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 shrink-0",
                    row.tone === "warn" ? "text-warn" : "text-ink-subtle",
                  )}
                  aria-hidden
                >
                  {row.icon}
                </span>
                <p className="min-w-0 text-sm text-ink">{row.body}</p>
              </div>
              {row.to && row.cta && (
                <Link
                  to={row.to}
                  className={cn(
                    "inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-lg text-sm font-semibold text-primary-text hover:underline",
                    focusRing,
                  )}
                >
                  {row.cta}
                  <ArrowRight size={15} aria-hidden className="rtl:-scale-x-100" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
