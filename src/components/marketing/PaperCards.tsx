import { useTranslation } from "react-i18next";
import { Heart, Scissors } from "lucide-react";
import { Section, SectionHeader } from "./primitives";
import { cn } from "../../lib/cn";

interface PaperCard {
  business: string;
  reward: string;
}

/** Icon and fill per card, in order. Not translated — it isn't language. */
const CARD_STYLE = [
  { icon: Scissors, fill: "grad-cta", tilt: "-rotate-[7deg]" },
  { icon: Heart, fill: "grad-magenta", tilt: "rotate-[5deg] -mt-8 ms-12" },
] as const;

/**
 * "Paper punch cards? That's over."
 *
 * Two cards fanned the way they'd sit if you dropped them on a counter —
 * overlapping, each turned a few degrees. The fan is the argument: a wallet
 * full of these is the problem the product solves, so they are drawn as
 * objects rather than illustrated as a concept.
 */
export function PaperCards() {
  const { t } = useTranslation();
  const cards = t("landing.paperCards.cards", {
    returnObjects: true,
  }) as PaperCard[];

  return (
    <Section id="paper-cards" tone="surface">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <SectionHeader
            title={t("landing.paperCards.title")}
            lead={t("landing.paperCards.body")}
            className="mb-0 sm:mb-0"
          />
        </div>

        <ul className="flex flex-col items-center">
          {cards.map((card, i) => {
            const style = CARD_STYLE[i % CARD_STYLE.length];
            const Icon = style.icon;
            return (
              <li
                key={card.business}
                className={cn(
                  "w-full max-w-[19rem] rounded-2xl p-5 text-white shadow-[0_18px_40px_-18px_rgb(15_15_35/0.55)]",
                  style.fill,
                  style.tilt,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Latin business names, so this one really is uppercase
                      styling rather than a no-op — but it goes through the
                      same eyebrow class the Hebrew labels use. */}
                  <p className="t-eyebrow min-w-0 text-white">{card.business}</p>
                  <Icon size={17} aria-hidden="true" className="shrink-0" />
                </div>

                <p className="mt-10 text-pretty font-heading text-lg font-bold">
                  {card.reward}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
