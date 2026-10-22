import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { GuideSection, Specimen } from "./GuideSection";
import { RatioList, type PairSpec } from "./Ratio";

// Every class is written out whole: Tailwind only ships what it can find.
const TEXT: PairSpec[] = [
  { name: "ink · background", sample: "bg-background text-ink" },
  { name: "ink · surface", sample: "bg-surface text-ink" },
  { name: "ink-muted · background", sample: "bg-background text-ink-muted" },
  { name: "ink-muted · surface", sample: "bg-surface text-ink-muted" },
  { name: "ink-subtle · background", sample: "bg-background text-ink-subtle" },
  { name: "ink-subtle · surface", sample: "bg-surface text-ink-subtle" },
  { name: "primary-on · primary", sample: "bg-primary text-primary-on" },
  { name: "primary-on · primary-hover", sample: "bg-primary-hover text-primary-on" },
  { name: "surface · ink", sample: "bg-ink text-surface" },
];

const STATES: PairSpec[] = [
  { name: "ok · surface", sample: "bg-surface text-ok" },
  { name: "ok-tag · ok/15", sample: "bg-ok/15 text-ok-tag" },
  { name: "warn · surface", sample: "bg-surface text-warn" },
  { name: "danger · surface", sample: "bg-surface text-danger" },
  { name: "reward · surface", sample: "bg-surface text-reward" },
];

// The data's teal: a line or a bar needs 3:1, a word that carries it 4.5:1.
const DATA: PairSpec[] = [
  { name: "series · background", sample: "border-series", kind: "edge" },
  { name: "series-ink · background", sample: "bg-background text-series-ink" },
  { name: "series-ink · surface", sample: "bg-surface text-series-ink" },
];

const EDGES: PairSpec[] = [
  { name: "field · background", sample: "border-field", kind: "edge" },
  { name: "ink ring · background", sample: "border-ink", kind: "edge" },
  { name: "danger edge · background", sample: "border-danger", kind: "edge" },
  { name: "primary · background", sample: "border-primary", kind: "edge", fillOnly: true },
];

const LIT: PairSpec[] = [
  { name: "ink · lit", sample: "bg-surface text-ink" },
  { name: "ink-muted · lit", sample: "bg-surface text-ink-muted" },
  { name: "ink-subtle · lit", sample: "bg-surface text-ink-subtle" },
  { name: "ok · lit", sample: "bg-surface text-ok" },
  { name: "warn · lit", sample: "bg-surface text-warn" },
  { name: "danger · lit", sample: "bg-surface text-danger" },
  { name: "reward · lit", sample: "bg-surface text-reward" },
  { name: "field · lit", sample: "border-field", kind: "edge" },
];

const LIGHT: PairSpec[] = [
  { name: "ink · light", sample: "bg-light text-ink" },
  { name: "ink · light-deep", sample: "bg-light-deep text-ink" },
  { name: "ink · light-bright", sample: "bg-light-bright text-ink" },
  { name: "ink · light-edge", sample: "bg-light-edge text-ink" },
  { name: "ink-muted · light-edge", sample: "bg-light-edge text-ink-muted" },
  { name: "ink · answer-punched", sample: "bg-answer-punched text-ink" },
  { name: "ink · answer-full", sample: "bg-answer-full text-ink" },
  { name: "ink · answer-failed", sample: "bg-answer-failed text-ink" },
  { name: "answer-punched-ink · answer-punched", sample: "bg-answer-punched text-answer-punched-ink" },
  { name: "answer-full-ink · answer-full", sample: "bg-answer-full text-answer-full-ink" },
  { name: "answer-failed-ink · answer-failed", sample: "bg-answer-failed text-answer-failed-ink" },
  { name: "warn · light", sample: "bg-light text-warn" },
  { name: "ink-muted · light", sample: "bg-light text-ink-muted" },
  { name: "ink · gold", sample: "bg-gold text-ink" },
  { name: "light · glass", sample: "bg-glass text-light" },
];

/**
 * Day and night stand side by side whatever the toolbar says, each in its
 * own nested scope, so the two can be compared at a glance. The rest of the
 * guide follows the toolbar.
 */
export function ColourSection({ version }: { version: string }) {
  const { t } = useTranslation();
  return (
    <GuideSection id="colour" title={t("styleGuide.colour.title")} lead={t("styleGuide.colour.lead")}>
      <p className="type-body max-w-2xl text-ink">{t("styleGuide.colour.rule")}</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Scope night={false} title={t("styleGuide.colour.day")} lead={t("styleGuide.colour.dayLead")} version={version} />
        <Scope night title={t("styleGuide.colour.night")} lead={t("styleGuide.colour.nightLead")} version={version} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title={t("styleGuide.colour.lit")} lead={t("styleGuide.colour.litLead")}>
          <div className="theme-lightbox theme-night rounded-panel bg-background p-4 text-ink sm:p-5">
            <div className="theme-lit rounded-field bg-surface px-4">
              <RatioList specs={LIT} version={version} />
            </div>
          </div>
        </Specimen>
        <Specimen title={t("styleGuide.colour.light")} lead={t("styleGuide.colour.lightLead")}>
          <div className="theme-lit rounded-panel border border-border bg-surface px-4">
            <RatioList specs={LIGHT} version={version} />
          </div>
        </Specimen>
      </div>
    </GuideSection>
  );
}

function Scope({
  night,
  title,
  lead,
  version,
}: {
  night: boolean;
  title: string;
  lead: string;
  version: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={cn("theme-lightbox rounded-panel border border-border bg-background p-4 text-ink sm:p-5", night && "theme-night")}>
      <h3 className="type-card-title text-ink">{title}</h3>
      <p className="type-body mt-1 text-ink-muted">{lead}</p>
      <h4 className="type-label mt-5 text-ink">{t("styleGuide.colour.text")}</h4>
      <RatioList specs={TEXT} version={version} />
      <h4 className="type-label mt-5 text-ink">{t("styleGuide.colour.states")}</h4>
      <RatioList specs={STATES} version={version} />
      <h4 className="type-label mt-5 text-ink">{t("styleGuide.colour.edges")}</h4>
      <RatioList specs={EDGES} version={version} />
      <h4 className="type-label mt-5 text-ink">{t("styleGuide.colour.data")}</h4>
      <RatioList specs={DATA} version={version} />
    </div>
  );
}
