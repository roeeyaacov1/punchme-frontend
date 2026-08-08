import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { WalletCardPreview } from "../wallet-card/WalletCardPreview";
import { Container, ctaClasses } from "./primitives";
import { WalletMark } from "./WalletMarks";

export function Hero() {
  const { t } = useTranslation();
  const trustBullets = t("landing.hero.trustBullets", {
    returnObjects: true,
  }) as string[];

  return (
    // overflow-hidden clips the gold glow — the usual cause of a stray
    // horizontal scrollbar on narrow screens.
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 end-[-10%] h-[560px] w-[560px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(200,138,17,0.28) 0%, rgba(200,138,17,0) 70%)",
        }}
      />

      <Container className="relative">
        {/* A 100svh hero buries everything on a phone, so the min-height only
            kicks in from md up. */}
        <div className="grid items-center gap-12 pb-16 pt-12 md:min-h-[calc(100svh-80px)] md:grid-cols-12 md:gap-8 md:py-20 lg:gap-16">
          <div className="space-y-6 md:col-span-7">
            <p className="t-eyebrow inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-ink-subtle">
              {t("landing.hero.eyebrow")}
            </p>

            <h1 className="t-h1 text-balance text-ink">
              {t("landing.hero.headline")}
            </h1>

            <p className="t-lead max-w-xl text-pretty text-ink-muted">
              {t("landing.hero.subheadline")}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
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

            <ul className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-ink-muted">
              {trustBullets.map((bullet, i) => (
                <li key={bullet} className="flex items-center gap-2">
                  {/* The separator belongs to the item that follows it, so a
                      wrap never strands a lone "·" at the end of a line. */}
                  {i > 0 && (
                    <span aria-hidden="true" className="text-ink-subtle">
                      ·
                    </span>
                  )}
                  <Check
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-primary-text"
                  />
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              <span className="t-eyebrow text-ink-subtle">
                {t("landing.hero.worksWith")}
              </span>
              <WalletMark label={t("landing.hero.appleWallet")} />
              <WalletMark label={t("landing.hero.googleWallet")} />
            </div>
          </div>

          <div className="flex justify-center md:col-span-5">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 scale-125 rounded-full opacity-70 blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(200,138,17,0.22) 0%, rgba(200,138,17,0) 70%)",
                }}
              />
              {/* Float only from md up: on a phone the card is the whole
                  visual and a moving target is just distracting. */}
              <div className="rounded-3xl shadow-lift md:animate-float-slow">
                <WalletCardPreview
                  backgroundColor="#1b2036"
                  foregroundColor="#ffffff"
                  labelColor="#a7adc9"
                  businessName={t("landing.example.businessName")}
                  stampsRequired={8}
                  currentStamps={5}
                  rewardDescription={t("landing.example.reward")}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
