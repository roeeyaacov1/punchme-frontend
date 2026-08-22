import { useTranslation } from "react-i18next";
import { Activity, MessageCircle, Scissors, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";
import { Container } from "./primitives";
import { NotificationBanner } from "./NotificationBanner";
import { useReveal } from "../motion/useReveal";

interface PushNotification {
  app: string;
  when: string;
  message: string;
}

/** The icon, tone, resting angle and horizontal offset for each banner, in
 * order. Kept out of the translation files because none of it is language —
 * the copy is.
 *
 * `tilt` and `offset` are separate because only the tilt is animated: the
 * offset is a margin, and dropping it while a banner was still arriving
 * would shift the column under the two below it. */
const BANNERS = [
  { icon: Activity, tone: "violet", tilt: "-rotate-[1.6deg]", offset: "" },
  { icon: Sparkles, tone: "magenta", tilt: "rotate-[1.1deg]", offset: "sm:-me-4" },
  { icon: Scissors, tone: "blue", tilt: "-rotate-[0.7deg]", offset: "" },
] as const;

/**
 * The violet band: "send a message, they come back".
 *
 * The page changes subject here — from the card an owner designs to the
 * thing that actually earns the subscription — and the full-bleed colour is
 * what marks that on a phone, where only one section is ever in view.
 *
 * The three banners arrive the way three notifications actually arrive: one
 * at a time, a beat apart, each dropping the short distance a banner drops
 * and settling into its own angle. That is the press curve rather than the
 * rise — a notification is an object landing on a screen, and this section is
 * the only place on the page where the *sequence* is the point. Nothing
 * loops; they land once and stay.
 */
export function PushBand() {
  const { t } = useTranslation();
  const notifications = t("landing.push.notifications", {
    returnObjects: true,
  }) as PushNotification[];
  const copy = useReveal<HTMLDivElement>();

  return (
    <section id="push" className="scroll-mt-24 bg-brand-violet py-16 sm:py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div
            ref={copy.ref}
            style={copy.style}
            className={cn("max-w-2xl", copy.className)}
          >
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

          {/* The container clips nothing, so a banner's tilt can hang past
              the column edge. */}
          <ul className="flex flex-col gap-3">
            {notifications.map((notification, i) => {
              const banner = BANNERS[i % BANNERS.length];
              return (
                <Banner
                  key={notification.app}
                  banner={banner}
                  notification={notification}
                  delay={i * 180}
                />
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function Banner({
  banner,
  notification,
  delay,
}: {
  banner: (typeof BANNERS)[number];
  notification: PushNotification;
  delay: number;
}) {
  // A transition rather than the shared keyframe: each banner settles on its
  // own angle, and a keyframe can only end in one place.
  const rise = useReveal<HTMLLIElement>(delay);

  return (
    <li
      ref={rise.ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none",
        banner.offset,
        rise.revealed
          ? cn(banner.tilt, "opacity-100")
          : "-translate-y-3 rotate-0 opacity-0",
      )}
    >
      <NotificationBanner
        icon={banner.icon}
        tone={banner.tone}
        app={notification.app}
        when={notification.when}
        message={notification.message}
      />
    </li>
  );
}
