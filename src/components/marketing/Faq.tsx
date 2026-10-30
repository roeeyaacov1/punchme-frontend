import { Trans, useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { focusRing, useReducedMotion } from "../kit";
import { noTapFlash } from "../kit/classes";
import { PUNCHME_MONTHLY_PRICE } from "./calculator";
import { column, section } from "./landingLayout";

interface FaqItem {
  q: string;
  a: string;
}

/**
 * The questions a sceptic asks before starting, answered true: the
 * customer's side first, then the owner's, the money last. Native
 * <details> as ruled rows on the wall, so the keyboard, in-page search and
 * a page without JavaScript all work, and eight open answers aren't a wall.
 * From 1024px the heading keeps a column of its own, so the list doesn't
 * leave half the width empty.
 */
export function Faq() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const items = t("landing.faq.items", { returnObjects: true }) as FaqItem[];
  // Two answers say what the dashboard says, in its own words, and the
  // price is said in one place.
  const shared = {
    phones: t("messaging.phones"),
    ifCancel: t("billing.pro.ifCancel"),
    price: PUNCHME_MONTHLY_PRICE,
  };

  return (
    <section id="faq" tabIndex={-1} aria-labelledby="faq-title" className={section}>
      <div className={cn(column, "grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16")}>
        <h2 id="faq-title" className="type-headline text-balance text-ink lg:col-span-4">
          {t("landing.faq.title")}
        </h2>
        <div className="border-t border-border-strong lg:col-span-8">
          {items.map((item, index) => (
            <details key={item.q} className="group border-b border-border-strong">
              <summary
                className={cn(
                  "flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-4 text-start [&::-webkit-details-marker]:hidden",
                  noTapFlash,
                  focusRing,
                )}
              >
                <span className="type-card-title text-ink">{item.q}</span>
                <Plus
                  aria-hidden
                  className={cn(
                    "size-5 shrink-0 text-ink group-open:rotate-45",
                    !reduced && "transition-transform duration-move ease-in-out-strong",
                  )}
                />
              </summary>
              <p className="type-prose pb-6 text-pretty text-ink-muted">
                <Trans
                  i18nKey={`landing.faq.items.${index}.a`}
                  values={shared}
                  components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
                />
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
