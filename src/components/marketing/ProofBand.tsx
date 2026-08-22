import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { Section, SectionHeader, focusRing } from "./primitives";
import { useReveal } from "../motion/useReveal";
import { PROOF_SOURCE_URLS } from "./sources";

interface ProofStat {
  id: string;
  value: string;
  claim: string;
  context: string;
  source: string;
}

/**
 * The evidence for the pitch. Every number carries a visible, clickable
 * source — a shop owner who can check our arithmetic is likelier to believe
 * the parts they can't.
 *
 * Set as a reference list rather than three cards, because that is what it
 * is. The figure hangs in its own column and the citation closes each entry,
 * so the section reads as sourced work; a row of tiles reads as marketing.
 */
export function ProofBand() {
  const { t } = useTranslation();
  const stats = t("landing.proof.stats", { returnObjects: true }) as ProofStat[];

  return (
    <Section id="proof" tone="surface">
      <SectionHeader
        title={t("landing.proof.title")}
        lead={t("landing.proof.lead")}
      />

      <dl className="flex flex-col">
        {stats.map((stat, i) => (
          <ProofRow key={stat.id} stat={stat} isFirst={i === 0} delay={i * 90} />
        ))}
      </dl>
    </Section>
  );
}

/** One sourced figure.
 *
 * It rises on scroll like everything else on the page, and that is *all* it
 * does — the figure never counts up. These are the page's sourced numbers,
 * and animating them into a performance is the exact move the citation
 * underneath exists to disown. `useCountUp` is available and stays unused
 * here on purpose.
 */
function ProofRow({
  stat,
  isFirst,
  delay,
}: {
  stat: ProofStat;
  isFirst: boolean;
  delay: number;
}) {
  const rise = useReveal<HTMLDivElement>(delay);

  return (
    <div
      ref={rise.ref}
      style={rise.style}
      className={cn(
        "grid gap-x-8 gap-y-3 py-8 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:py-10",
        !isFirst && "border-t border-border",
        rise.className,
      )}
    >
      <dt className="t-stat text-ink">{stat.value}</dt>
      <dd className="max-w-2xl">
        <p className="t-card-title text-pretty text-ink">{stat.claim}</p>
        <p className="mt-2 text-pretty text-ink-muted">{stat.context}</p>
        <a
          href={PROOF_SOURCE_URLS[stat.id]}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            // min-h gives the citation a 44px tap target without
            // changing how the line reads.
            "mt-1 inline-flex min-h-[44px] items-center gap-1 rounded text-sm text-primary-text underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-primary-text",
            focusRing,
          )}
        >
          {stat.source}
          <ArrowUpRight
            size={14}
            aria-hidden="true"
            className="shrink-0 rtl:-scale-x-100"
          />
        </a>
      </dd>
    </div>
  );
}
