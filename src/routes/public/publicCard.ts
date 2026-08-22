import { useEffect, useState } from "react";
import type { CardPublic } from "../../api/loyalty";
import type { CardPreviewValue } from "../../components/card-studio/CardPreviews";

/**
 * `/api/cards/{serial}` -> the value the studio's real Apple/Google
 * renderers take, so the public pages show the customer their actual pass
 * instead of a generic mock of one.
 *
 * There are three tiers here and the renderer picks the best available on
 * its own:
 *
 * 1. `strip_url` / `hero_url` — the artwork the pass is made of, rendered
 *    by the server from the same code that produces what the wallet
 *    provider is given. Nothing client-side can disagree with it.
 * 2. That URL did not load, but there is a design doc: `StampGrid` redraws
 *    the strip in CSS from the real glyph, colour and pattern. Close, and
 *    honest about the card's design — but blind to an uploaded stamp photo,
 *    which is why it is the fallback and not the plan.
 * 3. Neither — a frontend running ahead of the backend that serves them.
 *    The colours and the stamp count still land; the stamps fall back to
 *    the default glyph.
 *
 * The state map is keyed by this card's own `stamp_count` rather than by
 * the state the server clamped to. The server hands back the art for
 * `min(stamp_count, stamps_required)` — a card left past its requirement
 * gets the last strip rather than a blank one — and keying by the raw count
 * is what makes the lookup in `publishedArt` find it either way.
 */
export function publicCardPreview(
  card: CardPublic,
  serial: string,
  holderName?: string,
): CardPreviewValue {
  return {
    businessName: card.business_name,
    stampsRequired: card.stamps_required,
    currentStamps: card.stamp_count,
    rewardDescription: card.reward_description,
    backgroundColor: card.background_color,
    foregroundColor: card.foreground_color,
    labelColor: card.label_color,
    design: card.design ?? {},
    serial,
    holderName: holderName?.trim() || undefined,
  };
}

/** Resolves true when the browser can actually load `url`. */
function probe(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

type Slot = "strip" | "hero" | "logo" | "appleLogo";

/**
 * The same value, but every image is wired in only once it is known to
 * load — the wizard's `usePublishedPreview` rule, for the same reason.
 *
 * An `<img>` at an unreachable URL puts a broken-image glyph through the
 * card, which is worse than the fallback each slot already has: the
 * renderer redraws the strip in CSS, prints the business name where Apple's
 * wide logo goes, and draws an initial where Google's badge goes. Those are
 * all better than a torn icon, so a URL is an upgrade applied on success,
 * never an assumption.
 *
 * It matters for the logos in particular. Every slot except the ones we
 * render is hosted by the wallet provider, and WALLET_PROVIDER is still
 * "fake" — a business that uploaded its own logo has only a
 * `fake-wallet.local` link to show for it.
 *
 * Slots are probed independently: the page renders whichever wallet this
 * phone has, and one image going missing shouldn't cost the others theirs.
 */
export function usePublicCardPreview(
  card: CardPublic,
  serial: string,
  holderName?: string,
): CardPreviewValue {
  const base = publicCardPreview(card, serial, holderName);
  const state = String(card.stamp_count);
  const urls: Record<Slot, string | undefined> = {
    strip: card.strip_url || undefined,
    hero: card.hero_url || undefined,
    logo: card.logo_url || undefined,
    appleLogo: card.apple_logo_url || undefined,
  };
  const [loaded, setLoaded] = useState<Partial<Record<Slot, string>>>({});

  // Joined rather than passed as an array: the effect must re-run when a URL
  // changes (a stamp lands, the owner restyles the card) and not on every
  // render, and a fresh array literal would do the opposite of both.
  const key = ([...Object.values(urls)] as (string | undefined)[]).join("|");
  useEffect(() => {
    let cancelled = false;
    setLoaded({});
    for (const [slot, url] of Object.entries(urls) as [Slot, string | undefined][]) {
      if (!url) continue;
      void probe(url).then((ok) => {
        if (ok && !cancelled) setLoaded((v) => ({ ...v, [slot]: url }));
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    ...base,
    logoUrl: loaded.logo,
    appleLogoUrl: loaded.appleLogo,
    stripStates: loaded.strip ? { [state]: loaded.strip } : undefined,
    heroStates: loaded.hero ? { [state]: loaded.hero } : undefined,
  };
}
