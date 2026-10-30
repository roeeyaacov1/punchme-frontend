import { Trans, useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { LinkButton, LitPanel } from "../kit";
import { PUNCHME_MONTHLY_PRICE } from "./calculator";
import { column, section } from "./landingLayout";
import { useLightsOn } from "./useFirstSight";

/**
 * The close: one panel in the landing's field light, the hero's light at
 * the foot of the page, with one line, the same "Start free" and the price
 * in small print beside it. On the wall like everything else, not a dark
 * band. It lights on as it comes up the screen.
 */
export function FinalCta() {
  const { t } = useTranslation();
  const panel = useLightsOn<HTMLHeadingElement>();
  return (
    <section aria-labelledby="close-title" className={section}>
      <div className={column}>
        <LitPanel
          light="field"
          radius="card"
          arrive={panel.arrive}
          className={cn(
            "flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-12",
            panel.dark,
          )}
        >
          <h2 ref={panel.ref} id="close-title" className="type-headline max-w-[22ch] text-balance text-ink">
            {t("landing.finalCta.title")}
          </h2>
          <div className="flex flex-col items-stretch gap-3 sm:items-start lg:shrink-0 lg:items-end">
            <LinkButton to="/onboarding" size="lg" className="w-full sm:w-auto">
              {t("landing.hero.cta")}
            </LinkButton>
            <p className="type-body text-center text-ink-muted sm:text-start lg:text-end">
              <Trans
                i18nKey="landing.finalCta.note"
                values={{ price: PUNCHME_MONTHLY_PRICE }}
                components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
              />
            </p>
          </div>
        </LitPanel>
      </div>
    </section>
  );
}
