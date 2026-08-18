import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Coffee, Star, Zap } from "lucide-react";
import { Container, ctaClasses } from "./primitives";
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
 * What the redesign does add is the light: a violet bloom behind the device,
 * and two stamp chips floating off its edges.
 */
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
            <p className="grad-cta inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-white">
              <Zap size={14} aria-hidden="true" />
              {t("landing.hero.eyebrow")}
            </p>

            <h1 className="t-h1 mt-6 text-balance text-ink">
              {t("landing.hero.headline")}
            </h1>

            <p className="t-lead mx-auto mt-6 max-w-xl text-pretty text-ink-muted md:mx-0">
              {t("landing.hero.subheadline")}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link
                to="/onboarding"
                className={ctaClasses("gradient", "lg", "w-full sm:w-auto")}
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

            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-muted md:justify-start">
              {trustBullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2">
                  <PunchMark state="stamped" size={14} />
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-6 md:justify-start">
              <span className="t-eyebrow text-ink-subtle">
                {t("landing.hero.worksWith")}
              </span>
              <WalletMark label={t("landing.hero.appleWallet")} />
              <WalletMark label={t("landing.hero.googleWallet")} />
            </div>
          </div>

          <div className="flex justify-center md:col-span-6 md:justify-end lg:col-span-5">
            {/* `isolate` so the bloom's negative z-index stays inside this
                box, and everything hangs off the device rather than off the
                column — which is what kept the light beside the phone
                instead of behind it. */}
            <div className="relative isolate">
              <div
                aria-hidden="true"
                className="hero-bloom pointer-events-none absolute start-1/2 top-[42%] -z-10 size-[26rem] -translate-y-1/2 -translate-x-1/2 rtl:translate-x-1/2 md:size-[34rem]"
              />

              <FloatingStamp icon={Coffee} className="-end-5 top-16" delay="0s" />
              <FloatingStamp icon={Star} className="-start-5 bottom-40" delay="1.6s" />

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
 * `prefers-reduced-motion` by the rule in index.css. */
function FloatingStamp({
  icon: Icon,
  className,
  delay,
}: {
  icon: typeof Coffee;
  className?: string;
  delay: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ animationDelay: delay }}
      className={`animate-float absolute z-10 flex size-11 items-center justify-center rounded-2xl bg-surface shadow-lift ${className ?? ""}`}
    >
      <Icon size={20} className="text-primary-text" />
    </span>
  );
}
