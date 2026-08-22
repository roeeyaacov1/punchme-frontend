import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Coffee, Star, Zap } from "lucide-react";
import { cn } from "../../lib/cn";
import { Container, ctaArrow, ctaClasses } from "./primitives";
import { HeroCardCarousel } from "./HeroCardCarousel";
import { PunchMark } from "./PunchMark";
import { WalletMark } from "./WalletMarks";

/**
 * The hero.
 *
 * The device is still `HeroCardCarousel` — a real pass, drawn by the card
 * studio's own renderer, on a real lock screen. The comp draws a generic
 * phone with a hand-made pass inside it; that would have been a picture of
 * the product instead of the product, and the wallet card is a spec match to
 * what Apple and Google actually render, so it gets staged and framed here
 * rather than redrawn.
 *
 * What the redesign adds is the light: a violet bloom behind the device, and
 * two stamp chips floating off its edges.
 *
 * ── The punch beat ──────────────────────────────────────────────────────
 *
 * This is the one orchestrated moment on the page, and it is orchestrated
 * around the product's only verb. The copy rises in reading order over about
 * a second — badge, headline, promise, the two controls, then the small
 * print — and lands *before* anything happens, so the reader is finished and
 * looking when it does.
 *
 * At 1200ms the pass takes a stamp (`HeroCardCarousel` owns that; the screen
 * wakes with it, which is what a phone does when a pass updates), and the
 * three punch marks under the headline press in behind it, one beat apart.
 * That is deliberate: `PunchMark` means *one visit* everywhere on this page,
 * so tying the trust bullets to the card's stamp says the promises and the
 * product are the same event. It fires once. A loop would be decoration, and
 * the subheading's claim — "it updates itself with every visit" — is the
 * thing being demonstrated.
 *
 * The beats are named here rather than inlined so the sequence can be read
 * in one place, and `STAMP_AT_MS` is kept in step with the carousel's own.
 */
const BEAT = {
  badge: 0,
  headline: 70,
  lead: 160,
  actions: 250,
  bullets: 340,
  walletRow: 430,
  device: 120,
  /** Matches `STAMP_AT_MS` in `HeroCardCarousel` — the pass and the bullets
   * take their stamp together. */
  punch: 1200,
  /** Gap between the three bullet marks pressing in. */
  punchStagger: 110,
} as const;

export function Hero() {
  const { t } = useTranslation();
  const trustBullets = t("landing.hero.trustBullets", {
    returnObjects: true,
  }) as string[];

  return (
    <section className="relative overflow-hidden bg-background">
      <Container className="relative">
        <div className="grid gap-10 pb-16 pt-10 md:grid-cols-12 md:items-center md:gap-8 md:pb-24 md:pt-20 lg:gap-14">
          <div className="text-center md:col-span-6 md:text-start lg:col-span-7">
            <p
              style={{ animationDelay: `${BEAT.badge}ms` }}
              className="grad-cta animate-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-white"
            >
              <Zap size={14} aria-hidden="true" />
              {t("landing.hero.eyebrow")}
            </p>

            <h1
              style={{ animationDelay: `${BEAT.headline}ms` }}
              className="t-h1 animate-fade-up mt-6 text-balance text-ink"
            >
              {t("landing.hero.headline")}
            </h1>

            <p
              style={{ animationDelay: `${BEAT.lead}ms` }}
              className="t-lead animate-fade-up mx-auto mt-6 max-w-xl text-pretty text-ink-muted md:mx-0"
            >
              {t("landing.hero.subheadline")}
            </p>

            <div
              style={{ animationDelay: `${BEAT.actions}ms` }}
              className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start"
            >
              <Link
                to="/onboarding"
                className={ctaClasses(
                  "gradient",
                  "lg",
                  cn("w-full sm:w-auto", ctaArrow),
                )}
              >
                {t("landing.hero.cta")}
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="rtl:-scale-x-100"
                />
              </Link>
              <a
                href="#calculator"
                className={ctaClasses("secondary", "lg", "w-full sm:w-auto")}
              >
                {t("landing.hero.secondaryCta")}
              </a>
            </div>

            <ul
              style={{ animationDelay: `${BEAT.bullets}ms` }}
              className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-muted md:justify-start"
            >
              {trustBullets.map((bullet, i) => (
                <li key={bullet} className="flex items-center gap-2">
                  <PunchMark
                    state="stamped"
                    size={14}
                    className="animate-stamp-in"
                    style={{
                      animationDelay: `${BEAT.punch + i * BEAT.punchStagger}ms`,
                    }}
                  />
                  {bullet}
                </li>
              ))}
            </ul>

            <div
              style={{ animationDelay: `${BEAT.walletRow}ms` }}
              className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-6 md:justify-start"
            >
              <span className="t-eyebrow text-ink-subtle">
                {t("landing.hero.worksWith")}
              </span>
              <WalletMark label={t("landing.hero.appleWallet")} />
              <WalletMark label={t("landing.hero.googleWallet")} />
            </div>
          </div>

          <div
            style={{ animationDelay: `${BEAT.device}ms` }}
            className="animate-fade-up flex justify-center md:col-span-6 md:justify-end lg:col-span-5"
          >
            {/* `isolate` so the bloom's negative z-index stays inside this
                box, and everything hangs off the device rather than off the
                column — which is what kept the light beside the phone
                instead of behind it. */}
            <div className="relative isolate">
              {/* Two elements, not one: the outer holds the centring
                  translate and the inner does the breathing. A keyframe that
                  animates `transform` replaces the whole transform, so
                  putting the drift on the positioned element would snap the
                  light off-centre the moment it started. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute start-1/2 top-[42%] -z-10 size-[26rem] -translate-y-1/2 -translate-x-1/2 rtl:translate-x-1/2 md:size-[34rem]"
              >
                <div className="hero-bloom animate-bloom-drift size-full" />
              </div>

              <FloatingStamp
                icon={Coffee}
                className="-end-5 top-16"
                delay="0s"
                enter={BEAT.device + 260}
              />
              <FloatingStamp
                icon={Star}
                className="-start-5 bottom-40"
                delay="1.6s"
                enter={BEAT.device + 380}
              />

              <HeroCardCarousel />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** A stamp chip drifting beside the device. Decorative, so it is hidden
 * from assistive tech, and `animate-float` is already switched off under
 * `prefers-reduced-motion` by the rule in index.css.
 *
 * Two nested spans because an element can only run one `animation`
 * shorthand: the outer one lands the chip (`stamp-in`, the press curve —
 * these are stamps, so they arrive the way a stamp does), the inner one
 * holds the endless float. */
function FloatingStamp({
  icon: Icon,
  className,
  delay,
  enter,
}: {
  icon: typeof Coffee;
  className?: string;
  /** Offset into the float loop, so the two chips are never in phase. */
  delay: string;
  /** When the chip lands, in ms after load. */
  enter: number;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ animationDelay: `${enter}ms` }}
      className={cn("animate-stamp-in absolute z-10", className)}
    >
      <span
        style={{ animationDelay: delay }}
        className="animate-float flex size-11 items-center justify-center rounded-2xl bg-surface shadow-lift"
      >
        <Icon size={20} className="text-primary-text" />
      </span>
    </span>
  );
}
