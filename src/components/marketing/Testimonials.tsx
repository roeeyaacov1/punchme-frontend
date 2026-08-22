import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { cn } from "../../lib/cn";
import { Section, SectionHeader, cardHover } from "./primitives";
import { useReveal } from "../motion/useReveal";

interface Testimonial {
  name: string;
  trade: string;
  quote: string;
}

/**
 * ⚠️ THE QUOTES IN THIS SECTION ARE UNVERIFIED PLACEHOLDER COPY. ⚠️
 *
 * The three names, trades and quotes came from the Figma comp, not from
 * real customers, and neither the names nor the five-star ratings have been
 * confirmed by anyone. They were shipped as drawn at the owner's explicit
 * instruction after the risk was raised.
 *
 * They are worth replacing with real ones. Attributed quotes that no
 * customer actually said are a consumer-protection exposure under Israeli
 * law, and this page's whole argument elsewhere — sourced statistics, a
 * calculator that will tell an owner not to buy — depends on the reader
 * believing the parts they cannot check.
 *
 * To swap them, edit `landing.testimonials.items` in BOTH
 * `src/i18n/locales/en/common.json` and `.../he/common.json`. Nothing in
 * this component needs to change: it renders however many entries it finds.
 */
export function Testimonials() {
  const { t } = useTranslation();
  const items = t("landing.testimonials.items", {
    returnObjects: true,
  }) as Testimonial[];

  return (
    <Section id="testimonials" tone="surface">
      <SectionHeader title={t("landing.testimonials.title")} />

      <ul className="grid gap-6 md:grid-cols-3">
        {items.map((item, i) => (
          <TestimonialCard
            key={item.name}
            item={item}
            delay={i * 110}
            ratingLabel={t("landing.testimonials.rating")}
          />
        ))}
      </ul>
    </Section>
  );
}

function TestimonialCard({
  item,
  delay,
  ratingLabel,
}: {
  item: Testimonial;
  delay: number;
  ratingLabel: string;
}) {
  const rise = useReveal<HTMLLIElement>(delay);

  return (
    // Reveal on the item, hover on the panel — see `useReveal`.
    <li ref={rise.ref} style={rise.style} className={cn("h-full", rise.className)}>
      <div
        className={cn(
          "flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-card",
          cardHover,
        )}
      >
        <p className="t-card-title text-ink">{item.name}</p>
        <p className="mt-1 text-sm text-ink-subtle">{item.trade}</p>

        <blockquote className="mt-4 flex-1 text-pretty text-ink-muted">
          {item.quote}
        </blockquote>

        {/* One label for the whole row — five separate star glyphs
            announced individually is noise in a screen reader. */}
        <p className="mt-6 flex gap-1" aria-label={ratingLabel}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={16}
              aria-hidden="true"
              className="fill-primary text-primary"
            />
          ))}
        </p>
      </div>
    </li>
  );
}
