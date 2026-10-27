import { useEffect, useState } from "react";
import { readableInk } from "../../lib/color";

/** What `/api/p` says about the card's shop, for the pieces below. */
export interface ShopFace {
  business_name: string;
  template_name: string;
  background_color: string;
  foreground_color: string;
  label_color: string;
  logo_url: string | null;
}

/**
 * The shop's mark: its logo, once the picture is known to load, else its
 * initial on the card's own colour, as the kit's lock-screen notification
 * draws a sender. A logo hosted by a wallet provider that isn't there
 * (locally, `fake-wallet.local`) never shows a torn image.
 */
export function ShopMark({ shop }: { shop: ShopFace }) {
  const [logo, setLogo] = useState<string | null>(null);
  useEffect(() => {
    setLogo(null);
    if (!shop.logo_url) return;
    let live = true;
    const img = new Image();
    img.onload = () => {
      if (live) setLogo(shop.logo_url);
    };
    img.src = shop.logo_url;
    return () => {
      live = false;
    };
  }, [shop.logo_url]);

  if (logo) {
    return <img src={logo} alt="" className="size-10 shrink-0 rounded-[0.625rem] bg-white object-contain ring-1 ring-inset ring-rim/10" />;
  }
  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-[0.625rem] font-heading text-base font-medium ring-1 ring-inset ring-rim/10"
      style={{ backgroundColor: shop.background_color, color: shop.foreground_color || readableInk(shop.background_color) }}
    >
      {Array.from(shop.business_name.trim())[0] ?? ""}
    </span>
  );
}

/** The mark beside the shop's name and its card's. */
export function ShopLine({ shop }: { shop: ShopFace }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <ShopMark shop={shop} />
      <div className="min-w-0 text-start">
        <p dir="auto" className="font-heading text-base font-medium leading-tight text-ink">
          {shop.business_name}
        </p>
        <p dir="auto" className="text-sm leading-snug text-ink-muted">
          {shop.template_name}
        </p>
      </div>
    </div>
  );
}

/** The card as a chip in its own colours, the owner's pair as the pass
 * carries it: the shop's name, and the card's in its label colour. */
export function CardChip({ shop }: { shop: ShopFace }) {
  return (
    <div
      className="w-full rounded-panel px-5 py-6 text-center"
      style={{ backgroundColor: shop.background_color, color: shop.foreground_color }}
    >
      <p dir="auto" className="font-heading text-[1.1875rem] font-medium leading-tight">
        {shop.business_name}
      </p>
      <p dir="auto" className="mt-1 text-sm font-semibold" style={{ color: shop.label_color }}>
        {shop.template_name}
      </p>
    </div>
  );
}
