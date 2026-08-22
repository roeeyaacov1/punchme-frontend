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
 * 1. `strip_url` / `hero_url` — the literal PNG PassKit serves to the
 *    phone. Nothing client-side can disagree with it, because it *is* it.
 * 2. No published art (the design has never synced), but a design doc:
 *    `StampGrid` redraws the strip in CSS from the real glyph, colour and
 *    pattern. Close, and honest about the card's actual design.
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
    logoUrl: card.logo_url ?? undefined,
    appleLogoUrl: card.apple_logo_url ?? undefined,
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

/**
 * The same value, but the published art is only wired in once it is known
 * to load — the wizard's `usePublishedPreview` rule, for the same reason.
 *
 * An `<img>` pointed at an unreachable CDN (or, in local dev, the fake
 * provider's `fake-wallet.local`) puts a broken-image glyph through the
 * middle of the card, which is a worse thing to hand a customer than the
 * CSS redraw the renderer already falls back to. So the real art is an
 * upgrade applied on success, never an assumption.
 *
 * Both slots are probed independently: the page renders whichever wallet
 * this phone has, and one of the two going missing shouldn't cost the other
 * its artwork.
 */
export function usePublicCardPreview(
  card: CardPublic,
  serial: string,
  holderName?: string,
): CardPreviewValue {
  const base = publicCardPreview(card, serial, holderName);
  const state = String(card.stamp_count);
  const strip = card.strip_url || undefined;
  const hero = card.hero_url || undefined;
  const [loaded, setLoaded] = useState<{ strip?: string; hero?: string }>({});

  useEffect(() => {
    let cancelled = false;
    setLoaded({});
    if (strip) void probe(strip).then((ok) => {
      if (ok && !cancelled) setLoaded((v) => ({ ...v, strip }));
    });
    if (hero) void probe(hero).then((ok) => {
      if (ok && !cancelled) setLoaded((v) => ({ ...v, hero }));
    });
    return () => {
      cancelled = true;
    };
  }, [strip, hero]);

  return {
    ...base,
    stripStates: loaded.strip ? { [state]: loaded.strip } : undefined,
    heroStates: loaded.hero ? { [state]: loaded.hero } : undefined,
  };
}
