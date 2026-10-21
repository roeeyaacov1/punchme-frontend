import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Share, Smartphone, SquarePlus } from "lucide-react";
import { Button } from "../kit/Button";
import { LitPanel } from "../kit/LitPanel";
import { Notice } from "../kit/Notice";
import { useInstallApp } from "../../pwa/useInstallApp";

/**
 * Offering the owner a home-screen icon, last and quiet.
 *
 * Two platforms, two honest answers. On Chrome there is a real install API
 * and the button does exactly what it says. On iPhone there is none, so the
 * button opens the three steps instead of pretending, and says so in its
 * label.
 *
 * The iPhone note isn't hedging: WebKit keeps no camera permission for a
 * home-screen app between launches, and the app gets its own storage, so
 * the owner signs in once more inside it. It is words and an icon on a
 * plain panel, not a warm wash. Renders nothing at all when the app is
 * installed already or the browser can't install it.
 */
export function InstallApp() {
  const { t } = useTranslation();
  const { route, dismissed, install, dismiss, restore } = useInstallApp();
  const [showSteps, setShowSteps] = useState(false);
  const [busy, setBusy] = useState(false);

  if (route === "none") return null;

  if (dismissed) {
    return (
      <Button variant="quiet" icon={<Smartphone aria-hidden />} onClick={() => restore()} className="self-start text-ink-muted">
        {t("dashboard.install.collapsed")}
      </Button>
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
    <LitPanel as="section" aria-labelledby="install-title" className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 id="install-title" className="type-card-title text-ink">
          {t("dashboard.install.title")}
        </h2>
        <p className="type-body text-ink-muted">{t("dashboard.install.body")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {route === "prompt" ? (
          <Button variant="secondary" icon={<Smartphone aria-hidden />} busy={busy} onClick={onInstall}>
            {t("dashboard.install.cta")}
          </Button>
        ) : (
          <Button variant="secondary" icon={<Share aria-hidden />} aria-expanded={showSteps} onClick={() => setShowSteps((open) => !open)}>
            {t("dashboard.install.iosCta")}
          </Button>
        )}
        <Button variant="quiet" onClick={dismiss}>
          {t("dashboard.install.notNow")}
        </Button>
      </div>

      {route === "ios" && showSteps && (
        <>
          <ol className="flex flex-col gap-3 border-t border-border pt-4">
            {/* The glyphs are the point: the owner is looking for a shape in
                a toolbar, not reading a sentence. */}
            <Step index={1} icon={<Share aria-hidden />}>
              {t("dashboard.install.step1")}
            </Step>
            <Step index={2} icon={<SquarePlus aria-hidden />}>
              {t("dashboard.install.step2")}
            </Step>
            <Step index={3}>{t("dashboard.install.step3")}</Step>
          </ol>
          <Notice tone="warn">{t("dashboard.install.iosCaveat")}</Notice>
        </>
      )}
    </LitPanel>
  );
}

function Step({ index, icon, children }: { index: number; icon?: ReactNode; children: ReactNode }) {
  return (
    <li className="type-body flex items-center gap-3 text-ink">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink font-heading text-sm font-medium tabular-nums"
      >
        {index}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {icon && <span className="shrink-0 text-ink-muted [&_svg]:size-5">{icon}</span>}
    </li>
  );
}
