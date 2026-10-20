import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { useBusiness } from "../../../business/useBusiness";
import { Button, LitPanel, Loading, Skeleton } from "../../kit";
import { useDashboardTheme } from "../../../theme/useDashboardTheme";

/** Leaves for the sign-in page with nothing remembered: the next person to
 * sign in starts on the Overview. `logout()` and the navigation must stay in
 * one synchronous turn, so React applies them together; see the shell's
 * sign-out. */
function useSignOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return () => {
    logout();
    navigate("/login", { replace: true });
  };
}

/** While the business is on its way: the kit's status, with the sign's and
 * the name's places held. */
export function BusinessLoading() {
  return (
    <Loading className="flex min-h-dvh items-center justify-center p-6">
      <span className="flex items-center gap-3">
        <Skeleton className="h-6 w-9 rounded-md" />
        <Skeleton className="h-4 w-40" />
      </span>
    </Loading>
  );
}

/**
 * The business couldn't be reached: a 500, or no connection. Never read as
 * "no business", which would send a live shop to onboarding. There is no
 * business to build the shell from, so this is a page of its own, on
 * Lightbox for the whole screen, with a way to ask again and a way out.
 */
export function BusinessLoadFailed() {
  const { t } = useTranslation();
  const { refetch, isFetching } = useBusiness();
  const signOut = useSignOut();
  useDashboardTheme({ lightbox: true });
  // Outside the shell, so it names itself; the heading already says PunchMe.
  const title = t("dashboard.loadFailed.title");
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4 text-ink">
      <LitPanel as="section" className="flex w-full max-w-md flex-col items-center gap-3 px-6 py-10 text-center">
        <h1 className="type-card-title text-ink">{t("dashboard.loadFailed.title")}</h1>
        <p className="type-body max-w-sm text-ink-muted">{t("dashboard.loadFailed.body")}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button busy={isFetching} onClick={refetch}>
            {t("common.retry")}
          </Button>
          <Button variant="secondary" onClick={signOut}>
            {t("dashboard.nav.signOut")}
          </Button>
        </div>
      </LitPanel>
    </main>
  );
}

/** A 401 the refresh couldn't answer: the session has ended, so sign out
 * rather than offer a retry that can't work. */
export function SessionEnded() {
  const signOut = useSignOut();
  useEffect(() => {
    signOut();
    // Once, as it mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
