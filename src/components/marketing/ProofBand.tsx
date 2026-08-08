import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { cn } from "../../lib/cn";
import { Section, SectionHeader, focusRing } from "./primitives";
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
 */
export function ProofBand() {
  const { t } = useTranslation();
  const stats = t("landing.proof.stats", { returnObjects: true }) as ProofStat[];

  return (
    <Section id="proof" tone="surface">
      <SectionHeader
        eyebrow={t("landing.proof.eyebrow")}
        title={t("landing.proof.title")}
        lead={t("landing.proof.lead")}
      />

      <dl className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0 rtl:md:divide-x-reverse">
        {stats.map((stat, i) => (
          <div
            key={stat.id}
            className={cn(
              "flex flex-col gap-3 py-8 md:py-0",
              i === 0 ? "md:pe-8" : i === stats.length - 1 ? "md:ps-8" : "md:px-8",
            )}
          >
            <dt className="t-stat text-ink">{stat.value}</dt>
            <dd className="flex flex-col gap-3">
              <p className="t-card-title text-pretty text-ink">{stat.claim}</p>
              <p className="text-pretty text-ink-muted">{stat.context}</p>
              <a
                href={PROOF_SOURCE_URLS[stat.id]}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  // min-h gives the citation a 44px tap target without
                  // changing how the line reads.
                  "inline-flex min-h-[44px] items-center gap-1.5 rounded text-xs text-ink-subtle underline decoration-border underline-offset-4 transition-colors hover:text-ink-muted hover:decoration-ink-subtle",
                  focusRing,
                )}
              >
                {stat.source}
                <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
