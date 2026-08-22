import { useTranslation } from "react-i18next";
import type { CardPublic } from "../../api/loyalty";
import {
  AppleCardPreview,
  GoogleCardPreview,
  type PreviewPlatform,
} from "../../components/card-studio/CardPreviews";
import { cn } from "../../lib/cn";
import { usePublicCardPreview } from "./publicCard";

/** Which wallet this phone actually has.
 *
 * No switcher goes with this on the public pages, deliberately. The owner's
 * studio has one because the owner is designing for both; the customer has
 * exactly one wallet, and a segmented "Apple / Google" control next to an
 * add-to-wallet button reads as a choice about where the pass is going —
 * which it isn't. The add link is one universal URL the provider resolves
 * by device, so the preview resolves the same way and says nothing.
 *
 * Desktop can't be told apart and falls back to Apple; nobody joins a punch
 * card from a laptop, and either layout is honest there. */
function devicePlatform(): PreviewPlatform {
  if (typeof navigator === "undefined") return "apple";
  if (/android/i.test(navigator.userAgent)) return "google";
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return "apple";
  // iPadOS 13+ claims to be a Mac. A Mac with a touchscreen is an iPad.
  if (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  )
    return "apple";
  return "apple";
}

/**
 * The customer's own pass, staged.
 *
 * `theme-lit` because a pass is not a screen the page owns — it is the thing
 * being handed over, and it is drawn on white by both wallets whatever the
 * page around it is doing (see index.css, "Things that stay lit").
 *
 * The card itself is the studio's renderer untouched, which is the whole
 * point: it prefers the published PNG PassKit serves to the phone, so this
 * page cannot drift away from the pass the way a hand-drawn mock did.
 *
 * Hidden from assistive tech and summarised in words instead — read out
 * element by element it is a pile of unlabelled fragments, and the summary
 * says the same thing in one sentence.
 */
export function PassStage({
  card,
  serial,
  holderName,
  className,
}: {
  card: CardPublic;
  /** The card's serial — what the barcode encodes. */
  serial: string;
  /** The name the customer just gave, printed in the pass's name field.
   * Without it the renderer prints its sample name, which is the right
   * default in the studio and plainly wrong on someone's own card. */
  holderName?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const platform = devicePlatform();
  // The hook lives here rather than at the call sites: both of them render
  // this behind a loading/error branch, where a hook can't go.
  const value = usePublicCardPreview(card, serial, holderName);

  return (
    <div className={cn("theme-lit w-full", className)}>
      {/* An object arriving, not a paragraph revealing. `animate-scale-in` is
          already in the vocabulary and the reduced-motion block in index.css
          already switches it off, so this needs nothing new. */}
      <div
        aria-hidden="true"
        className="animate-scale-in mx-auto w-full max-w-[300px]"
      >
        {platform === "apple" ? (
          <AppleCardPreview {...value} />
        ) : (
          <GoogleCardPreview {...value} />
        )}
      </div>
      <p className="sr-only">
        {t("onboarding.preview.summary", {
          name: value.businessName,
          count: value.stampsRequired,
          reward: value.rewardDescription,
        })}
      </p>
    </div>
  );
}
