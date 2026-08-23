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

/**
 * How much of the phone each step earns on a short screen.
 *
 * The wizard used to give all eight steps the same 530px crop, which is the
 * right answer for exactly half of them. On the colour and stamp screens the
 * card *is* the question — the owner is looking at the preview, not the
 * control. On the account screen it is a trophy for work already finished,
 * and it was pushing the password field off the bottom of an iPhone SE.
 *
 * `full` keeps the whole cut. `short` keeps the pass's top — name, and
 * Apple's stamps. `peek` is a reminder that the card is still there.
 *
 * The sizes live in `index.css`, next to `--phone-scale`, because they are
 * one system: scale is how big the phone is and the tier is how much of it
 * you see, and both only bite where the screen is short.
 */
const PREVIEW_TIER: Record<WizardStep, "full" | "short" | "peek"> = {
  business: "full",
  color: "full",
  accent: "full",
  stamp: "full",
  // The number and the words. The card restates them live, but the slider
  // and the reward field are what the owner is reading.
  reward: "short",
  // Two fields and a password manager. Nothing here is about the card.
  account: "peek",
  // "Add to Apple Wallet" — the card is the subject again, but the step is
  // mostly one big button.
  wallet: "short",
  billing: "peek",
};

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

  // The row counts the road the owner can actually walk right now. Wallet and
  // billing sit behind `OnboardingGate`, so to someone without an account they
  // are not steps — they are what happens after signing up. Showing all eight
  // from the start made the free design phase look twice as long as it is.
  const shown =
    isAuthenticated || !(DRAFT_STEPS as readonly string[]).includes(step ?? "business")
      ? ALL_STEPS
      : DRAFT_STEPS;

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

      {/* `pb-4` on a phone. The 16 below was room to breathe under the panel
          on a desktop page that scrolls; on a screen where the whole point is
          that nothing follows the button, it was 48px of the very thing that
          made the button need scrolling to reach. */}
      <main className="mx-auto w-full max-w-md px-3 pb-4 sm:max-w-lg sm:px-0 sm:pb-16">
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

        <section
          className="onboarding-stage overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
          data-preview={PREVIEW_TIER[step ?? "business"]}
          // Which wallet is showing changes how much card there is to see —
          // Google's is 65px taller and puts its stamps at the very bottom.
          // Only the `full` tier reads this; see `--phone-crop` in index.css.
          data-wallet={platform}
        >
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
              if the pass layout changes.

              Remeasured when both cards were rebuilt to the wallets' own
              renderers. Measure them HERE, not in the studio: this frame is
              280px wide and hands the pass 248, where Google's card comes out
              395px tall and Apple's 330. Google is the one that sets this
              number — its stamps sit below the barcode, so it is both the
              taller card and the one with content at the very bottom. 94px of
              frame above it plus 41px of wallpaper below is what 530 is.

              `--phone-scale` (index.css) shrinks the frame and this crop by the
              same factor on a short screen, so the crop lands in exactly the
              same place on the pass — it is a smaller phone, not a deeper cut.

              Both numbers now live in `index.css` beside the scale, because
              `--phone-crop` also carries the per-step tier (`PREVIEW_TIER`
              above) and an arbitrary-property class here would outrank it.
              That is where the `sm` variant went too: the frame sits 16px
              lower from `sm` up (`sm:pt-5` here, `sm:pt-6` inside the frame),
              so 530 + 16 is the same cut through the pass as on a phone.

              The height is animated, and that is the wizard's one piece of
              theatre: stepping from the reward screen back to the stamp
              screen, the phone *rises* into the panel rather than jumping a
              tier. It is a layout property and so not free, but it fires once
              per navigation — not per frame of a drag — and the alternative
              is the card changing size between two blinks. */}
          <div
            className="overflow-hidden bg-background/60 pt-3 transition-[height] duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none sm:pt-5"
            style={{ height: "calc(var(--phone-crop) * var(--phone-scale))" }}
          >
            <div className="origin-top" style={{ transform: "scale(var(--phone-scale))" }}>
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
          </div>
          <p className="sr-only" aria-live="polite">
            {spoken}
          </p>

          {/* No caption under the phone: it read out the stamp count and the
              reward, which is what the pass above it already says, and the
              `aria-live` summary says the same for anyone who can't see it. */}
          <div className="px-5 pb-4 pt-2 sm:px-8 sm:pb-6 sm:pt-3">
            <StepProgress
              steps={shown}
              current={step ?? "business"}
              reachable={reachable}
              hrefFor={(s) => `/onboarding/${s}`}
              labelFor={stepLabel}
            />

            {/* 12px, not 8: the progress row draws 28px tall but each dot
                keeps a 44px pointer box that overhangs it by 8px, and the
                Back button on the first line of the step has a 44px box of
                its own. This is the clearance that keeps them apart. */}
            <div id="onboarding-step" className="mt-3">
              <Outlet />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
