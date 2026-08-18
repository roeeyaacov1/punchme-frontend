import { useTranslation } from "react-i18next";
import { Activity, MessageCircle, Scissors, Sparkles } from "lucide-react";
import { Container } from "./primitives";
import { NotificationBanner } from "./NotificationBanner";

interface PushNotification {
  app: string;
  when: string;
  message: string;
}

/** The icon, tone and tilt for each banner, in order. Kept out of the
 * translation files because none of it is language — the copy is. */
const BANNERS = [
  { icon: Activity, tone: "violet", tilt: "-rotate-[1.6deg]" },
  { icon: Sparkles, tone: "magenta", tilt: "rotate-[1.1deg] sm:-me-4" },
  { icon: Scissors, tone: "blue", tilt: "-rotate-[0.7deg]" },
] as const;

/**
 * The violet band: "send a message, they come back".
 *
 * The page changes subject here — from the card an owner designs to the
 * thing that actually earns the subscription — and the full-bleed colour is
 * what marks that on a phone, where only one section is ever in view.
 */
export function PushBand() {
  const { t } = useTranslation();
  const notifications = t("landing.push.notifications", {
    returnObjects: true,
  }) as PushNotification[];

  return (
    <section id="push" className="scroll-mt-24 bg-brand-violet py-16 sm:py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-pill px-3 py-1.5 text-xs font-bold text-ink">
              <MessageCircle size={14} aria-hidden="true" />
              {t("landing.push.badge")}
            </p>

            <h2 className="t-h2 mt-5 text-balance text-white">
              {t("landing.push.title")}
            </h2>

            <p className="t-lead mt-6 text-pretty text-brand-on-band">
              {t("landing.push.body")}
            </p>
          </div>

          {/* Negative vertical margins let the banners overlap the way a
              stack of them does; the container clips nothing, so the tilt
              can hang past the column edge. */}
          <ul className="flex flex-col gap-3">
            {notifications.map((notification, i) => {
              const banner = BANNERS[i % BANNERS.length];
              return (
                <li key={notification.app} className={banner.tilt}>
                  <NotificationBanner
                    icon={banner.icon}
                    tone={banner.tone}
                    app={notification.app}
                    when={notification.when}
                    message={notification.message}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
