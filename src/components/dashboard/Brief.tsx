import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { focusRing } from "../marketing/primitives";
import { Panel, PanelHeader } from "./primitives";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { cn } from "../../lib/cn";

/**
 * The brief — the band at the top of the overview, and the list under it.
 *
 * The owner's question at ₪99 a month is never "how many stamps", it is "are
 * people coming back". `BriefBand` answers it in one sentence and shows its
 * working; `WorthDoing` turns what is left into the two or three things worth
 * their morning.
 *
 * **Why this one surface is loud.** `AppShowcase` on the landing page — the
 * dashboard we sell — puts the owner's headline number on a violet-to-magenta
 * card, and the real dashboard answered with a row of flat white panels that
 * all weighed the same. This is the promised surface, delivered: one band,
 * dark in *both* themes, and everything below it stays quiet. A brief is a
 * brief whatever the theme is set to.
 *
 * **The floor is the shop's own month.** The horizon along the bottom of the
 * band is this business's thirty days, people per day. It is not an ornament
 * that happens to look like data — it is the data, at the weight of an
 * ornament, so no two owners are shown the same hero and nobody has to decode
 * anything to get the point of it.
 *
 * **Colour means one thing each.** Emerald is growth, violet is activity,
 * gold is the reward, white is the roster. It is carried by a 2px rule over
 * each readout rather than by the figures themselves — emerald text on
 * magenta is unreadable at any size, and the rule costs nothing to read.
 *
 * Everything with words in it stays an ordinary form. See `ActivityChart`
 * for the same call: the design effort goes into what the figures *say*.
 */

/** The band's own colours. Fixed rather than tokenised because the band does
 * not change with the theme — same reason `brand.*` is fixed in the config,
 * and the reason the hue rules below are hexes rather than `reward`/`ok`:
 * those flip per theme, and this ground never does.
 *
 * Only two text colours appear on the band, both measured against both stops
 * of `.grad-brief` (ratios in src/index.css): `text-white` for figures and
 * `text-brand-on-band` for the labels around them. Never white-with-an-alpha
 * — that composites differently at each end of a gradient, so it cannot be
 * measured once, and it is what put the readout labels at 2.82:1. */
const BAND_STROKE = "#f7edff";
const BAND_AREA_TOP = "rgb(255 255 255 / 0.30)";
const BAND_AREA_BOTTOM = "rgb(255 255 255 / 0.01)";

/** Plot height. Deep enough to read as a horizon, shallow enough that the
 * verdict above it is still the loudest thing in the band. */
const PLOT_H = 56;

export interface Readout {
  label: string;
  value: number;
  /** What kind of number this is. The rule over it is the only place the
   * category is said in colour, and the label says it in words underneath. */
  hue: "roster" | "growth" | "activity" | "reward";
  /** The activity walk fell short, so this figure is a floor. */
  capped?: boolean;
}

const HUE_RULE: Record<Readout["hue"], string> = {
  roster: "bg-white/45",
  growth: "bg-[#6ee7b7]",
  activity: "bg-[#a78bfa]",
  reward: "bg-[#ffd875]",
};

export function BriefBand({
  days,
  returned,
  delta,
  capped,
  series,
  readouts,
}: {
  days: number;
  returned: number;
  /** Against the window before it, or null when the sample could not prove
   * what that window held. Never guessed. */
  delta: number | null;
  capped: boolean;
  /** Oldest first — one entry per day of the window. */
  series: { date: Date; visits: number }[];
  readouts: Readout[];
}) {
  const { t } = useTranslation();
  const reduced = usePrefersReducedMotion();
  // The headline figure does *not* count up. `useCountUp` is a scroll-reveal
  // built for the landing page: it starts from 0 and waits on an
  // IntersectionObserver, so an element already on screen at mount can sit
  // showing a confident, enormous, wrong `0`. It did exactly that here. A
  // dashboard number is right before it is charming — the band's one moving
  // part is the month drawing itself in, which cannot misreport anything.

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-2xl",
        // The ad's run, darkened until the type fits. Flips for Hebrew.
        "grad-brief shadow-panel-lift",
        !reduced && "animate-fade-in",
      )}
    >
      <div className="relative px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
        <p className="t-eyebrow text-brand-on-band">
          {t("dashboard.brief.title", { days })}
        </p>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          {returned === 0 ? (
            // A bare 0 beside "nobody came back" says the same thing twice,
            // and the digit is the harsher half. The sentence is enough.
            <p className="t-card-title text-white">
              {t("dashboard.brief.verdictNone")}
            </p>
          ) : (
            <>
              {/* `t-stat` bare — it already carries tabular figures, and
                  wrapping it in `Figure` would quietly set it in mono. */}
              <span className="t-stat text-white">
                {returned}
                {capped ? "+" : ""}
              </span>
              <p className="text-white">
                {t("dashboard.brief.verdict", { count: returned })}
              </p>
            </>
          )}
          {delta !== null && <Delta value={delta} days={days} />}
        </div>

        {/* The readouts sit on the band under a hairline, so the brief is one
            object rather than a headline card with a panel of figures below
            it. Two across on a phone: four columns puts "Reward ready" on two
            lines in both languages. */}
        <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/15 pt-5 sm:grid-cols-4">
          {readouts.map((readout) => (
            <div key={readout.label} className="flex flex-col gap-1.5">
              <span
                aria-hidden
                className={cn("h-[3px] w-7 rounded-full", HUE_RULE[readout.hue])}
              />
              <dt className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-brand-on-band">
                {readout.label}
              </dt>
              <dd className="font-heading text-2xl font-bold tabular-nums text-white">
                {readout.value}
                {readout.capped ? "+" : ""}
              </dd>
            </div>
          ))}
        </dl>

        {capped && (
          <p className="mt-4 text-xs text-brand-on-band">
            {t("dashboard.brief.capped")}
          </p>
        )}
      </div>

      {/* The month is the floor the brief stands on, and it stands *under*
          the figures rather than behind them. Drawn across the readouts it
          put a white wash through "Reward ready" — the one word on the band
          with a number attached that an owner acts on. A ground that eats a
          label is decoration, whatever it is made of. */}
      <Month series={series} />
    </section>
  );
}

/**
 * The month, as the band's ground.
 *
 * Measured rather than scaled from a fixed viewBox — a stretched SVG thins
 * the stroke and this has to hold up at 320px, the same reason
 * `ActivityChart` measures. Mirrored in Hebrew for the same reason that one
 * is: a chart that runs against the direction of the page is the one place
 * the reading order breaks.
 *
 * Decorative to a screen reader on purpose. It carries no reading the
 * figures above it do not already state, and the Activity page is where the
 * day-by-day record actually lives.
 */
function Month({ series }: { series: { date: Date; visits: number }[] }) {
  const { i18n } = useTranslation();
  const rtl = i18n.dir() === "rtl";
  const reduced = usePrefersReducedMotion();

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

  // Two points make a line; one makes a dot with nothing to say.
  const drawable = series.length >= 2 && width > 0;
  // Floors at 1 so a month of single visits still has a scale to sit on
  // rather than dividing by zero.
  const peak = Math.max(1, ...series.map((d) => d.visits));
  const last = series.length - 1;
  const xAt = (i: number) => (rtl ? width - (i / last) * width : (i / last) * width);
  const yAt = (v: number) => PLOT_H - (v / peak) * (PLOT_H - 6);

  // Smoothed through the midpoints rather than joined corner to corner.
  // Thirty small daily counts drawn as straight segments is a saw, and a saw
  // reads as a chart demanding to be counted; a curve reads as a horizon,
  // which is all this is meant to be. Quadratics through midpoints never
  // overshoot, so no day is drawn busier than it was.
  const pt = (i: number) => [xAt(i), yAt(series[i].visits)] as const;
  let line = `M${pt(0)[0].toFixed(1)} ${pt(0)[1].toFixed(1)}`;
  for (let i = 1; i < series.length; i += 1) {
    const [px, py] = pt(i - 1);
    const [cx, cy] = pt(i);
    const mx = (px + cx) / 2;
    const my = (py + cy) / 2;
    line += ` Q${px.toFixed(1)} ${py.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  line += ` L${pt(last)[0].toFixed(1)} ${pt(last)[1].toFixed(1)}`;

  return (
    <div
      ref={box}
      data-month
      aria-hidden="true"
      className="pointer-events-none relative w-full"
      style={{ height: PLOT_H }}
    >
      {drawable && (
        <div
          className={cn(
            "h-full w-full origin-left rtl:origin-right",
            // Draws itself in from the start edge, once, in the same curve
            // the landing's section rules use. Words rise, objects land —
            // this is neither, it is a horizon appearing.
            !reduced && "animate-draw-rule [animation-duration:0.9s]",
          )}
        >
          <svg
            width={width}
            height={PLOT_H}
            viewBox={`0 0 ${width} ${PLOT_H}`}
            className="block"
          >
            <defs>
              <linearGradient id="brief-month" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BAND_AREA_TOP} />
                <stop offset="100%" stopColor={BAND_AREA_BOTTOM} />
              </linearGradient>
            </defs>
            <path
              d={`${line} L${xAt(last).toFixed(1)} ${PLOT_H} L${xAt(0).toFixed(1)} ${PLOT_H} Z`}
              fill="url(#brief-month)"
            />
            <path
              d={line}
              fill="none"
              stroke={BAND_STROKE}
              strokeOpacity={0.55}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/** Up is worth saying out loud; down and level are said quietly. A slow month
 * is not the owner's mistake, and colouring it like a failure is the one
 * thing this page must never do. Same rule as the week ledger — but on the
 * band both tones are white-on-translucent, because a token measured against
 * a page ground cannot be trusted against a gradient. */
function Delta({ value, days }: { value: number; days: number }) {
  const { t } = useTranslation();
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem] font-semibold",
        up ? "bg-white/20 text-white" : "bg-black/15 text-brand-on-band",
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
  /** What kind of job it is. A quiet till is the one row closer to a fault
   * than to an opportunity, so it is the only one allowed to warn. */
  tone: "quiet" | "winback" | "birthday";
}

/** The chip behind each row's icon. Tinted rather than filled: these sit on
 * the page's own panel, which is white by day and near-black by night, and a
 * wash of the token works on both where a solid fill would need two values. */
const TONE_CHIP: Record<TodoRow["tone"], string> = {
  quiet: "bg-warn/15 text-warn",
  winback: "bg-primary-text/15 text-primary-text",
  // Gold, not emerald: a birthday message in this product carries a gift, so
  // it belongs to the reward, not to growth. Emerald stays what it is on the
  // band — new customers. (It also measured 4.43:1 here against the reward
  // token's 5.27:1, though an aria-hidden icon beside its own sentence is
  // held to 3:1, not 4.5:1.)
  birthday: "bg-reward/15 text-reward",
};

/**
 * The short list of things worth the owner's morning.
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
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    TONE_CHIP[row.tone],
                  )}
                >
                  {row.icon}
                </span>
                <p className="min-w-0 text-sm text-ink">{row.body}</p>
              </div>
              {row.to && row.cta && (
                <Link
                  to={row.to}
                  className={cn(
                    "inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-lg ps-12 text-sm font-semibold text-primary-text hover:underline sm:ps-0",
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
