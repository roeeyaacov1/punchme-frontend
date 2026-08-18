import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container, ctaClasses } from "./primitives";

/**
 * The closing ask, on the dark ground the footer continues.
 *
 * A single bloom of violet light sits behind the button — the same light
 * that's behind the phone in the hero, so the page opens and closes on it.
 */
export function FinalCta() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-brand-night py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="hero-bloom pointer-events-none absolute bottom-0 start-1/2 size-[34rem] -translate-x-1/2 translate-y-1/3 rtl:translate-x-1/2"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="t-h2 text-balance text-white">
            {t("landing.finalCta.title")}
          </h2>

          <p className="t-lead mt-6 text-pretty text-brand-on-band">
            {t("landing.finalCta.body")}
          </p>

          <div className="mt-10 flex justify-center">
            <Link
              to="/onboarding"
              className={ctaClasses("gradient", "lg", "w-full sm:w-auto")}
            >
              {t("landing.finalCta.cta")}
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="rtl:-scale-x-100"
              />
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/60">
            {t("landing.finalCta.note")}
          </p>
        </div>
      </Container>
    </section>
  );
}
