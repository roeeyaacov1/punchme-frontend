import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  type TokenPair,
} from "../../api/auth";
import { ApiError } from "../../api/errors";
import { useAuth } from "../../auth/useAuth";
import { GoogleAuthButton } from "../../auth/providers/GoogleAuthButton";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import logo from "../../assets/logo.png";

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function completeSignIn(tokens: TokenPair) {
    login(tokens);
    const from =
      (location.state as { from?: { pathname: string } } | null)?.from
        ?.pathname ?? "/onboarding";
    navigate(from, { replace: true });
  }

  async function handleGoogleSuccess(idToken: string) {
    setError(null);
    try {
      completeSignIn(await signInWithGoogle(idToken));
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError(err instanceof ApiError ? err.message : t("auth.error"));
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const tokens =
        mode === "signup"
          ? await signUpWithPassword(email, password)
          : await signInWithPassword(email, password);
      completeSignIn(tokens);
    } catch (err) {
      console.error(`Password ${mode} failed:`, err);
      setError(err instanceof ApiError ? err.message : t("auth.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-white text-navy px-6">
      <Link to="/">
        <img src={logo} alt={t("app.name")} className="w-40" />
      </Link>
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-2xl text-center">{t("auth.title")}</h1>

        <form
          onSubmit={handlePasswordSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <Input
            type="email"
            label={t("auth.emailLabel")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            type="password"
            label={t("auth.passwordLabel")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("auth.submitting")
              : mode === "signup"
                ? t("auth.signUpCta")
                : t("auth.signInCta")}
          </Button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "signup" ? "signin" : "signup");
            }}
            className="text-sm text-navy/70 hover:text-navy underline underline-offset-2"
          >
            {mode === "signup"
              ? t("auth.toggleToSignIn")
              : t("auth.toggleToSignUp")}
          </button>
        </form>

        <div className="flex items-center gap-3 text-slate text-sm">
          <span className="h-px flex-1 bg-navy/10" />
          {t("auth.orDivider")}
          <span className="h-px flex-1 bg-navy/10" />
        </div>

        <div className="flex justify-center">
          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t("auth.error"))}
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
