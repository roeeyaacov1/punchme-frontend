import { useId } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { StepShell } from "../../../components/onboarding/StepShell";
import { focusRing } from "../../../components/marketing/primitives";
import { useDebounce } from "../../../hooks/useDebounce";
import { cn } from "../../../lib/cn";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { MAX_STAMPS, MIN_STAMPS } from "../draft";

export function RewardStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resolved, update } = useOnboardingDraft();
  const sliderId = useId();
  const rewardId = useId();

  const stamps = resolved.stampsRequired;
  const progress = ((stamps - MIN_STAMPS) / (MAX_STAMPS - MIN_STAMPS)) * 100;
  const stampsText = t("onboarding.reward.stampsValue", { count: stamps });
  // Dragging the slider must not read out every tick.
  const spoken = useDebounce(stampsText, 500);

  const canContinue = resolved.reward.trim().length > 0;

  return (
    <StepShell
      title={t("onboarding.reward.title")}
      subtitle={t("onboarding.reward.subtitle")}
      onBack={() => navigate("/onboarding/stamp")}
      onNext={() => {
        update({ stampsRequired: stamps, reward: resolved.reward.trim() });
        navigate("/onboarding/account");
      }}
      nextDisabled={!canContinue}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={sliderId} className="text-sm font-medium text-ink">
            {t("onboarding.reward.stampsLabel")}
          </label>
          <span className="t-figure text-lg text-ink" aria-hidden="true">
            {stamps}
          </span>
        </div>
        <input
          id={sliderId}
          type="range"
          min={MIN_STAMPS}
          max={MAX_STAMPS}
          step={1}
          value={stamps}
          onChange={(e) => update({ stampsRequired: Number(e.target.value) })}
          aria-valuetext={stampsText}
          className="range-accent"
          style={{ "--range-progress": `${progress}%` } as React.CSSProperties}
        />
        <p className="sr-only" aria-live="polite">
          {spoken}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={rewardId} className="text-sm font-medium text-ink">
          {t("onboarding.reward.rewardLabel")}
        </label>
        <input
          id={rewardId}
          type="text"
          dir="auto"
          value={resolved.reward}
          onChange={(e) => update({ reward: e.target.value })}
          placeholder={t("onboarding.reward.rewardPlaceholder")}
          maxLength={200}
          required
          className={cn(
            "w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ink placeholder:text-ink-subtle/70",
            focusRing,
          )}
        />
      </div>
    </StepShell>
  );
}
