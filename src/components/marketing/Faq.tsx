import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { Section, SectionHeader, focusRing } from "./primitives";

interface FaqItem {
  q: string;
  a: string;
}

/** Native <details>/<summary>: keyboard-accessible, findable by in-page
 * search, and works with JavaScript disabled. No accordion state to manage. */
export function Faq() {
  const { t } = useTranslation();
  const items = t("landing.faq.items", { returnObjects: true }) as FaqItem[];

  return (
    <Section id="faq">
      <SectionHeader
        eyebrow={t("landing.faq.eyebrow")}
        title={t("landing.faq.title")}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="faq-item group rounded-xl border border-border bg-surface shadow-card"
          >
            <summary
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 rounded-xl px-6 py-5 text-start",
                focusRing,
              )}
            >
              <span className="font-heading text-lg font-semibold text-ink">
                {item.q}
              </span>
              <ChevronDown
                size={20}
                aria-hidden="true"
                className="shrink-0 text-ink-subtle transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="px-6 pb-6 text-pretty text-ink-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
