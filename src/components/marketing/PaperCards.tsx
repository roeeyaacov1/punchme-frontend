import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Scissors } from "lucide-react";
import { Section, SectionHeader } from "./primitives";
import { useReveal } from "../motion/useReveal";
import { cn } from "../../lib/cn";

interface PaperCard {
  business: string;
  reward: string;
}

/** Icon, fill and resting tilt per card, in order. Not translated — none of
 * it is language.
 *
 * `spread` is where the card goes when the pointer is on the fan, and it is
 * always *away* from the other card: the stack opens rather than shuffling.
 * The offsets are direction-neutral (rotation and vertical shift only), so
 * the fan behaves identically in Hebrew. */
const CARD_STYLE = [
  {
    icon: Scissors,
    fill: "grad-cta",
    tilt: "-rotate-[7deg]",
    spread: "group-hover:-rotate-[10deg] group-hover:-translate-y-1.5",
    lead: "",
  },
  {
    icon: Heart,
    fill: "grad-magenta",
    // Was `-mt-8`, which pulled this card up over the barber card's reward
    // line — the one sentence the section exists to show. The overlap is now
    // the depth of the bottom padding and no more, so both rewards read, and
    // the fan is made of the horizontal offset and the rotation instead.
    tilt: "rotate-[5deg]",
    spread: "group-hover:rotate-[8deg] group-hover:translate-y-1.5",
    lead: "-mt-1 ms-8 sm:ms-16",
  },
] as const;

/** How long a card takes to land, matching `duration-500` below. */
const DEAL_MS = 500;

/**
 * "Paper punch cards? That's over."
 *
 * Two cards fanned the way they'd sit if you dropped them on a counter —
 * overlapping, each turned a few degrees. The fan is the argument: a wallet
 * full of these is the problem the product solves, so they are drawn as
 * objects rather than illustrated as a concept.
 *
 * Which is why they are dealt rather than faded in. Each card comes in flat
 * and square and turns into its tilt on the press curve, a beat apart —
 * cards landing on a counter, not a graphic appearing. Under the pointer the
 * fan opens a little further, because a stack of cards is a thing you would
 * reach for.
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
            flush
          />
        </div>

        <ul className="group flex flex-col items-center">
          {cards.map((card, i) => {
            const style = CARD_STYLE[i % CARD_STYLE.length];
            const Icon = style.icon;
            return (
              <PaperCardItem
                key={card.business}
                card={card}
                icon={Icon}
                style={style}
                delay={i * 140}
              />
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

function PaperCardItem({
  card,
  icon: Icon,
  style,
  delay,
}: {
  card: PaperCard;
  icon: typeof Scissors;
  style: (typeof CARD_STYLE)[number];
  delay: number;
}) {
  // The reveal is a transition here rather than the shared `fade-up`
  // keyframe, because each card settles on a *different* resting transform
  // and a keyframe can only end in one place.
  const rise = useReveal<HTMLLIElement>(delay);

  // The deal's stagger has to come back off once the card has landed.
  // `transition-delay` isn't per-trigger, so the second card would carry its
  // 140ms into the hover as well and open a beat behind the first one.
  const [dealt, setDealt] = useState(false);
  useEffect(() => {
    if (!rise.revealed || !delay) return;
    const timer = window.setTimeout(() => setDealt(true), delay + DEAL_MS);
    return () => window.clearTimeout(timer);
  }, [rise.revealed, delay]);

  return (
    <li
      ref={rise.ref}
      style={dealt ? undefined : { transitionDelay: `${delay}ms` }}
      className={cn(
        "w-full max-w-[19rem] rounded-2xl p-5 text-white shadow-[0_18px_40px_-18px_rgb(15_15_35/0.55)]",
        "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none",
        style.fill,
        style.lead,
        rise.revealed
          ? cn(style.tilt, style.spread, "opacity-100")
          : "translate-y-4 rotate-0 opacity-0",
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
}
