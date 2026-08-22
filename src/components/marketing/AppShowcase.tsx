import { useTranslation } from "react-i18next";
import { Tag, User } from "lucide-react";
import { cn } from "../../lib/cn";
import { Container } from "./primitives";
import { useReveal } from "../motion/useReveal";

interface MockCustomer {
  name: string;
  phone: string;
  punches: string;
  badge: string;
  /** 0–100. Drawn from the punch count, kept alongside it so the bar and
   * the label can never disagree. */
  progress: number;
}

/** The week's sparkline, in the chart's own 224×80 coordinate space.
 * Two of the seven points carry a dot in the comp — the third and the
 * sixth — which is what `DOTS` indexes. */
const SPARK_POINTS = [
  [0, 68],
  [37, 70],
  [75, 58],
  [112, 42],
  [149, 28],
  [187, 14],
  [224, 20],
] as const;
const DOTS = [2, 5];

/** The chart's own violet, light enough to hold up on the near-black
 * screen: #a78bfa is 7.9:1 on #0f0f23. */
const SPARK_STROKE = "#a78bfa";

/**
 * The dashboard, shown on a phone.
 *
 * The owner's side of the product. It sits on the indigo band because the
 * page has changed subject again — this is what *they* get, after two
 * sections about what the customer gets.
 *
 * The whole device is `aria-hidden`: it is an illustration built from
 * invented sample data, and reading two fictional customers and their phone
 * numbers aloud would be worse than silence. The heading and lead beside it
 * carry the meaning, and they are real text.
 */
export function AppShowcase() {
  const { t } = useTranslation();
  const customers = t("landing.app.customers", {
    returnObjects: true,
  }) as MockCustomer[];
  const days = t("landing.app.days", { returnObjects: true }) as string[];

  const path = SPARK_POINTS.map(([x, y]) => `${x},${y}`).join(" ");

  // This section and `PricingBand` draw their own heading rather than using
  // `SectionHeader` (both invert onto a saturated band and neither wanted
  // its margins), so they carry the accent rule's reveal themselves. Same
  // gesture, same 180ms hold, so the ornament reads as one thing across all
  // ten of its appearances.
  const copy = useReveal<HTMLDivElement>();
  const device = useReveal<HTMLDivElement>(140);

  return (
    <section
      id="dashboard"
      className="scroll-mt-24 overflow-hidden bg-brand-indigo py-16 sm:py-20 lg:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div
            ref={copy.ref}
            style={copy.style}
            className={cn("max-w-2xl", copy.className)}
          >
            <h2 className="t-h2 text-balance text-white">
              {t("landing.app.title")}
            </h2>
            <div
              aria-hidden="true"
              className={cn(
                "mt-5 h-1 w-10 origin-left rounded-full bg-white/70 rtl:origin-right",
                copy.revealed && "animate-draw-rule [animation-delay:180ms]",
              )}
            />
            <p className="t-lead mt-6 text-pretty text-brand-on-band">
              {t("landing.app.lead")}
            </p>
          </div>

          <div
            ref={device.ref}
            style={device.style}
            className={cn("flex justify-center", device.className)}
          >
            <div
              aria-hidden="true"
              className="w-full max-w-[19.5rem] rounded-[2.5rem] bg-brand-bezel p-2.5 shadow-[0_30px_60px_-24px_rgb(15_15_35/0.7)]"
            >
              <div className="relative overflow-hidden rounded-[2rem] bg-brand-night px-4 pb-5 pt-3">
                <div className="mx-auto mb-3 h-3.5 w-24 rounded-full bg-brand-bezel" />

                <div className="flex items-center justify-between gap-3">
                  <p className="font-heading text-base font-bold text-white">
                    {t("landing.app.ui.dashboard")}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">
                      {t("landing.app.ui.greeting")}
                    </span>
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/10">
                      <User size={14} className="text-white/80" />
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-xs font-bold text-white/70">
                  {t("landing.app.ui.overview")}
                </p>

                <div className="grad-magenta mt-3 flex items-center justify-between gap-3 rounded-2xl p-4">
                  <div>
                    <p className="font-heading text-3xl font-bold tabular-nums text-white">
                      {t("landing.app.ui.activeCards")}
                    </p>
                    <p className="mt-0.5 text-xs text-white/85">
                      {t("landing.app.ui.activeCardsLabel")}
                    </p>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <Tag size={18} className="text-white" />
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-white/70">
                    {t("landing.app.ui.weekly")}
                  </p>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.6875rem] text-white/70">
                    {t("landing.app.ui.weeklyRange")}
                  </span>
                </div>

                <div className="mt-3 rounded-2xl bg-brand-slate p-4">
                  {/* An SVG's own coordinate space doesn't flip with the
                      document direction, which is what we want: the week
                      runs Sunday→Saturday left to right, and mirroring a
                      chart would reverse the trend rather than translate
                      it. The day labels below carry `dir="ltr"` so they
                      stay in step with it. */}
                  <svg
                    viewBox="0 0 224 80"
                    className="h-20 w-full overflow-visible"
                    role="presentation"
                  >
                    {[0, 26.67, 53.33, 80].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        x2="224"
                        y1={y}
                        y2={y}
                        stroke="rgb(255 255 255 / 0.08)"
                        strokeWidth="1"
                      />
                    ))}
                    <polyline
                      points={path}
                      fill="none"
                      stroke={SPARK_STROKE}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {DOTS.map((i) => (
                      <circle
                        key={i}
                        cx={SPARK_POINTS[i][0]}
                        cy={SPARK_POINTS[i][1]}
                        r="4.5"
                        fill="#0f0f23"
                        stroke={SPARK_STROKE}
                        strokeWidth="2.5"
                      />
                    ))}
                  </svg>

                  <div dir="ltr" className="mt-3 flex justify-between">
                    {/* Keyed by position, not by label: the English initials
                        run S M T W T F S, so the labels are not unique. */}
                    {days.map((day, i) => (
                      <span key={i} className="text-[0.625rem] text-white/50">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-white/70">
                    {t("landing.app.ui.customers")}
                  </p>
                  <span className="text-[0.6875rem] text-brand-on-band">
                    {t("landing.app.ui.seeAll")}
                  </span>
                </div>

                <ul className="mt-3 flex flex-col gap-2">
                  {customers.map((customer) => (
                    <li
                      key={customer.name}
                      className="flex items-center gap-3 rounded-2xl bg-brand-slate p-3"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.6875rem] font-bold text-white">
                        {customer.name.slice(0, 1)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-white">
                          {customer.name}
                        </p>
                        <p
                          dir="ltr"
                          className="truncate text-[0.625rem] text-white/50 rtl:text-end"
                        >
                          {customer.phone}
                        </p>
                      </div>

                      <div className="w-20 shrink-0">
                        <span className="block rounded-full bg-white/10 px-2 py-0.5 text-center text-[0.5625rem] text-white/80">
                          {customer.badge}
                        </span>
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${customer.progress}%`,
                              backgroundColor: SPARK_STROKE,
                            }}
                          />
                        </span>
                        <span className="mt-1 block text-[0.5625rem] text-white/50">
                          {customer.punches}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
