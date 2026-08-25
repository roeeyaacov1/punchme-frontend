import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  BAND_INSET,
  BAND_RULE,
  Band,
  Readouts,
  type ReadoutItem,
} from "./primitives";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { cn } from "../../lib/cn";

/**
 * The brief — the band at the top of the overview.
 *
 * The owner's question at ₪99 a month is never "how many stamps", it is "are
 * people coming back". `BriefBand` answers it in one sentence and shows its
 * working.
 *
 * **Why this one surface is loud.** See `Band` in `./primitives` — it is the
 * ground this stands on, and the messages page's audience band stands on the
 * same one. Everything below either of them stays quiet.
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
  readouts: ReadoutItem[];
}) {
  const { t } = useTranslation();
  // The headline figure does *not* count up. `useCountUp` is a scroll-reveal
  // built for the landing page: it starts from 0 and waits on an
  // IntersectionObserver, so an element already on screen at mount can sit
  // showing a confident, enormous, wrong `0`. It did exactly that here. A
  // dashboard number is right before it is charming — the band's one moving
  // part is the month drawing itself in, which cannot misreport anything.

  return (
    <Band>
      {/* The month sits flush along the bottom, so the inset is on this
          wrapper rather than on the band itself. */}
      <div className={cn("relative", BAND_INSET)}>
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
            lines in both languages. The same strip the messages band spends —
            one figure, one look, wherever it is met. */}
        <Readouts items={readouts} on="band" className={BAND_RULE} />

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
    </Band>
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
