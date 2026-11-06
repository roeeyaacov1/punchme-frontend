import { useTranslation } from "react-i18next";
import { useCurrentFrame } from "remotion";
import { SITE_PX, light } from "../motion";
import { Logo, Ltr, SafeArea } from "../pieces";
import { SITE_URL } from "../config";

/**
 * 7. The door: the logo as the site's header draws it, "Start free" as the
 * site's coral pill with its label in ink (5.50:1), and the address. It
 * comes on at once and holds to the end.
 */
export function EndScene() {
  const { t } = useTranslation();
  const frame = useCurrentFrame();
  const host = new URL(SITE_URL).host;

  return (
    <SafeArea className="justify-center" style={{ paddingBottom: 380 }}>
      <div className="relative flex w-full flex-col items-center px-[60px] py-[120px]" style={light(frame, 0)}>
        <div aria-hidden className="theme-lit lit-field absolute inset-0" style={{ borderRadius: 40 * SITE_PX }} />
        <div className="relative flex flex-col items-center">
          <Logo height={120} />
          <span
            className="mt-[96px] inline-flex items-center rounded-full bg-primary font-heading font-medium text-primary-on"
            style={{ fontSize: 64, lineHeight: 1.2, minHeight: 52 * SITE_PX, paddingInline: 28 * SITE_PX }}
          >
            {t("landing.hero.cta")}
          </span>
          <span className="mt-[64px] font-heading font-medium text-ink" style={{ fontSize: 64, lineHeight: 1.2 }}>
            <Ltr>{host}</Ltr>
          </span>
        </div>
      </div>
    </SafeArea>
  );
}
