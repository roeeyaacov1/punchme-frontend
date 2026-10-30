import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { RewardField, StampCountControl } from "../../../../components/card-studio/controls";
import { useOnboardingDraft } from "../../useOnboardingDraft";

/**
 * What customers get, and after how many stamps: the card controls' reward
 * field (two lines) and stamp count. The reward is also what the back of the
 * card says, since the wizard writes it there, and Enter saves the card.
 */
export const RewardPanel = forwardRef<
  HTMLTextAreaElement,
  {
    /** The save found no reward: said under the field. */
    asked: boolean;
    onSave: () => void;
  }
>(function RewardPanel({ asked, onSave }, ref) {
  const { t } = useTranslation();
  const { resolved, update, artUrl } = useOnboardingDraft();
  const glyph = resolved.stamp.kind === "glyph" ? resolved.stamp.glyph : "check";
  return (
    <div className="flex flex-col gap-6">
      <RewardField
        ref={ref}
        value={resolved.reward}
        onChange={(reward) => update({ reward })}
        note={t("studio.back.follows")}
        error={asked && !resolved.reward.trim() ? t("onboarding.missing.reward") : undefined}
        onEnter={onSave}
      />
      <StampCountControl
        value={resolved.stampsRequired}
        onChange={(stampsRequired) => update({ stampsRequired })}
        glyph={glyph}
        stampColour={resolved.accent}
        background={resolved.background}
        pictureUrl={artUrl ?? null}
      />
    </div>
  );
});
