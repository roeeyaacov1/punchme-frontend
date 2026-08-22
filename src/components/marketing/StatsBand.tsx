import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { Container } from "./primitives";
import { useReveal } from "../motion/useReveal";

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
 *
 * They rise on scroll and nothing more. `useCountUp` exists in `src/lib` and
 * would land here in two lines, and it is deliberately left out: these are
 * the only figures on the page with no citation under them, and running an
 * unsourced number up from zero is the single loudest thing a page can do
 * with a claim it hasn't backed. The sourced set in `ProofBand` doesn't
 * count up either — the honest treatment has to be the same in both places
 * or it isn't a principle.
 */
export function StatsBand() {
  const { t } = useTranslation();
  const stats = t("landing.stats.items", { returnObjects: true }) as Stat[];

  return (
    <section className="bg-background py-12 sm:py-16">
      <Container>
        <dl className="grid grid-cols-3 gap-4 divide-x divide-border rtl:divide-x-reverse">
          {stats.map((stat, i) => (
            <StatCell key={stat.label} stat={stat} delay={i * 90} />
          ))}
        </dl>
      </Container>
    </section>
  );
}

function StatCell({ stat, delay }: { stat: Stat; delay: number }) {
  const rise = useReveal<HTMLDivElement>(delay);

  return (
    <div
      ref={rise.ref}
      style={rise.style}
      className={cn("px-2 text-center", rise.className)}
    >
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
  );
}
