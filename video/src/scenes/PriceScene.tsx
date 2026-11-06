import { useTranslation } from "react-i18next";
import { useCurrentFrame } from "remotion";
import { LitPanel } from "../../../src/components/kit/LitPanel";
import { light, sec } from "../motion";
import { Caption, Ltr, SafeArea, Stack, useHebrew } from "../pieces";

export const PRICE = { price: sec(0.6), cancel: sec(3.0) } as const;

/**
 * 6. The price: free to design and try on your own phone; ₪99 a month
 * including VAT, only once customers can join; then, in the first line's
 * place, cancel any time, and the cards customers hold keep working. The
 * two lines take turns over the price so the screen keeps to about twelve
 * words beside it. The price is printed, never counted.
 */
export function PriceScene() {
  const { t } = useTranslation();
  const frame = useCurrentFrame();
  const hebrew = useHebrew();

  return (
    <SafeArea>
      <Stack className="min-h-[170px] items-start">
        <div style={light(frame, 0, PRICE.cancel)}>
          <Caption>{t("video:price.free")}</Caption>
        </div>
        <div style={light(frame, PRICE.cancel)}>
          <Caption>{t("video:price.cancel")}</Caption>
        </div>
      </Stack>

      <div className="mt-[96px] w-full" style={light(frame, PRICE.price)}>
        <LitPanel
          light="lit"
          className="flex flex-col items-center px-[56px] py-[72px] text-center"
          style={{ borderRadius: 64 }}
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
        </LitPanel>
      </div>
    </SafeArea>
  );
}
