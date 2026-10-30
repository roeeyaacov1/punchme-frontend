import { forwardRef, useImperativeHandle, useMemo, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  AppleCardPreview,
  GoogleCardPreview,
  type CardPreviewValue,
  type PreviewPlatform,
} from "../../components/card-studio/CardPreviews";
import { SegmentedControl, WallpaperStage } from "../../components/kit";
import { cn } from "../../lib/cn";
import { MAX_STAMPS, type Niche } from "./draft";
import { useStageWallet } from "./stageWallet";
import { useOnboardingDraft } from "./useOnboardingDraft";

const WALLETS: PreviewPlatform[] = ["apple", "google"];

/** Where each wallet draws its stamps: the pass's own rows, in the order the
 * frozen previews draw them. Apple's strip sits under its logo row; Google's
 * hero is its last row, under the barcode. Read, never changed. */
const STAMPS_ROW: Record<PreviewPlatform, number> = { apple: 1, google: 5 };

/** The name the pass prints before there is one: the trade's own ("מספרה"),
 * and before a trade, or for "other", "Your business". Never "—", and never
 * a business someone made up. */
function nameBeforeOne(niche: Niche | null, t: TFunction): string {
  return niche && niche !== "other" ? t(`onboarding.business.niches.${niche}`) : t("onboarding.preview.yourBusiness");
}

export interface StageHandle {
  /** Where the pass's stamps are on screen now, to keep them in view above a tray. */
  stampsRect: () => DOMRect | null;
}

/**
 * The owner's card, standing on its own wallpaper (the kit's
 * `WallpaperStage`), the pass in its 300px slot, never redrawn. Above it, the
 * Apple/Google switch, which opens on the phone's own wallet.
 *
 * `top` shows the top of the pass on a phone: its name and, on Apple's, its
 * stamps, cut where the pass has nothing to say. From 1024px, where the card
 * has a column of its own, it is always whole, with the switch over it.
 */
export const CardStage = forwardRef<
  StageHandle,
  {
    /** The pass as it stands: the draft's, unless a screen has something
     * truer (the published card, or the look a trade is about to bring). */
    preview?: CardPreviewValue;
    crop?: "top" | "whole";
    /** Said over the pass's corner, such as "Not live yet". */
    tag?: ReactNode;
    className?: string;
  }
>(function CardStage({ preview: given, crop = "whole", tag, className }, ref) {
  const { t } = useTranslation();
  const { draft, preview: drafted } = useOnboardingDraft();
  const [wallet, setWallet] = useStageWallet();
  const slot = useRef<HTMLDivElement>(null);
  const preview = given ?? drafted;

  const shown = useMemo<CardPreviewValue>(
    () => ({
      ...preview,
      businessName: preview.businessName.trim() ? preview.businessName : nameBeforeOne(draft.niche, t),
      holderName: t("studio.sampleName"),
    }),
    [preview, draft.niche, t],
  );

  useImperativeHandle(
    ref,
    () => ({
      stampsRect: () => slot.current?.firstElementChild?.children[STAMPS_ROW[wallet]]?.getBoundingClientRect() ?? null,
    }),
    [wallet],
  );

  const Pass = wallet === "apple" ? AppleCardPreview : GoogleCardPreview;
  // Its height is all it is for, and that changes only with the wallet and
  // whether the pass draws the published strip or the stand-in.
  const published = !!shown.stripStates;
  const twin = useMemo(
    () => (
      <div aria-hidden className="invisible">
        <Pass {...shown} stampsRequired={MAX_STAMPS} currentStamps={0} />
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Pass, published],
  );
  const summary = t("onboarding.preview.summary", {
    name: shown.businessName,
    count: shown.stampsRequired,
    reward: shown.rewardDescription,
  });

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <SegmentedControl<PreviewPlatform>
        label={t("onboarding.preview.wallets")}
        hideLabel
        options={WALLETS.map((key) => ({ value: key, label: t(`studio.preview.${key}`) }))}
        value={wallet}
        onChange={setWallet}
        className={crop === "top" ? "max-lg:hidden" : undefined}
      />
      <div
        className={cn(
          "relative w-[340px] max-w-full",
          // 176px: just under Apple's strip, in the gap before its fields,
          // and just under Google's fields, before its barcode. A phone seen
          // past the edge of the page, not content clipped by accident.
          crop === "top" && "max-lg:h-44 max-lg:overflow-hidden max-lg:rounded-t-glass",
        )}
      >
        <WallpaperStage
          cardColor={preview.backgroundColor}
          stampColor={preview.design.stamp?.color ?? preview.labelColor}
          summary={summary}
        >
          {/* The stand-in grows by a row of stamps from 7 up, so the stage
              keeps room for the two-row card: an unseen copy with all twelve
              shares the cell. Dragging the count never moves the card, or
              the control under the finger. */}
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
            <div ref={slot}>
              <Pass {...shown} />
            </div>
            {twin}
          </div>
        </WallpaperStage>
        {tag && <div className="absolute end-3 top-3">{tag}</div>}
      </div>
    </div>
  );
});
