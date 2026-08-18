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
 * The comp draws every answer already open, which is what a static frame has
 * to do; kept as an accordion here because that is the behaviour the page
 * already shipped with, and eight open answers is a wall. */
export function Faq() {
  const { t } = useTranslation();
  const items = t("landing.faq.items", { returnObjects: true }) as FaqItem[];

  return (
    <Section id="faq" tone="surface">
      <SectionHeader title={t("landing.faq.title")} />

      <div className="flex max-w-3xl flex-col gap-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="faq-item group rounded-2xl border border-border bg-background px-5 shadow-card"
          >
            <summary
              className={cn(
                "flex cursor-pointer items-center justify-between gap-6 py-5 text-start",
                focusRing,
              )}
            >
              <span className="font-heading text-base font-bold text-ink sm:text-lg">
                {item.q}
              </span>
              <Plus
                size={20}
                aria-hidden="true"
                className="shrink-0 text-primary-text transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p className="max-w-2xl pb-5 text-pretty text-ink-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
