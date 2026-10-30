import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import type { PreviewPlatform } from "../../components/card-studio/CardPreviews";
import { focusRing, linkText, LitPanel } from "../../components/kit";
import { column } from "../../components/onboarding/column";
import { ProgressLine } from "../../components/onboarding/ProgressLine";
import { TopBar } from "../../components/onboarding/TopBar";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/cn";
import { usePublicGround } from "../../theme/usePublicGround";
import { deviceWallet } from "../public/wallet";
import { CardStage } from "./CardStage";
import { OnboardingDraftProvider } from "./DraftContext";
import { ALL_STEPS, DRAFT_STEPS, firstIncompleteStep, stepIndex, type WizardStep } from "./draft";
import { roadOf } from "./road";
import { StageWallet } from "./stageWallet";
import { useOnboardingDraft } from "./useOnboardingDraft";

/**
 * The wizard's frame: Lightbox by day, on the wall, outside the dashboard.
 * The top bar, then the road, then one screen at a time. Public: the draft
 * lives on this device until the account step turns it into a real card.
 * Anything after that (wallet, billing) sits behind `OnboardingGate` in the
 * route tree, not here.
 */
export function OnboardingLayout() {
  const wallet = useState<PreviewPlatform>(() => (deviceWallet() === "google" ? "google" : "apple"));
  return (
    <OnboardingDraftProvider>
      <StageWallet.Provider value={wallet}>
        <Shell />
      </StageWallet.Provider>
    </OnboardingDraftProvider>
  );
}

/** Screens still on the old step shell: the frame draws their card for them
 * until each moves onto `StepShell` (Phase 4, step B). */
const LEGACY = new Set<WizardStep>(["color", "accent", "stamp", "reward", "account", "wallet", "billing"]);

function stepFromPath(pathname: string): WizardStep | null {
  const last = pathname.replace(/\/+$/, "").split("/").pop() ?? "";
  return (ALL_STEPS as readonly string[]).includes(last) ? (last as WizardStep) : null;
}

function Shell() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const { draft, resolved, preview, hasArt } = useOnboardingDraft();
  usePublicGround();

  const step = stepFromPath(location.pathname);
  const first = firstIncompleteStep(draft, hasArt);
  const place = step ? roadOf(step) : null;

  // The tab names the screen, and a tray by its own name.
  useEffect(() => {
    if (!step) return;
    const previous = document.title;
    document.title = `${t(`onboarding.steps.${step}`)} — ${t("app.name")}`;
    return () => {
      document.title = previous;
    };
  }, [step, t]);

  // A new stop starts at its top. A tray opening on the card screen is the
  // same stop, and leaves the page where it is.
  const stop = place?.at;
  useEffect(() => {
    if (stop) window.scrollTo({ top: 0, behavior: "instant" });
  }, [stop]);

  // Announced quietly, and only once the owner has stopped changing things.
  const spoken = useDebounce(
    t("onboarding.preview.summary", {
      name: resolved.name || t("onboarding.business.nameLabel"),
      count: preview.stampsRequired,
      reward: preview.rewardDescription,
    }),
    1200,
  );

  // Forward guard: a draft step past the first incomplete one is not
  // reachable by URL. Wallet and billing govern themselves.
  if (step && (DRAFT_STEPS as readonly string[]).includes(step) && stepIndex(step) > stepIndex(first)) {
    return <Navigate to={`/onboarding/${first}`} replace />;
  }

  return (
    <div className="theme-lightbox flex min-h-svh flex-col bg-background text-ink [-webkit-tap-highlight-color:transparent] [&_button]:select-none">
      <a
        href="#onboarding-step"
        className={cn(
          "type-label sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2.5",
          focusRing,
        )}
      >
        {t("landing.nav.skipToContent")}
      </a>
      <TopBar showSignIn={!isAuthenticated} />

      <main className={cn(column, "flex flex-1 flex-col gap-6 pb-10 pt-2")}>
        {/* A staff account usually has no Business of its own, so it never
            reaches the dashboard, the only other place the admin link lives. */}
        {user?.is_staff && (
          <LitPanel className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
            <p className="type-body text-ink">{t("admin.staffHere")}</p>
            <Link to="/admin" className={cn(linkText, "type-body inline-flex min-h-11 items-center")}>
              {t("admin.openAdmin")}
            </Link>
          </LitPanel>
        )}

        {place && (
          <ProgressLine
            stop={place.stop}
            total={place.total}
            here={t(`onboarding.steps.${place.at}`)}
            next={place.next ? t(`onboarding.steps.${place.next}`) : null}
          />
        )}

        <div id="onboarding-step" tabIndex={-1} className="flex flex-col gap-5 outline-none">
          {step && LEGACY.has(step) && <CardStage crop="top" />}
          <Outlet />
        </div>
      </main>

      <p className="sr-only" aria-live="polite">
        {spoken}
      </p>
    </div>
  );
}
