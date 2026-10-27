import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../kit/Button";
import { RewardField, StampCountControl } from "../controls";
import { stampColourOf, withReward, type BackState, type CardStudioValue } from "../studioDraft";

/** What customers get, after how many stamps, and what the back of the card says. */
export const RewardTray = forwardRef<
  HTMLInputElement,
  {
    value: CardStudioValue;
    onChange: (next: CardStudioValue) => void;
    back: BackState;
    onFollow: () => void;
    stampPicture: string | null;
  }
>(function RewardTray({ value, onChange, back, onFollow, stampPicture }, ref) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <RewardField
          ref={ref}
          value={value.reward_description}
          onChange={(reward) => onChange(withReward(value, reward))}
          note={back.kind === "follows" ? t("studio.back.follows") : undefined}
        />
        <BackDiffers back={back} onFollow={onFollow} />
      </div>
      <StampCountControl
        value={value.stamps_required}
        onChange={(count) => onChange({ ...value, stamps_required: count })}
        glyph={value.design.stamp?.glyph ?? "check"}
        stampColour={stampColourOf(value)}
        background={value.background_color}
        pictureUrl={stampPicture}
      />
    </div>
  );
});

/** The back says something other than the reward, or nothing: said, never
 * overwritten without the owner asking. Nothing when it says the reward. */
export function BackDiffers({ back, onFollow }: { back: BackState; onFollow: () => void }) {
  const { t } = useTranslation();
  if (back.kind !== "differs" && back.kind !== "empty") return null;
  return (
    <div className="flex flex-col items-start gap-1">
      <p className="text-sm leading-snug text-ink-muted">
        {back.kind === "differs" ? (
          <>
            {t("studio.back.differs")} <bdi className="text-ink">{back.text}</bdi>
          </>
        ) : (
          t("studio.back.empty")
        )}
      </p>
      {/* Wraps rather than runs off a phone at 200% text. */}
      <Button variant="secondary" onClick={onFollow} className="max-w-full !whitespace-normal text-center">
        {t("studio.back.follow")}
      </Button>
    </div>
  );
}
