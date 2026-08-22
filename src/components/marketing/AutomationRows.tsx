import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { Section, SectionHeader } from "./primitives";
import { useReveal } from "../motion/useReveal";

interface AutomationItem {
  title: string;
  body: string;
}

/**
 * The three automations, set as a ruled list rather than three cards.
 *
 * They are short, parallel and read top to bottom in one pass; boxing each
 * one would have added three shadows and no information.
 *
 * The section is two columns rather than one. As a single `max-w-3xl` stack
 * it left the whole end half of the page empty with nothing to answer it —
 * the only section on the page that opened a hole that wide — and it sits
 * between two sections that are already built as heading-beside-object, so
 * splitting it puts it back in the page's rhythm instead of interrupting it.
 */
export function AutomationRows() {
  const { t } = useTranslation();
  const items = t("landing.automation.items", {
    returnObjects: true,
  }) as AutomationItem[];

  return (
    <Section id="automation" tone="background">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
        <SectionHeader
          title={t("landing.automation.title")}
          lead={t("landing.automation.lead")}
          flush
        />

        <dl className="border-t border-border">
          {items.map((item, i) => (
            <AutomationRow key={item.title} item={item} delay={i * 100} />
          ))}
        </dl>
      </div>
    </Section>
  );
}

function AutomationRow({
  item,
  delay,
}: {
  item: AutomationItem;
  delay: number;
}) {
  const rise = useReveal<HTMLDivElement>(delay);

  return (
    <div
      ref={rise.ref}
      style={rise.style}
      className={cn("border-b border-border py-6", rise.className)}
    >
      <dt className="t-card-title text-ink">{item.title}</dt>
      <dd className="mt-2 text-pretty text-ink-muted">{item.body}</dd>
    </div>
  );
}
