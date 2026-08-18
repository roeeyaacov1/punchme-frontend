import { useEffect, useState } from "react";
import type { Business } from "../../api/businesses";
import { designImageUrls, type DesignOut } from "../../api/designs";
import type { CardPreviewValue } from "../../components/card-studio/CardPreviews";
import { sampleStamps } from "./draft";

/** Resolves true when the browser can actually load `url`. */
function probe(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * The phone's value once the real card exists: the published PNGs, exactly
 * what the wallet shows. But only if they load — a CDN that is unreachable
 * (or, locally, the fake provider's `fake-wallet.local`) would otherwise
 * leave the card blank, and the CSS approximation with the right colours is
 * the more honest picture than an empty strip.
 */
export function usePublishedPreview(
  design: DesignOut | undefined,
  business: Business | null,
  artUrl: string | undefined,
): CardPreviewValue | null {
  const [value, setValue] = useState<CardPreviewValue | null>(null);

  useEffect(() => {
    if (!design || !business || !design.sync.synced_at) {
      setValue(null);
      return;
    }
    let cancelled = false;
    const images = designImageUrls(design);
    const stamps = sampleStamps(design.stamps_required);
    const base: CardPreviewValue = {
      businessName: business.name,
      stampsRequired: design.stamps_required,
      currentStamps: stamps,
      rewardDescription: design.reward_description,
      backgroundColor: design.background_color,
      foregroundColor: design.foreground_color,
      labelColor: design.label_color,
      design: design.design,
      stampArtUrl: design.assets.includes("stamp_art") ? artUrl : undefined,
      unsaved: true,
    };
    // Show the design immediately; upgrade to the published art once it is
    // known to load.
    setValue(base);
    const strip = images.strip_states?.[String(stamps)];
    if (!strip) return;
    probe(strip).then((ok) => {
      if (cancelled || !ok) return;
      setValue({
        ...base,
        logoUrl: images.logo,
        appleLogoUrl: images.apple_logo,
        stripBaseUrl: images.strip_base,
        stripStates: images.strip_states,
        heroStates: images.hero_states,
        unsaved: false,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [design, business, artUrl]);

  return value;
}
