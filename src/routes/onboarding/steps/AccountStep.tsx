import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  type TokenPair,
} from "../../../api/auth";
import type { Business, CardTemplate } from "../../../api/businesses";
import { ApiError } from "../../../api/errors";
import { useAuth } from "../../../auth/useAuth";
import { GoogleAuthButton } from "../../../auth/providers/GoogleAuthButton";
import { StepShell } from "../../../components/onboarding/StepShell";
import { ctaClasses, focusRing } from "../../../components/marketing/primitives";
import { cn } from "../../../lib/cn";
import { commitDraft } from "../commit";
import { useOnboardingDraft } from "../useOnboardingDraft";

type Mode = "signup" | "signin";

/**
 * The account step: the card is designed, now it needs an owner. Signed out,
 * this is a sign-up form (with a way to sign in instead); signed in, it is
 * one button. Either way the click that ends it also creates the Business
 * and the card from the draft — never from an effect, so React's dev-mode
 * double mount can't create two, and never twice at once, so a second tap
 * can't either.
 */
export function AccountStep() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const { draft, resolved, templateInput, art, update, clear } = useOnboardingDraft();

  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
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
      setError(err instanceof ApiError && err.status === 422 ? err.message : t("billing.error"));
    } finally {
      inFlight.current = false;
      setCommitting(false);
    }
  }

  function describeAuthError(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status === 409) return t("onboarding.account.alreadyRegistered");
      if (err.status === 429) return t("onboarding.account.throttled");
      if (err.status === 422 || err.status === 401) return err.message;
    }
    return t("auth.error");
  }

  async function authenticated(tokens: TokenPair) {
    login(tokens);
    await commit();
  }

  async function handlePasswordSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (submitting || committing) return;
    setError(null);
    setSubmitting(true);
    try {
      const tokens =
        mode === "signup"
          ? await signUpWithPassword(email, password)
          : await signInWithPassword(email, password);
      await authenticated(tokens);
    } catch (err) {
      const message = describeAuthError(err);
      if (err instanceof ApiError && err.status === 409) setMode("signin");
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle(idToken: string) {
    if (submitting || committing) return;
    setError(null);
    setSubmitting(true);
    try {
      await authenticated(await signInWithGoogle(idToken));
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = cn(
    "w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ink placeholder:text-ink-subtle/70",
    focusRing,
  );

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
        error={error}
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
        error={error}
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
      onNext={() => handlePasswordSubmit()}
      nextLabel={mode === "signup" ? t("onboarding.account.createCta") : t("auth.signInCta")}
      nextBusy={submitting}
      nextDisabled={!email || !password}
      error={error}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "signup" ? "signin" : "signup");
            }}
            className={cn("self-center text-sm text-ink-muted underline underline-offset-2 hover:text-ink", focusRing)}
          >
            {mode === "signup" ? t("auth.toggleToSignIn") : t("auth.toggleToSignUp")}
          </button>
          <div className="flex items-center gap-3 text-sm text-ink-subtle">
            <span className="h-px flex-1 bg-border" />
            {t("auth.orDivider")}
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex justify-center" dir="ltr">
            <GoogleAuthButton
              key={i18n.resolvedLanguage}
              onSuccess={handleGoogle}
              onError={() => setError(t("auth.error"))}
            />
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="account-email" className="text-sm font-medium text-ink">
          {t("auth.emailLabel")}
        </label>
        <input
          id="account-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="account-password" className="text-sm font-medium text-ink">
          {t("auth.passwordLabel")}
        </label>
        <input
          id="account-password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          dir="ltr"
          required
          minLength={mode === "signup" ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
      </div>
    </StepShell>
  );
}
