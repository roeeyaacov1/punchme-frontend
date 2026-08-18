import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { TokenPair } from "../../../api/auth";
import type { Business, CardTemplate } from "../../../api/businesses";
import { ApiError } from "../../../api/errors";
import { useAuth } from "../../../auth/useAuth";
import { AuthAlternatives, AuthFields } from "../../../components/auth/AuthFormParts";
import { useEmailPasswordAuth } from "../../../components/auth/useEmailPasswordAuth";
import { StepShell } from "../../../components/onboarding/StepShell";
import { ctaClasses, focusRing } from "../../../components/marketing/primitives";
import { cn } from "../../../lib/cn";
import { commitDraft } from "../commit";
import { useOnboardingDraft } from "../useOnboardingDraft";

/**
 * The account step: the card is designed, now it needs an owner. Signed out,
 * this is a sign-up form (with a way to sign in instead); signed in, it is
 * one button. Either way the click that ends it also creates the Business
 * and the card from the draft — never from an effect, so React's dev-mode
 * double mount can't create two, and never twice at once, so a second tap
 * can't either.
 */
export function AccountStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const { draft, resolved, templateInput, art, update, clear } = useOnboardingDraft();

  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [existing, setExisting] = useState<{ business: Business; template: CardTemplate } | null>(
    null,
  );
  const inFlight = useRef(false);

  const artForUpload =
    resolved.stamp.kind !== "glyph" && art?.hash === resolved.stamp.hash ? art : null;

  async function commit(replaceExisting = false) {
    if (inFlight.current) return;
    inFlight.current = true;
    setCommitting(true);
    setCommitError(null);
    try {
      const outcome = await commitDraft({
        draft,
        resolved,
        input: templateInput,
        art: artForUpload,
        queryClient,
        saveCommitted: (committed) => update({ committed }),
        replaceExisting,
      });
      if (outcome.kind === "existing-card") {
        setExisting({ business: outcome.business, template: outcome.template });
        return;
      }
      navigate("/onboarding/wallet");
    } catch (err) {
      setCommitError(
        err instanceof ApiError && err.status === 422 ? err.message : t("billing.error"),
      );
    } finally {
      inFlight.current = false;
      setCommitting(false);
    }
  }

  const auth = useEmailPasswordAuth({
    initialMode: "signup",
    onAuthenticated: async (tokens: TokenPair) => {
      login(tokens);
      await commit();
    },
  });

  // Saving in progress takes precedence over everything: `login()` flips
  // `isAuthenticated` mid-commit and this must not re-render into a second
  // "Save my card" button underneath the first.
  if (committing) {
    return (
      <StepShell title={t("onboarding.account.title")} hideNext>
        <p role="status" className="text-ink-muted">
          {t("onboarding.account.saving")}
        </p>
      </StepShell>
    );
  }

  if (existing) {
    return (
      <StepShell
        title={t("onboarding.account.existingTitle")}
        subtitle={t("onboarding.account.existingBody")}
        hideNext
        error={commitError}
      >
        <div className="flex flex-col gap-3">
          <button type="button" onClick={() => commit(true)} className={ctaClasses("primary", "lg", "w-full")}>
            {t("onboarding.account.replace")}
          </button>
          <button
            type="button"
            onClick={() => {
              clear();
              navigate("/dashboard", { replace: true });
            }}
            className={ctaClasses("secondary", "lg", "w-full")}
          >
            {t("onboarding.account.keep")}
          </button>
        </div>
      </StepShell>
    );
  }

  if (authLoading) {
    return (
      <StepShell title={t("onboarding.account.title")} hideNext>
        <p className="text-sm text-ink-muted">{t("auth.loadingSession")}</p>
      </StepShell>
    );
  }

  if (isAuthenticated) {
    return (
      <StepShell
        title={t("onboarding.account.title")}
        subtitle={t("onboarding.account.subtitle")}
        onBack={() => navigate("/onboarding/reward")}
        onNext={() => commit()}
        nextLabel={t("onboarding.account.saveCta")}
        error={commitError}
        footer={
          <button
            type="button"
            onClick={() => logout()}
            className={cn("self-center text-sm text-ink-muted underline underline-offset-2 hover:text-ink", focusRing)}
          >
            {t("onboarding.account.switchAccount")}
          </button>
        }
      >
        <p className="text-sm text-ink-muted">
          {t("onboarding.account.signedInAs", { email: user?.email ?? "" })}
        </p>
      </StepShell>
    );
  }

  return (
    <StepShell
      title={t("onboarding.account.title")}
      subtitle={t("onboarding.account.subtitle")}
      onBack={() => navigate("/onboarding/reward")}
      onNext={() => auth.submitPassword()}
      nextLabel={auth.mode === "signup" ? t("onboarding.account.createCta") : t("auth.signInCta")}
      nextBusy={auth.submitting}
      nextDisabled={!auth.canSubmit}
      error={auth.error ?? commitError}
      footer={
        <AuthAlternatives
          mode={auth.mode}
          onToggleMode={auth.toggleMode}
          onGoogle={auth.submitGoogle}
          onGoogleError={() => auth.setError(t("auth.error"))}
        />
      }
    >
      <AuthFields
        idPrefix="account"
        mode={auth.mode}
        email={auth.email}
        password={auth.password}
        onEmail={auth.setEmail}
        onPassword={auth.setPassword}
      />
    </StepShell>
  );
}
