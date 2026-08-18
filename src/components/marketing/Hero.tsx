import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Container, ctaClasses } from "./primitives";
import { HeroCardCarousel } from "./HeroCardCarousel";
import { PunchMark } from "./PunchMark";
import { WalletMark } from "./WalletMarks";

export function Hero() {
  const { t } = useTranslation();
  const trustBullets = t("landing.hero.trustBullets", {
    returnObjects: true,
  }) as string[];

  return (
    // overflow-hidden clips the top of the lock screen, which is the whole
    // point of it — you are seeing part of a phone, not a picture of one.
    <section className="relative overflow-hidden bg-background">
      <Container className="relative">
        <div className="grid gap-8 pb-12 pt-8 md:grid-cols-12 md:items-start md:gap-8 md:pb-24 md:pt-24 lg:gap-14">
          <div className="md:col-span-7 md:pt-6">
            <p className="t-eyebrow text-primary-text">
              {t("landing.hero.eyebrow")}
            </p>

            <h1 className="t-h1 mt-4 text-balance text-ink">
              {t("landing.hero.headline")}
            </h1>

            <p className="t-lead mt-6 max-w-xl text-pretty text-ink-muted">
              {t("landing.hero.subheadline")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className={ctaClasses("primary", "lg", "w-full sm:w-auto")}
              >
                {t("landing.hero.cta")}
              </Link>
              <a
                href="#calculator"
                className={ctaClasses("secondary", "lg", "w-full sm:w-auto")}
              >
                {t("landing.hero.secondaryCta")}
              </a>
            </div>

            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
              {trustBullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2">
                  <PunchMark state="stamped" size={14} />
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6">
              <span className="t-eyebrow text-ink-subtle">
                {t("landing.hero.worksWith")}
              </span>
              <WalletMark label={t("landing.hero.appleWallet")} />
              <WalletMark label={t("landing.hero.googleWallet")} />
            </div>
          </div>

          <div className="flex justify-center md:col-span-5 md:justify-end">
            <HeroCardCarousel />
          </div>
        </div>
      </Container>
    </section>
  );
}
