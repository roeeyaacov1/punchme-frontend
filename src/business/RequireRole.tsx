import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Role } from "../api/team";
import { ctaClasses } from "../components/marketing/primitives";
import { Panel, PanelHeader } from "../components/dashboard/primitives";
import { atLeast } from "./gating";
import { useBusiness } from "./useBusiness";

/**
 * UI gate for the dashboard routes a hire can't use — convenience only; the
 * real boundary is the API, which answers 403 (`insufficient_role`) on every
 * one of them.
 *
 * Says "no" out loud rather than redirecting, for the same reason
 * `RequireStaff` does: a silent bounce back to the overview is
 * indistinguishable from a broken link, which is how it gets reported. It
 * renders inside the dashboard shell — the person is signed in and in the
 * right place, they just aren't the owner — so this is a panel, not a
 * full-screen block.
 */
export function RequireRole({ minimum }: { minimum: Role }) {
  const { t } = useTranslation();
  const { role, isLoading } = useBusiness();

  if (isLoading) {
    return (
      <p className="font-mono text-sm text-ink-subtle">{t("auth.loadingSession")}</p>
    );
  }

  if (!atLeast(role, minimum)) {
    return (
      <Panel className="p-5 sm:p-6">
        <PanelHeader
          title={t("team.denied.title")}
          hint={t(`team.denied.${minimum}`)}
        />
        <Link to="/dashboard" className={ctaClasses("secondary", "sm", "mt-4")}>
          {t("team.denied.back")}
        </Link>
      </Panel>
    );
  }

  return <Outlet />;
}
