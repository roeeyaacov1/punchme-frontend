import { useTranslation } from "react-i18next";
import { Container } from "./primitives";

interface Stat {
  value: string;
  label: string;
}

/**
 * Three figures, ruled apart.
 *
 * Every value is Latin digits in both languages, so each one is marked
 * `dir="ltr"` — without it a string like "<60" reorders against the Hebrew
 * label beside it and renders as "60>".
 */
export function StatsBand() {
  const { t } = useTranslation();
  const stats = t("landing.stats.items", { returnObjects: true }) as Stat[];

  return (
    <section className="bg-background py-12 sm:py-16">
      <Container>
        <dl className="grid grid-cols-3 gap-4 divide-x divide-border rtl:divide-x-reverse">
          {stats.map((stat) => (
            <div key={stat.label} className="px-2 text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span
                  dir="ltr"
                  className="block font-heading text-2xl font-bold tabular-nums text-primary-text sm:text-4xl"
                >
                  {stat.value}
                </span>
                <span
                  aria-hidden="true"
                  className="mt-2 block text-pretty text-xs text-ink-muted sm:text-sm"
                >
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
