import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Gift,
  Palette,
  ScanLine,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Section, SectionHeader } from "./primitives";

interface FeatureItem {
  title: string;
  body: string;
}

/** Order matches `landing.features.items`. Every one of these is shipped —
 * nothing aspirational goes in this grid. */
const ICONS = [Palette, Wallet, Smartphone, ScanLine, Gift, BarChart3];

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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-background p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0"
            >
              <span className="mb-4 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary-text">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="t-card-title text-ink">{item.title}</h3>
              <p className="mt-2 text-pretty text-ink-muted">{item.body}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
