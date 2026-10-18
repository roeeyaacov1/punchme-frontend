import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppleCardPreview, GoogleCardPreview } from "../../components/card-studio/CardPreviews";
import { SegmentedControl } from "../../components/kit/SegmentedControl";
import { WallpaperStage } from "../../components/kit/WallpaperStage";
import { HERO_TEMPLATES, heroDesignDoc } from "../../components/marketing/heroTemplates";
import { GuideSection } from "./GuideSection";

/**
 * The owner's card on its own wallpaper, for the three trade presets the
 * landing page already uses. A sample card carries its trade, never an
 * invented business name, and its message is the change message a pass
 * really sends when its visits update.
 */
export function StageSection() {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState<"apple" | "google">("apple");
  const labels = { name: t("landing.templates.nameLabel"), points: t("landing.templates.pointsLabel") };
  const Preview = wallet === "apple" ? AppleCardPreview : GoogleCardPreview;

  return (
    <GuideSection id="stage" title={t("styleGuide.stage.title")} lead={t("styleGuide.stage.lead")}>
      <SegmentedControl
        label={t("styleGuide.controls.wallet")}
        value={wallet}
        onChange={setWallet}
        options={[
          { value: "apple", label: t("studio.preview.apple") },
          { value: "google", label: t("studio.preview.google") },
        ]}
      />
      <div className="grid justify-items-center gap-8 md:grid-cols-2">
        {HERO_TEMPLATES.map((template) => {
          const trade = t(`landing.templates.items.${template.key}.trade`);
          const message = t("onboarding.card.fields.pointsChange").replace("%@", String(template.currentStamps));
          return (
            <div key={template.id} className="flex w-full flex-col items-center gap-3">
              <WallpaperStage
                cardColor={template.backgroundColor}
                stampColor={template.stampColor}
                foregroundColor={template.foregroundColor}
                notification={{ sender: trade, body: message }}
                summary={t("styleGuide.stage.summary", {
                  trade,
                  filled: template.currentStamps,
                  total: template.stampsRequired,
                })}
              >
                <Preview
                  businessName={trade}
                  stampsRequired={template.stampsRequired}
                  currentStamps={template.currentStamps}
                  rewardDescription={t(`landing.templates.items.${template.key}.reward`)}
                  backgroundColor={template.backgroundColor}
                  foregroundColor={template.foregroundColor}
                  labelColor={template.labelColor}
                  design={heroDesignDoc(template, labels)}
                />
              </WallpaperStage>
              <p className="text-sm text-ink-muted">{t("styleGuide.stage.example")}</p>
            </div>
          );
        })}
      </div>
    </GuideSection>
  );
}
