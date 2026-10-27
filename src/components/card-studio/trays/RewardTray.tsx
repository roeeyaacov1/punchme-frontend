import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../kit/Button";
import { RewardField, StampCountControl } from "../controls";
import { stampColourOf, type BackState, type CardStudioValue } from "../studioDraft";

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
          onChange={(reward) => onChange({ ...value, reward_description: reward })}
          note={back.kind === "follows" ? t("studio.back.follows") : undefined}
        />
        {back.kind === "differs" && <BackDiffers text={back.text} onFollow={onFollow} />}
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

/** The back says something other than the reward: said, never overwritten
 * without the owner asking. */
export function BackDiffers({ text, onFollow }: { text: string; onFollow: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-start gap-1">
      <p className="text-sm leading-snug text-ink-muted">
        {t("studio.back.differs")} <bdi className="text-ink">{text}</bdi>
      </p>
      <Button variant="secondary" onClick={onFollow}>
        {t("studio.back.follow")}
      </Button>
    </div>
  );
}
