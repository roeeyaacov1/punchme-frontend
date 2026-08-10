import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useBusiness } from "../../business/useBusiness";
import { BusinessStep } from "./BusinessStep";
import { DesignStep } from "./DesignStep";
import { FinishStep } from "./FinishStep";
import type { Business, CardTemplate } from "../../api/businesses";

type Step = "business" | "design" | "finish";
const STEPS: Step[] = ["business", "design", "finish"];

export function OnboardingLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isLoading, hasBusiness } = useBusiness();
  const [step, setStep] = useState<Step>("business");
  const [business, setBusiness] = useState<Business | null>(null);
  const [template, setTemplate] = useState<CardTemplate | null>(null);

  // Checked exactly once, the first time isLoading resolves — a stale
  // bookmark from a completed owner belongs on the dashboard. Reading
  // hasBusiness reactively instead would also fire mid-wizard: BusinessStep
  // invalidates ["business","me"] right after creating the Business, which
  // flips hasBusiness true while step is still "business", well before the
  // wizard itself is done.
  const [skipToDashboard, setSkipToDashboard] = useState<boolean | null>(null);
  useEffect(() => {
    if (!isLoading && skipToDashboard === null) {
      setSkipToDashboard(hasBusiness);
    }
  }, [isLoading, hasBusiness, skipToDashboard]);

  if (skipToDashboard === null) return null;
  if (skipToDashboard) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center gap-10 bg-white text-navy px-6 py-16">
      {/* A staff account typically has no Business of its own, so it never
          reaches the dashboard — the only other place the admin link lives.
          Without this the catalog editor is unreachable except by URL. */}
      {user?.is_staff && (
        <div className="w-full max-w-lg rounded-xl bg-gold/10 border border-gold/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-body text-navy">{t("admin.staffHere")}</span>
          <Link to="/admin" className="text-sm font-medium text-navy underline hover:no-underline">
            {t("admin.openAdmin")}
          </Link>
        </div>
      )}

      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-mono " +
                (s === step
                  ? "bg-navy text-white"
                  : STEPS.indexOf(step) > i
                    ? "bg-navy/20 text-navy"
                    : "bg-navy/5 text-slate")
              }
            >
              {i + 1}
            </div>
            <span className="text-sm font-body text-slate hidden sm:inline">
              {t(`onboarding.steps.${s}`)}
            </span>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px bg-navy/15" />
            )}
          </div>
        ))}
      </div>

      {step === "business" && (
        <BusinessStep
          onCreated={(b, tpl) => {
            setBusiness(b);
            setTemplate(tpl);
            setStep("design");
          }}
        />
      )}

      {step === "design" && business && template && (
        <DesignStep
          business={business}
          template={template}
          onSaved={(tpl) => {
            setTemplate(tpl);
            setStep("finish");
          }}
          onBack={() => setStep("business")}
        />
      )}

      {step === "finish" && business && template && (
        <FinishStep business={business} template={template} />
      )}
    </div>
  );
}
