import { useTranslation } from "react-i18next";
import { Section, SectionHeader } from "./primitives";

interface AutomationItem {
  title: string;
  body: string;
}

/**
 * The three automations, set as a ruled list rather than three cards.
 *
 * They are short, parallel and read top to bottom in one pass; boxing each
 * one would have added three shadows and no information.
 */
export function AutomationRows() {
  const { t } = useTranslation();
  const items = t("landing.automation.items", {
    returnObjects: true,
  }) as AutomationItem[];

  return (
    <Section id="automation" tone="background">
      <SectionHeader
        title={t("landing.automation.title")}
        lead={t("landing.automation.lead")}
      />

      <dl className="max-w-3xl border-t border-border">
        {items.map((item) => (
          <div key={item.title} className="border-b border-border py-6">
            <dt className="t-card-title text-ink">{item.title}</dt>
            <dd className="mt-2 max-w-2xl text-pretty text-ink-muted">
              {item.body}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
