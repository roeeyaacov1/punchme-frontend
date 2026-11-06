import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { RewardField, StampCountControl } from "../../../../components/card-studio/controls";
import { studioMode } from "../../../../components/card-studio/designOptions";
import { CountOnCard } from "../../../../components/card-studio/trays/RewardTray";
import { sampleStamps } from "../../draft";
import { draftPatchOf, studioValueOf } from "../../studioValue";
import { useOnboardingDraft } from "../../useOnboardingDraft";

/**
 * What customers get, and after how many stamps: the card controls' reward
 * field (two lines) and stamp count. The reward is also what the back of the
 * card says, since the wizard writes it there. Enter goes on, as the tray's
 * button does: to the next part not yet opened, or to saving the card.
 *
 * On a card from a look, also the studio's "The count on the card" (brief
 * §7.4): under the stamps or at the top, and "6" or "6/8", Apple's alone.
 */
export const RewardPanel = forwardRef<
  HTMLTextAreaElement,
  {
    /** The save found no reward: said under the field. */
    asked: boolean;
    onEnter: () => void;
  }
>(function RewardPanel({ asked, onEnter }, ref) {
  const { t, i18n } = useTranslation();
  const { draft, resolved, update, artUrl, stickers, templateInput } = useOnboardingDraft();
  const glyph = resolved.stamp.kind === "glyph" ? resolved.stamp.glyph : "check";
  const card = draft.look ? studioValueOf(resolved, i18n.resolvedLanguage ?? "en", t, templateInput.name) : null;
  // Offered, as in the studio, only where the wallet draws the options.
  const shown = card && studioMode(stickers, card.design) === "options" ? card : null;
  return (
    <div className="flex flex-col gap-6">
      <RewardField
        ref={ref}
        value={resolved.reward}
        onChange={(reward) => update({ reward })}
        note={t("studio.back.follows")}
        error={asked && !resolved.reward.trim() ? t("onboarding.missing.reward") : undefined}
        onEnter={onEnter}
      />
      {/* The stamps on what they stand on: their ground where the card has
          one, since stamps in the card's own colour vanish on the card. */}
      <StampCountControl
        value={resolved.stampsRequired}
        onChange={(stampsRequired) => update({ stampsRequired })}
        glyph={glyph}
        stampColour={resolved.accent}
        background={resolved.panel || resolved.background}
        pictureUrl={artUrl ?? null}
      />
      {shown && (
        <CountOnCard
          value={shown}
          onChange={(next) => update(draftPatchOf(next, shown))}
          sample={sampleStamps(resolved.stampsRequired)}
        />
      )}
    </div>
  );
});
