import { useTranslation } from "react-i18next";
import { Section, SectionHeader } from "./primitives";

interface StepItem {
  title: string;
  body: string;
}

/**
 * The one section on the page where numbering carries information rather
 * than decorating: these really are three steps in order.
 *
 * So the numeral is set as a plate at the far edge of each row — large
 * enough to scan down the column and find your place, out of the way of the
 * sentence that matters. `<ol>` does the ordering semantically; the plates
 * are `aria-hidden` so a screen reader hears "1." once, not "01" twice.
 */
export function HowItWorks() {
  const { t } = useTranslation();
  const steps = t("landing.howItWorks.steps", {
    returnObjects: true,
  }) as StepItem[];

  return (
    <Section id="how-it-works" tone="background">
      <SectionHeader
        title={t("landing.howItWorks.title")}
        lead={t("landing.howItWorks.lead")}
      />

      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card"
          >
            <div className="min-w-0">
              <h3 className="t-card-title text-ink">{step.title}</h3>
              <p className="mt-2 text-pretty text-ink-muted">{step.body}</p>
            </div>

            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-sm font-bold tabular-nums text-primary-on"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
