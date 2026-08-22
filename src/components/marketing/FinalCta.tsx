import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { Container, ctaArrow, ctaClasses } from "./primitives";
import { useReveal } from "../motion/useReveal";

/**
 * The closing ask, on the dark ground the footer continues.
 *
 * A single bloom of violet light sits behind the button — the same light
 * that's behind the phone in the hero, so the page opens and closes on it.
 */
export function FinalCta() {
  const { t } = useTranslation();
  const rise = useReveal<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden bg-brand-night py-20 sm:py-28">
      {/* Two elements so the centring translate and the drift don't fight
          over `transform` — the same split the hero's bloom uses, and the
          same slow breath, so the page opens and closes on one light. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 start-1/2 size-[34rem] -translate-x-1/2 translate-y-1/3 rtl:translate-x-1/2"
      >
        <div className="hero-bloom animate-bloom-drift size-full" />
      </div>

      <Container className="relative">
        <div
          ref={rise.ref}
          style={rise.style}
          className={cn("mx-auto max-w-2xl text-center", rise.className)}
        >
          <h2 className="t-h2 text-balance text-white">
            {t("landing.finalCta.title")}
          </h2>

          <p className="t-lead mt-6 text-pretty text-brand-on-band">
            {t("landing.finalCta.body")}
          </p>

          <div className="mt-10 flex justify-center">
            <Link
              to="/onboarding"
              className={ctaClasses(
                "gradient",
                "lg",
                cn("w-full sm:w-auto", ctaArrow),
              )}
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
