import { useEffect, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, LitPanel } from "../components/kit";
import { useDashboardTheme } from "../theme/useDashboardTheme";
import { useAuth } from "./useAuth";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** Whether the browser says it is online, kept current as that changes. */
function useOnline(): boolean {
  return useSyncExternalStore(subscribe, () => navigator.onLine);
}

/**
 * A signed-in page while the start-up check can't get through. The session
 * is kept, since only the server can end it, so this says what is wrong and
 * that the owner is still signed in, and the check keeps trying
 * (`checkSession`): the page they asked for opens by itself once an answer
 * comes. Laid out like the shell's BusinessLoadFailed, the page that follows
 * when the business can't be read either: on Lightbox for the whole screen,
 * with a way to ask again and a way out.
 */
export function SessionUnreachable() {
  const { t } = useTranslation();
  const { retry, isTrying, logout } = useAuth();
  const navigate = useNavigate();
  const online = useOnline();
  useDashboardTheme({ lightbox: true });

  // Nothing of the app behind it yet, so it names itself.
  const title = t("session.unreachable.title");
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);

  // Leaves with nothing remembered, like the shell's sign-out: the next
  // person to sign in starts on the Overview. One synchronous turn, so React
  // applies the two together.
  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4 text-ink">
      <LitPanel as="section" className="flex w-full max-w-md flex-col items-center gap-3 px-6 py-10 text-center">
        <h1 className="type-card-title text-ink">{title}</h1>
        {/* Live, for the one change that can come while it is read: the
            device going offline or coming back. */}
        <p aria-live="polite" className="type-body max-w-sm text-ink-muted">
          {online ? t("session.unreachable.server") : t("session.unreachable.offline")}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button busy={isTrying} onClick={retry}>
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
