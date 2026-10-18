import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "../../components/kit/Button";
import { LitPanel } from "../../components/kit/LitPanel";
import { useReducedMotion } from "../../components/kit/motion";
import { cn } from "../../lib/cn";
import { GuideSection, Specimen, TokenName } from "./GuideSection";

const CURVES = ["--ease-out-strong", "--ease-overshoot", "--ease-drawer", "--ease-in-out-strong"];
const DURATIONS = [
  "--duration-press",
  "--duration-gentle",
  "--duration-exit",
  "--duration-move",
  "--duration-flash",
  "--duration-settle",
  "--duration-lights",
  "--duration-stamp-snap",
  "--duration-sheet",
  "--duration-crossfade",
  "--duration-stamp",
  "--duration-ceremony",
  "--duration-breathe",
];

export function MotionSection() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [lights, setLights] = useState(0);
  const [stamp, setStamp] = useState(0);
  const [tokens, setTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    setTokens(Object.fromEntries([...CURVES, ...DURATIONS].map((name) => [name, root.getPropertyValue(name).trim()])));
  }, []);

  return (
    <GuideSection id="motion" title={t("styleGuide.motion.title")} lead={t("styleGuide.motion.lead")}>
      <div className="grid gap-8 sm:grid-cols-2">
        <Specimen title={t("styleGuide.motion.curves")}>
          <TokenList names={CURVES} tokens={tokens} />
        </Specimen>
        <Specimen title={t("styleGuide.motion.durations")}>
          <TokenList names={DURATIONS} tokens={tokens} />
        </Specimen>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Specimen title={t("styleGuide.motion.lightsOn")} lead={t("styleGuide.motion.lightsOnLead")}>
          <div className="flex flex-col items-start gap-4">
            <div className="flex h-32 w-full items-center justify-center rounded-panel border border-dashed border-border-strong">
              <LitPanel key={lights} arrive className="px-6 py-4">
                <span className="type-card-title">{t("dashboard.nav.overview")}</span>
              </LitPanel>
            </div>
            <Button variant="secondary" icon={<RotateCcw aria-hidden />} onClick={() => setLights((n) => n + 1)}>
              {t("styleGuide.motion.replay")}
            </Button>
          </div>
        </Specimen>
        <Specimen title={t("styleGuide.motion.stamp")} lead={t("styleGuide.motion.stampLead")}>
          <div className="flex flex-col items-start gap-4">
            <div className="flex h-32 w-full items-center justify-center rounded-panel border border-dashed border-border-strong">
              <span
                key={stamp}
                aria-hidden
                className={cn(
                  "flex size-14 items-center justify-center rounded-full bg-ink text-surface",
                  !reduced && "animate-stamp-land",
                )}
              >
                <Check strokeWidth={3} className="size-7" />
              </span>
            </div>
            <Button variant="secondary" icon={<RotateCcw aria-hidden />} onClick={() => setStamp((n) => n + 1)}>
              {t("styleGuide.motion.replay")}
            </Button>
          </div>
        </Specimen>
      </div>
    </GuideSection>
  );
}

function TokenList({ names, tokens }: { names: string[]; tokens: Record<string, string> }) {
  return (
    <ul className="divide-y divide-border">
      {names.map((name) => (
        <li key={name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
          <TokenName>{name}</TokenName>
          <code dir="ltr" className="font-mono text-[0.8125rem] text-ink">
            {tokens[name]}
          </code>
        </li>
      ))}
    </ul>
  );
}
