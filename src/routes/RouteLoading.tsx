import { useLocation } from "react-router-dom";
import { Loading, Skeleton } from "../components/kit";
import { BusinessLoading } from "../components/dashboard/shell/BusinessPages";
import { column } from "../components/onboarding/column";
import { TopBar } from "../components/onboarding/TopBar";
import { cn } from "../lib/cn";

/**
 * What a cold load shows while a group that loads on demand fetches its
 * code: the router's `fallbackElement`, so a slow phone sees the frame it is
 * about to get rather than a blank page.
 *
 * - The dashboard: the same stand-in it shows while the business loads, on
 *   the ground `index.html`'s pre-paint script has already set.
 * - The wizard: its own top bar on the wall, and the road, the card and the
 *   question still on their way.
 * - Admin and the checkout returns: the kit's loading line on the page.
 */
export function RouteLoading() {
  const { pathname } = useLocation();
  if (/^\/dashboard(\/|$)/.test(pathname)) return <BusinessLoading />;
  if (/^\/onboarding(\/|$)/.test(pathname)) {
    return (
      <div className="theme-lightbox flex min-h-svh flex-col bg-background text-ink">
        <TopBar />
        <main className={cn(column, "pt-2")}>
          <Loading className="flex flex-col gap-6">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mx-auto h-[12.5rem] w-[340px] max-w-full !rounded-glass" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-12 w-full !rounded-field" />
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
