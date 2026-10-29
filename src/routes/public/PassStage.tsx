import { useTranslation } from "react-i18next";
import type { CardPublic } from "../../api/loyalty";
import { AppleCardPreview, GoogleCardPreview } from "../../components/card-studio/CardPreviews";
import { LitPanel, useReducedMotion } from "../../components/kit";
import { cn } from "../../lib/cn";
import { usePublicCardPreview } from "./publicCard";
import { deviceWallet } from "./wallet";

/**
 * The customer's own pass, staged in the sign's light.
 *
 * The pass stands in its slot of exactly 300px, the size both previews are
 * built for, in a lit stage 340px wide (DESIGN.md's 300px Slot Rule). On a
 * phone the stage reaches into the page's gutter, as the Overview stands its
 * wallpaper, so a 320px screen still gives the pass its full 300px; on a
 * screen narrower than that the stage clips the pass's edges rather than
 * squeeze it.
 *
 * The card itself is the studio's renderer untouched, which is the whole
 * point: it prefers the published PNG PassKit serves to the phone, so this
 * page cannot drift away from the pass the way a hand-drawn mock did. No
 * switcher goes with it: the customer has one wallet, and the preview is the
 * one this phone has (Google on Android, Apple otherwise), as the add button
 * under it is named.
 *
 * Hidden from assistive tech and summarised in words instead — read out
 * element by element it is a pile of unlabelled fragments, and the summary
 * says the same thing in one sentence.
 *
 * How it arrives is the stage's, never the pass's: the previews are drawn
 * as the wallets draw them and only their slot moves.
 * - `activate`, the card arriving on a join, once: the stage stands unlit
 *   (the wall, with a hairline edge) and its light comes up behind the pass
 *   over 600ms. The pass settles 8px into its slot in the first 240ms, so
 *   the light warms behind a card that is already there rather than
 *   fading on the same clock.
 * - `lights`, a return (`/c`): lights on, 240ms.
 * With reduced motion either one is the light at full strength in 150ms,
 * with no travel.
 */
export function PassStage({
  card,
  serial,
  holderName,
  arrival,
  className,
}: {
  card: CardPublic;
  /** The card's serial — what the barcode encodes. */
  serial: string;
  /** The name the customer just gave, printed in the pass's name field. */
  holderName?: string;
  arrival?: "activate" | "lights";
  className?: string;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const platform = deviceWallet() === "google" ? "google" : "apple";
  // The hook lives here rather than at the call sites: both of them render
  // this behind a loading/error branch, where a hook can't go.
  const value = usePublicCardPreview(card, serial, holderName);
  const activate = arrival === "activate" && !reduced;

  return (
    // `--unlit` keeps the wall: inside the lit stage, `background` is the
    // lit panel's own colour.
    <div className={cn("-mx-4 flex justify-center [--unlit:var(--c-background)] sm:mx-0", className)}>
      <LitPanel
        light="field"
        radius="card"
        arrive={arrival !== undefined && !activate}
        className="relative flex w-[340px] max-w-full justify-center overflow-hidden px-5 py-6"
      >
        {activate && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[rgb(var(--unlit))] ring-1 ring-inset ring-border animate-stage-on"
          />
        )}
        <div aria-hidden="true" className={cn("relative w-[300px] shrink-0", activate && "animate-lights-on")}>
          {platform === "apple" ? <AppleCardPreview {...value} /> : <GoogleCardPreview {...value} />}
        </div>
        <p className="sr-only">
          {t("onboarding.preview.summary", {
            name: value.businessName,
            count: value.stampsRequired,
            reward: value.rewardDescription,
          })}
        </p>
      </LitPanel>
    </div>
  );
}
