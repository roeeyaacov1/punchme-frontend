import { useTranslation } from "react-i18next";
import { interpolate } from "remotion";
import { SITE_URL } from "../config";
import { ACTIVATION_MS, EASE_OUT, SITE_PX, light, press, progress, sec, useBeat } from "../motion";
import { Logo, Ltr, SafeArea } from "../pieces";

export const END = { light: sec(0.1), cta: sec(0.4), site: sec(0.6), tap: sec(2.0) } as const;

/**
 * 7. The door: the logo as the site's header draws it, "Start free" as the
 * site's coral pill with its label in ink (5.50:1), and the address. The
 * field light behind them comes on as an activation, the pill lights and
 * settles, the address follows, and later the pill sinks once, as a press
 * does. It holds to the end.
 */
export function EndScene() {
  const { t } = useTranslation();
  const { t: f } = useBeat();
  const host = new URL(SITE_URL).host;
  const field = interpolate(progress(f, END.light, ACTIVATION_MS, EASE_OUT), [0, 1], [0.3, 1]);
  const settle = interpolate(progress(f, END.cta, 340, EASE_OUT), [0, 1], [0.94, 1]);

  return (
    <SafeArea className="justify-center" style={{ paddingBottom: 380 }}>
      <div className="relative flex w-full flex-col items-center px-[60px] py-[120px]">
        <div aria-hidden className="theme-lit lit-field absolute inset-0" style={{ opacity: field, borderRadius: 40 * SITE_PX }} />
        <div className="relative flex flex-col items-center">
          <Logo height={120} />
          <span
            className="mt-[96px] inline-flex items-center rounded-full bg-primary font-heading font-medium text-primary-on"
            style={{
              fontSize: 64,
              lineHeight: 1.2,
              minHeight: 52 * SITE_PX,
              paddingInline: 28 * SITE_PX,
              ...light(f, END.cta),
              transform: `scale(${settle * press(f, END.tap)})`,
            }}
          >
            {t("landing.hero.cta")}
          </span>
          <span
            className="mt-[64px] font-heading font-medium text-ink"
            style={{ fontSize: 64, lineHeight: 1.2, ...light(f, END.site) }}
          >
            <Ltr>{host}</Ltr>
          </span>
        </div>
      </div>
    </SafeArea>
  );
}
