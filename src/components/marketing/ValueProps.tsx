import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { Section, SectionHeader } from "./primitives";

interface ValueItem {
  title: string;
  body: string;
}

/**
 * Three claims, set as claims.
 *
 * This used to be a row of tiles with a gold icon chip, sitting immediately
 * above another row of tiles with a gold icon chip. Two grids saying
 * different things in identical shapes is most of what made the page read as
 * a template — so this one is typographic and the feature list below is
 * dense, and you can tell them apart with the page zoomed out.
 */
export function ValueProps() {
  const { t } = useTranslation();
  const items = t("landing.values.items", { returnObjects: true }) as ValueItem[];

  return (
    <Section id="why">
      <SectionHeader
        eyebrow={t("landing.values.eyebrow")}
        title={t("landing.values.title")}
      />

      <div className="flex flex-col">
        {items.map((item, i) => (
          <div
            key={item.title}
            className={cn(
              "grid gap-x-10 gap-y-2 py-8 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:py-10",
              i > 0 && "border-t border-border",
            )}
          >
            <h3 className="t-h3 text-balance text-ink">{item.title}</h3>
            <p className="t-lead max-w-2xl text-pretty text-ink-muted">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
