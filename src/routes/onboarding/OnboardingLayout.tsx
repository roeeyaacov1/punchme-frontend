/**
 * Throwaway placeholder to verify the auth chain end-to-end (protected
 * route -> real user session). Replaced by the real onboarding wizard
 * (business step + card designer step) in the next build steps.
 */
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui";
import { useAuth } from "../../auth/useAuth";

export function OnboardingLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white text-navy px-6 text-center">
      <h1 className="text-2xl">{t("onboardingPlaceholder.title")}</h1>
      <p className="text-slate font-body">
        {t("onboardingPlaceholder.signedInAs")} {user?.email}
      </p>
      <p className="text-slate font-mono text-sm max-w-sm">
        {t("onboardingPlaceholder.note")}
      </p>
      <Button variant="secondary" size="sm" onClick={logout}>
        {t("onboardingPlaceholder.signOut")}
      </Button>
    </div>
  );
}
