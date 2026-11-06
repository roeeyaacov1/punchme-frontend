import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { DesignField } from "../../../api/designs";
import { Badge } from "../../kit/Badge";
import { Button } from "../../kit/Button";
import { SegmentedControl } from "../../kit/SegmentedControl";
import { RewardField, StampCountControl } from "../controls";
import { designOptions, withOption, withStampsPlace, type StampsFormat, type StampsPlace } from "../designOptions";
import { stampColourOf, withReward, type BackState, type CardStudioValue } from "../studioDraft";

/** What customers get, after how many stamps, and what the back of the card
 * says. Where the wallet draws the design options, also where Apple Wallet
 * shows the count and how it writes it, beside the number of stamps it
 * counts (brief §6.5). */
export const RewardTray = forwardRef<
  HTMLTextAreaElement,
  {
    value: CardStudioValue;
    onChange: (next: CardStudioValue) => void;
    back: BackState;
    onFollow: () => void;
    stampPicture: string | null;
    /** The wallet draws the design options: the count's place and format. */
    options?: boolean;
    /** The count the stage shows, which the format's example is written at. */
    sample?: number;
    /** The card's fields as saved: the count goes back where it was. */
    savedFields?: readonly DesignField[];
  }
>(function RewardTray({ value, onChange, back, onFollow, stampPicture, options = false, sample, savedFields }, ref) {
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
      {/* The stamps on what they stand on: their ground where the card has
          one, since stamps in the card's own colour vanish on the card. */}
      <StampCountControl
        value={value.stamps_required}
        onChange={(count) => onChange({ ...value, stamps_required: count })}
        glyph={value.design.stamp?.glyph ?? "check"}
        stampColour={stampColourOf(value)}
        background={designOptions(value.design).panelColor || value.background_color}
        pictureUrl={stampPicture}
      />
      {options && <CountOnCard value={value} onChange={onChange} sample={sample} savedFields={savedFields} />}
    </div>
  );
});

/** "המספר על הכרטיס": under the stamps or at the top by the logo, and "6" or
 * "6/8", both Apple's alone, with Google's line saying what it does instead. */
function CountOnCard({
  value,
  onChange,
  sample,
  savedFields,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  sample?: number;
  savedFields?: readonly DesignField[];
}) {
  const { t } = useTranslation();
  const chosen = designOptions(value.design);
  const count = Math.min(sample ?? Math.floor(value.stamps_required / 2), value.stamps_required);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="type-label text-ink">{t("studio.count.legend")}</p>
        <Badge>{t("studio.iphoneOnly")}</Badge>
      </div>
      <SegmentedControl<StampsPlace>
        label={t("studio.count.place")}
        options={[
          { value: "secondary", label: t("studio.count.places.secondary") },
          { value: "header", label: t("studio.count.places.header") },
        ]}
        value={chosen.stampsPlace}
        onChange={(place) => onChange(withStampsPlace(value, place, savedFields))}
      />
      <SegmentedControl<StampsFormat>
        label={t("studio.count.format")}
        options={[
          { value: "count", label: <bdi dir="ltr">{count}</bdi> },
          { value: "fraction", label: <bdi dir="ltr">{`${count}/${value.stamps_required}`}</bdi> },
        ]}
        value={chosen.stampsFormat}
        onChange={(stamps_format) => onChange(withOption(value, { stamps_format }))}
      />
      <p className="-mt-2 text-sm leading-snug text-ink-muted">{t("studio.count.google")}</p>
    </div>
  );
}

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
