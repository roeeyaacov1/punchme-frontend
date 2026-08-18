import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/useAuth";
import { BusinessProvider } from "../../business/BusinessProvider";

/**
 * The wallet and billing steps need an account and a Business. This is
 * `ProtectedRoute` in spirit, but it keeps the owner inside the wizard —
 * signed out means "go and make the account", not `/login` — and its
 * loading state is a line inside the panel, not a full-screen block under
 * the phone.
 */
export function OnboardingGate() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <p className="py-6 text-center text-sm text-ink-muted">{t("auth.loadingSession")}</p>;
  }
  if (!isAuthenticated) return <Navigate to="/onboarding/account" replace />;
  return (
    <BusinessProvider>
      <Outlet />
    </BusinessProvider>
  );
}
