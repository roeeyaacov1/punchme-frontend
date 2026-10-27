import { forwardRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../../kit/Input";
import { charactersLeft, REWARD_MAX } from "./controlRules";

/** The counter says nothing until the reward is this long. */
const COUNT_FROM = 160;

/**
 * What customers get, in the owner's own words: `dir="auto"` once there are
 * some (empty, it follows the page, or a Hebrew placeholder sits left), at
 * most the API's 200 characters, with a count of what is left once it nears
 * that.
 */
export const RewardField = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (next: string) => void;
    /** Said under the field, after the count: where else the reward shows. */
    note?: ReactNode;
    error?: ReactNode;
  }
>(function RewardField({ value, onChange, note, error }, ref) {
  const { t } = useTranslation();
  const left = charactersLeft(value, REWARD_MAX, COUNT_FROM);
  const hint =
    left === null && !note ? undefined : (
      <>
        {left !== null && <span className="block">{t("cardControls.charactersLeft", { count: left })}</span>}
        {note && <span className="block">{note}</span>}
      </>
    );
  return (
    <Input
      ref={ref}
      label={t("cardControls.reward")}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      maxLength={REWARD_MAX}
      dir={value ? "auto" : undefined}
      autoComplete="off"
      placeholder={t("onboarding.reward.rewardPlaceholder")}
      hint={hint}
      error={error}
    />
  );
});
