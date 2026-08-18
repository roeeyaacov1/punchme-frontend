import { useTranslation } from "react-i18next";
import { Section, SectionHeader } from "./primitives";
import { PunchMark } from "./PunchMark";

interface StepItem {
  title: string;
  body: string;
}

/**
 * The one section on the page where numbering carries information rather
 * than decorating: these really are three steps in order.
 *
 * So the numerals sit inside punches strung along a dashed rule — the row is
 * the card, and getting to the end of it is the product. Boxing each step in
 * its own tile said nothing; this says "three, in order, and short".
 */
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

      <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
        {/* The rule the punches are strung on. Hidden on a phone, where the
            steps stack and a horizontal line would mean nothing. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[17px] hidden border-t-2 border-dashed border-border md:block"
        />

        {steps.map((step, i) => (
          <li key={step.title} className="relative">
            <span className="inline-flex bg-surface pe-3">
              <PunchMark state="stamped" size={36}>
                {i + 1}
              </PunchMark>
            </span>
            <h3 className="t-card-title mt-5 text-ink">{step.title}</h3>
            <p className="mt-2 max-w-sm text-pretty text-ink-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
