import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signInWithGoogle } from "../../api/auth";
import { useAuth } from "../../auth/useAuth";
import { GoogleAuthButton } from "../../auth/providers/GoogleAuthButton";
import logo from "../../assets/logo.png";

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSuccess(idToken: string) {
    setError(null);
    try {
      const tokens = await signInWithGoogle(idToken);
      login(tokens);
      const from =
        (location.state as { from?: { pathname: string } } | null)?.from
          ?.pathname ?? "/onboarding";
      navigate(from, { replace: true });
    } catch {
      setError(t("auth.error"));
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-white text-navy px-6">
      <Link to="/">
        <img src={logo} alt={t("app.name")} className="w-40" />
      </Link>
      <h1 className="text-2xl text-center">{t("auth.title")}</h1>
      <GoogleAuthButton
        onSuccess={handleGoogleSuccess}
        onError={() => setError(t("auth.error"))}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
