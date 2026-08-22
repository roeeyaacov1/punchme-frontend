import type { ReactNode } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import type { TokenPair } from "../../api/auth";
import { getRefreshToken } from "../../auth/tokenStore";
import { useAuth } from "../../auth/useAuth";
import { AuthAlternatives, AuthFields } from "../../components/auth/AuthFormParts";
import {
  useEmailPasswordAuth,
  type AuthMode,
} from "../../components/auth/useEmailPasswordAuth";
import { StepShell } from "../../components/onboarding/StepShell";
import { TopBar } from "../../components/onboarding/TopBar";
import { focusRing } from "../../components/marketing/primitives";
import { cn } from "../../lib/cn";
import { hasDraftInProgress, loadDraft } from "../onboarding/draft";

/**
 * Where an owner belongs when nothing sent them here.
 *
 * `/onboarding` can answer this properly — it is the one page that knows
 * whether there is a Business — but it answers from inside the wizard, so
 * sending every sign-in through it made a returning owner watch the wizard
 * load, and its URL flash past, on the way to their own dashboard. The one
 * thing that would genuinely send them back there is a card half-designed
 * on this device, and that is readable right here. Guessing forward is
 * safe: `RequireBusiness` turns around the rare account that owns nothing.
 *
 * Signing *up* is the exception — a brand-new account has no Business yet,
 * so it keeps the wizard.
 */
function signedInDestination(mode: AuthMode = "signin"): string {
  if (mode === "signup") return "/onboarding";
  return hasDraftInProgress(loadDraft()) ? "/onboarding" : "/dashboard";
}

/**
 * Sign in — the returning owner's door. Same paper panel, same form and
 * same top bar as the wizard, because it is the same product; the only
 * difference is what happens after: this page goes back to wherever the
 * owner was headed, the wizard saves the card. New owners are pointed at
 * the wizard, where the account comes last — and an owner who is already
 * signed in is never asked for a password they have already given.
 */
export function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? null;

  const auth = useEmailPasswordAuth({
    initialMode: "signin",
    onAuthenticated: (tokens: TokenPair) => {
      login(tokens);
      navigate(from ?? signedInDestination(auth.mode), { replace: true });
    },
  });
  const signup = auth.mode === "signup";

  // A cold load of /login has to know whether a session already exists
  // before it offers a form asking for one — but only when there is a
  // refresh token for it to find. Waiting without one would hold the form
  // behind a request that is going to fail anyway, which on a stopped
  // backend is the difference between a slow sign-in and none at all.
  if (isLoading && getRefreshToken()) {
    return (
      <LoginShell>
        <p className="py-6 text-center text-sm text-ink-muted">{t("auth.loadingSession")}</p>
      </LoginShell>
    );
  }

  // Signed in already: pressing "Sign in" means "take me to my cards".
  if (isAuthenticated) {
    return <Navigate to={from ?? signedInDestination()} replace />;
  }

  return (
    <LoginShell>
      <StepShell
        title={signup ? t("auth.signUpTitle") : t("auth.signInTitle")}
        subtitle={signup ? t("auth.signUpSubtitle") : t("auth.signInSubtitle")}
        onNext={() => auth.submitPassword()}
        nextLabel={signup ? t("auth.signUpCta") : t("auth.signInCta")}
        nextBusy={auth.submitting}
        nextDisabled={!auth.canSubmit}
        error={auth.error}
        footer={
          <>
            <AuthAlternatives
              mode={auth.mode}
              onToggleMode={auth.toggleMode}
              onGoogle={auth.submitGoogle}
              onGoogleError={() => auth.setError(t("auth.error"))}
            />
            <Link
              to="/onboarding"
              className={cn(
                "mt-2 inline-flex min-h-[44px] items-center justify-center gap-1.5 self-center rounded-lg px-3 text-sm font-semibold text-primary-text hover:underline",
                focusRing,
              )}
            >
              {t("auth.newHere")}
              <ArrowRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
          </>
        }
      >
        <AuthFields
          idPrefix="login"
          mode={auth.mode}
          email={auth.email}
          password={auth.password}
          onEmail={auth.setEmail}
          onPassword={auth.setPassword}
        />
      </StepShell>
    </LoginShell>
  );
}

/** The panel every state of this page sits in — form, or the line that
 * stands in for it while the session resolves. */
function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="theme-purple theme-raised min-h-screen bg-background text-ink">
      <TopBar />
      <main className="mx-auto w-full max-w-md px-3 pb-16 sm:max-w-lg sm:px-0">
        <section className="rounded-2xl border border-border bg-surface px-5 py-7 shadow-card sm:px-8">
          {children}
        </section>
      </main>
    </div>
  );
}
