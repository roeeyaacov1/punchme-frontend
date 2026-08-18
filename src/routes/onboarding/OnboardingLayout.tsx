import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import {
  AppleCardPreview,
  GoogleCardPreview,
  type PreviewPlatform,
} from "../../components/card-studio/CardPreviews";
import { IslandSwitch, PhoneFrame } from "../../components/onboarding/PhoneFrame";
import { useWakeOnChange } from "../../components/onboarding/useWakeOnChange";
import { StepProgress } from "../../components/onboarding/StepProgress";
import { TopBar } from "../../components/onboarding/TopBar";
import { focusRing } from "../../components/marketing/primitives";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/cn";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { OnboardingDraftProvider } from "./DraftContext";
import { useOnboardingDraft } from "./useOnboardingDraft";
import {
  ALL_STEPS,
  DRAFT_STEPS,
  firstIncompleteStep,
  stepIndex,
  type DraftStep,
  type WizardStep,
} from "./draft";

/**
 * The wizard's shell: one paper panel on the card-stock ground, with the
 * owner's pass in a phone at the top and one step at a time underneath.
 * Public — the draft lives on this device until the account step turns it
 * into a real card. Anything after that (wallet, billing) sits behind
 * `OnboardingGate` in the route tree, not here.
 */
export function OnboardingLayout() {
  return (
    <OnboardingDraftProvider>
      <Shell />
    </OnboardingDraftProvider>
  );
}

const PLATFORMS: PreviewPlatform[] = ["apple", "google"];

function stepFromPath(pathname: string): WizardStep | null {
  const last = pathname.replace(/\/+$/, "").split("/").pop() ?? "";
  return (ALL_STEPS as readonly string[]).includes(last) ? (last as WizardStep) : null;
}

function Shell() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const { draft, resolved, preview, hasArt } = useOnboardingDraft();
  const [platform, setPlatform] = useState<PreviewPlatform>("apple");

  const step = stepFromPath(location.pathname);
  const first = firstIncompleteStep(draft, hasArt);

  // The screen brightens when the card changes — colours, stamp, count — but
  // not on every keystroke of the name.
  const wakeKey = useMemo(
    () =>
      [
        preview.backgroundColor,
        preview.foregroundColor,
        preview.design.stamp?.color,
        preview.design.stamp?.glyph,
        preview.stampArtUrl,
        preview.stampsRequired,
      ].join("|"),
    [preview],
  );
  const wake = useWakeOnChange(wakeKey);

  useEffect(() => {
    if (!step) return;
    const previous = document.title;
    document.title = `${t(`onboarding.steps.${step}`)} — ${t("app.name")}`;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    return () => {
      document.title = previous;
    };
  }, [step, t, reduced]);

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
  if (
    step &&
    (DRAFT_STEPS as readonly string[]).includes(step) &&
    stepIndex(step) > stepIndex(first)
  ) {
    return <Navigate to={`/onboarding/${first}`} replace />;
  }

  const stepLabel = (s: string) => t(`onboarding.steps.${s}`);
  const reachable = (s: string) =>
    (DRAFT_STEPS as readonly string[]).includes(s) &&
    stepIndex(s as DraftStep) <= stepIndex(first);

  return (
    <div className="theme-purple theme-raised min-h-screen bg-background text-ink">
      <a
        href="#onboarding-step"
        className={cn(
          "sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold",
          focusRing,
        )}
      >
        {t("landing.nav.skipToContent")}
      </a>

      <TopBar showSignIn={!isAuthenticated} />

      <main className="mx-auto w-full max-w-md px-3 pb-16 sm:max-w-lg sm:px-0">
        {/* A staff account usually has no Business of its own, so it never
            reaches the dashboard — the only other place the admin link lives. */}
        {user?.is_staff && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
            <span className="text-sm">{t("admin.staffHere")}</span>
            <Link to="/admin" className={cn("text-sm font-semibold underline hover:no-underline", focusRing)}>
              {t("admin.openAdmin")}
            </Link>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          {/* The phone, cropped: you are looking at the top of a phone with
              the pass on it, not at a picture of one. */}
          {/* The phone is cropped; the pass never is. Google stacks its
              stamps *below* the barcode where Apple puts them above, so a
              crop that spared Apple's cut Google's off entirely.

              Fixed rather than content-height on purpose: the reward step's
              slider changes the stamp count, a second row of stamps would
              change the height, and the control you are dragging would slide
              out from under your finger. So this is the two-row worst case
              for either wallet, with a little wallpaper left below it. Remeasure
              if the pass layout changes. */}
          <div className="h-[424px] overflow-hidden bg-background/60 pt-3 sm:h-[452px] sm:pt-5">
            <PhoneFrame
              backgroundColor={preview.backgroundColor}
              accentColor={preview.labelColor}
              wake={wake}
              island={
                <IslandSwitch
                  label={t("onboarding.preview.wallets")}
                  value={platform}
                  onChange={setPlatform}
                  options={PLATFORMS.map((key) => ({
                    value: key,
                    label: t(`studio.preview.${key}`),
                  }))}
                />
              }
            >
              {platform === "apple" ? (
                <AppleCardPreview {...preview} />
              ) : (
                <GoogleCardPreview {...preview} />
              )}
            </PhoneFrame>
          </div>
          <p className="sr-only" aria-live="polite">
            {spoken}
          </p>

          <div className="px-5 pb-7 pt-3 sm:px-8">
            <p className="text-pretty text-sm text-ink-subtle">
              {t("onboarding.preview.caption", {
                count: preview.stampsRequired,
                reward: preview.rewardDescription,
              })}
            </p>

            <StepProgress
              className="mt-2"
              steps={ALL_STEPS}
              current={step ?? "business"}
              reachable={reachable}
              hrefFor={(s) => `/onboarding/${s}`}
              labelFor={stepLabel}
            />

            <div id="onboarding-step" className="mt-3">
              <Outlet />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
