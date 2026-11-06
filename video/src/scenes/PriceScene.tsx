import { useTranslation } from "react-i18next";
import { ACTIVATION_MS, EASE_OUT, progress, sec, useBeat } from "../motion";
import { Ltr, SafeArea, Say, Stack, useHebrew } from "../pieces";

export const PRICE = { on: sec(0.45), cancel: sec(3.0) } as const;

/**
 * 6. The price: free to design and try on your own phone; ₪99 a month
 * including VAT, only once customers can join; then, in the first line's
 * place, cancel any time, and the cards customers hold keep working. The
 * two lines take turns over the price so the screen keeps to about twelve
 * words beside it.
 *
 * The price's panel switches on the way the sign does when a business
 * activates (the landing page's "The sign switches on when you activate"):
 * an unlit outline whose light comes up over 600ms, once, the price lighting
 * with it. Printed, never counted.
 */
export function PriceScene() {
  const { t } = useTranslation();
  const { t: f } = useBeat();
  const hebrew = useHebrew();
  const lit = progress(f, PRICE.on, ACTIVATION_MS, EASE_OUT);

  return (
    <SafeArea>
      <Stack className="min-h-[170px] items-start">
        <Say text={t("video:price.free")} on={-1} off={PRICE.cancel} />
        <Say text={t("video:price.cancel")} on={PRICE.cancel} />
      </Stack>

      <div className="relative mt-[96px] w-full" style={{ borderRadius: 64 }}>
        {/* Unlit: only its edge. */}
        <div aria-hidden className="absolute inset-0 rounded-[64px] border-[3px] border-border-strong" />
        {/* Lit: the panel's own light, coming up. */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[64px] border-2 border-border bg-surface shadow-panel"
          style={{ opacity: lit }}
        />
        <div
          className="relative flex flex-col items-center px-[56px] py-[72px] text-center"
          style={{ opacity: lit, transform: `scale(${0.98 + 0.02 * lit})` }}
        >
          <span className="type-figure text-ink" style={{ fontSize: 240, lineHeight: 1 }}>
            <Ltr>{t("landing.pricing.pro.price")}</Ltr>
          </span>
          <span className="mt-[28px] font-heading font-medium text-ink" style={{ fontSize: 64, lineHeight: 1.2 }}>
            {t("landing.pricing.pro.per")}
          </span>
          <span
            className="mt-[20px] text-balance font-body font-semibold text-ink-muted"
            style={{ fontSize: 56, lineHeight: hebrew ? 1.4 : 1.3 }}
          >
            {t("video:price.when")}
          </span>
        </div>
      </div>
    </SafeArea>
  );
}
