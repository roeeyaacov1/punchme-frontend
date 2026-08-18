import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { Section, SectionHeader, focusRing } from "./primitives";

interface FaqItem {
  q: string;
  a: string;
}

/** Native <details>/<summary>: keyboard-accessible, findable by in-page
 * search, and works with JavaScript disabled. No accordion state to manage.
 *
 * Ruled rather than boxed — six cards stacked vertically was six shadows
 * doing nothing, and the questions read faster as a list. */
export function Faq() {
  const { t } = useTranslation();
  const items = t("landing.faq.items", { returnObjects: true }) as FaqItem[];

  return (
    <Section id="faq" tone="surface">
      <SectionHeader
        eyebrow={t("landing.faq.eyebrow")}
        title={t("landing.faq.title")}
      />

      <div className="max-w-3xl border-t border-border">
        {items.map((item) => (
          <details key={item.q} className="faq-item group border-b border-border">
            <summary
              className={cn(
                "flex cursor-pointer items-center justify-between gap-6 py-5 text-start",
                focusRing,
              )}
            >
              <span className="font-heading text-lg font-bold text-ink">
                {item.q}
              </span>
              <Plus
                size={20}
                aria-hidden="true"
                className="shrink-0 text-ink-subtle transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p className="max-w-2xl pb-6 text-pretty text-ink-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
