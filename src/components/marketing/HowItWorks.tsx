import { useTranslation } from "react-i18next";
import { Section, SectionHeader } from "./primitives";

interface StepItem {
  title: string;
  body: string;
}

export function HowItWorks() {
  const { t } = useTranslation();
  const steps = t("landing.howItWorks.steps", {
    returnObjects: true,
  }) as StepItem[];

  return (
    <Section id="how-it-works" tone="surface">
      <SectionHeader
        eyebrow={t("landing.howItWorks.eyebrow")}
        title={t("landing.howItWorks.title")}
        lead={t("landing.howItWorks.lead")}
      />

      <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="rounded-2xl border border-border bg-background p-8 shadow-card"
          >
            <span
              aria-hidden="true"
              // Navy on gold, not white on gold — see ctaClasses.
              className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-navy-deep"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="t-card-title text-ink">{step.title}</h3>
            <p className="mt-2 text-pretty text-ink-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
