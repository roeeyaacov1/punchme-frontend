import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import type { TokenPair } from "../../api/auth";
import { useAuth } from "../../auth/useAuth";
import { AuthAlternatives, AuthFields } from "../../components/auth/AuthFormParts";
import { useEmailPasswordAuth } from "../../components/auth/useEmailPasswordAuth";
import { StepShell } from "../../components/onboarding/StepShell";
import { TopBar } from "../../components/onboarding/TopBar";
import { focusRing } from "../../components/marketing/primitives";
import { cn } from "../../lib/cn";

/**
 * Sign in — the returning owner's door. Same paper panel, same form and
 * same top bar as the wizard, because it is the same product; the only
 * difference is what happens after: this page goes back to wherever the
 * owner was headed (or into onboarding), the wizard saves the card. New
 * owners are pointed at the wizard, where the account comes last.
 */
export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useEmailPasswordAuth({
    initialMode: "signin",
    onAuthenticated: (tokens: TokenPair) => {
      login(tokens);
      const from =
        (location.state as { from?: { pathname: string } } | null)?.from?.pathname ??
        "/onboarding";
      navigate(from, { replace: true });
    },
  });
  const signup = auth.mode === "signup";

  return (
    <div className="min-h-screen bg-background text-ink">
      <TopBar />
      <main className="mx-auto w-full max-w-md px-3 pb-16 sm:max-w-lg sm:px-0">
        <section className="rounded-2xl border border-border bg-surface px-5 py-7 shadow-card sm:px-8">
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
        </section>
      </main>
    </div>
  );
}
