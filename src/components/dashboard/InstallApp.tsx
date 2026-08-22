import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Share, Smartphone, SquarePlus } from "lucide-react";
import { ctaClasses, focusRing } from "../marketing/primitives";
import { Panel, PanelHeader } from "./primitives";
import { useInstallApp } from "../../pwa/useInstallApp";
import { cn } from "../../lib/cn";

/**
 * Offering the owner a home-screen icon.
 *
 * Two platforms, two honest answers. On Chrome there is a real install API
 * and the button does exactly what it says. On iPhone there is none — Apple
 * has never shipped one — so the button opens the three steps instead of
 * pretending, and says so in the label. A control that claims to install and
 * then shows a tutorial is the kind of small lie that makes an owner stop
 * trusting the other buttons.
 *
 * The iPhone note is not hedging. WebKit does not keep a camera permission
 * for a home-screen app between launches, so the scanner will ask again each
 * morning, and a home-screen app gets its own storage jar so they sign in
 * once more inside it. Both are real, neither is our doing, and finding out
 * afterwards is worse than being told.
 *
 * Renders nothing at all when it is already installed, or in a browser that
 * cannot install — which is most desktop Firefox, and every in-app browser.
 */
export function InstallApp() {
  const { t } = useTranslation();
  const { route, dismissed, install, dismiss, restore } = useInstallApp();
  const [showSteps, setShowSteps] = useState(false);
  const [busy, setBusy] = useState(false);

  if (route === "none") return null;

  if (dismissed) {
    return (
      <button
        type="button"
        onClick={() => restore()}
        className={cn(
          "inline-flex min-h-[44px] items-center gap-2 self-start rounded-xl px-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink",
          focusRing,
        )}
      >
        <Smartphone size={16} aria-hidden />
        {t("dashboard.install.collapsed")}
      </button>
    );
  }

  const onInstall = async () => {
    setBusy(true);
    try {
      await install();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="flex flex-col gap-4 p-5 sm:p-6">
      <PanelHeader
        title={t("dashboard.install.title")}
        hint={t("dashboard.install.body")}
      />

      <div className="flex flex-wrap items-center gap-2">
        {route === "prompt" ? (
          <button
            type="button"
            onClick={onInstall}
            disabled={busy}
            className={ctaClasses("primary", "sm")}
          >
            <Smartphone size={16} aria-hidden />
            {t("dashboard.install.cta")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowSteps((open) => !open)}
            aria-expanded={showSteps}
            className={ctaClasses("secondary", "sm")}
          >
            <Share size={16} aria-hidden />
            {t("dashboard.install.iosCta")}
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          className={cn(
            "inline-flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-ink-subtle transition-colors hover:text-ink",
            focusRing,
          )}
        >
          {t("dashboard.install.notNow")}
        </button>
      </div>

      {route === "ios" && showSteps && (
        <ol className="flex flex-col gap-3 border-t border-border pt-4">
          {/* The glyphs are the point: an owner is looking for a shape in a
              toolbar, not reading a sentence. */}
          <Step index={1} icon={<Share size={17} aria-hidden />}>
            {t("dashboard.install.step1")}
          </Step>
          <Step index={2} icon={<SquarePlus size={17} aria-hidden />}>
            {t("dashboard.install.step2")}
          </Step>
          <Step index={3}>{t("dashboard.install.step3")}</Step>
        </ol>
      )}

      {route === "ios" && showSteps && (
        <p className="rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn">
          {t("dashboard.install.iosCaveat")}
        </p>
      )}
    </Panel>
  );
}

function Step({
  index,
  icon,
  children,
}: {
  index: number;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 text-sm text-ink">
      <span
        aria-hidden
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 font-mono text-xs font-semibold text-primary-text"
      >
        {index}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {icon && <span className="shrink-0 text-ink-muted">{icon}</span>}
    </li>
  );
}
