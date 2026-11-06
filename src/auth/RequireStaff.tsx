import { Outlet } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { Opening } from "../components/opening/Opening";
import { Button, LinkButton, LitPanel } from "../components/kit";
import { useDocumentTitle } from "../routes/public/useDocumentTitle";
import { usePublicGround } from "../theme/usePublicGround";
import { useAuth } from "./useAuth";

/** UI gate for the /admin area — convenience only; the real boundary is the
 * API's require_staff check (403 for non-staff on every endpoint).
 *
 * Says "no" out loud rather than redirecting: a silent bounce back to the
 * dashboard is indistinguishable from the admin area not existing, which is
 * exactly how it got reported as missing. */
export function RequireStaff() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Opening fromLoad />;

  if (!user?.is_staff) return <StaffRefusal email={user?.email ?? ""} />;

  return <Outlet />;
}

/**
 * The refusal, on Lightbox by day like the rest of the staff area: one lit
 * panel naming the area, who is signed in, and why that isn't enough. Its
 * first way out is the likely one, another account: staff who opened
 * /admin signed in as a test owner. Signing out is enough for that, since
 * `ProtectedRoute` then sends the page to sign-in, which brings them back
 * here. The other is the app they came from.
 */
function StaffRefusal({ email }: { email: string }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  usePublicGround();
  useDocumentTitle(t("admin.staffOnly"));

  return (
    <div className="theme-lightbox flex min-h-svh flex-col bg-background text-ink [-webkit-tap-highlight-color:transparent] [&_button]:select-none">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <LitPanel className="flex w-full max-w-[28rem] flex-col gap-3 p-6 sm:p-8">
          <h1 className="type-title text-ink">{t("admin.staffOnly")}</h1>
          <p className="type-body text-ink-muted">{t("admin.staffOnlyBody")}</p>
          <p className="type-body text-ink-muted">
            {/* An address is one unbroken run: isolated, and free to break. */}
            <Trans
              i18nKey="admin.staffOnlySignedInAs"
              values={{ email }}
              components={{ email: <bdi dir="ltr" className="font-semibold text-ink [overflow-wrap:anywhere]" /> }}
            />
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <Button onClick={logout} className="w-full !whitespace-normal">
              {t("admin.otherAccount")}
            </Button>
            <LinkButton variant="secondary" to="/dashboard" className="w-full !whitespace-normal">
              {t("admin.backToApp")}
            </LinkButton>
          </div>
        </LitPanel>
      </main>
    </div>
  );
}
