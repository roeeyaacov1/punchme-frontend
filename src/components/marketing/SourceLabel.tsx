import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";

/** One entry of `landing.proof.stats`; its link lives in `sources.ts`. */
export interface ProofStat {
  id: string;
  value: string;
  claim: string;
  context: string;
  source: string;
}

/**
 * What a citation's link says: the source as printed, an arrow out, and, to
 * a screen reader, that it opens in a new tab before it does.
 */
export function SourceLabel({ label }: { label: string }) {
  const { t } = useTranslation();
  return (
    <>
      {label}
      <ArrowUpRight aria-hidden className="ms-1 size-4 shrink-0 rtl:-scale-x-100" />
      <span className="sr-only">{t("landing.newTab")}</span>
    </>
  );
}
