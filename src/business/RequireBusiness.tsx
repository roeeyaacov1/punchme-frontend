import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBusiness } from "./useBusiness";

export function RequireBusiness() {
  const { t } = useTranslation();
  const { isLoading, hasBusiness } = useBusiness();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate font-mono text-sm">
        {t("auth.loadingSession")}
      </div>
    );
  }

  if (!hasBusiness) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
