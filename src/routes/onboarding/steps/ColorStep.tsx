import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { ChoiceGrid } from "../../../components/onboarding/ChoiceGrid";
import { StepShell } from "../../../components/onboarding/StepShell";
import { ColorField } from "../../../components/ui";
import { focusRing } from "../../../components/marketing/primitives";
import { accentFits, CARD_BACKGROUNDS } from "../../../lib/accentPalette";
import { cn } from "../../../lib/cn";
import { normalizeHex } from "../../../lib/color";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { swatch } from "./swatch";

export function ColorStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draft, resolved, update } = useOnboardingDraft();
  const current = resolved.background;
  const isCurated = CARD_BACKGROUNDS.some((b) => b.hex === current);
  const [customOpen, setCustomOpen] = useState(!isCurated);

  function choose(hex: string) {
    const next = normalizeHex(hex);
    if (!next) return;
    update({
      background: next,
      // A stamp colour picked against the old background may no longer
      // read on the new one; let it be chosen again.
      accent: accentFits(draft.accent, next) ? draft.accent : null,
    });
  }

  const choices = CARD_BACKGROUNDS.map((b) => ({
    value: b.hex,
    label: t(`onboarding.color.names.${b.key}`),
    render: (selected: boolean) => swatch(b.hex, selected),
  }));

  return (
    <StepShell
      title={t("onboarding.color.title")}
      subtitle={t("onboarding.color.subtitle")}
      onBack={() => navigate("/onboarding/business")}
      onNext={() => {
        // Write the resolved value down, so what the owner saw is what is kept.
        update({ background: current });
        navigate("/onboarding/accent");
      }}
    >
      <ChoiceGrid
        name="background"
        legend={t("onboarding.color.gridLabel")}
        legendHidden
        choices={choices}
        value={isCurated ? current : null}
        onChange={choose}
        columns={5}
      />

      <div>
        <button
          type="button"
          onClick={() => setCustomOpen((open) => !open)}
          aria-expanded={customOpen}
          className={cn(
            "-ms-1 inline-flex min-h-[44px] items-center gap-1 rounded-lg px-1 text-sm font-semibold text-primary-text hover:underline",
            focusRing,
          )}
        >
          {t("onboarding.color.custom")}
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn("transition-transform", customOpen && "rotate-180")}
          />
        </button>
        {customOpen && (
          <div className="mt-1 max-w-xs">
            <ColorField label={t("onboarding.color.customLabel")} value={current} onChange={choose} />
          </div>
        )}
      </div>
    </StepShell>
  );
}
