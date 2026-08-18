import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  type TokenPair,
} from "../../api/auth";
import { ApiError } from "../../api/errors";

export type AuthMode = "signup" | "signin";

/**
 * The sign-in / sign-up form's logic, shared by the login page and the
 * wizard's account step so the two can't drift: one mode toggle, one
 * reading of the API's errors (409 = that email exists → flip to sign-in
 * and keep the address; 422 = the server's password message; 429 = the
 * anonymous throttle), one Google path.
 *
 * `onAuthenticated` receives the tokens and does whatever the screen is
 * for — the login page navigates, the account step saves the card. It may
 * be async; its failure is reported here too.
 */
export function useEmailPasswordAuth({
  initialMode,
  onAuthenticated,
}: {
  initialMode: AuthMode;
  onAuthenticated: (tokens: TokenPair) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function describe(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status === 409) return t("onboarding.account.alreadyRegistered");
      if (err.status === 429) return t("onboarding.account.throttled");
      if (err.status === 422 || err.status === 401) return err.message;
    }
    return t("auth.error");
  }

  async function run(getTokens: () => Promise<TokenPair>) {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const tokens = await getTokens();
      await onAuthenticated(tokens);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setMode("signin");
      setError(describe(err));
    } finally {
      setSubmitting(false);
    }
  }

  return {
    mode,
    toggleMode: () => {
      setError(null);
      setMode(mode === "signup" ? "signin" : "signup");
    },
    email,
    setEmail,
    password,
    setPassword,
    submitting,
    error,
    setError,
    canSubmit: email.trim().length > 0 && password.length > 0,
    submitPassword: () =>
      run(() =>
        mode === "signup" ? signUpWithPassword(email, password) : signInWithPassword(email, password),
      ),
    submitGoogle: (idToken: string) => run(() => signInWithGoogle(idToken)),
  };
}
