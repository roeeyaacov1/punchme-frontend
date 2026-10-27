import { useLocation } from "react-router-dom";
import { Loading, Skeleton } from "../components/kit";
import { BusinessLoading } from "../components/dashboard/shell/BusinessPages";
import { TopBar } from "../components/onboarding/TopBar";

/**
 * What a cold load shows while a group that loads on demand fetches its
 * code: the router's `fallbackElement`, so a slow phone sees the frame it is
 * about to get rather than a blank page.
 *
 * - The dashboard: the same stand-in it shows while the business loads, on
 *   the ground `index.html`'s pre-paint script has already set.
 * - The wizard: its own ground and top bar, the panel still on its way.
 * - Admin and the checkout returns: the kit's loading line on the page.
 */
export function RouteLoading() {
  const { pathname } = useLocation();
  if (/^\/dashboard(\/|$)/.test(pathname)) return <BusinessLoading />;
  if (/^\/onboarding(\/|$)/.test(pathname)) {
    return (
      <div className="theme-purple theme-raised min-h-screen bg-background text-ink">
        <TopBar />
        <main className="mx-auto w-full max-w-md px-3 sm:max-w-lg sm:px-0">
          <Loading className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-7 shadow-card sm:px-8">
            <Skeleton className="h-48 w-full !rounded-xl" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-12 w-full !rounded-xl" />
          </Loading>
        </main>
      </div>
    );
  }
  return (
    <Loading className="flex min-h-dvh items-center justify-center bg-background p-6">
      <Skeleton className="h-4 w-40" />
    </Loading>
  );
}
