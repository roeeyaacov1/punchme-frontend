import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  type TokenPair,
} from "../../api/auth";
import { ApiError } from "../../api/errors";
import { authErrorKey, type AuthMethod } from "./authErrors";

export type AuthMode = "signup" | "signin";

/**
 * The sign-in / sign-up form's logic, shared by the login page, the
 * invitation and the wizard's account step so they can't drift: one mode
 * toggle, one reading of the API's errors in the page's own words
 * (`authErrors.ts`: 409 = that email exists → flip to sign-in and keep the
 * address; 401 = the email or the password, or a Google account; 422 = a
 * weak password; 429 = the anonymous throttle), one Google path.
 *
 * `onAuthenticated` receives the tokens and does whatever the screen is
 * for — the login page navigates, the account step saves the card. It may
 * be async; its failure is reported here too, though all three callers
 * catch their own.
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

  /** `method` travels with the call: a Google 401 and a password 401 look
   * the same on the wire and must not read the same. */
  async function run(method: AuthMethod, getTokens: () => Promise<TokenPair>) {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const tokens = await getTokens();
      await onAuthenticated(tokens);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setMode("signin");
      setError(t(authErrorKey(err, { mode, method })));
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
      run("password", () =>
        mode === "signup" ? signUpWithPassword(email, password) : signInWithPassword(email, password),
      ),
    submitGoogle: (idToken: string) => run("google", () => signInWithGoogle(idToken)),
  };
}
