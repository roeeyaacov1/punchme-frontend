import { useTranslation } from "react-i18next";
import { Section, SectionHeader } from "./primitives";

interface FeatureItem {
  title: string;
  body: string;
}

/**
 * What's in the box.
 *
 * Set as the spec list off the back of a product, not as six tiles: ruled,
 * dense, small, no icon chips. Every one of these is shipped — nothing
 * aspirational goes in this list.
 */
export function FeatureGrid() {
  const { t } = useTranslation();
  const items = t("landing.features.items", {
    returnObjects: true,
  }) as FeatureItem[];

  return (
    <Section id="features" tone="surface">
      <SectionHeader
        eyebrow={t("landing.features.eyebrow")}
        title={t("landing.features.title")}
      />

      <dl className="grid border-t border-border sm:grid-cols-2 sm:gap-x-12 lg:gap-x-20">
        {items.map((item) => (
          <div key={item.title} className="border-b border-border py-5">
            <dt className="font-heading text-base font-bold text-ink">
              {item.title}
            </dt>
            <dd className="mt-1 text-pretty text-sm text-ink-muted">
              {item.body}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
