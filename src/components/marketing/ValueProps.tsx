import { useTranslation } from "react-i18next";
import { Repeat, ShieldCheck, Sparkles } from "lucide-react";
import { Section, SectionHeader } from "./primitives";

interface ValueItem {
  title: string;
  body: string;
}

const ICONS = [Repeat, ShieldCheck, Sparkles];

export function ValueProps() {
  const { t } = useTranslation();
  const items = t("landing.values.items", { returnObjects: true }) as ValueItem[];

  return (
    <Section id="why">
      <SectionHeader
        eyebrow={t("landing.values.eyebrow")}
        title={t("landing.values.title")}
      />

      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-8 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0"
            >
              <span className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 text-primary-text">
                <Icon size={22} aria-hidden="true" />
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
