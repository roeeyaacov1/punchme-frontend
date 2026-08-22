import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { Section, SectionHeader, cardHover } from "./primitives";
import { PunchMark } from "./PunchMark";
import { useReveal } from "../motion/useReveal";

interface StepItem {
  title: string;
  body: string;
}

/**
 * The one section on the page where numbering carries information rather
 * than decorating: these really are three steps in order.
 *
 * The numeral is a punch. `PunchMark`'s whole premise is that the page has
 * exactly one ornament and it always means *one visit* — its own
 * documentation says it "numbers the steps in how it works" — and this
 * section was the one place that claim wasn't true, drawing a plain rounded
 * plate instead. A stamp with the numeral knocked out of the ink is the same
 * mark the trust bullets and the calculator's card already spend, so the
 * three steps now read as three punches, which is what they are.
 *
 * It sits at the head of the card rather than trailing at the far edge: at
 * three across there is no column to scan down, and the mark belongs with
 * the step it numbers. `<ol>` does the ordering semantically; the marks are
 * `aria-hidden` so a screen reader hears "1." once, not twice.
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

      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((step, i) => (
          <Step key={step.title} step={step} index={i} delay={i * 110} />
        ))}
      </ol>
    </Section>
  );
}

function Step({
  step,
  index,
  delay,
}: {
  step: StepItem;
  index: number;
  delay: number;
}) {
  const rise = useReveal<HTMLLIElement>(delay);

  return (
    // The list item carries the reveal and nothing else; the panel inside it
    // carries the hover. One transition each — see the note in `useReveal`
    // about why a card cannot run both on the same element.
    <li ref={rise.ref} style={rise.style} className={cn("h-full", rise.className)}>
      <div
        className={cn(
          "h-full rounded-2xl border border-border bg-surface p-6 shadow-card",
          cardHover,
        )}
      >
        <span aria-hidden="true">
          <PunchMark
            state="stamped"
            size={36}
            // Pressed in a beat after the card it heads, so the stamp reads
            // as landing *on* the card rather than arriving with it.
            className={cn(rise.revealed && "animate-stamp-in")}
            style={{ animationDelay: `${delay + 260}ms` }}
          >
            {index + 1}
          </PunchMark>
        </span>

        <h3 className="t-card-title mt-4 text-ink">{step.title}</h3>
        <p className="mt-2 text-pretty text-ink-muted">{step.body}</p>
      </div>
    </li>
  );
}
