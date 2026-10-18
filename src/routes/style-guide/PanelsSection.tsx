import { useTranslation } from "react-i18next";
import { LitPanel, type Light } from "../../components/kit/LitPanel";
import { GuideSection, TokenName } from "./GuideSection";

const LIGHTS: { light: Light; copy: string; radius?: "panel" | "card" }[] = [
  { light: "panel", copy: "styleGuide.panels.panel" },
  { light: "lit", copy: "styleGuide.panels.lit" },
  { light: "band", copy: "styleGuide.panels.band" },
  { light: "field", copy: "styleGuide.panels.field", radius: "card" },
];

export function PanelsSection() {
  const { t } = useTranslation();
  return (
    <GuideSection id="panels" title={t("styleGuide.panels.title")} lead={t("styleGuide.panels.lead")}>
      <div className="grid gap-6 sm:grid-cols-2">
        {LIGHTS.map(({ light, copy, radius }) => (
          <LitPanel key={light} light={light} radius={radius} className="flex min-h-40 flex-col justify-between gap-6 p-5 sm:p-6">
            <TokenName>{`light="${light}"`}</TokenName>
            <p className="type-body text-ink">{t(copy)}</p>
          </LitPanel>
        ))}
      </div>
    </GuideSection>
  );
}
