import { useEffect, useRef, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
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
import { Button, LinkButton, LitPanel, Loading, Notice, Skeleton } from "../../components/kit";
import { PublicPage } from "../public/PublicPage";
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
 * Sign in — the returning owner's door. One lit panel on the wall, the form
 * built from the kit around the fields it shares with `/invite` and the
 * wizard's account step; what happens after is this page's own: back to
 * wherever the owner was headed. New owners are pointed at the wizard,
 * where the account comes last — and an owner who is already signed in is
 * never asked for a password they have already given.
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
      <LoginFrame>
        <LitPanel as="section" className="p-5 sm:p-6">
          <Loading className="flex flex-col gap-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-12 w-full rounded-field" />
            <Skeleton className="h-12 w-full rounded-field" />
          </Loading>
        </LitPanel>
      </LoginFrame>
    );
  }

  // Signed in already: pressing "Sign in" means "take me to my cards".
  if (isAuthenticated) {
    return <Navigate to={from ?? signedInDestination()} replace />;
  }

  return (
    <LoginFrame>
      <LitPanel as="section" aria-labelledby="login-title" className="flex flex-col gap-5 p-5 sm:p-6">
        <Heading
          id="login-title"
          title={signup ? t("auth.signUpTitle") : t("auth.signInTitle")}
          subtitle={signup ? t("auth.signUpSubtitle") : t("auth.signInSubtitle")}
        />
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (auth.canSubmit) void auth.submitPassword();
          }}
          className="flex flex-col gap-4"
        >
          <AuthFields
            mode={auth.mode}
            email={auth.email}
            password={auth.password}
            onEmail={auth.setEmail}
            onPassword={auth.setPassword}
          />
          {auth.error && (
            <Notice tone="danger" role="alert">
              {auth.error}
            </Notice>
          )}
          <Button
            type="submit"
            size="lg"
            busy={auth.submitting}
            disabled={!auth.canSubmit}
            className="w-full"
          >
            {signup ? t("auth.signUpCta") : t("auth.signInCta")}
          </Button>
        </form>
        <AuthAlternatives
          mode={auth.mode}
          onToggleMode={auth.toggleMode}
          onGoogle={auth.submitGoogle}
          onGoogleError={() => auth.setError(t("auth.error"))}
        />
      </LitPanel>
      <LinkButton
        to="/onboarding"
        variant="secondary"
        iconEnd={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}
        className="mt-5 max-w-full self-center !whitespace-normal text-balance text-center"
      >
        {t("auth.newHere")}
      </LinkButton>
    </LoginFrame>
  );
}

/** The page's title and what it is for. The title takes focus when the form
 * mounts, so a screen reader starts at the question, not the top bar. */
function Heading({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <h1 ref={heading} id={id} tabIndex={-1} className="type-title text-balance outline-none">
        {title}
      </h1>
      <p className="type-body text-pretty text-ink-muted">{subtitle}</p>
    </div>
  );
}

/** The frame every state of this page sits in: the form, or what stands in
 * for it while the session resolves. A column on a phone; at most 26rem and
 * centred from 640px. */
function LoginFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <PublicPage variant="team" title={t("auth.pageTitle")} className="items-stretch pb-16 pt-2 sm:items-center sm:pt-8">
      <div className="flex w-full flex-col sm:max-w-[26rem]">{children}</div>
    </PublicPage>
  );
}
